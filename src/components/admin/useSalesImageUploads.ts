import { useCallback, useState } from "react";
import type { SalesImageTransforms } from "../../lib/sales";
import {
  defaultTransforms,
  MAX_IMAGES,
  parseTransforms,
  type SalesImageRecord,
} from "./sales-transforms";

export function useSalesImageUploads(
  postingSlug: string,
  initialImages: SalesImageRecord[] = [],
) {
  const [images, setImages] = useState<SalesImageRecord[]>(
    [...initialImages].sort((a, b) => a.sort_order - b.sort_order),
  );
  const [expanded, setExpanded] = useState<number | null>(null);
  const [transforms, setTransforms] = useState<
    Record<number, SalesImageTransforms>
  >(
    Object.fromEntries(
      initialImages.map((img) => [img.id, parseTransforms(img.transforms)]),
    ),
  );
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("");
  const [dragging, setDragging] = useState<number | null>(null);

  const toast = (msg: string) => {
    setStatus(msg);
    setTimeout(() => setStatus(""), 4000);
  };

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      if (images.length >= MAX_IMAGES) {
        toast(`Maximum of ${MAX_IMAGES} images allowed`);
        return;
      }
      const remaining = MAX_IMAGES - images.length;
      const toUpload = Array.from(files).slice(0, remaining);

      setUploading(true);
      for (const file of toUpload) {
        const reader = new FileReader();
        const dataUri = await new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target!.result as string);
          reader.readAsDataURL(file);
        });

        const res = await fetch(`/api/admin/sales/${postingSlug}/images`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            file_data: dataUri,
            alt_text: file.name.replace(/\.[^.]+$/, ""),
            transforms: defaultTransforms(),
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const newImg: SalesImageRecord = {
            id: data.id,
            url: data.url,
            public_id: data.public_id,
            alt_text: data.alt_text,
            transforms: data.transforms,
            sort_order: data.sort_order,
          };
          setImages((prev) => [...prev, newImg]);
          setTransforms((prev) => ({
            ...prev,
            [data.id]: defaultTransforms(),
          }));
          toast(`Uploaded ${file.name}`);
        } else {
          const err = await res.json().catch(() => ({}));
          toast(`Upload failed: ${err.error ?? res.statusText}`);
        }
      }
      setUploading(false);
    },
    [images.length, postingSlug],
  );

  const handleDelete = async (imageId: number) => {
    if (!confirm("Remove this image?")) return;
    const res = await fetch(`/api/admin/sales/${postingSlug}/images`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_id: imageId }),
    });
    if (res.ok) {
      setImages((prev) => prev.filter((i) => i.id !== imageId));
      setTransforms((prev) => {
        const next = { ...prev };
        delete next[imageId];
        return next;
      });
      if (expanded === imageId) setExpanded(null);
      toast("Image removed");
    } else {
      toast("Delete failed");
    }
  };

  const updateTransform = (
    imageId: number,
    key: keyof SalesImageTransforms,
    value: SalesImageTransforms[typeof key],
  ) => {
    setTransforms((prev) => ({
      ...prev,
      [imageId]: { ...(prev[imageId] ?? defaultTransforms()), [key]: value },
    }));
  };

  const applyTransforms = async (img: SalesImageRecord) => {
    const t = transforms[img.id] ?? defaultTransforms();
    const res = await fetch(`/api/admin/sales/${postingSlug}/images`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_id: img.id, transforms: t }),
    });
    if (res.ok) {
      setImages((prev) =>
        prev.map((i) =>
          i.id === img.id ? { ...i, transforms: JSON.stringify(t) } : i,
        ),
      );
      toast("Transforms saved");
    } else {
      toast("Save failed");
    }
  };

  const handleDragStart = (id: number) => setDragging(id);
  const handleDragOver = (e: React.DragEvent, overId: number) => {
    e.preventDefault();
    if (dragging === null || dragging === overId) return;
    setImages((prev) => {
      const list = [...prev];
      const fromIdx = list.findIndex((i) => i.id === dragging);
      const toIdx = list.findIndex((i) => i.id === overId);
      if (fromIdx === -1 || toIdx === -1) return prev;
      const [item] = list.splice(fromIdx, 1);
      list.splice(toIdx, 0, item);
      return list.map((img, idx) => ({ ...img, sort_order: idx }));
    });
  };
  const handleDragEnd = async () => {
    setDragging(null);
    const order = images.map((img, idx) => ({ id: img.id, sort_order: idx }));
    await fetch(`/api/admin/sales/${postingSlug}/images`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order }),
    });
  };

  return {
    images,
    expanded,
    setExpanded,
    transforms,
    uploading,
    status,
    dragging,
    handleFiles,
    handleDelete,
    updateTransform,
    applyTransforms,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
}
