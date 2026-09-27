"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PlusCircle, Trophy, Users, User, Compass, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Feed", icon: Compass },
  { href: "/log", label: "Add Car", icon: PlusCircle, isMain: true },
  { href: "/leaderboard", label: "Ranks", icon: Trophy },
  { href: "/groups", label: "Groups", icon: Users },
  { href: "/profile", label: "Passport", icon: User },
  // Note: Admin link is excluded from public menu; access controlled at the page level
];

export function Navigation() {
  const pathname = usePathname();

  // Don't show nav on auth pages
  if (pathname === "/login" || pathname === "/signup") {
    return null;
  }

  return (
    <>
      {/* Top Header - Desktop & Mobile */}
      <header className="sticky top-0 z-40 bg-bg/90 backdrop-blur-md border-b border-bg-card px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🏎️</span>
            <span className="font-heading text-xl font-bold tracking-wider text-text">
              WhoDrove<span className="text-accent-red">Better</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium transition-colors",
                    isActive
                      ? "text-accent-red"
                      : "text-text-muted hover:text-text"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Bottom Nav Bar - Mobile Only */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-bg-card/95 backdrop-blur-lg border-t border-bg-hover md:hidden">
        <div className="grid grid-cols-5 h-16 max-w-lg mx-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            if (item.isMain) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center justify-center -mt-5"
                >
                  <div className="w-12 h-12 rounded-full bg-accent-red flex items-center justify-center shadow-lg shadow-accent-red/30 active:scale-95 transition-transform">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-[10px] font-medium text-text mt-1">
                    {item.label}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 transition-colors active:scale-95",
                  isActive ? "text-accent-red" : "text-text-muted"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
