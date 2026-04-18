/**
 * PayPal buy button HTML sanitizer.
 *
 * Supports three PayPal button formats generated from the PayPal dashboard:
 *
 *  Type A — Simple SDK button:
 *    <script src="https://www.paypal.com/sdk/js?client-id=..."></script>
 *    <div id="paypal-container-XXXX"></div>
 *    <script>paypal.HostedButtons({ hostedButtonId: "XXXX" }).render("...")</script>
 *
 *  Type B — SDK button with DOMContentLoaded:
 *    <script src="https://www.paypal.com/sdk/js?..."></script>
 *    <script>document.addEventListener("DOMContentLoaded", () => { paypal.HostedButtons({...}) })</script>
 *    <div id="paypal-container-XXXX"></div>
 *
 *  Type C — Styled form button (div + style + form):
 *    <div>
 *      <style>.pp-XXXX { ... }</style>
 *      <form action="https://www.paypal.com/ncp/payment/XXXX" method="post">
 *        <input type="submit" value="Buy Now" />
 *        <img src="https://www.paypalobjects.com/..." alt="cards" />
 *        <section>Powered by <img src="https://www.paypalobjects.com/..." /></section>
 *      </form>
 *    </div>
 *
 *  Legacy — form with image button (older PayPal button format):
 *    <form action="https://www.paypal.com/cgi-bin/webscr" method="post">
 *      <input type="hidden" name="cmd" value="_s-xclick" />
 *      <input type="hidden" name="hosted_button_id" value="XXXX" />
 *      <input type="image" src="https://www.paypalobjects.com/..." />
 *      <img src="https://www.paypalobjects.com/.../pixel.gif" width="1" height="1" />
 *    </form>
 *
 * For SDK buttons (Types A & B): use extractPayPalSdkConfig() to get structured data,
 * then render the button via a controlled Astro template. Scripts inside set:html do
 * not execute in browsers, so SDK buttons cannot go through sanitizePayPalButton().
 *
 * For form buttons (Type C + Legacy): use sanitizePayPalButton() directly — no
 * scripts involved, safe for set:html rendering.
 */

// ── Public API ────────────────────────────────────────────────────────────────

export interface PayPalSdkConfig {
  hostedButtonId: string;
  sdkSrc: string;
}

/**
 * Extract structured config from SDK-based PayPal buttons (Types A & B).
 * Returns null if the HTML is not a valid PayPal SDK button.
 *
 * Use this in the shop page; render the button via a controlled template
 * that dynamically loads the SDK and initialises HostedButtons.
 */
