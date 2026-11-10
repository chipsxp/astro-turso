import { useRef } from "react";
import {
  defaultTransforms,
  MAX_IMAGES,
  type SalesImageRecord,
} from "./sales-transforms";
import { SalesImageRow } from "./SalesImageRow";
import { useSalesImageUploads } from "./useSalesImageUploads";

interface Props {
  postingSlug: string;
  initialImages?: SalesImageRecord[];
  cloudName: string;
}

export default function SalesImageManager({
  postingSlug,
  initialImages = [],
  cloudName,
}: Props) {
  const {
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
  } = useSalesImageUploads(postingSlug, initialImages);

  const fileRef = useRef<HTMLInputElement>(null);

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
          const isOpen = expanded === img.id;

          return (
            <SalesImageRow
              key={img.id}
              img={img}
              transforms={t}
              cloudName={cloudName}
              isOpen={isOpen}
              isDragging={dragging === img.id}
              onToggleExpand={() => setExpanded(isOpen ? null : img.id)}
              onDelete={() => handleDelete(img.id)}
              onUpdateTransform={(key, value) =>
                updateTransform(img.id, key, value)
              }
              onApplyTransforms={() => applyTransforms(img)}
              onDragStart={() => handleDragStart(img.id)}
              onDragOver={(e) => handleDragOver(e, img.id)}
              onDragEnd={handleDragEnd}
            />
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
