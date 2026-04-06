/**
 * Shared Quill editor utilities for article creation and editing.
 * Centralizes editor initialization, serialization, and preview rendering.
 */

import Quill from "quill";
import QuillResize from "quill-resize-module";
import "quill-resize-module/dist/resize.css";
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import { enableCustomColorPickers } from "./quill-custom-colors";

export interface EditorConfig {
  containerId: string;
  initialContent?: string;
  onContentChange?: (html: string) => void;
}

/**
 * Initialize a Quill editor instance with standard toolbar configuration.
 */
const COMIC_PALETTE = [
  "#080808",
  "#1c1008",
  "#ffffff",
  "#f3e9db",
  "#e04030",
  "#1c4268",
  "#f2c85a",
  "#f8e040",
  "#fffef0",
  "#f4ede0",
  "#34c070",
  "#c09838",
];

let resizeModuleRegistered = false;

function ensureResizeModuleRegistered() {
  if (resizeModuleRegistered) return;
  Quill.register("modules/resize", QuillResize, true);
  resizeModuleRegistered = true;
}

export function initializeEditor(config: EditorConfig): Quill {
  ensureResizeModuleRegistered();

  const editor = new Quill(`#${config.containerId}`, {
    theme: "snow",
    modules: {
      toolbar: [
        ["bold", "italic", "underline"],
        [{ color: COMIC_PALETTE }, { background: COMIC_PALETTE }],
        ["blockquote", "code-block"],
        [{ header: 2 }, { header: 3 }],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "image"],
      ],
      resize: {
        modules: ["Resize", "DisplaySize", "Toolbar", "Keyboard"],
        keyboardSelect: true,
        parchment: {
          image: {
            attribute: ["width"],
            limit: {
              minWidth: 100,
            },
          },
        },
      },
    },
    placeholder: "Write your article content here…",
  });

  // Set initial content if provided
  if (config.initialContent) {
    editor.root.innerHTML = config.initialContent;
  }

  // Preserve palette swatches and add a custom color control for both pickers.
  enableCustomColorPickers(editor);

  // Handle content changes
  if (config.onContentChange) {
    editor.on("text-change", () => {
      const html = editor.root.innerHTML;
      const cleanHtml = html === "<p><br></p>" ? "" : html;
      config.onContentChange!(cleanHtml);
    });
  }

  return editor;
}

/**
 * Escape HTML special characters for safe rendering of text content.
 */
export function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Escape attribute values for safe insertion into HTML attributes.
 */
export function escapeAttr(str: string): string {
  return String(str).replace(/"/g, "&quot;");
}

/**
 * Convert body text (which may contain HTML tags) to renderable HTML.
 * Wraps plain-text paragraphs in <p> tags while preserving existing block-level HTML.
 */
export function previewBodyToHtml(text: string): string {
  const blockTagPattern =
    /^\s*<(ul|ol|li|figure|img|h1|h2|h3|h4|h5|h6|blockquote|pre|table|hr|p|div|section|article|blockquote)\b/i;
  return text
    .split(/\n{2,}/)
    .map((para) => para.trim())
    .filter(Boolean)
    .map((para) =>
      blockTagPattern.test(para)
        ? para
        : `<p>${para.replace(/\n/g, "<br>")}</p>`,
    )
    .join("\n");
}

export interface MediaItem {
  url: string;
  alt_text: string;
  resource_type: "image" | "video";
}

export interface PreviewOptions {
  title: string;
  description: string;
  body: string;
  media: MediaItem[];
}

/**
 * Build full HTML preview of an article with title, description, hero media, body, and gallery.
 */
export function buildPreviewHtml(options: PreviewOptions): string {
  const { title, description, body, media } = options;
  const bodyHtml = previewBodyToHtml(body);
  const heroMedia = media?.[0] ?? null;
  const inlineMedia = media?.slice(1) ?? [];
  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  let html = `<article class="article-wrap">`;

  // Header
  html += `<header class="article-header page-wrap"><div class="content-col">`;
  html += `<h1 class="article-title">${escapeHtml(title || "(Untitled)")}</h1>`;
  if (description) {
    html += `<p class="article-lede">${escapeHtml(description)}</p>`;
  }
  html += `<div class="article-byline"><time class="article-byline__date">${today}</time></div>`;
  html += `</div></header>`;

  // Hero media
  if (heroMedia) {
    html += `<div class="hero-image-wrap page-wrap"><div class="content-col"><figure class="hero-image">`;
    if (heroMedia.resource_type === "video") {
      html += `<video controls preload="metadata" src="${escapeAttr(heroMedia.url)}"></video>`;
    } else {
      html += `<img src="${escapeAttr(heroMedia.url)}" alt="${escapeAttr(heroMedia.alt_text)}" />`;
    }
    if (heroMedia.alt_text) {
      html += `<figcaption class="hero-image__caption">${escapeHtml(heroMedia.alt_text)}</figcaption>`;
    }
    html += `</figure></div></div>`;
  }

  // Divider
  html += `<div class="rule-wrap page-wrap" aria-hidden="true"><div class="content-col"><div class="rule-inner"><span class="rule-line"></span><span class="rule-glyph">✦</span><span class="rule-line"></span></div></div></div>`;

  // Body
  html += `<div class="article-body page-wrap"><div class="content-col"><div class="prose">${bodyHtml}</div></div></div>`;

  // Inline media gallery
  if (inlineMedia.length > 0) {
    html += `<div class="article-images page-wrap"><div class="content-col"><div class="image-grid">`;
    for (const m of inlineMedia) {
      html += `<figure class="image-grid__item">`;
      if (m.resource_type === "video") {
        html += `<video controls preload="metadata" src="${escapeAttr(m.url)}"></video>`;
      } else {
        html += `<img src="${escapeAttr(m.url)}" alt="${escapeAttr(m.alt_text)}" loading="lazy" />`;
      }
      html += `<figcaption>${escapeHtml(m.alt_text)}</figcaption></figure>`;
    }
    html += `</div></div></div>`;
  }

  html += `</article>`;
  return html;
}

/**
 * Toast notification management.
 */
export function createToastManager() {
  let timerHandle: number | undefined;

  function ensureStack(): HTMLDivElement {
    let stack = document.getElementById("toast-stack") as HTMLDivElement | null;
    if (!stack) {
      stack = document.createElement("div");
      stack.id = "toast-stack";
      stack.className = "toast-stack";
      document.body.appendChild(stack);
    }
    return stack;
  }

  function show(message: string, type: "error" | "success") {
    const stack = ensureStack();
    stack.innerHTML = `<div class="toast toast--${type}">${message}</div>`;
    stack.classList.add("is-visible");

    if (timerHandle) window.clearTimeout(timerHandle);
    timerHandle = window.setTimeout(() => {
      stack.classList.remove("is-visible");
    }, 2600);
  }

  return { show };
}
