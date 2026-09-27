"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Search, Camera, Star, MessageSquare, Settings2, Loader2, CheckCircle, Car, Plus } from "lucide-react";
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

  // Optional fields (always visible now)
  const [photoUrl, setPhotoUrl] = useState("");
  const [rating, setRating] = useState("");
  const [comment, setComment] = useState("");
  const [context, setContext] = useState("");
  const [isManual, setIsManual] = useState(false);

  // Manual add modal
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [manualMake, setManualMake] = useState("");
  const [manualModel, setManualModel] = useState("");
  const [manualYear, setManualYear] = useState("");
  const [addingManual, setAddingManual] = useState(false);

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastPoints, setToastPoints] = useState(0);
  const [showNoPhotoRoast, setShowNoPhotoRoast] = useState(false);
  const [roastMessage, setRoastMessage] = useState("");

  // Logged cars history (for current session)
  const [loggedCars, setLoggedCars] = useState<Array<{ make: string; model: string; points: number }>>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
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

  const resetForm = () => {
    setSelectedCar(null);
    setPhotoUrl("");
    setRating("");
    setComment("");
    setContext("");
    setIsManual(false);
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
            tier: car.tier,
            horsepower: car.horsepower,
            country: car.country,
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

  const handleManualAdd = async () => {
    if (!manualMake.trim() || !manualModel.trim()) return;

    setAddingManual(true);
    try {
      // The API will normalize the name and create the car
      const res = await fetch("/api/cars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          make: manualMake.trim(),
          model: manualModel.trim(),
          year: manualYear ? parseInt(manualYear) : null,
        }),
      });

      const data = await res.json();
      if (data.car) {
        setSelectedCar(data.car);
        setShowManualAdd(false);
        setManualMake("");
        setManualModel("");
        setManualYear("");
        setSearchQuery("");
        setCars([]);
        setShowResults(false);
      } else {
        alert(data.error || "Failed to add car. Try again.");
      }
    } catch (error) {
      console.error("Failed to add car manually:", error);
      alert("Failed to add car. Try again.");
    } finally {
      setAddingManual(false);
    }
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
          photoUrl: photoUrl || undefined,
          rating: rating ? parseInt(rating) : undefined,
          comment: comment || undefined,
          context: context || undefined,
          isManual,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || data.error || "Failed to log drive");
        return;
      }
      const points = data.pointsBreakdown?.total || 10;
      const groupsCount = data.groupsCount || 0;

      // Add to logged cars history
      setLoggedCars(prev => [
        ...prev,
        { make: selectedCar.make, model: selectedCar.model, points },
      ]);

      // Show success toast
      let message = `${selectedCar.make} ${selectedCar.model} logged!`;
      if (groupsCount > 0) {
        message += ` (personal + ${groupsCount} ${groupsCount === 1 ? 'group' : 'groups'})`;
      }

      setToastMessage(message);
      setToastPoints(points);
      setShowToast(true);

      // Show roast if no photo
      if (!photoUrl) {
        setRoastMessage(getNoPhotoComment());
        setShowNoPhotoRoast(true);
        setTimeout(() => {
          setShowNoPhotoRoast(false);
        }, 5000);
      }

      // Hide success toast after 4 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 4000);

      // Reset form for next car
      resetForm();
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

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-8 animate-fade-in">
      {/* Success Toast */}
      {showToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-bg-card border-2 border-accent-green rounded-xl shadow-2xl p-4 animate-fade-in max-w-md">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-accent-green flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-text font-medium text-sm">{toastMessage}</p>
              <p className="text-accent-yellow font-heading text-xl mt-1">+{toastPoints} pts</p>
            </div>
          </div>
        </div>
      )}

      {/* No Photo Roast Toast */}
      {showNoPhotoRoast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-accent-red/10 border-2 border-accent-red rounded-xl shadow-2xl p-4 animate-fade-in max-w-md">
          <div className="flex items-start gap-3">
            <Camera className="w-6 h-6 text-accent-red flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-accent-red font-bold text-sm mb-1">No Photo? Really? 📸</p>
              <p className="text-text text-sm italic">"{roastMessage}"</p>
            </div>
          </div>
        </div>
      )}

      <div className="text-center space-y-2">
        <h1 className="font-heading text-3xl text-text">Log a Car 🚗</h1>
        <p className="text-text-muted text-sm">
          Search by make or model — e.g. "Slavia", "Skoda", "i20", "City"
        </p>
      </div>

      {/* Session logged cars counter */}
      {loggedCars.length > 0 && (
        <div className="bg-bg-card rounded-xl p-3 border border-bg-hover">
          <p className="text-xs text-text-muted mb-2">
            Logged this session ({loggedCars.length} {loggedCars.length === 1 ? 'car' : 'cars'}):
          </p>
          <div className="flex flex-wrap gap-2">
            {loggedCars.map((c, i) => (
              <span key={i} className="inline-flex items-center gap-1 bg-bg-hover rounded-lg px-2 py-1 text-xs text-text">
                <CheckCircle className="w-3 h-3 text-accent-green" />
                {c.make} {c.model}
                <span className="text-accent-yellow ml-1">+{c.points}</span>
              </span>
            ))}
          </div>
        </div>
      )}

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
                placeholder='Type make or model (e.g. "Slavia", "i20", "City", "Patrol")'
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
                          {car.make} {car.model}
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

            {/* No results — offer manual add */}
            {!searching && searchQuery.length >= 2 && cars.length === 0 && (
              <div className="text-center py-4 space-y-3">
                <p className="text-text-muted text-sm">
                  No cars found for "{searchQuery}"
                </p>
                <button
                  type="button"
                  onClick={() => {
                    // Pre-fill brand/model from the search query
                    const parts = searchQuery.trim().split(/\s+/);
                    setManualMake(parts[0] || "");
                    setManualModel(parts.slice(1).join(" ") || "");
                    setShowManualAdd(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent-red text-white rounded-xl text-sm font-medium hover:bg-accent-red/90 active:scale-[0.98] transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add car manually
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-bg-card rounded-xl p-4 border-2 border-accent-red">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-heading text-lg text-text">
                  {selectedCar.make} {selectedCar.model}
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

        {/* Manual Add Modal */}
        {showManualAdd && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-bg-card rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-fade-in">
              <h3 className="font-heading text-xl text-text">Add Car Manually</h3>
              <p className="text-text-muted text-sm">
                We'll normalize the name and look up the details for you.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-text-secondary block mb-1">
                    Brand / Make *
                  </label>
                  <input
                    type="text"
                    value={manualMake}
                    onChange={(e) => setManualMake(e.target.value)}
                    placeholder='e.g. "Toyota", "Hyundai", "BMW"'
                    className="w-full px-4 py-2.5 bg-bg border border-bg-hover rounded-lg text-text text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-red/50 transition-all"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-text-secondary block mb-1">
                    Model *
                  </label>
                  <input
                    type="text"
                    value={manualModel}
                    onChange={(e) => setManualModel(e.target.value)}
                    placeholder='e.g. "Patrol", "Land Cruiser", "M4"'
                    className="w-full px-4 py-2.5 bg-bg border border-bg-hover rounded-lg text-text text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-red/50 transition-all"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-text-secondary block mb-1">
                    Year (optional)
                  </label>
                  <input
                    type="number"
                    min="1900"
                    max="2030"
                    value={manualYear}
                    onChange={(e) => setManualYear(e.target.value)}
                    placeholder="e.g. 2024"
                    className="w-full px-4 py-2.5 bg-bg border border-bg-hover rounded-lg text-text text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-red/50 transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowManualAdd(false)}
                  className="flex-1 py-2.5 text-text-secondary border border-bg-hover rounded-xl hover:bg-bg-hover transition-all text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleManualAdd}
                  disabled={addingManual || !manualMake.trim() || !manualModel.trim()}
                  className="flex-1 py-2.5 bg-accent-red text-white rounded-xl hover:bg-accent-red/90 active:scale-[0.98] transition-all disabled:opacity-60 text-sm font-medium flex items-center justify-center gap-2"
                >
                  {addingManual ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  Add Car
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Optional Fields (always shown) */}
        {selectedCar && (
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
