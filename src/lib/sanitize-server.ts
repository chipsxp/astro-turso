/**
 * Server-side HTML sanitization for article bodies.
 * This module provides sanitization without requiring a DOM context (e.g., DOMPurify).
 * It uses regex-based pattern matching to remove dangerous content while preserving semantic HTML.
 */

/**
 * Server-side sanitization of article body HTML.
 * Removes dangerous tags and attributes that could lead to XSS vulnerabilities.
 */
export function sanitizeArticleBodyServer(html: string): string {
  if (!html) return "";

  let sanitized = html;

  // Remove script tags entirely (including content)
  sanitized = sanitized.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    "",
  );

  // Remove iframe tags
  sanitized = sanitized.replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, "");

  // Remove object, embed, applet tags
  sanitized = sanitized.replace(
    /<(object|embed|applet)[^>]*>[\s\S]*?<\/\1>/gi,
    "",
  );

  // Remove event handlers from all tags (onclick, onerror, onload, etc.)
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*["']?[^"']*["']?/gi, "");

  // Remove javascript: URLs in href, src, poster attributes
  sanitized = sanitized.replace(
    /(\s(?:href|src|poster)\s*=\s*)["']?javascript:[^"'\s>]*["']?/gi,
    '$1""',
  );

  // Remove data: URLs in href (but allow in src for images if needed)
  sanitized = sanitized.replace(
    /(\s(?:href)\s*=\s*)["']?data:[^"'\s>]*["']?/gi,
    '$1""',
  );

  // Remove vbscript: URLs
  sanitized = sanitized.replace(
    /(\s(?:href|src)\s*=\s*)["']?vbscript:[^"'\s>]*["']?/gi,
    '$1""',
  );

  // Remove style tags
  sanitized = sanitized.replace(
    /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
    "",
  );

  // Remove meta, link, base, form tags
  sanitized = sanitized.replace(/<(meta|link|base|form)[^>]*>/gi, "");

  // Clean up dangerous attributes while preserving allowed ones
  sanitized = sanitized.replace(
    /(<[a-z][^>]*?\s)(action|behavior|formaction|ioaction|poster)\s*=\s*["']?[^"'\s>]*["']?/gi,
    "$1",
  );

  // Remove dangerous style properties from inline styles
  sanitized = sanitizeInlineStyles(sanitized);

  return sanitized;
}

/**
 * Remove dangerous CSS properties from inline style attributes.
 * Blocks properties that can be used for XSS attacks (expression, behavior, etc.).
 */
function sanitizeInlineStyles(html: string): string {
  // Match style attributes
  return html.replace(
    /style\s*=\s*["']([^"']*)["']/gi,
    (match, styleContent) => {
      // Blocked CSS that can execute code
      let clean = styleContent
        .replace(/binding\s*:[^;]*/gi, "") // VML binding
        .replace(/behavior\s*:[^;]*/gi, "") // IE behavior
        .replace(/expression\s*\([^)]*\)/gi, "") // IE expression()
        .replace(/-moz-binding:[^;]*/gi, "") // Mozilla binding
        .replace(/javascript:/gi, "") // javascript: protocol
        .replace(/vbscript:/gi, "") // vbscript: protocol
        .replace(/@import/gi, "") // @import (can load external))
        .replace(/\s+/g, " ") // Normalize whitespace
        .trim();

      // Re-encode the cleaned style
      return clean ? `style="${clean}"` : "";
    },
  );
}

/**
 * Validate a URL to ensure it uses safe protocols.
 */
export function isValidUrlForAttribute(
  url: string,
  attributeName: string,
): boolean {
  if (!url) return true; // Empty is OK
  const lower = url.toLowerCase().trim();

  const dangerousProtocols = ["javascript:", "data:", "vbscript:", "file://"];
  for (const protocol of dangerousProtocols) {
    if (lower.startsWith(protocol)) return false;
  }

  // If href attribute specifically, allow most URLs
  if (attributeName === "href") {
    return true;
  }

  // For src, poster, etc., be more restrictive
  const safePrefixes = ["http://", "https://", "/", "#", "data:image/"];
  return safePrefixes.some((prefix) => lower.startsWith(prefix));
}
