"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Search, Camera, Star, MessageSquare, Settings2, Loader2, CheckCircle, Car } from "lucide-react";
import { getNoPhotoComment, getTierComment } from "@/lib/comments";
import { TIER_LABELS } from "@/lib/points";

interface Car {
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
  const [cars, setCars] = useState<Car[]>([]);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [searching, setSearching] = useState(false);

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

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchGroups();
    }
  }, [status, router]);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchCars();
    } else {
      setCars([]);
    }
  }, [searchQuery]);

  const fetchGroups = async () => {
    try {
      const res = await fetch("/api/groups");
      const data = await res.json();
      setGroups(data.groups || []);
    } catch (error) {
      console.error("Failed to fetch groups:", error);
    }
  };

  const searchCars = async () => {
    setSearching(true);
    try {
      const res = await fetch(`/api/cars?q=${encodeURIComponent(searchQuery)}&limit=20`);
      const data = await res.json();
      setCars(data.cars || []);
    } catch (error) {
      console.error("Failed to search cars:", error);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectCar = async (car: Car) => {
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

      // Show roast if no photo
      if (!photoUrl) {
        setNoPhotoRoast(getNoPhotoComment());
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 2000);
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
        {noPhotoRoast && (
          <p className="text-text-muted italic max-w-sm">{noPhotoRoast}</p>
        )}
        <p className="text-text-secondary">Redirecting to feed...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h1 className="font-heading text-3xl text-text">Log a Car 🚗</h1>
        <p className="text-text-muted text-sm">
          What have you driven recently?
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Car Selection */}
        {!selectedCar ? (
          <div className="space-y-3">
            <label className="text-sm font-medium text-text-secondary">
              Search for a car *
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type make or model (e.g. M3, Supra, Civic, Tesla)"
                className="w-full pl-12 pr-4 py-3 bg-bg-card border border-bg-hover rounded-xl text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-red/50 focus:border-accent-red transition-all"
                autoFocus
              />
            </div>

            {searching && (
              <p className="text-text-muted text-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Searching local database & internet...
              </p>
            )}

            {cars.length > 0 && (
              <div className="bg-bg-card rounded-xl border border-bg-hover max-h-96 overflow-y-auto">
                {cars.map((car) => {
                  const tierInfo = TIER_LABELS[car.tier] || TIER_LABELS.common;
                  return (
                    <button
                      key={car.id}
                      type="button"
                      onClick={() => handleSelectCar(car)}
                      className="w-full text-left px-4 py-3 hover:bg-bg-hover transition-colors flex items-center justify-between group"
                    >
                      <div>
                        <p className="font-semibold text-text group-hover:text-accent-red transition-colors">
                          {car.year ? `${car.year} ` : ""}{car.make} {car.model}
                        </p>
                        <p className="text-xs text-text-muted">
                          {car.isExternal ? (
                            <span>🌐 Internet Result</span>
                          ) : (
                            <span>
                              {tierInfo.emoji} {tierInfo.label} • {car.horsepower} HP • {car.country}
                            </span>
                          )}
                        </p>
                      </div>
                      <Car className="w-5 h-5 text-text-muted group-hover:text-accent-red transition-colors" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-bg-card rounded-xl p-4 border-2 border-accent-red">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-heading text-lg text-text">
                  {selectedCar.year ? `${selectedCar.year} ` : ""}{selectedCar.make} {selectedCar.model}
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
