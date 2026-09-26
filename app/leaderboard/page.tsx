"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Trophy, Hash, Star, Users, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  username: string;
  value: number;
  label: string;
  driveCount?: number;
}

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const [type, setType] = useState<"points" | "count">("points");
  const [groupId, setGroupId] = useState<string>("");
  const [groups, setGroups] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [type, groupId]);

  const fetchGroups = async () => {
    try {
      const res = await fetch("/api/groups");
      const data = await res.json();
      setGroups(data.groups || []);
    } catch (error) {
      console.error("Failed to fetch groups:", error);
    }
  };

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      let url = `/api/leaderboard?type=${type}&limit=50`;
      if (groupId) url += `&groupId=${groupId}`;

      const res = await fetch(url);
      const data = await res.json();
      setLeaderboard(data.leaderboard || []);
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="font-heading text-3xl text-text">Leaderboard 🏆</h1>
        <p className="text-text-muted text-sm">
          Who's leading the pack?
        </p>
      </div>

      {/* Type Toggle: Points vs Count */}
      <div className="flex bg-bg-card p-1 rounded-xl border border-bg-hover">
        <button
          onClick={() => setType("points")}
          className={cn(
            "flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2",
            type === "points"
              ? "bg-accent-red text-white shadow-md"
              : "text-text-muted hover:text-text"
          )}
        >
          <Star className="w-4 h-4" />
          Points Leaderboard
        </button>
        <button
          onClick={() => setType("count")}
          className={cn(
            "flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2",
            type === "count"
              ? "bg-accent-red text-white shadow-md"
              : "text-text-muted hover:text-text"
          )}
        >
          <Hash className="w-4 h-4" />
          Pure Car Count
        </button>
      </div>

      {/* Group Filter (if user has groups) */}
      {groups.length > 0 && (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-text-muted" />
          <select
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            className="flex-1 px-3 py-2 bg-bg-card border border-bg-hover rounded-lg text-text text-sm focus:outline-none focus:ring-2 focus:ring-accent-red/50"
          >
            <option value="">Global Leaderboard</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Leaderboard List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-accent-red" />
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="bg-bg-card rounded-xl p-8 text-center text-text-muted">
          No entries yet. Be the first to log a drive!
        </div>
      ) : (
        <div className="space-y-2">
          {leaderboard.map((entry) => {
            const isCurrentUser = session?.user?.id === entry.userId;
            const isTop3 = entry.rank <= 3;

            return (
              <div
                key={entry.userId}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl transition-all",
                  isCurrentUser
                    ? "bg-accent-red/10 border-2 border-accent-red"
                    : "bg-bg-card hover:bg-bg-hover",
                  isTop3 && "shadow-lg"
                )}
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                      entry.rank === 1
                        ? "bg-accent-yellow text-bg font-extrabold text-base"
                        : entry.rank === 2
                        ? "bg-text-secondary text-bg font-bold"
                        : entry.rank === 3
                        ? "bg-amber-700 text-white font-bold"
                        : "bg-bg-hover text-text-muted"
                    )}
                  >
                    {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : entry.rank}
                  </div>

                  <div>
                    <p className="font-semibold text-text flex items-center gap-2">
                      {entry.displayName}
                      {isCurrentUser && (
                        <span className="text-[10px] bg-accent-red text-white px-1.5 py-0.5 rounded font-medium">
                          YOU
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-text-muted">@{entry.username}</p>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right">
                  <p className="font-bold text-lg text-text">
                    {entry.label}
                  </p>
                  {type === "points" && entry.driveCount !== undefined && (
                    <p className="text-xs text-text-muted">
                      {entry.driveCount} car{entry.driveCount !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
