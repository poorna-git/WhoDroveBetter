import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEarnedBadges, type UserStats } from "@/lib/points";
import { hash, compare } from "bcryptjs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");

    const session = await getServerSession(authOptions);

    // If no username provided, use logged-in user
    let userId = session?.user?.id;

    if (username) {
      const user = await prisma.user.findUnique({
        where: { username },
        select: { id: true },
      });
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      userId = user.id;
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch all drives for this user
    const drives = await prisma.drive.findMany({
      where: { userId },
      include: { car: true },
      orderBy: { createdAt: "desc" },
    });

    // Calculate stats
    const totalDrives = drives.length;
    const totalPoints = drives.reduce((sum, d) => sum + d.points, 0);
    const totalHorsepower = drives.reduce((sum, d) => sum + d.car.horsepower, 0);

    const uniqueBrands = Array.from(new Set(drives.map((d) => d.car.make)));

    const countryBreakdown: Record<string, number> = {};
    drives.forEach((d) => {
      countryBreakdown[d.car.country] = (countryBreakdown[d.car.country] || 0) + 1;
    });

    const tierBreakdown: Record<string, number> = {};
    drives.forEach((d) => {
      tierBreakdown[d.car.tier] = (tierBreakdown[d.car.tier] || 0) + 1;
    });

    const manualCount = drives.filter((d) => d.isManual).length;
    const photoCount = drives.filter((d) => d.photoUrl).length;

    // Calculate longest streak
    const sortedDrives = [...drives].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const driveDates = sortedDrives.map((d) => {
      const date = new Date(d.createdAt);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    });

    const uniqueDates = Array.from(new Set(driveDates)).sort((a, b) => a - b);

    let longestStreak = 0;
    let currentStreak = 1;

    for (let i = 1; i < uniqueDates.length; i++) {
      const diff = (uniqueDates[i] - uniqueDates[i - 1]) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        currentStreak++;
      } else {
        longestStreak = Math.max(longestStreak, currentStreak);
        currentStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, currentStreak);

    const topRating = Math.max(...drives.map((d) => d.rating || 0));

    // Favorite car (highest rated, or most driven)
    const favoriteCar = drives.length > 0
      ? drives.reduce((best, d) => {
          if (!best) return d;
          if ((d.rating || 0) > (best.rating || 0)) return d;
          return best;
        })
      : null;

    const stats: UserStats = {
      totalDrives,
      totalPoints,
      totalHorsepower,
      uniqueBrands,
      countryBreakdown,
      tierBreakdown,
      manualCount,
      photoCount,
      longestStreak,
      topRating,
    };

    // Calculate earned badges
    const earnedBadges = getEarnedBadges(stats);

    return NextResponse.json({
      user,
      stats,
      earnedBadges,
      favoriteCar: favoriteCar
        ? {
            id: favoriteCar.car.id,
            make: favoriteCar.car.make,
            model: favoriteCar.car.model,
            year: favoriteCar.car.year,
            tier: favoriteCar.car.tier,
            rating: favoriteCar.rating,
          }
        : null,
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// PUT: Update user profile (displayName, username, avatarUrl, password)
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { displayName, username, avatarUrl, currentPassword, newPassword } = await req.json();

    // Fetch current user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {};

    // Update displayName
    if (displayName !== undefined && displayName.trim() !== "") {
      updateData.displayName = displayName.trim();
    }

    // Update username (check uniqueness)
    if (username !== undefined && username.trim() !== "" && username !== user.username) {
      const existingUser = await prisma.user.findUnique({
        where: { username: username.trim() },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Username already taken" },
          { status: 400 }
        );
      }

      updateData.username = username.trim();
    }

    // Update avatarUrl
    if (avatarUrl !== undefined) {
      updateData.avatarUrl = avatarUrl.trim() || null;
    }

    // Update password (requires current password verification)
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Current password required to set new password" },
          { status: 400 }
        );
      }

      // Verify current password
      const isValid = await compare(currentPassword, user.passwordHash);

      if (!isValid) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 400 }
        );
      }

      // Hash new password
      const hashedPassword = await hash(newPassword, 10);
      updateData.passwordHash = hashedPassword;
    }

    // Perform update
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      user: updatedUser,
      message: "Profile updated successfully"
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
