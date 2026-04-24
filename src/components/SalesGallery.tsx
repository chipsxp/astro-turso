import { useCallback, useEffect, useRef, useState } from "react";
import { buildSalesImageUrl } from "../lib/sales";

interface GalleryImage {
  url: string;
  public_id: string;
  alt_text: string;
  transforms: string;
}

interface Props {
  images: GalleryImage[];
  cloudName: string;
}

export default function SalesGallery({ images, cloudName }: Props) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const total = images.length;

  const prev = useCallback(() => {
    setCurrent((i) => (i - 1 + total) % total);
  }, [total]);

  const next = useCallback(() => {
    setCurrent((i) => (i + 1) % total);
  }, [total]);

  // Auto-advance every 5 seconds, pause on hover
  useEffect(() => {
    if (total <= 1 || paused) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [total, paused, next]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);

  if (total === 0) return null;

  const img = images[current];
  const displayUrl = img.public_id
    ? buildSalesImageUrl(cloudName, img.public_id, img.transforms, 800)
    : img.url;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 40) return;
    if (delta < 0) next();
    else prev();
  };

  return (
    <div
      className="sg-root"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="sg-stage"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          key={current}
          className="sg-img"
          src={displayUrl}
          alt={img.alt_text || "Product image"}
          loading="eager"
        />

        {total > 1 && (
          <>
            <button
              type="button"
              className="sg-arrow sg-arrow--prev"
              onClick={prev}
              aria-label="Previous image"
            >
              ‹
            </button>
            <button
              type="button"
              className="sg-arrow sg-arrow--next"
              onClick={next}
              aria-label="Next image"
            >
              ›
            </button>
          </>
        )}
      </div>

      {total > 1 && (
        <div className="sg-dots" role="tablist" aria-label="Image navigation">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === current}
              aria-label={`Image ${i + 1}`}
              className={`sg-dot${i === current ? " sg-dot--active" : ""}`}
              onClick={() => setCurrent(i)}
            />
          ))}
        </div>
      )}

      {/* Thumbnail strip for 2+ images */}
      {total > 1 && (
        <div className="sg-thumbs">
          {images.map((thumb, i) => {
            const thumbUrl = thumb.public_id
              ? buildSalesImageUrl(
                  cloudName,
                  thumb.public_id,
                  thumb.transforms,
                  120,
                )
              : thumb.url;
            return (
              <button
                key={i}
                type="button"
                className={`sg-thumb${i === current ? " sg-thumb--active" : ""}`}
                onClick={() => setCurrent(i)}
                aria-label={`View image ${i + 1}`}
              >
                <img src={thumbUrl} alt={thumb.alt_text || `Image ${i + 1}`} />
              </button>
            );
          })}
        </div>
      )}

      <style>{`
        .sg-root {
          width: 100%;
          user-select: none;
        }
        .sg-stage {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          background: var(--color-surface-alt, #f5f0e8);
          border-radius: 8px;
          overflow: hidden;
        }
        .sg-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
          transition: opacity 0.25s ease;
        }
        .sg-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0,0,0,0.45);
          color: #fff;
          border: none;
          border-radius: 50%;
          width: 2.4rem;
          height: 2.4rem;
          font-size: 1.6rem;
          line-height: 1;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
          z-index: 2;
        }
        .sg-arrow:hover { background: rgba(0,0,0,0.7); }
        .sg-arrow--prev { left: 0.6rem; }
        .sg-arrow--next { right: 0.6rem; }
        .sg-dots {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 0.75rem;
        }
        .sg-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          border: none;
          background: var(--color-rule, #ccc);
          cursor: pointer;
          padding: 0;
          transition: background 0.2s;
        }
        .sg-dot--active { background: var(--accent, #f2c85a); }
        .sg-thumbs {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.75rem;
          overflow-x: auto;
          padding-bottom: 2px;
        }
        .sg-thumb {
          flex-shrink: 0;
          width: 64px;
          height: 64px;
          border-radius: 4px;
          overflow: hidden;
          border: 2px solid transparent;
          cursor: pointer;
          padding: 0;
          background: none;
          transition: border-color 0.2s;
        }
        .sg-thumb--active { border-color: var(--accent, #f2c85a); }
        .sg-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        @media (max-width: 480px) {
          .sg-arrow {
            width: 2rem;
            height: 2rem;
            font-size: 1.3rem;
          }
        }
      `}</style>
    </div>
  );
}
