"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Users, Plus, Key, Copy, Check, Car, Loader2, ArrowLeft, RefreshCw, Brain } from "lucide-react";
import Link from "next/link";

export default function GroupsPage() {
  const { session } = useSession();
  const router = useRouter();
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingBackfill, setSyncingBackfill] = useState(false);
  const [copiedCode, setCopiedCode] = useState("");

  // Modals
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await fetch("/api/groups");
      const data = await res.json();
      setGroups(data.groups || []);
    } catch (error) {
      console.error("Failed to fetch groups:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: groupName }),
      });

      if (res.ok) {
        setShowCreate(false);
        setGroupName("");
        fetchGroups();
      } else {
        alert("Failed to create group");
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/groups/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode }),
      });

      const data = await res.json();

      if (res.ok) {
        setShowJoin(false);
        setInviteCode("");
        fetchGroups();
      } else {
        alert(data.error || "Failed to join group");
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSyncAllGroups = async () => {
    if (!window.confirm("Sync all your personal drives to every group you're in? This may take a moment.")) return;

    setSyncingBackfill(true);
    try {
      const res = await fetch("/api/groups/backfill", { method: "POST" });
      const data = await res.json();

      if (res.ok) {
        alert(`✅ ${data.message}`);
        fetchGroups();
      } else {
        alert(data.error || "Failed to sync cars to groups");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong during sync");
    } finally {
      setSyncingBackfill(false);
    }
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(""), 2000);
  };

  return (
    <div className="space-y-6 pb-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="font-heading text-3xl text-text">Your Crews 👥</h1>
        <p className="text-text-muted text-sm">
          Compete directly against your friends
        </p>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center justify-center gap-2 py-3 bg-accent-red text-white font-semibold rounded-xl hover:bg-accent-red/90 active:scale-95 transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          Create Group
        </button>
        <button
          onClick={() => setShowJoin(true)}
          className="flex items-center justify-center gap-2 py-3 bg-bg-card border border-bg-hover text-text font-semibold rounded-xl hover:bg-bg-hover active:scale-95 transition-all text-sm"
        >
          <Key className="w-4 h-4 text-accent-yellow" />
          Join with Code
        </button>
      </div>

      {/* Backfill All Groups Button */}
      {session && (
        <button
          onClick={handleSyncAllGroups}
          disabled={syncingBackfill}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-bg-card border-2 border-accent-yellow/30 text-accent-yellow font-semibold rounded-xl hover:bg-accent-yellow/10 active:scale-95 transition-all text-sm"
        >
          <Brain className="w-4 h-4" />
          {syncingBackfill ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Syncing to all groups...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Sync My Cars to All Groups
            </>
          )}
        </button>
      )}

      {/* Create Group Modal */}
      {showCreate && (
        <div className="bg-bg-card p-4 rounded-xl border border-accent-red space-y-4 animate-slide-up">
          <h3 className="font-heading text-lg text-text">Create a Crew</h3>
          <form onSubmit={handleCreateGroup} className="space-y-3">
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g. Sunday Morning Drivers"
              required
              className="w-full px-4 py-2.5 bg-bg border border-bg-hover rounded-lg text-text text-sm focus:outline-none focus:ring-2 focus:ring-accent-red/50"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2 bg-accent-red text-white font-semibold rounded-lg text-sm hover:bg-accent-red/90 disabled:opacity-60"
              >
                {submitting ? "Creating..." : "Create"}
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 bg-bg-hover text-text-muted hover:text-text rounded-lg text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Join Group Modal */}
      {showJoin && (
        <div className="bg-bg-card p-4 rounded-xl border border-accent-yellow space-y-4 animate-slide-up">
          <h3 className="font-heading text-lg text-text">Join a Crew</h3>
          <form onSubmit={handleJoinGroup} className="space-y-3">
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="Enter 6-character code"
              required
              maxLength={6}
              className="w-full px-4 py-2.5 bg-bg border border-bg-hover rounded-lg text-text text-sm uppercase tracking-widest font-mono text-center focus:outline-none focus:ring-2 focus:ring-accent-yellow/50"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2 bg-accent-yellow text-bg font-semibold rounded-lg text-sm hover:bg-accent-yellow/90 disabled:opacity-60"
              >
                {submitting ? "Joining..." : "Join"}
              </button>
              <button
                type="button"
                onClick={() => setShowJoin(false)}
                className="px-4 py-2 bg-bg-hover text-text-muted hover:text-text rounded-lg text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Group List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-accent-red" />
        </div>
      ) : groups.length === 0 ? (
        <div className="bg-bg-card rounded-xl p-8 text-center text-text-muted">
          You haven't joined any groups yet. Create one or join with an invite code!
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map((group) => (
            <Link
              key={group.id}
              href={`/groups/${group.id}`}
              className="block bg-bg-card rounded-xl p-4 space-y-3 hover:bg-bg-hover transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-lg text-text">{group.name}</h3>
                  <p className="text-xs text-text-muted">
                    {group.memberCount} members • {group.driveCount} drives logged
                  </p>
                </div>
                {group.role === "admin" && (
                  <span className="text-[10px] bg-accent-yellow/20 text-accent-yellow px-2 py-0.5 rounded font-medium">
                    Admin
                  </span>
                )}
              </div>

              {/* Invite Code */}
              <div className="flex items-center justify-between bg-bg rounded-lg p-2.5 text-xs">
                <span className="text-text-muted">Invite Code:</span>
                <button
                  onClick={() => copyInviteCode(group.inviteCode)}
                  className="flex items-center gap-1.5 font-mono text-accent-red hover:underline font-bold"
                >
                  {group.inviteCode}
                  {copiedCode === group.inviteCode ? (
                    <Check className="w-3.5 h-3.5 text-accent-green" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}