import { buildCloudinaryImageUrl } from "../../lib/cloudinary";
import type { MediaItem } from "./useAdminMedia";

interface Props {
  activeImage: MediaItem;
  cloudName: string;
  onClose: () => void;
}

export function MediaLightbox({ activeImage, cloudName, onClose }: Props) {
  return (
    <div
      className="admin-media-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
    >
      <button
        type="button"
        className="admin-media-lightbox__backdrop"
        onClick={onClose}
        aria-label="Close image viewer"
      />
      <div className="admin-media-lightbox__dialog">
        <button
          type="button"
          className="admin-media-lightbox__close"
          onClick={onClose}
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
  );
}
