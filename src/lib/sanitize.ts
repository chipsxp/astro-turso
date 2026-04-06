/**
 * HTML sanitization utilities for article body rendering.
 * Prevents XSS attacks by stripping dangerous tags/attributes while preserving semantic formatting.
 */

import DOMPurify from "dompurify";

/**
 * Sanitization configuration for article body content.
 * Allows semantic formatting tags but blocks script, event handlers, and dangerous attributes.
 */
const ARTICLE_SANITIZE_CONFIG = {
  ALLOWED_TAGS: [
    // Semantic formatting
    "strong",
    "em",
    "u",
    "span",
    "code",
    // Structure
    "p",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "blockquote",
    "hr",
    "br",
    // Lists
    "ul",
    "ol",
    "li",
    // Tables
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
    // Media
    "img",
    "figure",
    "figcaption",
    "video",
    "source",
    // Links
    "a",
    // Code
    "pre",
  ],
  ALLOWED_ATTR: [
    // Global attributes
    "id",
    "class",
    "data-*",
    // Link attributes
    "href",
    "title",
    "rel",
    "target",
    // Media attributes
    "src",
    "alt",
    "width",
    "height",
    "controls",
    "preload",
    "loading",
    // Video attributes
    "type",
    // Span/formatting attributes (safe style properties only)
    "style",
  ],
  KEEP_CONTENT: true,
  FORCE_BODY: false,
  SAFE_FOR_TEMPLATES: true,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  RETURN_DOM_IMPORT: false,
  // Custom filter for safe inline styles
  CUSTOM_ELEMENT_HANDLER: function (element: Element) {
    // Allow limited safe inline styles
    if (element.getAttribute("style")) {
      const style = element.getAttribute("style") || "";
      // Only allow safe CSS properties commonly used in articles
      const safeProperties = [
        "color",
        "background-color",
        "font-size",
        "font-weight",
        "font-style",
        "text-decoration",
        "text-align",
        "margin",
        "padding",
        "border",
        "display",
        "max-width",
        "height",
        "width",
      ];

      const parsedStyle = parseInlineStyle(style);
      const safeStyle = Object.entries(parsedStyle)
        .filter(([key]) => safeProperties.includes(key.toLowerCase()))
        .map(([key, value]) => `${key}: ${value}`)
        .join("; ");

      if (safeStyle) {
        element.setAttribute("style", safeStyle);
      } else {
        element.removeAttribute("style");
      }
    }
    return false;
  },
};

/**
 * Parse inline CSS style string into key-value object.
 */
function parseInlineStyle(styleStr: string): Record<string, string> {
  const styles: Record<string, string> = {};
  const declarations = styleStr.split(";").filter((d) => d.trim());

  for (const decl of declarations) {
    const [key, value] = decl.split(":").map((s) => s.trim());
    if (key && value) {
      styles[key.toLowerCase()] = value;
    }
  }

  return styles;
}

/**
 * Sanitize article body HTML to prevent XSS while preserving formatting.
 * Removes:
 * - Script tags and event handlers
 * - Dangerous attributes (onload, onerror, etc.)
 * - Unsafe URL schemes (javascript:, data:, vbscript:)
 * - Event listeners
 * - Unsupported HTML elements
 *
 * Preserves:
 * - Semantic formatting (strong, em, u, code, etc.)
 * - Links (with safe URL validation)
 * - Images and figures
 * - Lists and tables
 * - Blockquotes and headings
 */
export function sanitizeArticleBody(html: string): string {
  if (!html) return "";

  // Parse and sanitize with DOMPurify
  const cleaned = DOMPurify.sanitize(html, ARTICLE_SANITIZE_CONFIG as any);
  const cleanedHtml = String(cleaned);

  // Additional validation: ensure links use safe protocols
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = cleanedHtml;

  // Validate all links
  for (const link of tempDiv.querySelectorAll("a")) {
    const href = link.getAttribute("href") || "";

    // Block javascript: and data: schemes
    if (
      href.toLowerCase().startsWith("javascript:") ||
      href.toLowerCase().startsWith("data:")
    ) {
      link.removeAttribute("href");
      link.setAttribute("title", "Link blocked (unsafe protocol)");
    }

    // Require rel="noopener" for external links with target="_blank"
    if (link.getAttribute("target") === "_blank" && href.startsWith("http")) {
      const rel = link.getAttribute("rel") || "";
      if (!rel.includes("noopener")) {
        link.setAttribute("rel", `${rel} noopener noreferrer`.trim());
      }
    }
  }

  return tempDiv.innerHTML;
}

/**
 * Sanitize for use in preview/client context where we have DOM access.
 * This version uses DOMPurify directly on the HTML string.
 */
export function sanitizeForPreview(html: string): string {
  return sanitizeArticleBody(html);
}

/**
 * Validate image source URLs to prevent data: or javascript: schemes.
 */
export function isValidImageUrl(url: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return (
    !lower.startsWith("javascript:") &&
    !lower.startsWith("data:") &&
    !lower.startsWith("vbscript:")
  );
}

/**
 * Validate link URLs to prevent dangerous protocols.
 */
export function isValidLinkUrl(url: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();

  // Whitelist safe protocols
  const safeProtocols = ["http://", "https://", "mailto:", "tel:", "/", "#"];
  return safeProtocols.some((protocol) => lower.startsWith(protocol));
}
