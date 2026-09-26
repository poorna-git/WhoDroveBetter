"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, Loader2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, displayName }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Signup failed");
        setLoading(false);
        return;
      }

      // Auto-login after signup
      const signInRes = await fetch("/api/auth/callback/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (signInRes.ok) {
        router.push("/");
        router.refresh();
      } else {
        router.push("/login");
      }
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="text-6xl">🏁</div>
          <h1 className="font-heading text-3xl tracking-wider">
            Join the Race
          </h1>
          <p className="text-text-muted text-sm">Start logging your drives</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="displayName" className="text-sm font-medium text-text-secondary">
              Display Name
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Jake The Drift King"
              required
              className="w-full px-4 py-3 bg-bg-card border border-bg-hover rounded-xl text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-red/50 focus:border-accent-red transition-all"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium text-text-secondary">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="driftking99"
              required
              className="w-full px-4 py-3 bg-bg-card border border-bg-hover rounded-xl text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-red/50 focus:border-accent-red transition-all"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-text-secondary">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full px-4 py-3 bg-bg-card border border-bg-hover rounded-xl text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-red/50 focus:border-accent-red transition-all"
            />
            <p className="text-xs text-text-muted">At least 6 characters</p>
          </div>

          {error && (
            <div className="text-accent-red text-sm bg-accent-red/10 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-accent-red text-white font-semibold rounded-xl hover:bg-accent-red/90 active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <UserPlus className="w-5 h-5" />
            )}
            Create Account
          </button>
        </form>

        <p className="text-center text-text-muted text-sm">
          Already racing?{" "}
          <Link href="/login" className="text-accent-red hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
