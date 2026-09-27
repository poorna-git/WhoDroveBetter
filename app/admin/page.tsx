"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Users, Trash2, Shield, Loader2, AlertCircle, RefreshCw, Car, Star } from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface AdminUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: string;
  driveCount: number;
  groupCount: number;
  totalPoints: number;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [cleaningDuplicates, setCleaningDuplicates] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchUsers();
    }
  }, [status, router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/admin/users");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch users");
      }

      setUsers(data.users || []);
    } catch (err: any) {
      setError(err.message || "Failed to load admin panel");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (user: AdminUser) => {
    const confirm = window.confirm(
      `Are you sure you want to delete user @${user.username} (${user.displayName})? This will delete all their drives and remove them from all groups.`
    );

    if (!confirm) return;

    setDeletingId(user.id);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete user");
      }

      setSuccess(`User @${user.username} deleted successfully`);
      setUsers(users.filter((u) => u.id !== user.id));
    } catch (err: any) {
      setError(err.message || "Failed to delete user");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCleanDuplicates = async () => {
    if (!window.confirm("Clean up duplicate drive records across all users? This will keep the best drive for each car (with photo/rating) and remove extras.")) {
      return;
    }

    setCleaningDuplicates(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/clean-duplicates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to clean duplicates");
      }

      setSuccess(data.message || "Duplicates cleaned successfully");
      fetchUsers(); // Refresh stats
    } catch (err: any) {
      setError(err.message || "Failed to clean duplicates");
    } finally {
      setCleaningDuplicates(false);
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
    <div className="space-y-6 pb-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl text-text flex items-center gap-2">
            <Shield className="w-7 h-7 text-accent-red" />
            Admin Panel
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Manage users and platform data
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCleanDuplicates}
            disabled={cleaningDuplicates}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-red/10 border border-accent-red/30 hover:bg-accent-red/20 rounded-lg text-xs font-semibold text-accent-red transition-all active:scale-95 disabled:opacity-50"
          >
            {cleaningDuplicates ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Cleaning...
              </>
            ) : (
              <>
                <Car className="w-3.5 h-3.5" />
                Clean Duplicates
              </>
            )}
          </button>
          <button
            onClick={fetchUsers}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-card border border-bg-hover hover:bg-bg-hover rounded-lg text-xs font-semibold text-text transition-all active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-accent-red/10 border border-accent-red/30 rounded-xl text-accent-red text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-accent-green/10 border border-accent-green/30 rounded-xl text-accent-green text-sm">
          {success}
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-bg-card rounded-xl p-4 border border-bg-hover">
          <p className="text-xs text-text-muted flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-accent-red" />
            Total Users
          </p>
          <p className="font-heading text-2xl text-text mt-1">{users.length}</p>
        </div>
        <div className="bg-bg-card rounded-xl p-4 border border-bg-hover">
          <p className="text-xs text-text-muted flex items-center gap-1">
            <Car className="w-3.5 h-3.5 text-accent-yellow" />
            Total Drives
          </p>
          <p className="font-heading text-2xl text-text mt-1">
            {users.reduce((sum, u) => sum + u.driveCount, 0)}
          </p>
        </div>
        <div className="bg-bg-card rounded-xl p-4 border border-bg-hover">
          <p className="text-xs text-text-muted flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-accent-green" />
            Total Points
          </p>
          <p className="font-heading text-2xl text-text mt-1">
            {formatNumber(users.reduce((sum, u) => sum + u.totalPoints, 0))}
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-bg-card rounded-xl border border-bg-hover overflow-hidden">
        <div className="p-4 border-b border-bg-hover">
          <h2 className="font-heading text-lg text-text">User Management</h2>
        </div>

        <div className="divide-y divide-bg-hover">
          {users.map((user) => (
            <div
              key={user.id}
              className="p-4 flex items-center justify-between hover:bg-bg/40 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.displayName}
                    className="w-10 h-10 rounded-full object-cover border border-bg-hover flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-accent-red/20 flex items-center justify-center text-lg flex-shrink-0">
                    🏎️
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-text truncate">
                      {user.displayName}
                    </p>
                    {user.id === session?.user?.id && (
                      <span className="text-[10px] bg-accent-red/20 text-accent-red px-1.5 py-0.5 rounded font-bold">
                        YOU
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-muted">
                    @{user.username} • Joined{" "}
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-semibold text-text">
                    {user.driveCount} drives • {user.groupCount} groups
                  </p>
                  <p className="text-xs text-accent-yellow font-bold">
                    {formatNumber(user.totalPoints)} pts
                  </p>
                </div>

                {user.id !== session?.user?.id && (
                  <button
                    onClick={() => handleDeleteUser(user)}
                    disabled={deletingId === user.id}
                    className="p-2 text-text-muted hover:text-accent-red hover:bg-accent-red/10 rounded-lg transition-colors active:scale-95 disabled:opacity-50"
                    title="Delete User"
                  >
                    {deletingId === user.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-accent-red" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
