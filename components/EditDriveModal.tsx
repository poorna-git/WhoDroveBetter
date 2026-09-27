"use client";

import { useState, useEffect } from "react";
import { X, Save, Trash2, Loader2, Star, Camera, MessageSquare, Tag, Zap, AlertCircle } from "lucide-react";
import { TIER_LABELS, calculatePoints } from "@/lib/points";
import { formatCarName } from "@/lib/utils";

export interface DriveEditData {
  id: string;
  carId: string;
  make: string;
  model: string;
  year?: number | null;
  tier: string;
  photoUrl?: string | null;
  rating?: number | null;
  comment?: string | null;
  context?: string | null;
  isManual?: boolean;
  points?: number;
}

interface EditDriveModalProps {
  isOpen: boolean;
  drive: DriveEditData | null;
  onClose: () => void;
  onSaved: () => void;
  onDeleted?: () => void;
}

const CONTEXT_OPTIONS = [
  { value: "owned", label: "My Car / Daily Driver" },
  { value: "rental", label: "Rental / Trip" },
  { value: "friend", label: "Friend / Family Car" },
  { value: "test_drive", label: "Test Drive / Dealership" },
  { value: "track_day", label: "Track Day / Event" },
  { value: "other", label: "Other" },
];

export default function EditDriveModal({
  isOpen,
  drive,
  onClose,
  onSaved,
  onDeleted,
}: EditDriveModalProps) {
  const [photoUrl, setPhotoUrl] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [context, setContext] = useState("");
  const [isManual, setIsManual] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (drive) {
      setPhotoUrl(drive.photoUrl || "");
      setRating(drive.rating || null);
      setComment(drive.comment || "");
      setContext(drive.context || "");
      setIsManual(Boolean(drive.isManual));
      setError("");
      setSuccess("");
    }
  }, [drive]);

  if (!isOpen || !drive) return null;

  const tierInfo = TIER_LABELS[drive.tier] || TIER_LABELS.common;

  // Calculate live projected points
  const estimatedPoints = calculatePoints({
    carTier: drive.tier,
    hasPhoto: Boolean(photoUrl.trim()),
    hasReview: Boolean(rating || comment.trim()),
    isManual,
    isFirstInGroup: false,
    isNewBrand: false,
    streakDays: 0,
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/drives", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          driveId: drive.id,
          carId: drive.carId,
          photoUrl: photoUrl.trim() || null,
          rating: rating ? Number(rating) : null,
          comment: comment.trim() || null,
          context: context.trim() || null,
          isManual,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update drive");
      }

      setSuccess("Drive updated successfully!");
      setTimeout(() => {
        onSaved();
        onClose();
      }, 700);
    } catch (err: any) {
      setError(err.message || "Failed to update drive");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const carName = formatCarName(drive);
    const confirmed = window.confirm(
      `Are you sure you want to remove the ${carName} from your garage? This will remove it from all your crews and recalculate your points.`
    );

    if (!confirmed) return;

    setDeleting(true);
    setError("");
    try {
      const res = await fetch(`/api/drives?driveId=${drive.id}&carId=${drive.carId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to remove car");
      }

      if (onDeleted) {
        onDeleted();
      } else {
        onSaved();
      }
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to delete car");
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-bg-card border border-bg-hover rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl animate-fade-in max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-bg-hover pb-3">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-accent-red font-bold">
              Edit Garage Entry
            </span>
            <h2 className="font-heading text-xl text-text mt-0.5">
              {formatCarName(drive)}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-text-muted hover:text-text rounded-lg hover:bg-bg-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Car Badge info */}
        <div className="flex items-center justify-between p-3 bg-bg rounded-xl border border-bg-hover">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-text">
              {tierInfo.emoji} {tierInfo.label}
            </span>
            {drive.year && (
              <span className="text-xs text-text-muted">({drive.year})</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-accent-yellow font-bold text-sm">
            <Zap className="w-4 h-4 text-accent-yellow" />
            <span>{estimatedPoints.total} pts</span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-accent-red/10 border border-accent-red/30 rounded-xl text-accent-red text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-accent-green/10 border border-accent-green/30 rounded-xl text-accent-green text-xs">
            {success}
          </div>
        )}

        {/* Edit Form */}
        <form onSubmit={handleSave} className="space-y-4">
          {/* Photo URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-accent-red" />
                Photo URL (Proof)
              </span>
              <span className="text-[10px] text-accent-green font-bold">+3 pts</span>
            </label>
            <input
              type="url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://images.unsplash.com/... or image link"
              className="w-full bg-bg border border-bg-hover rounded-xl px-3.5 py-2.5 text-sm text-text placeholder:text-text-muted/50 focus:outline-none focus:border-accent-red transition-colors"
            />
            {photoUrl && (
              <div className="mt-2 relative rounded-xl overflow-hidden border border-bg-hover max-h-40 bg-bg flex items-center justify-center">
                <img
                  src={photoUrl}
                  alt="Preview"
                  className="w-full h-36 object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          {/* Rating (1-10) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-accent-yellow" />
                Drive Rating: {rating ? `${rating}/10` : "No rating"}
              </span>
              <span className="text-[10px] text-accent-green font-bold">+2 pts with review</span>
            </label>
            <div className="grid grid-cols-10 gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  type="button"
                  key={num}
                  onClick={() => setRating(rating === num ? null : num)}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                    rating === num
                      ? "bg-accent-yellow text-bg font-black scale-105 shadow-md shadow-accent-yellow/20"
                      : "bg-bg text-text-muted hover:bg-bg-hover hover:text-text border border-bg-hover"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Comment / Review */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-text-muted" />
              Notes & Review
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How did it handle? Manual or auto? Exhaust sound? First impressions..."
              rows={3}
              className="w-full bg-bg border border-bg-hover rounded-xl px-3.5 py-2 text-sm text-text placeholder:text-text-muted/50 focus:outline-none focus:border-accent-red transition-colors resize-none"
            />
          </div>

          {/* Context / Ownership */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-text-muted" />
              Experience Context
            </label>
            <select
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="w-full bg-bg border border-bg-hover rounded-xl px-3.5 py-2.5 text-sm text-text focus:outline-none focus:border-accent-red transition-colors"
            >
              <option value="">Select context (optional)</option>
              {CONTEXT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Manual Transmission Toggle */}
          <div className="p-3 bg-bg rounded-xl border border-bg-hover flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🕹️</span>
              <div>
                <p className="text-xs font-semibold text-text">
                  Manual Transmission (Stick Shift)
                </p>
                <p className="text-[10px] text-text-muted">
                  3 pedals, true driver experience (+5 pts)
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsManual(!isManual)}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                isManual ? "bg-accent-red" : "bg-bg-hover"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  isManual ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-between gap-3 border-t border-bg-hover">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || saving}
              className="flex items-center gap-1.5 px-3 py-2 bg-accent-red/10 border border-accent-red/30 hover:bg-accent-red/20 text-accent-red rounded-xl text-xs font-semibold transition-all active:scale-95 disabled:opacity-50"
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Remove Car
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={saving || deleting}
                className="px-4 py-2 bg-bg hover:bg-bg-hover border border-bg-hover text-text-muted hover:text-text rounded-xl text-xs font-semibold transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || deleting}
                className="flex items-center gap-1.5 px-5 py-2 bg-accent-red hover:bg-accent-red/90 text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-md shadow-accent-red/20 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
