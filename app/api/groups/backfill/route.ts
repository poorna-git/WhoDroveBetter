import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST: Backfill all personal drives to user's groups
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get all user's groups
    const userGroups = await prisma.groupMember.findMany({
      where: { userId },
      select: { groupId: true },
    });

    if (userGroups.length === 0) {
      return NextResponse.json({
        message: "No groups to backfill",
        created: 0,
      });
    }

    // Get all personal drives (groupId: null) that don't have group equivalents yet
    const personalDrives = await prisma.drive.findMany({
      where: {
        userId,
        groupId: null,
      },
      orderBy: { createdAt: "asc" },
    });

    let createdCount = 0;

    // For each personal drive, check if it exists in each group, and create if not
    for (const drive of personalDrives) {
      for (const group of userGroups) {
        // Check if this car is already logged in this group
        const existing = await prisma.drive.findFirst({
          where: {
            userId,
            carId: drive.carId,
            groupId: group.groupId,
          },
        });

        if (!existing) {
          // Create the group drive with same data
          await prisma.drive.create({
            data: {
              userId,
              carId: drive.carId,
              groupId: group.groupId,
              photoUrl: drive.photoUrl,
              rating: drive.rating,
              comment: drive.comment,
              context: drive.context,
              isManual: drive.isManual,
              points: drive.points,
              createdAt: drive.createdAt, // Keep original timestamp
            },
          });
          createdCount++;
        }
      }
    }

    return NextResponse.json({
      message: `Successfully backfilled ${createdCount} drives to ${userGroups.length} group(s)`,
      created: createdCount,
      groups: userGroups.length,
    });
  } catch (error) {
    console.error("Backfill error:", error);
    return NextResponse.json(
      { error: "Failed to backfill drives" },
      { status: 500 }
    );
  }
}
