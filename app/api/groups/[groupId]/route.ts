import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Get group details with members and their stats
export async function GET(
  req: Request,
  { params }: { params: { groupId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const groupId = params.groupId;

    // Check if user is member of this group
    const membership = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: session.user.id,
          groupId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Not a member of this group" },
        { status: 403 }
      );
    }

    // Fetch group with members
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Get stats for each member
    const membersWithStats = await Promise.all(
      group.members.map(async (member) => {
        // Get drives in this group
        const groupDrives = await prisma.drive.findMany({
          where: {
            userId: member.userId,
            groupId,
          },
          include: {
            car: true,
          },
          orderBy: { createdAt: "desc" },
        });

        // Get all user drives for overall stats
        let allDrives = await prisma.drive.findMany({
          where: { userId: member.userId, groupId: null },
          include: { car: true },
        });

        if (allDrives.length === 0) {
          allDrives = await prisma.drive.findMany({
            where: { userId: member.userId },
            include: { car: true },
          });
        }

        // Deduplicate user drives by carId so stats are accurate
        const uniqueDrivesMap = new Map<string, typeof allDrives[0]>();
        for (const drive of allDrives) {
          if (!drive.carId) continue;
          if (!uniqueDrivesMap.has(drive.carId)) {
            uniqueDrivesMap.set(drive.carId, drive);
          } else {
            const existing = uniqueDrivesMap.get(drive.carId)!;
            const scoreExisting = (existing.photoUrl ? 10 : 0) + (existing.rating ? 5 : 0) + (existing.comment ? 2 : 0);
            const scoreCurrent = (drive.photoUrl ? 10 : 0) + (drive.rating ? 5 : 0) + (drive.comment ? 2 : 0);
            if (scoreCurrent > scoreExisting) {
              uniqueDrivesMap.set(drive.carId, drive);
            }
          }
        }
        const uniqueUserDrives = Array.from(uniqueDrivesMap.values());

        const totalPoints = uniqueUserDrives.reduce((sum, d) => sum + d.points, 0);
        const totalHorsepower = uniqueUserDrives.reduce((sum, d) => sum + d.car.horsepower, 0);
        const uniqueBrands = [...new Set(uniqueUserDrives.map((d) => d.car.make))];
        const uniqueCarIds = [...new Set(uniqueUserDrives.map((d) => d.carId))];

        const countryBreakdown: Record<string, number> = {};
        const tierBreakdown: Record<string, number> = {};

        uniqueUserDrives.forEach((drive) => {
          countryBreakdown[drive.car.country] = (countryBreakdown[drive.car.country] || 0) + 1;
          tierBreakdown[drive.car.tier] = (tierBreakdown[drive.car.tier] || 0) + 1;
        });

        return {
          ...member.user,
          role: member.role,
          joinedAt: member.joinedAt,
          stats: {
            totalDrives: uniqueUserDrives.length,
            totalPoints,
            totalHorsepower,
            uniqueBrands: uniqueBrands.length,
            uniqueCars: uniqueCarIds.length,
            countryBreakdown,
            tierBreakdown,
          },
          recentCars: groupDrives.map((d) => ({
            id: d.id,
            carId: d.carId,
            make: d.car.make,
            model: d.car.model,
            year: d.car.year,
            tier: d.car.tier,
            photoUrl: d.photoUrl,
            rating: d.rating,
            comment: d.comment,
            context: d.context,
            isManual: d.isManual,
            points: d.points,
            createdAt: d.createdAt,
          })),
        };
      })
    );

    return NextResponse.json({
      group: {
        id: group.id,
        name: group.name,
        inviteCode: group.inviteCode,
        createdAt: group.createdAt,
        members: membersWithStats,
      },
    });
  } catch (error) {
    console.error("Group details fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch group details" },
      { status: 500 }
    );
  }
}
