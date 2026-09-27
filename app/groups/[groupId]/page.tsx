"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Car,
  Trophy,
  ArrowLeft,
  Star,
  Zap,
  Flame,
  Flag,
  Copy,
  Check,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { TIER_LABELS } from "@/lib/points";

interface MemberStats {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  role: string;
  joinedAt: string;
  stats: {
    totalDrives: number;
    totalPoints: number;
    totalHorsepower: number;
    uniqueBrands: number;
    uniqueCars: number;
    countryBreakdown: Record<string, number>;
    tierBreakdown: Record<string, number>;
  };
  recentCars: Array<{
    id: string;
    make: string;
    model: string;
    year?: number;
    tier: string;
    photoUrl?: string;
    rating?: number;
    createdAt: string;
  }>;
}

interface GroupDetails {
  id: string;
  name: string;
  inviteCode: string;
  createdAt: string;
  members: MemberStats[];
}

export default function GroupDetailsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const groupId = params.groupId as string;

  const [group, setGroup] = useState<GroupDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<MemberStats | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [backfilling, setBackfilling] = useState(false);
  const [backfillMessage, setBackfillMessage] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && groupId) {
      fetchGroupDetails();
    }
  }, [status, groupId, router]);

  const fetchGroupDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/groups/${groupId}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch group details");
      }

      setGroup(data.group);
      if (data.group?.members?.length > 0) {
        setSelectedMember(data.group.members[0]);
      }
    } catch (error) {
      console.error("Failed to load group:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyInviteCode = () => {
    if (!group) return;
    navigator.clipboard.writeText(group.inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleBackfill = async () => {
    setBackfilling(true);
    setBackfillMessage("");
    try {
      const res = await fetch("/api/groups/backfill", { method: "POST" });
      const data = await res.json();
      setBackfillMessage(data.message || "Backfill complete!");
      fetchGroupDetails();
    } catch {
      setBackfillMessage("Failed to backfill drives");
    } finally {
      setBackfilling(false);
    }
  };

  // Helper to rate catalogue diversity/impressiveness
  const getCatalogueRating = (stats: MemberStats["stats"]) => {
    let score = 0;
    // Points based on unique cars
    score += Math.min(stats.uniqueCars * 2, 40);
    // Points based on total horsepower
    score += Math.min(Math.floor(stats.totalHorsepower / 500), 30);
    // Points based on exotic/unicorn tiers
    const exoticCount = (stats.tierBreakdown?.["exotic"] || 0) + (stats.tierBreakdown?.["unicorn"] || 0);
    score += Math.min(exoticCount * 10, 30);

    const rating = (score / 10).toFixed(1);
    let title = "Novice Driver";
    if (score > 80) title = "Legendary Collector 👑";
    else if (score > 60) title = "Master Enthusiast 🔥";
    else if (score > 40) title = "Seasoned Cruiser 🏎️";
    else if (score > 20) title = "Garage Builder 🛠️";

    return { score: rating, title };
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-accent-red" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-text-muted">Group not found</p>
        <Link
          href="/groups"
          className="inline-flex items-center gap-2 text-accent-red font-semibold hover:underline text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Groups
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/groups"
          className="inline-flex items-center gap-1.5 text-text-muted hover:text-text transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Groups
        </Link>
        <button
          onClick={fetchGroupDetails}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-card border border-bg-hover hover:bg-bg-hover rounded-lg text-xs font-semibold text-text transition-all active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Group Card */}
      <div className="bg-gradient-to-br from-bg-card to-bg-hover rounded-2xl p-6 border border-bg-hover space-y-4 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs uppercase tracking-widest text-accent-red font-bold">
              Crew Details
            </span>
            <h1 className="font-heading text-3xl text-text mt-1">{group.name}</h1>
            <p className="text-xs text-text-muted mt-1">
              {group.members.length} {group.members.length === 1 ? "member" : "members"} • Created{" "}
              {new Date(group.createdAt).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={copyInviteCode}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-bg hover:bg-bg/80 border border-bg-hover rounded-xl text-xs font-mono font-bold text-accent-red transition-all active:scale-95"
          >
            <span>{group.inviteCode}</span>
            {copiedCode ? (
              <Check className="w-4 h-4 text-accent-green" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Sync / Backfill button */}
        <div className="pt-2 border-t border-bg-hover flex items-center justify-between">
          <p className="text-xs text-text-muted">
            Missing past cars in this group?
          </p>
          <button
            onClick={handleBackfill}
            disabled={backfilling}
            className="px-3 py-1.5 bg-accent-red/10 text-accent-red border border-accent-red/30 hover:bg-accent-red/20 rounded-lg text-xs font-semibold transition-all active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
          >
            {backfilling ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            Sync My Cars to Group
          </button>
        </div>

        {backfillMessage && (
          <div className="p-2.5 bg-accent-green/10 border border-accent-green/30 rounded-lg text-accent-green text-xs">
            {backfillMessage}
          </div>
        )}
      </div>

      {/* Member Selection Tabs */}
      <div className="space-y-3">
        <h2 className="font-heading text-lg text-text flex items-center gap-2">
          <Users className="w-5 h-5 text-accent-red" />
          Crew Passports ({group.members.length})
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {group.members.map((member) => (
            <button
              key={member.id}
              onClick={() => setSelectedMember(member)}
              className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                selectedMember?.id === member.id
                  ? "bg-bg-card border-accent-red shadow-md"
                  : "bg-bg/60 border-bg-hover hover:bg-bg-card"
              }`}
            >
              {member.avatarUrl ? (
                <img
                  src={member.avatarUrl}
                  alt={member.displayName}
                  className="w-10 h-10 rounded-full object-cover border border-bg-hover flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-accent-red/20 flex items-center justify-center text-lg flex-shrink-0">
                  🏎️
                </div>
              )}
              <div className="min-w-0">
                <p className="font-semibold text-text text-sm truncate">
                  {member.displayName}
                </p>
                <p className="text-[11px] text-text-muted truncate">
                  @{member.username}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Member Passport & Catalogue */}
      {selectedMember && (
        <div className="space-y-4 pt-2 animate-fade-in">
          {/* Driver Passport Header */}
          <div className="bg-bg-card rounded-2xl p-6 border-2 border-accent-red/30 space-y-4 shadow-xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                {selectedMember.avatarUrl ? (
                  <img
                    src={selectedMember.avatarUrl}
                    alt={selectedMember.displayName}
                    className="w-14 h-14 rounded-full object-cover border-2 border-accent-red shadow-md"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-accent-red/20 flex items-center justify-center text-3xl border border-accent-red/40 shadow-md">
                    🏎️
                  </div>
                )}
                <div>
                  <span className="text-xs uppercase tracking-widest text-accent-red font-bold">
                    Passport Details
                  </span>
                  <h3 className="font-heading text-2xl text-text mt-0.5">
                    {selectedMember.displayName}
                  </h3>
                  <p className="text-xs text-text-muted">
                    @{selectedMember.username} • {selectedMember.role}
                  </p>
                </div>
              </div>

              {/* Catalogue Rating Badge */}
              <div className="text-right">
                <div className="inline-flex items-center gap-1 bg-accent-yellow/20 text-accent-yellow px-2.5 py-1 rounded-lg text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-accent-yellow" />
                  {getCatalogueRating(selectedMember.stats).score}/10
                </div>
                <p className="text-[11px] text-text-muted mt-1 font-semibold">
                  {getCatalogueRating(selectedMember.stats).title}
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              <div className="bg-bg rounded-xl p-3">
                <p className="text-xs text-text-muted flex items-center gap-1">
                  <Car className="w-3.5 h-3.5 text-accent-red" />
                  Cars Driven
                </p>
                <p className="font-heading text-xl text-text mt-1">
                  {selectedMember.stats.totalDrives}
                </p>
              </div>

              <div className="bg-bg rounded-xl p-3">
                <p className="text-xs text-text-muted flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-accent-yellow" />
                  Total Points
                </p>
                <p className="font-heading text-xl text-accent-yellow mt-1">
                  {formatNumber(selectedMember.stats.totalPoints)}
                </p>
              </div>

              <div className="bg-bg rounded-xl p-3">
                <p className="text-xs text-text-muted flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-accent-red" />
                  Total HP
                </p>
                <p className="font-heading text-xl text-text mt-1">
                  {formatNumber(selectedMember.stats.totalHorsepower)}
                </p>
              </div>

              <div className="bg-bg rounded-xl p-3">
                <p className="text-xs text-text-muted flex items-center gap-1">
                  <Flag className="w-3.5 h-3.5 text-accent-green" />
                  Brands
                </p>
                <p className="font-heading text-xl text-text mt-1">
                  {selectedMember.stats.uniqueBrands}
                </p>
              </div>
            </div>
          </div>

          {/* Member's Car Catalogue */}
          <div className="bg-bg-card rounded-2xl p-4 border border-bg-hover space-y-3">
            <h4 className="font-heading text-base text-text flex items-center gap-2">
              <Car className="w-4 h-4 text-accent-red" />
              {selectedMember.displayName}'s Garage in this Crew
            </h4>

            {selectedMember.recentCars.length === 0 ? (
              <p className="text-sm text-text-muted py-4 text-center">
                No cars logged directly in this group yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {selectedMember.recentCars.map((drive) => {
                  const tierInfo = TIER_LABELS[drive.tier] || TIER_LABELS.common;
                  return (
                    <div
                      key={drive.id}
                      className="p-3 bg-bg rounded-xl border border-bg-hover flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-text text-sm truncate">
                          {drive.year ? `${drive.year} ` : ""}{drive.make} {drive.model}
                        </p>
                        <p className="text-xs text-text-muted mt-0.5">
                          {tierInfo.emoji} {tierInfo.label}
                          {drive.rating ? ` • ⭐ ${drive.rating}/10` : ""}
                        </p>
                      </div>
                      {drive.photoUrl && (
                        <img
                          src={drive.photoUrl}
                          alt={`${drive.make} ${drive.model}`}
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
