"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Car, Calendar, Trophy, Zap, Loader2 } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import { TIER_LABELS } from "@/lib/points";

interface Drive {
  id: string;
  createdAt: string;
  points: number;
  photoUrl?: string;
  rating?: number;
  comment?: string;
  car: {
    make: string;
    model: string;
    year?: number;
    tier: string;
  };
  user: {
    displayName: string;
    username: string;
  };
  group?: {
    name: string;
  };
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [drives, setDrives] = useState<Drive[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchDrives();
    }
  }, [status]);

  const fetchDrives = async () => {
    try {
      const res = await fetch("/api/drives?limit=30");
      const data = await res.json();
      setDrives(data.drives || []);
    } catch (error) {
      console.error("Failed to fetch drives:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-accent-red" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Welcome Card */}
      <div className="bg-gradient-to-br from-accent-red to-accent-red/70 rounded-2xl p-6 text-white">
        <h1 className="font-heading text-2xl mb-2">
          Welcome, {session?.user?.name || "Driver"}! 🏁
        </h1>
        <p className="text-white/90 text-sm mb-4">
          Track every car you've driven and see who drove better.
        </p>
        <Link
          href="/log"
          className="inline-flex items-center gap-2 bg-white text-accent-red px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-white/90 active:scale-95 transition-all"
        >
          <Car className="w-4 h-4" />
          Log a Car
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Link
          href="/leaderboard"
          className="bg-bg-card rounded-xl p-4 hover:bg-bg-hover active:scale-95 transition-all"
        >
          <Trophy className="w-5 h-5 text-accent-yellow mb-2" />
          <p className="text-xs text-text-muted">Leaderboard</p>
          <p className="font-heading text-lg text-text">Ranks</p>
        </Link>
        <Link
          href="/groups"
          className="bg-bg-card rounded-xl p-4 hover:bg-bg-hover active:scale-95 transition-all"
        >
          <Zap className="w-5 h-5 text-accent-red mb-2" />
          <p className="text-xs text-text-muted">Your Groups</p>
          <p className="font-heading text-lg text-text">Crews</p>
        </Link>
        <Link
          href="/profile"
          className="bg-bg-card rounded-xl p-4 hover:bg-bg-hover active:scale-95 transition-all"
        >
          <Car className="w-5 h-5 text-accent-green mb-2" />
          <p className="text-xs text-text-muted">Profile</p>
          <p className="font-heading text-lg text-text">Passport</p>
        </Link>
      </div>

      {/* Activity Feed */}
      <div className="space-y-3">
        <h2 className="font-heading text-xl text-text flex items-center gap-2">
          <Calendar className="w-5 h-5 text-accent-red" />
          Recent Activity
        </h2>

        {drives.length === 0 ? (
          <div className="bg-bg-card rounded-xl p-8 text-center">
            <p className="text-text-muted mb-4">No drives logged yet.</p>
            <Link
              href="/log"
              className="inline-flex items-center gap-2 bg-accent-red text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-accent-red/90 active:scale-95 transition-all"
            >
              <Car className="w-4 h-4" />
              Log Your First Car
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {drives.map((drive) => {
              const tierInfo = TIER_LABELS[drive.car.tier] || TIER_LABELS.common;
              return (
                <div
                  key={drive.id}
                  className="bg-bg-card rounded-xl p-4 hover:bg-bg-hover transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {drive.photoUrl ? (
                      <img
                        src={drive.photoUrl}
                        alt={`${drive.car.make} ${drive.car.model}`}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-bg-hover flex items-center justify-center">
                        <Car className="w-6 h-6 text-text-muted" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-text">
                            {drive.user.displayName}
                          </p>
                          <p className="text-sm text-text-muted">
                            drove a{" "}
                            <span className={`font-semibold text-${tierInfo.color}`}>
                              {drive.car.year} {drive.car.make} {drive.car.model}
                            </span>
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-lg font-bold text-accent-red">
                            +{drive.points}
                          </p>
                          <p className="text-xs text-text-muted">pts</p>
                        </div>
                      </div>

                      {drive.comment && (
                        <p className="text-sm text-text-secondary mt-2 italic">
                          "{drive.comment}"
                        </p>
                      )}

                      <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
                        <span>{timeAgo(new Date(drive.createdAt))}</span>
                        {drive.group && (
                          <>
                            <span>•</span>
                            <span>{drive.group.name}</span>
                          </>
                        )}
                        {drive.rating && (
                          <>
                            <span>•</span>
                            <span>⭐ {drive.rating}/10</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
