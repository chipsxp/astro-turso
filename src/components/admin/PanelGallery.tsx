import {
  useEffect,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from "react";
import { buildCloudinaryImageUrl } from "../../lib/cloudinary";

// ─── Types ───────────────────────────────────────────────────────────────────

type PanelSlot = "panel-01" | "panel-02" | "panel-03" | "panel-04";

interface PanelMedia {
  id: number;
  public_id: string;
  url: string;
  alt_text: string;
  width: number | null;
  height: number | null;
  format: string | null;
  created_at: string;
}

interface PanelAssignment {
  slot: PanelSlot;
  label: string;
  media_id: number | null;
  media_public_id: string | null;
  url: string | null;
  alt_text: string | null;
  updated_at: string;
}

const SLOT_META: Record<PanelSlot, { location: string; bgHint: string }> = {
  "panel-01": { location: "Hero — top-left", bgHint: "var(--surface-2)" },
  "panel-02": { location: "Hero — top-right", bgHint: "#3a7bd5" },
  "panel-03": { location: "Hero — bottom wide", bgHint: "var(--surface)" },
  "panel-04": { location: "Splash Screen", bgHint: "#3a7bd5" },
};

const VALID_SLOTS: PanelSlot[] = [
  "panel-01",
  "panel-02",
  "panel-03",
  "panel-04",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso.slice(0, 10);
  }
}

function thumbUrl(item: PanelMedia, cloudName: string): string {
  if (item.public_id && cloudName) {
    try {
      return buildCloudinaryImageUrl({
        cloudName,
        publicId: item.public_id,
        preset: "thumb",
      });
    } catch {
      return item.url;
    }
  }
  return item.url;
}

