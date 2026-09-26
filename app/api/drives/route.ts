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
      groupId,
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

    // Check if user already logged this car
    const existingDrive = await prisma.drive.findFirst({
      where: { userId, carId },
    });

    // Check if first in group to log this car
    let isFirstInGroup = false;
    if (groupId) {
      const priorGroupDrive = await prisma.drive.findFirst({
        where: { groupId, carId },
      });
      isFirstInGroup = !priorGroupDrive;
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

    // Calculate points using the full points engine
    const pointsBreakdown = calculatePoints({
      carTier: car.tier,
      hasPhoto: Boolean(photoUrl),
      hasReview: Boolean(rating || comment),
      isManual: Boolean(isManual),
      isFirstInGroup,
      isNewBrand,
      streakDays,
    });

    // Create the drive record
    const drive = await prisma.drive.create({
      data: {
        userId,
        carId,
        groupId: groupId || null,
        photoUrl: photoUrl || null,
        rating: rating ? parseInt(rating) : null,
        comment: comment || null,
        context: context || null,
        isManual: Boolean(isManual),
        points: pointsBreakdown.total,
      },
      include: {
        car: true,
        user: { select: { displayName: true, username: true } },
      },
    });

    return NextResponse.json({
      drive,
      pointsBreakdown,
      isFirstLog: !existingDrive,
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
      include: {
        car: true,
        user: { select: { id: true, displayName: true, username: true } },
        group: { select: { id: true, name: true } },
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
