type CloudinaryImagePreset =
  | "hero"
  | "inline"
  | "thumb"
  | "panel"
  | "panel-tall"
  | "panel-wide";

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
  panel: { width: 640, height: 480 },
  "panel-tall": { width: 400, height: 720 }, // 5:9 portrait — panel-01, panel-02, panel-04
  "panel-wide": { width: 800, height: 450 }, // 16:9 landscape — panel-03
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

  const scaledHeight =
    presetDimensions.height !== undefined
      ? Math.round(
          (targetWidth / presetDimensions.width) * presetDimensions.height,
        )
      : undefined;

  const resizeComponent =
    preset === "thumb" || preset === "panel-tall" || preset === "panel-wide"
      ? `c_fill,g_auto,h_${scaledHeight ?? 240},w_${targetWidth}`
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

export function buildCloudinaryImageSrcset({
  cloudName,
  publicId,
  preset,
  widths = [480, 768, 1024, 1280],
}: BuildCloudinaryImageUrlInput & { widths?: number[] }): string {
  return widths
    .map(
      (w) =>
        `${buildCloudinaryImageUrl({ cloudName, publicId, preset, width: w })} ${w}w`,
    )
    .join(", ");
}

export function buildCloudinaryVideoUrl({
  cloudName,
  publicId,
  width = 1280,
}: {
  cloudName: string;
  publicId: string;
  width?: number;
}): string {
  const trimmedCloudName = cloudName.trim();
  const trimmedPublicId = publicId.trim();

  if (!trimmedCloudName) throw new Error("cloudName is required");
  if (!trimmedPublicId) throw new Error("publicId is required");

  const transformations = [
    `c_limit,w_${clampWidth(width)}`,
    "f_auto",
    "q_auto",
    "vc_auto",
  ].join("/");

  return `https://res.cloudinary.com/${trimmedCloudName}/video/upload/${transformations}/${encodePublicId(trimmedPublicId)}`;
}

export function buildCloudinaryVideoPosterUrl({
  cloudName,
  publicId,
  width = 1280,
}: {
  cloudName: string;
  publicId: string;
  width?: number;
}): string {
  const trimmedCloudName = cloudName.trim();
  const trimmedPublicId = publicId.trim();

  if (!trimmedCloudName) throw new Error("cloudName is required");
  if (!trimmedPublicId) throw new Error("publicId is required");

  return `https://res.cloudinary.com/${trimmedCloudName}/video/upload/fl_screenshot,pg_1,so_0,f_jpg,q_auto,w_${clampWidth(width)}/${encodePublicId(trimmedPublicId)}.jpg`;
}
