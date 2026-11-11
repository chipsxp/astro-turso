import { useState, useEffect } from "react";
import type { SalesImageTransforms } from "../../lib/sales";
import { buildSalesImageUrl } from "../../lib/sales";
import {
  BG_COLORS,
  type SalesImageRecord,
  TEXT_COLORS,
} from "./sales-transforms";

interface Props {
  img: SalesImageRecord;
  transforms: SalesImageTransforms;
  cloudName: string;
  isOpen: boolean;
  isDragging: boolean;
  onToggleExpand: () => void;
  onDelete: () => void;
  onUpdateTransform: <K extends keyof SalesImageTransforms>(
    key: K,
    value: SalesImageTransforms[K],
  ) => void;
  onApplyTransforms: () => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

export function SalesImageRow({
  img,
  transforms: t,
  cloudName,
  isOpen,
  isDragging,
  onToggleExpand,
  onDelete,
  onUpdateTransform,
  onApplyTransforms,
  onDragStart,
  onDragOver,
  onDragEnd,
}: Props) {
  const [localText, setLocalText] = useState(t.text);

  useEffect(() => {
    setLocalText(t.text);
  }, [t.text]);

  useEffect(() => {
    if (localText === t.text) return;
    const timer = setTimeout(() => {
      onUpdateTransform("text", localText);
    }, 300);
    return () => clearTimeout(timer);
  }, [localText, t.text, onUpdateTransform]);

  const flushText = () => {
    if (localText !== t.text) {
      onUpdateTransform("text", localText);
    }
  };

  const previewUrl = img.public_id
    ? buildSalesImageUrl(cloudName, img.public_id, JSON.stringify(t), 400)
    : img.url;

  return (
    <div
      className={`sim-item${isDragging ? " sim-item--dragging" : ""}`}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
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
          <span className="sim-item__name">{img.alt_text || "Image"}</span>
          <span className="sim-item__order">#{img.sort_order + 1}</span>
        </div>
        <div className="sim-item__actions">
          <button
            type="button"
            className="sim-btn sim-btn--sm"
            onClick={onToggleExpand}
          >
            {isOpen ? "Close" : "Edit"}
          </button>
          <button
            type="button"
            className="sim-btn sim-btn--danger sim-btn--sm"
            onClick={onDelete}
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
                  onUpdateTransform("bgRemoval", e.target.checked)
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
                    onClick={() => onUpdateTransform("bgColor", c.value)}
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
              value={localText}
              placeholder="Optional text on image (max 60 chars)"
              onChange={(e) => setLocalText(e.target.value)}
              onBlur={flushText}
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
                        onChange={() => onUpdateTransform("textPosition", pos)}
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
                        onChange={() => onUpdateTransform("textColor", c.value)}
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
            <img src={previewUrl} alt="Preview" className="sim-preview__img" />
          </div>

          <button
            type="button"
            className="sim-btn sim-btn--primary"
            onClick={() => {
              flushText();
              onApplyTransforms();
            }}
          >
            Apply Transforms
          </button>
        </div>
      )}
    </div>
  );
}