function showToast(type: "success" | "error", message: string) {
  window.dispatchEvent(
    new CustomEvent("admin-media-toast", {
      detail: { galleryId: "panels", type, message },
    }),
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SlotPicker({
  onSelect,
  onClose,
}: {
  onSelect: (slot: PanelSlot) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <div className="slot-picker" ref={ref}>
      {VALID_SLOTS.map((s) => (
        <button
          key={s}
          type="button"
          className="slot-picker__btn"
          onClick={() => {
            onSelect(s);
            onClose();
          }}
        >
          {SLOT_META[s as PanelSlot].location}
        </button>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  cloudName: string;
}

export default function PanelGallery({ cloudName }: Props) {
  const [assignments, setAssignments] = useState<PanelAssignment[]>([]);
  const [gallery, setGallery] = useState<PanelMedia[]>([]);
  const [brokenGalleryThumbs, setBrokenGalleryThumbs] = useState<Set<number>>(
    new Set(),
  );
  const [brokenAssignmentThumbs, setBrokenAssignmentThumbs] = useState<
    Set<PanelSlot>
  >(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pickerForId, setPickerForId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [optimisticAssignments, addOptimisticAssignment] = useOptimistic(
    assignments,
    (
      state: PanelAssignment[],
      update: {
        slot: PanelSlot;
        media_id: number | null;
        url: string | null;
        alt_text: string | null;
      },
    ) => state.map((a) => (a.slot === update.slot ? { ...a, ...update } : a)),
  );

  // ── Load on mount ──
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/panels");
        if (res.status === 401) {
          window.location.href = "/admin";
          return;
        }
        if (!res.ok) throw new Error("Failed to load panels");
        const data = await res.json();
        setAssignments(data.assignments ?? []);
        setGallery(data.gallery ?? []);
        setBrokenGalleryThumbs(new Set());
        setBrokenAssignmentThumbs(new Set());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Load failed");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ── Upload ──
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    const altInput = window.prompt(
      "Alt text for this panel image (recommended):",
      "",
    );
    if (altInput == null) return;
    const altText = altInput.trim().slice(0, 160);

    setUploading(true);
    try {
      const dataUri = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await fetch("/api/admin/panels/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file_data: dataUri,
          mime_type: file.type,
          file_size: file.size,
          alt_text: altText,
        }),
      });
      if (res.status === 401) {
        window.location.href = "/admin";
        return;
      }
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast("error", payload.error ?? "Upload failed.");
        return;
      }
      setGallery((prev) => [payload.media, ...prev]);
      setBrokenGalleryThumbs(new Set());
      showToast("success", "Image uploaded.");
    } catch {
      showToast("error", "Network error during upload.");
    } finally {
      setUploading(false);
    }
  }

  // ── Assign ──
  function handleAssign(mediaItem: PanelMedia, slot: PanelSlot) {
    startTransition(async () => {
      addOptimisticAssignment({
        slot,
        media_id: mediaItem.id,
        url: mediaItem.url,
        alt_text: mediaItem.alt_text,
      });
      try {
        const res = await fetch("/api/admin/panels/assign", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ slot, media_id: mediaItem.id }),
        });
        if (res.status === 401) {
          window.location.href = "/admin";
          return;
        }
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) {
          showToast("error", payload.error ?? "Assign failed.");
          // Revert by re-fetching
          const refresh = await fetch("/api/admin/panels");
          if (refresh.ok) {
            const data = await refresh.json();
            setAssignments(data.assignments ?? []);
          }
          return;
        }
        setAssignments((prev) =>
          prev.map((a) =>
            a.slot === slot
              ? {
                  ...a,
                  media_id: mediaItem.id,
                  url: mediaItem.url,
                  alt_text: mediaItem.alt_text,
                }
              : a,
          ),
        );
        setBrokenAssignmentThumbs((prev) => {
          if (!prev.has(slot)) return prev;
          const next = new Set(prev);
          next.delete(slot);
          return next;
        });
        showToast("success", `${SLOT_META[slot].location} updated.`);
      } catch {
        showToast("error", "Network error during assign.");
      }
    });
  }

  // ── Unassign ──
  function handleUnassign(slot: PanelSlot) {
    startTransition(async () => {
      addOptimisticAssignment({
        slot,
        media_id: null,
        url: null,
        alt_text: null,
      });
      try {
        const res = await fetch("/api/admin/panels/assign", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ slot, media_id: null }),
        });
        if (!res.ok) {
          showToast("error", "Unassign failed.");
          const refresh = await fetch("/api/admin/panels");
          if (refresh.ok) {
            const data = await refresh.json();
            setAssignments(data.assignments ?? []);
          }
          return;
        }
        setAssignments((prev) =>
          prev.map((a) =>
            a.slot === slot
              ? { ...a, media_id: null, url: null, alt_text: null }
              : a,
          ),
        );
        setBrokenAssignmentThumbs((prev) => {
          if (!prev.has(slot)) return prev;
          const next = new Set(prev);
          next.delete(slot);
          return next;
        });
        showToast("success", `${SLOT_META[slot].location} cleared.`);
      } catch {
        showToast("error", "Network error during unassign.");
      }
    });
  }

  // ── Delete ──
  async function handleDelete(mediaId: number) {
    if (confirmDeleteId !== mediaId) {
      setConfirmDeleteId(mediaId);
      showToast("error", "Click Confirm to permanently delete this image.");
      return;
    }
    setDeletingId(mediaId);
    try {
      const res = await fetch(`/api/admin/panels/media/${mediaId}`, {
        method: "DELETE",
      });
      if (res.status === 401) {
        window.location.href = "/admin";
        return;
      }
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        showToast("error", payload.error ?? "Delete failed.");
        return;
      }
      setGallery((prev) => prev.filter((item) => item.id !== mediaId));
      setBrokenGalleryThumbs((prev) => {
        if (!prev.has(mediaId)) return prev;
        const next = new Set(prev);
        next.delete(mediaId);
        return next;
      });
      // Clear any slot that was showing this image
      setAssignments((prev) =>
        prev.map((a) =>
          a.media_id === mediaId
            ? { ...a, media_id: null, url: null, alt_text: null }
            : a,
        ),
      );
      setBrokenAssignmentThumbs(new Set());
      setConfirmDeleteId(null);
      showToast("success", "Image deleted.");
    } catch {
      showToast("error", "Network error during delete.");
    } finally {
      setDeletingId(null);
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="state-caption">
        <span className="state-caption__label">Loading panels…</span>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert--error">{error}</div>;
  }

  return (
    <div className="panel-gallery">
      {/* ── Section A: Assignment Board ── */}
      <div className="panel-gallery__board-wrap">
        <p className="panel-gallery__eyebrow">Current Assignments</p>
        <div className="panel-gallery__board">
          {optimisticAssignments.map((a) => {
            const meta = SLOT_META[a.slot];
            return (
              <div
                key={a.slot}
                className="panel-slot-card"
                style={{ "--slot-bg": meta.bgHint } as React.CSSProperties}
              >
                <div className="panel-slot-card__header">
                  <span className="panel-slot-card__label">{a.label}</span>
                  <span className="panel-slot-card__location">
                    {meta.location}
                  </span>
                </div>

                {a.url && !brokenAssignmentThumbs.has(a.slot) ? (
                  <div className="panel-slot-card__thumb">
                    <img
                      src={
                        a.media_public_id && cloudName
                          ? buildCloudinaryImageUrl({
                              cloudName,
                              publicId: a.media_public_id,
                              preset: "thumb",
                            })
                          : (a.url ?? "")
                      }
                      alt={a.alt_text ?? ""}
                      onError={() =>
                        setBrokenAssignmentThumbs((prev) => {
                          if (prev.has(a.slot)) return prev;
                          const next = new Set(prev);
                          next.add(a.slot);
                          return next;
                        })
                      }
                    />
                  </div>
                ) : (
                  <div className="panel-slot-card__empty">
                    {a.url ? "Image unavailable" : "No image assigned"}
                  </div>
                )}

                <div className="panel-slot-card__actions">
                  {a.url && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleUnassign(a.slot)}
                    >
                      Unassign
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Section B: Recent Gallery ── */}
      <div className="panel-gallery__section">
        <div className="panel-gallery__toolbar">
          <p className="panel-gallery__eyebrow">Recent Images — Last 7 Days</p>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? "Uploading…" : "+ Upload Image"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </div>

        {gallery.length === 0 ? (
          <div className="panel-gallery__empty">
            No images uploaded this week.
          </div>
        ) : (
          <div className="panel-gallery__grid">
            {gallery.map((item) => (
              <div
                key={item.id}
                className={`panel-gallery__image-card ${pickerForId === item.id ? "is-picker-open" : ""}`}
              >
                {brokenGalleryThumbs.has(item.id) ? (
                  <div className="panel-gallery__image-fallback">
                    Image unavailable
                  </div>
                ) : (
                  <img
                    src={thumbUrl(item, cloudName)}
                    alt={item.alt_text || "Panel image"}
                    loading="lazy"
                    onError={() =>
                      setBrokenGalleryThumbs((prev) => {
                        if (prev.has(item.id)) return prev;
                        const next = new Set(prev);
                        next.add(item.id);
                        return next;
                      })
                    }
                  />
                )}
                <span className="panel-gallery__date">
                  {formatDate(item.created_at)}
                </span>

                <div className="panel-gallery__image-card-overlay">
                  <div style={{ position: "relative" }}>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() =>
                        setPickerForId(pickerForId === item.id ? null : item.id)
                      }
                    >
                      Assign to…
                    </button>
                    {pickerForId === item.id && (
                      <SlotPicker
                        onSelect={(slot) => handleAssign(item, slot)}
                        onClose={() => setPickerForId(null)}
                      />
                    )}
                  </div>

                  {confirmDeleteId === item.id ? (
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        disabled={deletingId === item.id}
                        onClick={() => handleDelete(item.id)}
                      >
                        {deletingId === item.id ? "Deleting…" : "Confirm"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        disabled={deletingId === item.id}
                        onClick={() => setConfirmDeleteId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
