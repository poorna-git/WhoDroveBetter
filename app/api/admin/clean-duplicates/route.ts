import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if current user is admin or cleaning their own drives
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    const firstUser = await prisma.user.findFirst({
      orderBy: { createdAt: "asc" },
    });

    const isAdmin =
      currentUser?.id === firstUser?.id ||
      currentUser?.username?.toLowerCase() === "admin" ||
      currentUser?.username?.toLowerCase() === "poorna";

    const body = await req.json().catch(() => ({}));
    const targetUserId = (isAdmin && body.userId) ? body.userId : session.user.id;

    // Fetch all drives for this user
    const userDrives = await prisma.drive.findMany({
      where: { userId: targetUserId },
      include: { car: true },
      orderBy: { createdAt: "asc" },
    });

    let removedDrivesCount = 0;
    const deletedDriveIds: string[] = [];

    // Group drives by (carId + groupId)
    // If groupId is null, key is `carId_personal`
    // If groupId is set, key is `carId_group_${groupId}`
    const driveGroups = new Map<string, typeof userDrives>();

    for (const drive of userDrives) {
      const key = `${drive.carId}_${drive.groupId || "personal"}`;
      if (!driveGroups.has(key)) {
        driveGroups.set(key, []);
      }
      driveGroups.get(key)!.push(drive);
    }

    // For any group that has more than 1 drive, keep the best one and delete the rest
    for (const [key, drives] of driveGroups.entries()) {
      if (drives.length > 1) {
        // Sort drives to find the "best" one to keep:
        // 1. Prefers drive with photoUrl
        // 2. Prefers drive with rating
        // 3. Prefers drive with comment
        // 4. Earliest createdAt
        drives.sort((a, b) => {
          const scoreA = (a.photoUrl ? 10 : 0) + (a.rating ? 5 : 0) + (a.comment ? 2 : 0);
          const scoreB = (b.photoUrl ? 10 : 0) + (b.rating ? 5 : 0) + (b.comment ? 2 : 0);
          if (scoreB !== scoreA) return scoreB - scoreA;
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });

        const [keepDrive, ...duplicatesToDelete] = drives;

        for (const duplicate of duplicatesToDelete) {
          await prisma.drive.delete({
            where: { id: duplicate.id },
          });
          deletedDriveIds.push(duplicate.id);
          removedDrivesCount++;
        }
      }
    }

    // Now, ensure every unique car the user has logged also has a personal drive record (groupId: null)
    // so personal stats and group stats match perfectly
    const allUserDrivesRemaining = await prisma.drive.findMany({
      where: { userId: targetUserId },
      include: { car: true },
      orderBy: { createdAt: "asc" },
    });

    const personalCarIds = new Set(
      allUserDrivesRemaining.filter((d) => d.groupId === null).map((d) => d.carId)
    );

    let createdPersonalCount = 0;
    for (const drive of allUserDrivesRemaining) {
      if (drive.groupId !== null && !personalCarIds.has(drive.carId)) {
        // Create the missing personal drive
        await prisma.drive.create({
          data: {
            userId: targetUserId,
            carId: drive.carId,
            groupId: null,
            photoUrl: drive.photoUrl,
            rating: drive.rating,
            comment: drive.comment,
            context: drive.context,
            isManual: drive.isManual,
            points: drive.points,
            createdAt: drive.createdAt,
          },
        });
        personalCarIds.add(drive.carId);
        createdPersonalCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${removedDrivesCount} duplicate drive(s). Added ${createdPersonalCount} missing personal drive record(s).`,
      removedCount: removedDrivesCount,
      createdPersonalCount,
      deletedDriveIds,
    });
  } catch (error) {
    console.error("Clean duplicates error:", error);
    return NextResponse.json(
      { error: "Failed to clean duplicate drives" },
      { status: 500 }
    );
  }
}
