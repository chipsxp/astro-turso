import { useRef } from "react";
import { buildCloudinaryImageUrl } from "../../lib/cloudinary";
import { formatDate, SLOT_META, thumbUrl } from "./panel-gallery-utils";
import { SlotPicker } from "./SlotPicker";
import { usePanelAssignments } from "./usePanelAssignments";

interface Props {
  cloudName: string;
}

export default function PanelGallery({ cloudName }: Props) {
  const {
    optimisticAssignments,
    gallery,
    brokenGalleryThumbs,
    setBrokenGalleryThumbs,
    brokenAssignmentThumbs,
    setBrokenAssignmentThumbs,
    loading,
    error,
    uploading,
    pickerForId,
    setPickerForId,
    confirmDeleteId,
    setConfirmDeleteId,
    deletingId,
    handleFileChange,
    handleAssign,
    handleUnassign,
    handleDelete,
  } = usePanelAssignments();

  const fileInputRef = useRef<HTMLInputElement>(null);

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
