import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculatePoints } from "@/lib/points";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();

    const {
      carId,
      photoUrl,
      rating,
      comment,
      context,
      isManual = false,
    } = body;

    if (!carId) {
      return NextResponse.json({ error: "Car is required" }, { status: 400 });
    }

    // Get car details
    const car = await prisma.car.findUnique({
      where: { id: carId },
    });

    if (!car) {
      return NextResponse.json({ error: "Car not found" }, { status: 404 });
    }

    // Fetch all groups the user belongs to
    const userGroups = await prisma.groupMember.findMany({
      where: { userId },
      select: { groupId: true },
    });

    // Check if user already logged this exact car (same carId = same make+model+year)
    const existingDrive = await prisma.drive.findFirst({
      where: { userId, carId, groupId: null },
    });

    if (existingDrive) {
      return NextResponse.json(
        {
          error: "Already in your garage!",
          message: `You've already logged the ${car.make} ${car.model}${car.year ? ` (${car.year})` : ""}. Try a different year or variant!`,
        },
        { status: 409 }
      );
    }

    // Check if brand is new to this user
    const priorBrandDrive = await prisma.drive.findFirst({
      where: {
        userId,
        car: { make: car.make },
      },
    });
    const isNewBrand = !priorBrandDrive;

    // Check user's current streak (drives in consecutive previous days)
    const recentDrives = await prisma.drive.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    let streakDays = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const loggedDates = new Set(
      recentDrives.map((d) => {
        const date = new Date(d.createdAt);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      })
    );

    // Count consecutive days backward
    let checkDate = new Date(today);
    while (loggedDates.has(checkDate.getTime())) {
      streakDays++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Create drives for personal feed + each group the user belongs to
    const drivesToCreate = [
      // Personal drive (no groupId)
      { groupId: null },
      // One drive per group
      ...userGroups.map(g => ({ groupId: g.groupId })),
    ];

    const createdDrives = [];
    let totalPoints = 0;
    let pointsBreakdown = null;

    for (const driveData of drivesToCreate) {
      // Check if first in THIS group to log this car
      let isFirstInGroup = false;
      if (driveData.groupId) {
        const priorGroupDrive = await prisma.drive.findFirst({
          where: { groupId: driveData.groupId, carId },
        });
        isFirstInGroup = !priorGroupDrive;
      }

      // Calculate points (same for all drives)
      const breakdown = calculatePoints({
        carTier: car.tier,
        hasPhoto: Boolean(photoUrl),
        hasReview: Boolean(rating || comment),
        isManual: Boolean(isManual),
        isFirstInGroup,
        isNewBrand,
        streakDays,
      });

      // Only count points once (for the personal drive)
      if (!driveData.groupId) {
        totalPoints = breakdown.total;
        pointsBreakdown = breakdown;
      }

      // Create the drive record
      const drive = await prisma.drive.create({
        data: {
          userId,
          carId,
          groupId: driveData.groupId,
          photoUrl: photoUrl || null,
          rating: rating ? parseInt(rating) : null,
          comment: comment || null,
          context: context || null,
          isManual: Boolean(isManual),
          points: breakdown.total,
        },
        include: {
          car: true,
          user: { select: { displayName: true, username: true } },
          group: driveData.groupId ? { select: { name: true } } : undefined,
        },
      });

      createdDrives.push(drive);
    }

    return NextResponse.json({
      drives: createdDrives,
      drive: createdDrives[0], // Personal drive for backward compatibility
      pointsBreakdown,
      isFirstLog: !existingDrive,
      groupsCount: userGroups.length,
    });
  } catch (error) {
    console.error("Drive creation error:", error);
    return NextResponse.json(
      { error: "Failed to log drive" },
      { status: 500 }
    );
  }
}

