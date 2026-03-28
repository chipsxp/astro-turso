type CloudinaryImagePreset = "hero" | "inline" | "thumb";

type BuildCloudinaryImageUrlInput = {
  cloudName: string;
  publicId: string;
  preset: CloudinaryImagePreset;
  width?: number;
};

type PresetDimensions = {
  width: number;
  height?: number;
};

const PRESET_DIMENSIONS: Record<CloudinaryImagePreset, PresetDimensions> = {
  hero: { width: 1280 },
  inline: { width: 960 },
  thumb: { width: 320, height: 240 },
};

function encodePublicId(publicId: string): string {
  return publicId
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function clampWidth(width: number): number {
  if (!Number.isFinite(width)) return 1;
  const rounded = Math.round(width);
  if (rounded < 1) return 1;
  return rounded;
}

export function buildCloudinaryImageUrl({
  cloudName,
  publicId,
  preset,
  width,
}: BuildCloudinaryImageUrlInput): string {
  const trimmedCloudName = cloudName.trim();
  const trimmedPublicId = publicId.trim();

  if (!trimmedCloudName) {
    throw new Error("cloudName is required");
  }

  if (!trimmedPublicId) {
    throw new Error("publicId is required");
  }

  const presetDimensions = PRESET_DIMENSIONS[preset];
  const targetWidth = clampWidth(width ?? presetDimensions.width);

  const resizeComponent =
    preset === "thumb"
      ? `c_fill,g_auto,h_${presetDimensions.height ?? 240},w_${targetWidth}`
      : `c_limit,w_${targetWidth}`;

  const transformations = [resizeComponent, "f_auto", "q_auto"].join("/");
  const encodedPublicId = encodePublicId(trimmedPublicId);

  return `https://res.cloudinary.com/${trimmedCloudName}/image/upload/${transformations}/${encodedPublicId}`;
}

export function getCloudinaryPresetWidth(
  preset: CloudinaryImagePreset,
): number {
  return PRESET_DIMENSIONS[preset].width;
}
