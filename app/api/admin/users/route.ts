import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: List all users (admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin (you need to set this up - for now using username check)
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    // TODO: Add isAdmin field to User model, for now checking if username is "admin" or first user
    const allUsers = await prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      take: 1,
    });
    const isAdmin = currentUser?.id === allUsers[0]?.id;

    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            drives: true,
            groupMembers: true,
          },
        },
      },
    });

    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const drives = await prisma.drive.findMany({
          where: { userId: user.id },
          include: { car: true },
        });

        const totalPoints = drives.reduce((sum, d) => sum + d.points, 0);

        return {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt,
          driveCount: user._count.drives,
          groupCount: user._count.groupMembers,
          totalPoints,
        };
      })
    );

    return NextResponse.json({ users: usersWithStats });
  } catch (error) {
    console.error("Admin users fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a user (admin only)
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    const allUsers = await prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      take: 1,
    });
    const isAdmin = currentUser?.id === allUsers[0]?.id;

    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Prevent self-deletion
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Delete user (cascade will handle drives and group memberships)
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("User deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
