import { AdvancedImage, lazyload, responsive } from "@cloudinary/react";
import { Cloudinary } from "@cloudinary/url-gen";
import { useEffect, useState } from "react";
import {
  buildCloudinaryImageUrl,
  buildCloudinaryVideoUrl,
} from "../../lib/cloudinary";

type MediaResourceType = "image" | "video";

interface MediaItem {
  id: number;
  resource_type: MediaResourceType;
  public_id: string | null;
  url: string;
  alt_text: string;
  duration?: number | null;
}

interface Props {
  cloudName: string;
  galleryId: string;
  emptyMessage?: string;
}

declare global {
  interface WindowEventMap {
    "admin-media-sync": CustomEvent<{ galleryId: string; media: MediaItem[] }>;
    "admin-media-deleted": CustomEvent<{ galleryId: string; mediaId: number }>;
    "admin-media-toast": CustomEvent<{
      galleryId: string;
      type: "success" | "error";
      message: string;
    }>;
  }
}

export default function AdminMediaGallery({
  cloudName,
  galleryId,
  emptyMessage = "No media uploaded yet.",
}: Props) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [brokenImageIds, setBrokenImageIds] = useState<Set<number>>(new Set());
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [activeImage, setActiveImage] = useState<MediaItem | null>(null);
  const cloudinary = new Cloudinary({ cloud: { cloudName } });

  useEffect(() => {
    function handleSync(event: WindowEventMap["admin-media-sync"]) {
      if (event.detail.galleryId !== galleryId) return;
      setMedia(event.detail.media ?? []);
      setBrokenImageIds(new Set());
    }

    window.addEventListener("admin-media-sync", handleSync as EventListener);
    return () => {
      window.removeEventListener(
        "admin-media-sync",
        handleSync as EventListener,
      );
    };
  }, [galleryId]);

  async function handleDelete(mediaId: number) {
    if (confirmId !== mediaId) {
      setConfirmId(mediaId);
      window.dispatchEvent(
        new CustomEvent("admin-media-toast", {
          detail: {
            galleryId,
            type: "error",
            message: "Click Confirm to permanently delete this media.",
          },
        }),
      );
      return;
    }

    setDeletingId(mediaId);

    try {
      const response = await fetch("/api/upload", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ media_id: mediaId }),
      });

      if (response.status === 401) {
        window.location.href = "/admin";
        return;
      }

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        window.dispatchEvent(
          new CustomEvent("admin-media-toast", {
            detail: {
              galleryId,
              type: "error",
              message: payload.error ?? "Failed to delete media.",
            },
          }),
        );
        return;
      }

      setMedia((prev) => prev.filter((item) => item.id !== mediaId));
      setBrokenImageIds((prev) => {
        if (!prev.has(mediaId)) return prev;
        const next = new Set(prev);
        next.delete(mediaId);
        return next;
      });
      setConfirmId(null);
      window.dispatchEvent(
        new CustomEvent("admin-media-deleted", {
          detail: { galleryId, mediaId },
        }),
      );
    } catch {
      window.dispatchEvent(
        new CustomEvent("admin-media-toast", {
          detail: {
            galleryId,
            type: "error",
            message: "Network error while deleting media.",
          },
        }),
      );
    } finally {
      setDeletingId(null);
    }
  }

  useEffect(() => {
    function handleEsc(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveImage(null);
      }
    }

    if (activeImage) {
      document.body.classList.add("lightbox-open");
      window.addEventListener("keydown", handleEsc);
    }

    return () => {
      document.body.classList.remove("lightbox-open");
      window.removeEventListener("keydown", handleEsc);
    };
  }, [activeImage]);

  if (media.length === 0) {
    return (
      <p
        className="text-muted"
        style={{ fontSize: "0.78rem", marginBottom: "16px" }}
      >
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="admin-media-gallery">
      {media.map((item) => (
        <div className="admin-media-gallery__item" key={item.id}>
          <div className="admin-media-gallery__preview">
            {item.resource_type === "image" ? (
              brokenImageIds.has(item.id) ? (
                <div
                  className="admin-media-gallery__fallback"
                  role="img"
                  aria-label="Image unavailable"
                >
                  Image unavailable
                </div>
              ) : item.public_id ? (
                <button
                  type="button"
                  className="admin-media-gallery__preview-button"
                  onClick={() => setActiveImage(item)}
                  aria-label={`View full image: ${item.alt_text || `Media ${item.id}`}`}
                >
                  <AdvancedImage
                    alt={item.alt_text}
                    cldImg={cloudinary.image(item.public_id)}
                    plugins={[lazyload(), responsive()]}
                    onError={() =>
                      setBrokenImageIds((prev) => {
                        if (prev.has(item.id)) return prev;
                        const next = new Set(prev);
                        next.add(item.id);
                        return next;
                      })
                    }
                  />
                </button>
              ) : (
                <button
                  type="button"
                  className="admin-media-gallery__preview-button"
                  onClick={() => setActiveImage(item)}
                  aria-label={`View full image: ${item.alt_text || `Media ${item.id}`}`}
                >
                  <img
                    alt={item.alt_text}
                    loading="lazy"
                    src={item.url}
                    onError={() =>
                      setBrokenImageIds((prev) => {
                        if (prev.has(item.id)) return prev;
                        const next = new Set(prev);
                        next.add(item.id);
                        return next;
                      })
                    }
                  />
                </button>
              )
            ) : (
              <video
                controls
                preload="metadata"
                src={
                  item.public_id && cloudName
                    ? buildCloudinaryVideoUrl({
                        cloudName,
                        publicId: item.public_id,
                      })
                    : item.url
                }
              />
            )}
          </div>
          <div className="admin-media-gallery__meta">
            <span className="admin-media-gallery__type">
              {item.resource_type}
            </span>
            <a href={item.url} rel="noreferrer" target="_blank">
              {item.alt_text || item.url}
            </a>
            <span className="admin-media-gallery__id">#{item.id}</span>
            {confirmId === item.id ? (
              <>
                <button
                  type="button"
                  className="admin-media-gallery__delete admin-media-gallery__delete--confirm"
                  onClick={() => handleDelete(item.id)}
                  disabled={deletingId === item.id}
                >
                  {deletingId === item.id ? "Deleting…" : "Confirm"}
                </button>
                <button
                  type="button"
                  className="admin-media-gallery__delete"
                  onClick={() => setConfirmId(null)}
                  disabled={deletingId === item.id}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                className="admin-media-gallery__delete"
                onClick={() => handleDelete(item.id)}
                disabled={deletingId === item.id}
              >
                Delete
              </button>
            )}
          </div>
        </div>
      ))}

      {activeImage && (
        <div
          className="admin-media-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
        >
          <button
            type="button"
            className="admin-media-lightbox__backdrop"
            onClick={() => setActiveImage(null)}
            aria-label="Close image viewer"
          />
          <div className="admin-media-lightbox__dialog">
            <button
              type="button"
              className="admin-media-lightbox__close"
              onClick={() => setActiveImage(null)}
              aria-label="Close image viewer"
            >
              ×
            </button>
            <img
              src={
                activeImage.public_id && cloudName
                  ? buildCloudinaryImageUrl({
                      cloudName,
                      publicId: activeImage.public_id,
                      preset: "hero",
                    })
                  : activeImage.url
              }
              alt={activeImage.alt_text}
            />
          </div>
        </div>
      )}

      <style>{`
        .admin-media-gallery {
          display: grid;
          gap: 14px;
          margin-bottom: 16px;
        }

        .admin-media-gallery__item {
          display: grid;
          gap: 10px;
          padding: 12px;
          background: var(--surface-2);
          border: 1px solid var(--border);
          border-radius: var(--radius);
        }

        .admin-media-gallery__preview img,
        .admin-media-gallery__preview video {
          width: 100%;
          max-width: 280px;
          border-radius: var(--radius);
          display: block;
        }

        .admin-media-gallery__preview-button {
          display: block;
          padding: 0;
          border: 0;
          background: transparent;
          cursor: zoom-in;
          border-radius: var(--radius);
        }

        .admin-media-gallery__fallback {
          width: 100%;
          max-width: 280px;
          min-height: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px dashed var(--border);
          border-radius: var(--radius);
          background: var(--surface);
          color: var(--text-muted);
          font-family: var(--font-mono);
          font-size: 0.68rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          text-align: center;
          padding: 8px;
        }

        .admin-media-gallery__meta {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
          font-size: 0.78rem;
        }

        .admin-media-gallery__type,
        .admin-media-gallery__id {
          font-family: var(--font-mono);
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .admin-media-gallery__meta a {
          color: var(--accent);
          word-break: break-word;
        }

        .admin-media-gallery__delete {
          margin-left: auto;
          padding: 4px 8px;
          border: 1px solid var(--danger);
          background: transparent;
          color: var(--danger);
          font-family: var(--font-mono);
          font-size: 0.68rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          border-radius: var(--radius);
        }

        .admin-media-gallery__delete:hover:not(:disabled) {
          background: var(--danger);
          color: var(--surface-2);
        }

        .admin-media-gallery__delete--confirm {
          background: var(--danger);
          color: var(--surface-2);
        }

        .admin-media-gallery__delete:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .admin-media-lightbox {
          position: fixed;
          inset: 0;
          z-index: 120;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px;
        }

        .admin-media-lightbox__backdrop {
          position: absolute;
          inset: 0;
          border: 0;
          background: color-mix(in srgb, var(--comic-black) 86%, transparent);
          cursor: zoom-out;
        }

        .admin-media-lightbox__dialog {
          position: relative;
          z-index: 1;
          width: min(96vw, 1180px);
          height: min(92vh, 860px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px;
          background: var(--surface-2);
          border: 2px solid var(--border);
          box-shadow: var(--shadow-lg);
        }

        .admin-media-lightbox__dialog img {
          max-width: 100%;
          max-height: 100%;
          width: auto;
          height: auto;
          object-fit: contain;
          display: block;
        }

        .admin-media-lightbox__close {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 40px;
          height: 40px;
          border: 2px solid var(--comic-black);
          background: var(--surface);
          color: var(--text);
          font-size: 1.4rem;
          line-height: 1;
          cursor: pointer;
        }

        body.lightbox-open {
          overflow: hidden;
        }

        @media (max-width: 760px) {
          .admin-media-lightbox {
            padding: 8px;
          }

          .admin-media-lightbox__dialog {
            width: 100%;
            height: min(88vh, 760px);
            padding: 10px;
          }

          .admin-media-lightbox__close {
            width: 44px;
            height: 44px;
            top: 6px;
            right: 6px;
          }
        }
      `}</style>
    </div>
  );
}
