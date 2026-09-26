"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Search, Camera, Star, MessageSquare, Settings2, Loader2, CheckCircle, Car } from "lucide-react";
import { getNoPhotoComment, getTierComment } from "@/lib/comments";
import { TIER_LABELS } from "@/lib/points";

interface CarResult {
  id: string;
  make: string;
  model: string;
  year?: number | null;
  tier: string;
  horsepower: number;
  country: string;
  isExternal?: boolean;
}

export default function LogCarPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [cars, setCars] = useState<CarResult[]>([]);
  const [selectedCar, setSelectedCar] = useState<CarResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Optional fields
  const [showOptional, setShowOptional] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");
  const [rating, setRating] = useState("");
  const [comment, setComment] = useState("");
  const [context, setContext] = useState("");
  const [isManual, setIsManual] = useState(false);

  // Groups
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [noPhotoRoast, setNoPhotoRoast] = useState("");
  const [pointsEarned, setPointsEarned] = useState(0);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchGroups();
    }
  }, [status, router]);

  // Debounced search — waits 300ms after user stops typing
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (searchQuery.length < 2) {
      setCars([]);
      setShowResults(false);
      return;
    }

    setSearching(true);
    debounceTimer.current = setTimeout(() => {
      searchCars(searchQuery);
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await fetch("/api/groups");
      const data = await res.json();
      setGroups(data.groups || []);
    } catch (error) {
      console.error("Failed to fetch groups:", error);
    }
  };

  const searchCars = async (query: string) => {
    try {
      const res = await fetch(`/api/cars?q=${encodeURIComponent(query)}&limit=30`);
      const data = await res.json();
      setCars(data.cars || []);
      setShowResults(true);
    } catch (error) {
      console.error("Failed to search cars:", error);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectCar = async (car: CarResult) => {
    // If it's an external car, save it to DB first
    if (car.isExternal) {
      try {
        const res = await fetch("/api/cars", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            make: car.make,
            model: car.model,
            year: car.year || null,
          }),
        });
        const data = await res.json();
        if (data.car) {
          setSelectedCar(data.car);
        } else {
          setSelectedCar(car);
        }
      } catch (error) {
        console.error("Failed to save external car:", error);
        setSelectedCar(car);
      }
    } else {
      setSelectedCar(car);
    }

    setSearchQuery("");
    setCars([]);
    setShowResults(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCar) return;

    setSubmitting(true);

    try {
      const res = await fetch("/api/drives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carId: selectedCar.id,
          groupId: selectedGroupId || undefined,
          photoUrl: photoUrl || undefined,
          rating: rating ? parseInt(rating) : undefined,
          comment: comment || undefined,
          context: context || undefined,
          isManual,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to log drive");
      }

      const data = await res.json();
      setPointsEarned(data.pointsBreakdown?.total || 10);

      // Show roast if no photo
      if (!photoUrl) {
        setNoPhotoRoast(getNoPhotoComment());
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 2500);
    } catch (error) {
      console.error("Failed to log drive:", error);
      alert("Failed to log drive. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-accent-red" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 animate-fade-in">
        <CheckCircle className="w-16 h-16 text-accent-green" />
        <h2 className="font-heading text-2xl text-text">Drive Logged! 🏁</h2>
        <p className="text-accent-yellow font-heading text-3xl animate-count-up">
          +{pointsEarned} pts
        </p>
        {noPhotoRoast && (
          <p className="text-text-muted italic max-w-sm bg-bg-card rounded-xl p-3 text-sm">
            {noPhotoRoast}
          </p>
        )}
        <p className="text-text-secondary text-sm">Redirecting to feed...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h1 className="font-heading text-3xl text-text">Log a Car 🚗</h1>
        <p className="text-text-muted text-sm">
          Search by make or model — e.g. "Slavia", "Skoda", "i20", "City"
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Car Selection */}
        {!selectedCar ? (
          <div className="space-y-3 relative" ref={dropdownRef}>
            <label className="text-sm font-medium text-text-secondary">
              Search for a car *
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => cars.length > 0 && setShowResults(true)}
                placeholder='Type make or model (e.g. "Slavia", "i20", "City", "Creta")'
                className="w-full pl-12 pr-4 py-3 bg-bg-card border border-bg-hover rounded-xl text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-red/50 focus:border-accent-red transition-all"
                autoFocus
              />
              {searching && (
                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-accent-red" />
              )}
            </div>

            {showResults && cars.length > 0 && (
              <div className="absolute z-50 left-0 right-0 bg-bg-card rounded-xl border border-bg-hover max-h-80 overflow-y-auto shadow-2xl">
                {cars.map((car, index) => {
                  const tierInfo = TIER_LABELS[car.tier] || TIER_LABELS.common;
                  return (
                    <button
                      key={`${car.id}-${index}`}
                      type="button"
                      onMouseDown={(e) => {
                        // Use mousedown instead of click to fire before blur hides the dropdown
                        e.preventDefault();
                        handleSelectCar(car);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-bg-hover transition-colors flex items-center justify-between group border-b border-bg-hover/50 last:border-0"
                    >
                      <div>
                        <p className="font-semibold text-text group-hover:text-accent-red transition-colors">
                          {car.make} {car.model} {car.year ? `(${car.year})` : ""}
                        </p>
                        <p className="text-xs text-text-muted mt-0.5">
                          {car.isExternal ? (
                            <span>🌐 Found online — tap to add</span>
                          ) : (
                            <span>
                              {tierInfo.emoji} {tierInfo.label} • {car.horsepower > 0 ? `${car.horsepower} HP • ` : ""}{car.country}
                            </span>
                          )}
                        </p>
                      </div>
                      <Car className="w-5 h-5 text-text-muted group-hover:text-accent-red transition-colors flex-shrink-0" />
                    </button>
                  );
                })}
              </div>
            )}

            {!searching && searchQuery.length >= 2 && cars.length === 0 && (
              <p className="text-text-muted text-sm text-center py-4">
                No cars found for "{searchQuery}". Try a different spelling.
              </p>
            )}
          </div>
        ) : (
          <div className="bg-bg-card rounded-xl p-4 border-2 border-accent-red">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-heading text-lg text-text">
                  {selectedCar.make} {selectedCar.model} {selectedCar.year ? `(${selectedCar.year})` : ""}
                </p>
                <p className="text-sm text-text-muted">
                  {TIER_LABELS[selectedCar.tier]?.emoji} {getTierComment(selectedCar.tier)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCar(null)}
                className="text-accent-red hover:underline text-sm font-medium"
              >
                Change
              </button>
            </div>
          </div>
        )}

        {/* Group Selection (if user has groups) */}
        {selectedCar && groups.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">
              Log to a group (optional)
            </label>
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="w-full px-4 py-3 bg-bg-card border border-bg-hover rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-accent-red/50 focus:border-accent-red transition-all"
            >
              <option value="">No group (personal only)</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Optional Fields Toggle */}
        {selectedCar && (
          <button
            type="button"
            onClick={() => setShowOptional(!showOptional)}
            className="flex items-center gap-2 text-text-secondary hover:text-text transition-colors text-sm"
          >
            <Settings2 className="w-4 h-4" />
            {showOptional ? "Hide" : "Show"} optional details (photo, rating, context)
          </button>
        )}

        {/* Optional Fields */}
        {selectedCar && showOptional && (
          <div className="space-y-4 bg-bg-card rounded-xl p-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Photo URL (optional)
              </label>
              <input
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://i.imgur.com/example.jpg"
                className="w-full px-4 py-2.5 bg-bg border border-bg-hover rounded-lg text-text text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-red/50 transition-all"
              />
              <p className="text-xs text-text-muted">
                No photo? We'll roast you. 😏
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
                <Star className="w-4 h-4" />
                Rating (optional)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                placeholder="1-10"
                className="w-full px-4 py-2.5 bg-bg border border-bg-hover rounded-lg text-text text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-red/50 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Comment (optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Quick thoughts..."
                rows={2}
                className="w-full px-4 py-2.5 bg-bg border border-bg-hover rounded-lg text-text text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-red/50 transition-all resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">
                Context (optional)
              </label>
              <select
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="w-full px-4 py-2.5 bg-bg border border-bg-hover rounded-lg text-text text-sm focus:outline-none focus:ring-2 focus:ring-accent-red/50 transition-all"
              >
                <option value="">Not specified</option>
                <option value="owned">I own it</option>
                <option value="rental">Rental</option>
                <option value="friend">Friend's car</option>
                <option value="test_drive">Test drive</option>
                <option value="track_day">Track day</option>
              </select>
            </div>

            <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={isManual}
                onChange={(e) => setIsManual(e.target.checked)}
                className="w-4 h-4 accent-accent-red"
              />
              Manual transmission (+5 pts bonus!)
            </label>
          </div>
        )}

        {/* Submit */}
        {selectedCar && (
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-accent-red text-white font-bold text-lg rounded-xl hover:bg-accent-red/90 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <CheckCircle className="w-5 h-5" />
            )}
            Log This Drive
          </button>
        )}
      </form>
    </div>
  );
}
