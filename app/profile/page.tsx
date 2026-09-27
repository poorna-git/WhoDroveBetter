"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Car, Zap, Trophy, Flame, Flag, Star, LogOut, Loader2, Edit, X, Save } from "lucide-react";
import { BADGES } from "@/lib/points";
import { formatNumber, formatCarName } from "@/lib/utils";

interface ProfileData {
  user: {
    displayName: string;
    username: string;
    avatarUrl?: string;
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
  const [showEditModal, setShowEditModal] = useState(false);

  // Edit form state
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editAvatarUrl, setEditAvatarUrl] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
      // Initialize edit form with current values
      setEditDisplayName(data.user.displayName);
      setEditUsername(data.user.username);
      setEditAvatarUrl(data.user.avatarUrl || "");
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    setShowEditModal(true);
    setError("");
    setSuccess("");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate password change
    if (newPassword && newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: editDisplayName,
          username: editUsername,
          avatarUrl: editAvatarUrl,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setSuccess("Profile updated successfully!");

      // Refresh profile data
      await fetchProfile();

      // Close modal after 1.5s
      setTimeout(() => {
        setShowEditModal(false);
        setSuccess("");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
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
    <div className="space-y-6 pb-8 animate-fade-in relative">
      {/* Driver Passport Card */}
      <div className="bg-gradient-to-br from-bg-card to-bg-hover rounded-2xl p-6 border-2 border-accent-red/30 space-y-4 shadow-xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {profile.user.avatarUrl ? (
              <img
                src={profile.user.avatarUrl}
                alt={profile.user.displayName}
                className="w-14 h-14 rounded-full object-cover border-2 border-accent-red shadow-md"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-accent-red/20 flex items-center justify-center text-3xl border border-accent-red/40 shadow-md">
                🏎️
              </div>
            )}
            <div>
              <span className="text-xs uppercase tracking-widest text-accent-red font-bold">
                Driver Passport
              </span>
              <h1 className="font-heading text-2xl text-text mt-0.5">
                {profile.user.displayName}
              </h1>
              <p className="text-xs text-text-muted">@{profile.user.username}</p>
            </div>
          </div>
          <button
            onClick={handleEditProfile}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-bg/80 hover:bg-bg border border-bg-hover hover:border-accent-red/50 rounded-lg text-xs font-semibold text-text transition-all active:scale-95"
          >
            <Edit className="w-3.5 h-3.5 text-accent-red" />
            Edit Profile
          </button>
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
            {formatCarName(profile.favoriteCar)}
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

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bg-card border border-bg-hover rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-bg-hover pb-3">
              <h2 className="font-heading text-xl text-text flex items-center gap-2">
                <Edit className="w-5 h-5 text-accent-red" />
                Edit Profile
              </h2>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-text-muted hover:text-text p-1 rounded-lg hover:bg-bg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-accent-red/10 border border-accent-red/30 rounded-xl text-accent-red text-xs">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-accent-green/10 border border-accent-green/30 rounded-xl text-accent-green text-xs">
                {success}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Display Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full px-3.5 py-2.5 bg-bg border border-bg-hover rounded-xl text-text text-sm focus:outline-none focus:ring-2 focus:ring-accent-red/50 focus:border-accent-red transition-all"
                />
              </div>

              {/* Username */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-sm">
                    @
                  </span>
                  <input
                    type="text"
                    required
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                    placeholder="username"
                    className="w-full pl-8 pr-3.5 py-2.5 bg-bg border border-bg-hover rounded-xl text-text text-sm focus:outline-none focus:ring-2 focus:ring-accent-red/50 focus:border-accent-red transition-all"
                  />
                </div>
              </div>

              {/* Profile Picture / Avatar URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">
                  Profile Picture URL (optional)
                </label>
                <input
                  type="url"
                  value={editAvatarUrl}
                  onChange={(e) => setEditAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full px-3.5 py-2.5 bg-bg border border-bg-hover rounded-xl text-text text-sm focus:outline-none focus:ring-2 focus:ring-accent-red/50 focus:border-accent-red transition-all"
                />
                <p className="text-[11px] text-text-muted">
                  Paste any image link (e.g. Imgur, Discord, Unsplash).
                </p>
              </div>

              {/* Change Password Section */}
              <div className="pt-2 border-t border-bg-hover space-y-3">
                <p className="text-xs font-bold text-text uppercase tracking-wider">
                  Change Password (optional)
                </p>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-3.5 py-2.5 bg-bg border border-bg-hover rounded-xl text-text text-sm focus:outline-none focus:ring-2 focus:ring-accent-red/50 focus:border-accent-red transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-3.5 py-2.5 bg-bg border border-bg-hover rounded-xl text-text text-sm focus:outline-none focus:ring-2 focus:ring-accent-red/50 focus:border-accent-red transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-3.5 py-2.5 bg-bg border border-bg-hover rounded-xl text-text text-sm focus:outline-none focus:ring-2 focus:ring-accent-red/50 focus:border-accent-red transition-all"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 bg-bg border border-bg-hover hover:bg-bg-hover text-text-secondary rounded-xl text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-accent-red hover:bg-accent-red/90 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-60 shadow-lg shadow-accent-red/20"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
