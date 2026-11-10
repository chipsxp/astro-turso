import { estimateBase64DecodedBytes } from "./media";

// Shared article-body guardrails, previously duplicated verbatim in
// POST /api/articles and PUT /api/articles/[slug].

export const MAX_ARTICLE_BODY_BYTES = 1835008; // 1.75 MB
export const MAX_INLINE_IMAGE_COUNT = 4;
export const MAX_INLINE_IMAGE_BYTES = 300 * 1024; // 300 KB per inline image
export const MAX_INLINE_IMAGE_TOTAL_BYTES = 1200 * 1024; // 1200 KB total

/**
 * Validate an article body before persisting. Returns a user-facing error
 * message, or null when the body is acceptable.
 */
export function validateArticleBody(body: string): string | null {
  const bodyBytes = new TextEncoder().encode(body).length;
  if (bodyBytes > MAX_ARTICLE_BODY_BYTES) {
    return "Article body is too large (max 1.75 MB).";
  }

  const inlineMatches = Array.from(
    body.matchAll(/data:image\/[a-z0-9.+-]+;base64,([A-Za-z0-9+/=\r\n]+)/gi),
  );

  if (inlineMatches.length > MAX_INLINE_IMAGE_COUNT) {
    return "Too many inline images in article body (max 4). Please use media upload for additional images.";
  }

  let inlineDecodedTotal = 0;
  for (const match of inlineMatches) {
    const base64Data = match[1] ?? "";
    const decodedSize = estimateBase64DecodedBytes(base64Data);

    if (decodedSize > MAX_INLINE_IMAGE_BYTES) {
      return "An inline image in article body is too large (max 300 KB decoded per image). Please use media upload instead of large base64 embeds.";
    }

    inlineDecodedTotal += decodedSize;
  }

  if (inlineDecodedTotal > MAX_INLINE_IMAGE_TOTAL_BYTES) {
    return "Inline image payload in article body is too large (max 1200 KB decoded total). Please use media upload instead of large base64 embeds.";
  }

  return null;
}
