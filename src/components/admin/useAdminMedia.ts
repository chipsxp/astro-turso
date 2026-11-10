import { useEffect, useState } from "react";

export type MediaResourceType = "image" | "video";

export interface MediaItem {
  id: number;
  resource_type: MediaResourceType;
  public_id: string | null;
  url: string;
  alt_text: string;
  duration?: number | null;
}

declare global {
  interface WindowEventMap {
    "admin-media-sync": CustomEvent<{ galleryId: string; media: MediaItem[] }>;
    "admin-media-ready": CustomEvent<{ galleryId: string }>;
    "admin-media-deleted": CustomEvent<{ galleryId: string; mediaId: number }>;
    "admin-media-toast": CustomEvent<{
      galleryId: string;
      type: "success" | "error";
      message: string;
    }>;
  }
}

export function useAdminMedia(galleryId: string) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [brokenImageIds, setBrokenImageIds] = useState<Set<number>>(new Set());
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [activeImage, setActiveImage] = useState<MediaItem | null>(null);

  useEffect(() => {
    function handleSync(event: WindowEventMap["admin-media-sync"]) {
      if (event.detail.galleryId !== galleryId) return;
      setMedia(event.detail.media ?? []);
      setBrokenImageIds(new Set());
    }

    window.addEventListener("admin-media-sync", handleSync as EventListener);
    window.dispatchEvent(
      new CustomEvent("admin-media-ready", { detail: { galleryId } }),
    );
    return () => {
      window.removeEventListener(
        "admin-media-sync",
        handleSync as EventListener,
      );
    };
  }, [galleryId]);

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

  return {
    media,
    brokenImageIds,
    setBrokenImageIds,
    confirmId,
    setConfirmId,
    deletingId,
    activeImage,
    setActiveImage,
    handleDelete,
  };
}
