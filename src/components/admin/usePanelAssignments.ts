import { useEffect, useOptimistic, useState, useTransition } from "react";
import {
  type PanelAssignment,
  type PanelMedia,
  type PanelSlot,
  SLOT_META,
  showToast,
} from "./panel-gallery-utils";

export function usePanelAssignments() {
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

  return {
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
  };
}
