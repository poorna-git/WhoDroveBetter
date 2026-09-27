import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Generate a short invite code (6 chars). */
export function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/** Format a number with commas. */
export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

/** Format car name cleanly without year, only showing year if there are multiple cars of the same make & model in the list. */
export function formatCarName(
  car: { make: string; model: string; year?: number | null },
  carList?: Array<{ make: string; model: string; year?: number | null }>
): string {
  if (!car) return "";

  // If a list of cars is provided, check if there are multiple cars with the same make + model
  if (carList && carList.length > 0) {
    const matchingCars = carList.filter(
      (c) =>
        c.make.toLowerCase().trim() === car.make.toLowerCase().trim() &&
        c.model.toLowerCase().trim() === car.model.toLowerCase().trim()
    );

    // If there's more than one car with the same make & model, include the year to distinguish them
    if (matchingCars.length > 1 && car.year) {
      return `${car.year} ${car.make} ${car.model}`;
    }
  }

  // Otherwise, display clean make + model without year
  return `${car.make} ${car.model}`;
}

export function timeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