export function extractPayPalSdkConfig(html: string): PayPalSdkConfig | null {
  if (!html || typeof html !== "string") return null;
  if (!hasSdkScript(html)) return null;

  // Extract hostedButtonId — alphanumeric only, 4-32 chars
  const idMatch = html.match(/hostedButtonId\s*:\s*["']([A-Z0-9]{4,32})["']/i);
  if (!idMatch) return null;
  const hostedButtonId = idMatch[1];

  // Extract and validate the SDK script src
  const srcMatch = html.match(
    /src\s*=\s*["'](https:\/\/www\.paypal\.com\/sdk\/js[^"']*)["']/i,
  );
  if (!srcMatch) return null;
  const sdkSrc = srcMatch[1];
  if (!sdkSrc.startsWith("https://www.paypal.com/sdk/js")) return null;

  return { hostedButtonId, sdkSrc };
}

/**
 * Sanitize form-based PayPal buy button HTML (Type C + Legacy).
 * Returns sanitized HTML on success, empty string on failure.
 *
 * SDK buttons (Types A & B, which contain <script src="paypal.com/sdk/js">)
 * return "" here — use extractPayPalSdkConfig() for those instead.
 */
export function sanitizePayPalButton(html: string): string {
  if (!html || typeof html !== "string") return "";
  const trimmed = html.trim();
  if (!trimmed) return "";

  // SDK buttons must go through extractPayPalSdkConfig — scripts don't run via set:html
  if (hasSdkScript(trimmed)) return "";

  // Type C: outer <div> wrapper containing <style> + <form>
  if (/^<div\b/i.test(trimmed)) {
    return sanitizeTypeCButton(trimmed);
  }

  // Legacy: bare <form> as the root element
  return sanitizeLegacyFormButton(trimmed);
}

// ── Detection ─────────────────────────────────────────────────────────────────

function hasSdkScript(html: string): boolean {
  return /src\s*=\s*["']https:\/\/www\.paypal\.com\/sdk\/js/i.test(html);
}

// ── Type C: styled div+style+form button ──────────────────────────────────────

function sanitizeTypeCButton(html: string): string {
  // Extract and sanitize the <style> block (the scoped PayPal button CSS)
  const styleMatch = html.match(/<style\b[^>]*>([\s\S]*?)<\/style>/i);
  const safeStyle = styleMatch
    ? `<style>${sanitizeCssBlock(styleMatch[1])}</style>`
    : "";

  // Extract the <form>
  const formMatch = html.match(/(<form\b[^>]*>)([\s\S]*?)(<\/form>)/i);
  if (!formMatch) return "";
  const [, formOpenTag, innerHtml] = formMatch;

  const safeForm = buildSafeForm(formOpenTag, innerHtml);
  if (!safeForm) return "";

  return `<div>${safeStyle}${safeForm}</div>`;
}

// ── Legacy: bare form button ──────────────────────────────────────────────────

function sanitizeLegacyFormButton(trimmed: string): string {
  const formMatch = trimmed.match(/^(<form\b[^>]*>)([\s\S]*?)(<\/form>)\s*$/i);
  if (!formMatch) return "";
  const [, formOpenTag, innerHtml] = formMatch;
  return buildSafeForm(formOpenTag, innerHtml) ?? "";
}

// ── Shared form builder ───────────────────────────────────────────────────────

function buildSafeForm(formOpenTag: string, innerHtml: string): string | null {
  const action = extractAttr(formOpenTag, "action");
  if (!action || !action.startsWith("https://www.paypal.com/")) return null;

  const method = extractAttr(formOpenTag, "method") ?? "post";
  const target = extractAttr(formOpenTag, "target") ?? "_blank";
  const rawStyle = extractAttr(formOpenTag, "style") ?? "";

  let safeFormOpen = `<form action="${escAttr(action)}" method="${escAttr(method)}" target="${escAttr(target)}"`;
  if (rawStyle) {
    const cleanStyle = sanitizeStyleValue(rawStyle);
    if (cleanStyle) safeFormOpen += ` style="${escAttr(cleanStyle)}"`;
  }
  safeFormOpen += `>`;

  const safeInner = sanitizeFormInner(innerHtml);
  if (safeInner === null) return null;

  return `${safeFormOpen}${safeInner}</form>`;
}

// ── Form inner content sanitizer ──────────────────────────────────────────────

/**
 * Sanitize the content inside a PayPal <form>.
 * Allowed elements: <input>, <img src="paypalobjects.com">, <section>, <br>.
 * Any other HTML tag → reject (return null).
 */
function sanitizeFormInner(html: string): string | null {
  // Strip HTML comments
  let inner = html.replace(/<!--[\s\S]*?-->/g, "");

  // Validation pass: remove all known-safe elements and check nothing remains
  let test = inner;
  test = test.replace(/<input\b[^>]*\/?>/gi, "");
  test = test.replace(/<img\b[^>]*\/?>/gi, "");
  test = test.replace(/<section\b[^>]*>[\s\S]*?<\/section>/gi, "");
  test = test.replace(/<br\s*\/?>/gi, "");
  // Any remaining HTML tags (not text/whitespace) means disallowed content
  if (/<[a-z/!]/i.test(test)) return null;

  // Rebuild pass: replace each element with a safe version
  inner = inner.replace(/<input\b([^>]*)\/?\>/gi, (_, attrs) =>
    buildSafeInput(attrs),
  );
  inner = inner.replace(
    /<img\b([^>]*)\/?\>/gi,
    (_, attrs) => buildSafePaypalImg(attrs) ?? "",
  );
  inner = inner.replace(
    /<section\b[^>]*>([\s\S]*?)<\/section>/gi,
    (_, content) => {
      const safe = sanitizeSectionContent(content);
      return safe !== null ? `<section>${safe}</section>` : "";
    },
  );
  inner = inner.replace(/<br\s*\/?>/gi, "<br />");

  return inner;
}

/**
 * Sanitize content inside a <section> (PayPal's "Powered by" footer).
 * Allows text nodes and <img> from paypalobjects.com only.
 */
function sanitizeSectionContent(html: string): string | null {
  let test = html;
  test = test.replace(/<img\b[^>]*\/?>/gi, "");
  // No other HTML tags allowed inside section
  if (/<[a-z/!]/i.test(test)) return null;

  return html.replace(
    /<img\b([^>]*)\/?\>/gi,
    (_, attrs) => buildSafePaypalImg(attrs) ?? "",
  );
}

// ── Element builders ──────────────────────────────────────────────────────────

/**
 * Build a safe <input> tag.
 * Supports: type="hidden", type="submit", type="image" (src from paypalobjects.com).
 * Strips all event handlers and unknown attributes.
 */
function buildSafeInput(attrsStr: string): string {
  const attrs = parseAttrs(attrsStr);

  // Reject event handler attributes
  if (Object.keys(attrs).some((k) => k.startsWith("on"))) return "";

  const type = (attrs["type"] ?? "text").toLowerCase();
  const safeParts: string[] = [`type="${escAttr(type)}"`];

  if (attrs["name"]) safeParts.push(`name="${escAttr(attrs["name"])}"`);
  if (attrs["value"]) safeParts.push(`value="${escAttr(attrs["value"])}"`);
  // class is needed for Type C styled submit button (.pp-XXXX)
  if (attrs["class"]) safeParts.push(`class="${escAttr(attrs["class"])}"`);

  if (type === "image") {
    const src = attrs["src"] ?? "";
    if (!src.startsWith("https://www.paypalobjects.com/")) return "";
    safeParts.push(`src="${escAttr(src)}"`);
    if (attrs["border"]) safeParts.push(`border="${escAttr(attrs["border"])}"`);
    if (attrs["alt"]) safeParts.push(`alt="${escAttr(attrs["alt"])}"`);
  }

  return `<input ${safeParts.join(" ")} />`;
}

/**
 * Build a safe <img> tag — src must be from paypalobjects.com.
 * Returns null if src is missing or from a disallowed domain.
 */
function buildSafePaypalImg(attrsStr: string): string | null {
  const attrs = parseAttrs(attrsStr);

  // Reject event handlers
  if (Object.keys(attrs).some((k) => k.startsWith("on"))) return null;

  const src = attrs["src"] ?? "";
  if (!src.startsWith("https://www.paypalobjects.com/")) return null;

  const parts: string[] = [`src="${escAttr(src)}"`];
  if (attrs["alt"] !== undefined) parts.push(`alt="${escAttr(attrs["alt"])}"`);
  if (attrs["border"]) parts.push(`border="${escAttr(attrs["border"])}"`);
  if (attrs["width"]) parts.push(`width="${escAttr(attrs["width"])}"`);
  if (attrs["height"]) parts.push(`height="${escAttr(attrs["height"])}"`);
  if (attrs["style"]) {
    const clean = sanitizeStyleValue(attrs["style"]);
    if (clean) parts.push(`style="${escAttr(clean)}"`);
  }

  return `<img ${parts.join(" ")} />`;
}

// ── CSS sanitization ──────────────────────────────────────────────────────────

/** Sanitize a full CSS block (content of a <style> tag). */
function sanitizeCssBlock(css: string): string {
  return css
    .replace(/<\/?\s*style\b[^>]*>/gi, "") // prevent style tag escape
    .replace(/expression\s*\([^)]*\)/gi, "")
    .replace(/binding\s*:[^;]*/gi, "")
    .replace(/behavior\s*:[^;]*/gi, "")
    .replace(/-moz-binding:[^;]*/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/vbscript:/gi, "")
    .replace(/@import[^;]*/gi, "")
    .trim();
}

/** Sanitize an inline style attribute value. */
function sanitizeStyleValue(style: string): string {
  return style
    .replace(/expression\s*\([^)]*\)/gi, "")
    .replace(/binding\s*:[^;]*/gi, "")
    .replace(/behavior\s*:[^;]*/gi, "")
    .replace(/-moz-binding:[^;]*/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/vbscript:/gi, "")
    .trim();
}

// ── Attribute parsing ─────────────────────────────────────────────────────────

function parseAttrs(attrsStr: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const attrRegex = /(\w[\w-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+)))?/g;
  let m: RegExpExecArray | null;
  while ((m = attrRegex.exec(attrsStr)) !== null) {
    const name = m[1].toLowerCase();
    const value = (m[2] ?? m[3] ?? m[4] ?? "").trim();
    attrs[name] = value;
  }
  return attrs;
}

function extractAttr(tag: string, attr: string): string | null {
  const re = new RegExp(
    `\\b${attr}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|(\\S+))`,
    "i",
  );
  const m = tag.match(re);
  if (!m) return null;
  return (m[1] ?? m[2] ?? m[3] ?? "").trim();
}

function escAttr(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
