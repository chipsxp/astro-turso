import { useCallback, useRef, useState } from "react";
import type { SalesImageTransforms } from "../../lib/sales";
import { buildSalesImageUrl } from "../../lib/sales";

interface SalesImageRecord {
  id: number;
  url: string;
  public_id: string;
  alt_text: string;
  transforms: string;
  sort_order: number;
}

interface Props {
  postingSlug: string;
  initialImages?: SalesImageRecord[];
  cloudName: string;
}

const BG_COLORS = [
  { label: "White", value: "white" },
  { label: "Black", value: "black" },
  { label: "Cream", value: "rgb:F5F0E8" },
  { label: "Beige", value: "rgb:E8D9C5" },
  { label: "Gray", value: "rgb:CCCCCC" },
  { label: "Transparent", value: "transparent" },
];

const TEXT_COLORS = [
  { label: "White", value: "white" },
  { label: "Black", value: "black" },
  { label: "Gold", value: "gold" },
];

const MAX_IMAGES = 4;

function defaultTransforms(): SalesImageTransforms {
  return {
    bgRemoval: false,
    bgColor: "white",
    text: "",
    textPosition: "bottom",
    textColor: "white",
  };
}

function parseTransforms(json: string): SalesImageTransforms {
  try {
    return { ...defaultTransforms(), ...JSON.parse(json) };
  } catch {
    return defaultTransforms();
  }
}