// GET: fetch recent drives (activity feed)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get("groupId");
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = {};
    if (groupId) where.groupId = groupId;
    if (userId) where.userId = userId;

    const drives = await prisma.drive.findMany({
      where,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        points: true,
        photoUrl: true,
        rating: true,
        comment: true,
        isManual: true,
        car: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            tier: true,
            horsepower: true,
            country: true,
          },
        },
        user: {
          select: {
            id: true,
            displayName: true,
            username: true,
            avatarUrl: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ drives });
  } catch (error) {
    console.error("Drive fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch drives" },
      { status: 500 }
    );
  }
}

// PUT: Edit drive details (photo, rating, comment, context, manual)
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { driveId, carId, photoUrl, rating, comment, context, isManual } = body;

    let targetCarId = carId;
    let targetUserId = session.user.id;

    if (driveId) {
      const drive = await prisma.drive.findUnique({
        where: { id: driveId },
      });

      if (!drive) {
        return NextResponse.json({ error: "Drive not found" }, { status: 404 });
      }

      // Check permissions (must be drive owner or admin)
      if (drive.userId !== session.user.id) {
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

        if (!isAdmin) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
      }

      targetCarId = drive.carId;
      targetUserId = drive.userId;
    }

    if (!targetCarId) {
      return NextResponse.json(
        { error: "driveId or carId is required" },
        { status: 400 }
      );
    }

    const car = await prisma.car.findUnique({
      where: { id: targetCarId },
    });

    if (!car) {
      return NextResponse.json({ error: "Car not found" }, { status: 404 });
    }

    // Recalculate points
    const pointsBreakdown = calculatePoints({
      carTier: car.tier,
      hasPhoto: Boolean(photoUrl),
      hasReview: Boolean(rating || comment),
      isManual: Boolean(isManual),
      isFirstInGroup: false,
      isNewBrand: false,
      streakDays: 0,
    });

    const parsedRating = rating !== undefined && rating !== null && rating !== ""
      ? Math.max(1, Math.min(10, parseInt(String(rating))))
      : null;

    // Update all matching drive records (personal + all groups) for this user & car
    const updateResult = await prisma.drive.updateMany({
      where: {
        userId: targetUserId,
        carId: targetCarId,
      },
      data: {
        photoUrl: photoUrl ? String(photoUrl).trim() : null,
        rating: parsedRating,
        comment: comment ? String(comment).trim() : null,
        context: context ? String(context).trim() : null,
        isManual: Boolean(isManual),
        points: pointsBreakdown.total,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Drive updated successfully across all views",
      updatedCount: updateResult.count,
      points: pointsBreakdown.total,
    });
  } catch (error) {
    console.error("Drive update error:", error);
    return NextResponse.json(
      { error: "Failed to update drive" },
      { status: 500 }
    );
  }
}

// DELETE: Remove car/drive from garage
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const queryDriveId = searchParams.get("driveId");
    const queryCarId = searchParams.get("carId");
    const body = await req.json().catch(() => ({}));

    const driveId = body.driveId || queryDriveId;
    const carId = body.carId || queryCarId;

    let targetCarId = carId;
    let targetUserId = session.user.id;

    if (driveId) {
      const drive = await prisma.drive.findUnique({
        where: { id: driveId },
      });

      if (!drive) {
        return NextResponse.json({ error: "Drive not found" }, { status: 404 });
      }

      // Check permissions
      if (drive.userId !== session.user.id) {
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

        if (!isAdmin) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
      }

      targetCarId = drive.carId;
      targetUserId = drive.userId;
    }

    if (!targetCarId) {
      return NextResponse.json(
        { error: "driveId or carId is required" },
        { status: 400 }
      );
    }

    // Delete all drive records for this user and car (both personal and groups)
    const deleteResult = await prisma.drive.deleteMany({
      where: {
        userId: targetUserId,
        carId: targetCarId,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Car removed from garage (${deleteResult.count} record(s) deleted)`,
      count: deleteResult.count,
    });
  } catch (error) {
    console.error("Drive delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete drive" },
      { status: 500 }
    );
  }
}
