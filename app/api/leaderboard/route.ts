import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: leaderboard data
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get("groupId");
    const type = searchParams.get("type") || "points"; // "points" or "count"
    const limit = parseInt(searchParams.get("limit") || "20");

    // Build where clause
    const driveWhere: any = {};
    if (groupId) driveWhere.groupId = groupId;

    if (type === "count") {
      // Pure car count leaderboard
      const users = await prisma.user.findMany({
        where: groupId
          ? { groupMembers: { some: { groupId } } }
          : undefined,
        select: {
          id: true,
          displayName: true,
          username: true,
          _count: {
            select: {
              drives: groupId ? { where: { groupId } } : true,
            },
          },
        },
        orderBy: {
          drives: { _count: "desc" },
        },
        take: limit,
      });

      const leaderboard = users.map((u, i) => ({
        rank: i + 1,
        userId: u.id,
        displayName: u.displayName,
        username: u.username,
        value: u._count.drives,
        label: `${u._count.drives} car${u._count.drives !== 1 ? "s" : ""}`,
      }));

      return NextResponse.json({ leaderboard, type: "count" });
    } else {
      // Points leaderboard
      const drives = await prisma.drive.groupBy({
        by: ["userId"],
        where: groupId ? { groupId } : undefined,
        _sum: { points: true },
        _count: true,
        orderBy: { _sum: { points: "desc" } },
        take: limit,
      });

      // Fetch user display names
      const userIds = drives.map((d) => d.userId);
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, displayName: true, username: true },
      });

      const userMap = new Map(users.map((u) => [u.id, u]));

      const leaderboard = drives.map((d, i) => ({
        rank: i + 1,
        userId: d.userId,
        displayName: userMap.get(d.userId)?.displayName || "Unknown",
        username: userMap.get(d.userId)?.username || "unknown",
        value: d._sum.points || 0,
        driveCount: d._count,
        label: `${(d._sum.points || 0).toLocaleString()} pts`,
      }));

      return NextResponse.json({ leaderboard, type: "points" });
    }
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
