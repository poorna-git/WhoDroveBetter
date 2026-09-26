"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Car, Zap, Trophy, Flame, Flag, Star, LogOut, Loader2 } from "lucide-react";
import { BADGES } from "@/lib/points";
import { formatNumber } from "@/lib/utils";

interface ProfileData {
  user: {
    displayName: string;
    username: string;
    createdAt: string;
  };
  stats: {
    totalDrives: number;
    totalPoints: number;
    totalHorsepower: number;
    uniqueBrands: string[];
    countryBreakdown: Record<string, number>;
    tierBreakdown: Record<string, number>;
    manualCount: number;
    photoCount: number;
    longestStreak: number;
    topRating: number;
  };
  earnedBadges: {
    id: string;
    name: string;
    emoji: string;
    description: string;
  }[];
  favoriteCar?: {
    make: string;
    model: string;
    year?: number;
    tier: string;
    rating?: number;
  };
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, router]);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();
      setProfile(data);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
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

  if (!profile) return null;

  return (
    <div className="space-y-6 pb-8 animate-fade-in">
      {/* Driver Passport Card */}
      <div className="bg-gradient-to-br from-bg-card to-bg-hover rounded-2xl p-6 border-2 border-accent-red/30 space-y-4 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs uppercase tracking-widest text-accent-red font-bold">
              Driver Passport
            </span>
            <h1 className="font-heading text-2xl text-text mt-1">
              {profile.user.displayName}
            </h1>
            <p className="text-xs text-text-muted">@{profile.user.username}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-accent-red/20 flex items-center justify-center text-2xl border border-accent-red/40">
            🏎️
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="bg-bg/60 rounded-xl p-3">
            <p className="text-xs text-text-muted flex items-center gap-1">
              <Car className="w-3.5 h-3.5 text-accent-red" />
              Cars Driven
            </p>
            <p className="font-heading text-2xl text-text mt-1">
              {profile.stats.totalDrives}
            </p>
          </div>

          <div className="bg-bg/60 rounded-xl p-3">
            <p className="text-xs text-text-muted flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-accent-yellow" />
              Total Points
            </p>
            <p className="font-heading text-2xl text-accent-yellow mt-1">
              {formatNumber(profile.stats.totalPoints)}
            </p>
          </div>

          <div className="bg-bg/60 rounded-xl p-3">
            <p className="text-xs text-text-muted flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-accent-red" />
              Total HP Controlled
            </p>
            <p className="font-heading text-2xl text-text mt-1">
              {formatNumber(profile.stats.totalHorsepower)}
            </p>
          </div>

          <div className="bg-bg/60 rounded-xl p-3">
            <p className="text-xs text-text-muted flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              Longest Streak
            </p>
            <p className="font-heading text-2xl text-text mt-1">
              {profile.stats.longestStreak} days
            </p>
          </div>
        </div>
      </div>

      {/* Favorite Car */}
      {profile.favoriteCar && (
        <div className="bg-bg-card rounded-xl p-4 space-y-2">
          <p className="text-xs text-text-muted flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-accent-yellow" />
            Top Rated Car
          </p>
          <p className="font-heading text-lg text-text">
            {profile.favoriteCar.year} {profile.favoriteCar.make} {profile.favoriteCar.model}
          </p>
          {profile.favoriteCar.rating && (
            <p className="text-xs text-accent-yellow">
              ⭐ {profile.favoriteCar.rating}/10
            </p>
          )}
        </div>
      )}

      {/* Country Breakdown */}
      {Object.keys(profile.stats.countryBreakdown).length > 0 && (
        <div className="bg-bg-card rounded-xl p-4 space-y-3">
          <p className="text-xs text-text-muted flex items-center gap-1">
            <Flag className="w-3.5 h-3.5 text-accent-red" />
            Country Origin Breakdown
          </p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(profile.stats.countryBreakdown).map(([country, count]) => (
              <div key={country} className="bg-bg rounded-lg p-2.5 flex items-center justify-between text-xs">
                <span className="text-text">{country}</span>
                <span className="font-bold text-accent-red">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Badges / Trophies */}
      <div className="bg-bg-card rounded-xl p-4 space-y-3">
        <p className="text-xs text-text-muted flex items-center gap-1">
          <Trophy className="w-3.5 h-3.5 text-accent-yellow" />
          Badges ({profile.earnedBadges.length}/{BADGES.length})
        </p>

        <div className="grid grid-cols-2 gap-2">
          {BADGES.map((badge) => {
            const isEarned = profile.earnedBadges.some((b) => b.id === badge.id);
            return (
              <div
                key={badge.id}
                className={`p-2.5 rounded-lg flex items-center gap-2 text-xs transition-opacity ${
                  isEarned
                    ? "bg-bg border border-accent-yellow/30 text-text"
                    : "bg-bg/40 text-text-muted opacity-40"
                }`}
              >
                <span className="text-xl">{badge.emoji}</span>
                <div>
                  <p className="font-semibold">{badge.name}</p>
                  <p className="text-[10px] text-text-muted">{badge.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="w-full flex items-center justify-center gap-2 py-3 bg-bg-card border border-bg-hover text-accent-red rounded-xl hover:bg-bg-hover transition-colors text-sm font-semibold"
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </button>
    </div>
  );
}
