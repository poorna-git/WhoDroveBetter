import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateInviteCode } from "@/lib/utils";

// POST: create a group
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await req.json();

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Group name is required" }, { status: 400 });
    }

    // Generate unique invite code
    let inviteCode = generateInviteCode();
    let existing = await prisma.group.findUnique({ where: { inviteCode } });
    while (existing) {
      inviteCode = generateInviteCode();
      existing = await prisma.group.findUnique({ where: { inviteCode } });
    }

    // Create group and add creator as admin
    const group = await prisma.group.create({
      data: {
        name: name.trim(),
        inviteCode,
        createdById: session.user.id,
        members: {
          create: {
            userId: session.user.id,
            role: "admin",
          },
        },
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, displayName: true, username: true } },
          },
        },
      },
    });

    return NextResponse.json({ group }, { status: 201 });
  } catch (error) {
    console.error("Group creation error:", error);
    return NextResponse.json({ error: "Failed to create group" }, { status: 500 });
  }
}

// GET: list user's groups
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const memberships = await prisma.groupMember.findMany({
      where: { userId: session.user.id },
      include: {
        group: {
          include: {
            members: {
              include: {
                user: { select: { id: true, displayName: true, username: true } },
              },
            },
            _count: { select: { drives: true } },
          },
        },
      },
    });

    const groups = memberships.map((m) => ({
      ...m.group,
      role: m.role,
      memberCount: m.group.members.length,
      driveCount: m.group._count.drives,
    }));

    return NextResponse.json({ groups });
  } catch (error) {
    console.error("Group fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch groups" }, { status: 500 });
  }
}