export default function SalesImageManager({
  postingSlug,
  initialImages = [],
  cloudName,
}: Props) {
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
  const fileRef = useRef<HTMLInputElement>(null);

  const toast = (msg: string) => {
    setStatus(msg);
    setTimeout(() => setStatus(""), 4000);
  };

  // ── File upload ──────────────────────────────────────────────────────────────

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

  // ── Delete ───────────────────────────────────────────────────────────────────

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

  // ── Transforms ───────────────────────────────────────────────────────────────

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

  // ── Drag-to-reorder ──────────────────────────────────────────────────────────

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

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="sim-root">
      {status && <p className="sim-toast">{status}</p>}

      {/* Upload zone */}
      {images.length < MAX_IMAGES && (
        <div
          className="sim-dropzone"
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFiles(e.dataTransfer.files);
          }}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            multiple
            hidden
            onChange={(e) => handleFiles(e.target.files)}
          />
          {uploading ? (
            <span>Uploading…</span>
          ) : (
            <span>
              Drop images here or click to upload
              <br />
              <small>
                {images.length}/{MAX_IMAGES} images · max 10 MB each
              </small>
            </span>
          )}
        </div>
      )}

      {/* Image list */}
      {images.length === 0 && (
        <p className="sim-empty">No images yet. Upload up to {MAX_IMAGES}.</p>
      )}

      <div className="sim-list">
        {images.map((img) => {
          const t = transforms[img.id] ?? defaultTransforms();
          const previewUrl = img.public_id
            ? buildSalesImageUrl(
                cloudName,
                img.public_id,
                JSON.stringify(t),
                400,
              )
            : img.url;
          const isOpen = expanded === img.id;

          return (
            <div
              key={img.id}
              className={`sim-item${dragging === img.id ? " sim-item--dragging" : ""}`}
              draggable
              onDragStart={() => handleDragStart(img.id)}
              onDragOver={(e) => handleDragOver(e, img.id)}
              onDragEnd={handleDragEnd}
            >
              <div className="sim-item__row">
                <span className="sim-drag-handle" title="Drag to reorder">
                  ⠿
                </span>
                <img
                  className="sim-thumb"
                  src={img.url}
                  alt={img.alt_text}
                  width={64}
                  height={64}
                />
                <div className="sim-item__meta">
                  <span className="sim-item__name">
                    {img.alt_text || "Image"}
                  </span>
                  <span className="sim-item__order">#{img.sort_order + 1}</span>
                </div>
                <div className="sim-item__actions">
                  <button
                    type="button"
                    className="sim-btn sim-btn--sm"
                    onClick={() => setExpanded(isOpen ? null : img.id)}
                  >
                    {isOpen ? "Close" : "Edit"}
                  </button>
                  <button
                    type="button"
                    className="sim-btn sim-btn--danger sim-btn--sm"
                    onClick={() => handleDelete(img.id)}
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Transform panel */}
              {isOpen && (
                <div className="sim-transforms">
                  {/* Background removal */}
                  <div className="sim-field">
                    <label className="sim-label">
                      <input
                        type="checkbox"
                        checked={t.bgRemoval}
                        onChange={(e) =>
                          updateTransform(img.id, "bgRemoval", e.target.checked)
                        }
                      />{" "}
                      Remove Background (AI)
                    </label>
                  </div>

                  {t.bgRemoval && (
                    <div className="sim-field">
                      <span className="sim-label">Background Color</span>
                      <div className="sim-swatches">
                        {BG_COLORS.map((c) => (
                          <button
                            key={c.value}
                            type="button"
                            title={c.label}
                            className={`sim-swatch${t.bgColor === c.value ? " sim-swatch--active" : ""}`}
                            style={
                              c.value === "transparent"
                                ? {
                                    background:
                                      "repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 0 0/12px 12px",
                                  }
                                : {
                                    background: c.value.startsWith("rgb:")
                                      ? `#${c.value.slice(4)}`
                                      : c.value,
                                    border:
                                      c.value === "white"
                                        ? "1px solid #ccc"
                                        : undefined,
                                  }
                            }
                            onClick={() =>
                              updateTransform(img.id, "bgColor", c.value)
                            }
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Text overlay */}
                  <div className="sim-field">
                    <label className="sim-label" htmlFor={`text-${img.id}`}>
                      Text Overlay
                    </label>
                    <input
                      id={`text-${img.id}`}
                      type="text"
                      className="sim-input"
                      maxLength={60}
                      value={t.text}
                      placeholder="Optional text on image (max 60 chars)"
                      onChange={(e) =>
                        updateTransform(img.id, "text", e.target.value)
                      }
                    />
                  </div>

                  {t.text.trim() && (
                    <>
                      <div className="sim-field">
                        <span className="sim-label">Text Position</span>
                        <div className="sim-radio-group">
                          {(["top", "bottom", "corner"] as const).map((pos) => (
                            <label key={pos} className="sim-radio">
                              <input
                                type="radio"
                                name={`pos-${img.id}`}
                                value={pos}
                                checked={t.textPosition === pos}
                                onChange={() =>
                                  updateTransform(img.id, "textPosition", pos)
                                }
                              />
                              {pos.charAt(0).toUpperCase() + pos.slice(1)}
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="sim-field">
                        <span className="sim-label">Text Color</span>
                        <div className="sim-radio-group">
                          {TEXT_COLORS.map((c) => (
                            <label key={c.value} className="sim-radio">
                              <input
                                type="radio"
                                name={`tc-${img.id}`}
                                value={c.value}
                                checked={t.textColor === c.value}
                                onChange={() =>
                                  updateTransform(img.id, "textColor", c.value)
                                }
                              />
                              {c.label}
                            </label>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Live preview */}
                  <div className="sim-preview">
                    <span className="sim-label">Preview</span>
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="sim-preview__img"
                    />
                  </div>

                  <button
                    type="button"
                    className="sim-btn sim-btn--primary"
                    onClick={() => applyTransforms(img)}
                  >
                    Apply Transforms
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        .sim-root { font-size: 0.9rem; }
        .sim-toast {
          background: var(--accent, #f2c85a);
          color: #000;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          margin-bottom: 0.75rem;
          font-weight: 600;
        }
        .sim-dropzone {
          border: 2px dashed var(--border, #ccc);
          border-radius: 8px;
          padding: 2rem 1rem;
          text-align: center;
          cursor: pointer;
          margin-bottom: 1rem;
          transition: border-color 0.2s;
          line-height: 1.6;
        }
        .sim-dropzone:hover { border-color: var(--accent, #f2c85a); }
        .sim-empty { color: var(--muted, #888); font-style: italic; }
        .sim-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .sim-item {
          border: 1px solid var(--border, #ddd);
          border-radius: 8px;
          overflow: hidden;
        }
        .sim-item--dragging { opacity: 0.5; }
        .sim-item__row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
        }
        .sim-drag-handle {
          cursor: grab;
          font-size: 1.2rem;
          color: var(--muted, #888);
          user-select: none;
        }
        .sim-thumb {
          width: 64px;
          height: 64px;
          object-fit: cover;
          border-radius: 4px;
          flex-shrink: 0;
        }
        .sim-item__meta { flex: 1; min-width: 0; }
        .sim-item__name {
          display: block;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .sim-item__order { font-size: 0.75rem; color: var(--muted, #888); }
        .sim-item__actions { display: flex; gap: 0.4rem; flex-shrink: 0; }
        .sim-btn {
          padding: 0.4em 0.9em;
          border-radius: 4px;
          border: 1px solid var(--border, #ccc);
          background: var(--surface, #fff);
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 600;
        }
        .sim-btn--sm { padding: 0.3em 0.7em; font-size: 0.8rem; }
        .sim-btn--primary {
          background: var(--accent, #f2c85a);
          border-color: var(--accent, #f2c85a);
          color: #000;
        }
        .sim-btn--danger { border-color: #c0392b; color: #c0392b; }
        .sim-transforms {
          padding: 1rem;
          border-top: 1px solid var(--border, #ddd);
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          background: var(--surface-2, #fafafa);
        }
        .sim-field { display: flex; flex-direction: column; gap: 0.3rem; }
        .sim-label { font-weight: 600; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.03em; }
        .sim-input {
          padding: 0.4em 0.7em;
          border: 1px solid var(--border, #ccc);
          border-radius: 4px;
          background: var(--surface, #fff);
          font-size: 0.9rem;
        }
        .sim-swatches { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .sim-swatch {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid transparent;
        }
        .sim-swatch--active { border-color: var(--accent, #f2c85a) !important; outline: 2px solid var(--accent, #f2c85a); outline-offset: 2px; }
        .sim-radio-group { display: flex; gap: 1rem; flex-wrap: wrap; }
        .sim-radio { display: flex; align-items: center; gap: 0.3rem; cursor: pointer; }
        .sim-preview { display: flex; flex-direction: column; gap: 0.4rem; }
        .sim-preview__img {
          max-width: 100%;
          max-height: 200px;
          object-fit: contain;
          border-radius: 4px;
          border: 1px solid var(--border, #ddd);
        }
      `}</style>
    </div>
  );
}
