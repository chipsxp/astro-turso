/**
 * PayPal legacy buy button HTML sanitizer.
 *
 * PayPal's legacy form-based buttons (from paypal.com console) contain:
 *   <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
 *     <input type="hidden" name="cmd" value="_s-xclick" />
 *     <input type="hidden" name="hosted_button_id" value="XXXXXXX" />
 *     <input type="image" src="https://www.paypalobjects.com/..." ... />
 *   </form>
 *
 * This sanitizer ONLY allows that specific structure.
 * Never use sanitizeArticleBodyServer() for PayPal HTML — it strips <form> and <input>.
 */

/**
 * Sanitize a PayPal legacy buy button HTML snippet.
 * Returns sanitized HTML on success, or an empty string if validation fails.
 */
export function sanitizePayPalButton(html: string): string {
  if (!html || typeof html !== "string") return "";
  const trimmed = html.trim();
  if (!trimmed) return "";

  // Must begin with <form ... and end with </form>
  const formMatch = trimmed.match(/^(<form\b[^>]*>)([\s\S]*?)(<\/form>)\s*$/i);
  if (!formMatch) return "";

  const [, formOpenTag, innerHtml, formCloseTag] = formMatch;

  // Validate form action — must be PayPal's cgi-bin endpoint
  const actionMatch = formOpenTag.match(/\baction\s*=\s*["']([^"']*)["']/i);
  if (!actionMatch) return "";
  const action = actionMatch[1].trim();
  if (!action.startsWith("https://www.paypal.com/")) return "";

  // Rebuild form tag with only safe attributes
  const method =
    /\bmethod\s*=\s*["']([^"']*)["']/i.exec(formOpenTag)?.[1] ?? "post";
  const target =
    /\btarget\s*=\s*["']([^"']*)["']/i.exec(formOpenTag)?.[1] ?? "_top";
  const safeFormOpen = `<form action="${escAttr(action)}" method="${escAttr(method)}" target="${escAttr(target)}">`;

  // Process inner elements — only allow <input> tags
  const safeInner = sanitizeInputs(innerHtml);
  if (safeInner === null) return ""; // Contains disallowed tags

  return `${safeFormOpen}${safeInner}${formCloseTag}`;
}

/**
 * Process the inner HTML of the PayPal form.
 * Only <input> tags are allowed. Any other HTML element returns null (failure).
 * Returns sanitized string or null if disallowed content is found.
 */
function sanitizeInputs(html: string): string | null {
  // Strip HTML comments
  let inner = html.replace(/<!--[\s\S]*?-->/g, "");

  // Allow only whitespace and <input ... /> or <input ...> tags
  // Remove all <input> tags temporarily to check for remaining content
  const withoutInputs = inner.replace(/<input\b[^>]*\/?>/gi, "");
  // If anything other than whitespace remains, reject
  if (withoutInputs.replace(/\s/g, "").length > 0) return null;

  // Now rebuild safe <input> tags
  const result = inner.replace(/<input\b([^>]*)\/?\>/gi, (_match, attrsStr) => {
    return buildSafeInput(attrsStr);
  });

  return result;
}

/**
 * Build a safe <input> tag from the raw attribute string.
 * - Strips all event handlers (on*)
 * - For type="image", validates src must be from paypalobjects.com
 * - Keeps: type, name, value, src, border, alt
 */
function buildSafeInput(attrsStr: string): string {
  const attrs: Record<string, string> = {};

  // Parse attributes
  const attrRegex = /(\w[\w-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+)))?/g;
  let m: RegExpExecArray | null;
  while ((m = attrRegex.exec(attrsStr)) !== null) {
    const name = m[1].toLowerCase();
    const value = (m[2] ?? m[3] ?? m[4] ?? "").trim();
    attrs[name] = value;
  }

  // Reject any event handler attributes
  for (const key of Object.keys(attrs)) {
    if (key.startsWith("on")) return "";
  }

  const type = (attrs["type"] ?? "text").toLowerCase();
  const safeParts: string[] = [];

  safeParts.push(`type="${escAttr(type)}"`);

  if (attrs["name"]) safeParts.push(`name="${escAttr(attrs["name"])}"`);
  if (attrs["value"]) safeParts.push(`value="${escAttr(attrs["value"])}"`);

  if (type === "image") {
    const src = attrs["src"] ?? "";
    if (!src.startsWith("https://www.paypalobjects.com/")) return "";
    safeParts.push(`src="${escAttr(src)}"`);
    if (attrs["border"]) safeParts.push(`border="${escAttr(attrs["border"])}"`);
    if (attrs["alt"]) safeParts.push(`alt="${escAttr(attrs["alt"])}"`);
  }

  return `<input ${safeParts.join(" ")} />`;
}

function escAttr(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
