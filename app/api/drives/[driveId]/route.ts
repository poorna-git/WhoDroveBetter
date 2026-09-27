import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculatePoints } from "@/lib/points";

// GET single drive
export async function GET(
  req: Request,
  { params }: { params: { driveId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const drive = await prisma.drive.findUnique({
      where: { id: params.driveId },
      include: {
        car: true,
        user: { select: { id: true, displayName: true, username: true, avatarUrl: true } },
        group: { select: { id: true, name: true } },
      },
    });

    if (!drive) {
      return NextResponse.json({ error: "Drive not found" }, { status: 404 });
    }

    return NextResponse.json({ drive });
  } catch (error) {
    console.error("Fetch drive error:", error);
    return NextResponse.json({ error: "Failed to fetch drive" }, { status: 500 });
  }
}

// PUT: Update drive
export async function PUT(
  req: Request,
  { params }: { params: { driveId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const drive = await prisma.drive.findUnique({
      where: { id: params.driveId },
    });

    if (!drive) {
      return NextResponse.json({ error: "Drive not found" }, { status: 404 });
    }

    if (drive.userId !== session.user.id) {
      const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } });
      const firstUser = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
      const isAdmin =
        currentUser?.id === firstUser?.id ||
        currentUser?.username?.toLowerCase() === "admin" ||
        currentUser?.username?.toLowerCase() === "poorna";

      if (!isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const body = await req.json().catch(() => ({}));
    const { photoUrl, rating, comment, context, isManual } = body;

    const car = await prisma.car.findUnique({
      where: { id: drive.carId },
    });

    if (!car) {
      return NextResponse.json({ error: "Car not found" }, { status: 404 });
    }

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

    const updateResult = await prisma.drive.updateMany({
      where: {
        userId: drive.userId,
        carId: drive.carId,
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
      message: "Drive updated successfully",
      updatedCount: updateResult.count,
      points: pointsBreakdown.total,
    });
  } catch (error) {
    console.error("Update drive error:", error);
    return NextResponse.json({ error: "Failed to update drive" }, { status: 500 });
  }
}

// DELETE drive
export async function DELETE(
  req: Request,
  { params }: { params: { driveId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const drive = await prisma.drive.findUnique({
      where: { id: params.driveId },
    });

    if (!drive) {
      return NextResponse.json({ error: "Drive not found" }, { status: 404 });
    }

    if (drive.userId !== session.user.id) {
      const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } });
      const firstUser = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
      const isAdmin =
        currentUser?.id === firstUser?.id ||
        currentUser?.username?.toLowerCase() === "admin" ||
        currentUser?.username?.toLowerCase() === "poorna";

      if (!isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const deleteResult = await prisma.drive.deleteMany({
      where: {
        userId: drive.userId,
        carId: drive.carId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Car removed from garage",
      count: deleteResult.count,
    });
  } catch (error) {
    console.error("Delete drive error:", error);
    return NextResponse.json({ error: "Failed to delete drive" }, { status: 500 });
  }
}
