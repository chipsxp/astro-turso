import {
  buildPreviewHtml,
  createToastManager,
  initializeEditor,
} from "../../lib/editor-utils";
import { sanitizeForPreview } from "../../lib/sanitize";

const createdArticleId: number | null = null;
let uploadSessionId: string | null = null;
const previewMediaItems: Array<{
  url: string;
  alt_text: string;
  resource_type: "image" | "video";
}> = [];
const toast = createToastManager();

const form = document.getElementById("article-form") as HTMLFormElement;
const submitBtn = document.getElementById("submit-btn") as HTMLButtonElement;
const uploadBtn = document.getElementById("upload-btn") as HTMLButtonElement;
const uploadStatus = document.getElementById(
  "upload-status",
) as HTMLDivElement;
const uploadedImages = document.getElementById(
  "uploaded-images",
) as HTMLDivElement;
const categorySelect = document.getElementById(
  "category",
) as HTMLSelectElement;
const bodyInput = document.getElementById("body") as HTMLInputElement;
const previewBtn = document.getElementById(
  "preview-btn",
) as HTMLButtonElement;
const draftPreview = document.getElementById(
  "draft-preview",
) as HTMLDivElement;
const previewScroll = document.getElementById(
  "draft-preview-scroll",
) as HTMLDivElement;
const previewCloseBtn = document.getElementById(
  "preview-close",
) as HTMLButtonElement;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const SUPPORTED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];
const UNSUPPORTED_IMAGE_TYPE_MESSAGE =
  "Unsupported image format. Please use PNG, JPG, WEBP, GIF, or AVIF.";
const IMAGE_TOO_LARGE_MESSAGE =
  "Image is too large (max 10 MB). Please optimize it to 5–10 MB before uploading.";

// Initialize editor
initializeEditor({
  containerId: "body-editor",
  onContentChange: (html) => {
    bodyInput.value = html;
  },
});

function openPreview() {
  const title = (
    document.getElementById("title") as HTMLInputElement
  ).value.trim();
  const description = (
    document.getElementById("description") as HTMLTextAreaElement
  ).value.trim();
  const body = bodyInput.value.trim();
  const html = buildPreviewHtml({
    title,
    description,
    body,
    media: previewMediaItems,
  });
  previewScroll.innerHTML = sanitizeForPreview(html);
  previewScroll.scrollTop = 0;
  draftPreview.classList.remove("is-hidden");
  draftPreview.setAttribute("aria-hidden", "false");
  document.body.classList.add("preview-open");
  previewCloseBtn.focus();
}

function closePreview() {
  draftPreview.classList.add("is-hidden");
  draftPreview.setAttribute("aria-hidden", "true");
  document.body.classList.remove("preview-open");
  previewBtn.focus();
}

previewBtn.addEventListener("click", openPreview);
previewCloseBtn.addEventListener("click", closePreview);
document.addEventListener("keydown", (e: KeyboardEvent) => {
  if (e.key === "Escape" && !draftPreview.classList.contains("is-hidden")) {
    closePreview();
  }
});

function validateImageUploadType(file: File): boolean {
  if (SUPPORTED_IMAGE_MIME_TYPES.includes(file.type)) return true;

  toast.show(UNSUPPORTED_IMAGE_TYPE_MESSAGE, "error");
  return false;
}

function validateImageUploadSize(file: File): boolean {
  if (!validateImageUploadType(file)) return false;
  if (file.size <= MAX_IMAGE_BYTES) return true;

  toast.show(IMAGE_TOO_LARGE_MESSAGE, "error");
  return false;
}

async function uploadLocalEditorImage(
  file: File,
  altText: string,
): Promise<string | null> {
  if (!validateImageUploadSize(file)) return null;

  let sessionId = uploadSessionId;

  if (!createdArticleId && !sessionId) {
    sessionId = await createUploadSession();
    if (!sessionId) return null;
    uploadSessionId = sessionId;
  }

  try {
    const dataUri = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        file_data: dataUri,
        mime_type: file.type,
        file_size: file.size,
        ...(createdArticleId
          ? { article_id: String(createdArticleId) }
          : { upload_session_id: sessionId }),
        alt_text: altText,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      toast.show(data.error ?? "Image upload failed.", "error");
      return null;
    }

    return String(data.media_url ?? data.image_url ?? "");
  } catch {
    toast.show("Network error during image upload.", "error");
    return null;
  }
}

function appendUploadedMediaItem(
  name: string,
  mediaId?: number,
  url?: string,
) {
  const safeName = name.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const safeUrl = (url ?? "").replace(/"/g, "&quot;");
  const idLabel = Number.isFinite(mediaId) ? `#${mediaId}` : "#staged";

  let html = `<div class="media-upload-item">
    <span class="media-upload-item__id">${idLabel}</span>`;

  if (safeUrl) {
    html += `<a href="${safeUrl}" target="_blank" class="media-upload-item__link">${safeName}</a>`;
  } else {
    html += `<span class="media-upload-item__link">${safeName}</span>`;
  }

  html += `</div>`;

  uploadedImages.insertAdjacentHTML("beforeend", html);
}

async function createUploadSession(): Promise<string | null> {
  try {
    const res = await fetch("/api/admin/uploads/sessions", {
      method: "POST",
    });

    if (res.status === 401) {
      window.location.href = "/admin";
      return null;
    }

    const data = await res.json();
    if (!res.ok) {
      toast.show(data.error ?? "Could not start upload session.", "error");
      return null;
    }

    return String(data.upload_session_id ?? "").trim() || null;
  } catch {
    toast.show("Network error while starting upload session.", "error");
    return null;
  }
}

// Auto-generate slug from title
const titleInput = document.getElementById("title") as HTMLInputElement;
const slugInput = document.getElementById("slug") as HTMLInputElement;

titleInput.addEventListener("input", () => {
  if (!slugInput.dataset.userEdited) {
    slugInput.value = titleInput.value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }
});

slugInput.addEventListener("input", () => {
  slugInput.dataset.userEdited = "1";
});

// Submit
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = titleInput.value.trim();
  const slug = slugInput.value.trim() || undefined;
  const body = bodyInput.value.trim();
  const description =
    (
      document.getElementById("description") as HTMLTextAreaElement
    ).value.trim() || undefined;
  const statusVal = (document.getElementById("status") as HTMLSelectElement)
    .value;
  const categoryValue = categorySelect.value;
  const tagsRaw = (document.getElementById("tags") as HTMLInputElement).value;
  const tags = tagsRaw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  if (!title || !body) {
    toast.show("Title and body are required.", "error");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Saving…";

  try {
    const payload: Record<string, unknown> = {
      title,
      body,
      status: statusVal,
    };
    if (slug) payload.slug = slug;
    if (description) payload.description = description;
    if (tags.length) payload.tags = tags;
    if (categoryValue) payload.category_id = Number(categoryValue);
    if (uploadSessionId) payload.upload_session_id = uploadSessionId;

    const res = await fetch("/api/articles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (res.status === 401) {
      window.location.href = "/admin";
      return;
    }

    const data = await res.json();

    if (!res.ok) {
      toast.show(data.error ?? "Failed to create article.", "error");
      return;
    }

    // Redirect to the edit page
    window.location.href = `/admin/articles/${data.slug}`;
  } catch {
    toast.show("Network error. Please try again.", "error");
  } finally {
    submitBtn.disabled = false;
    if (submitBtn.textContent === "Saving…") {
      submitBtn.textContent = "Create Article";
    }
  }
});

// Image upload
uploadBtn.addEventListener("click", async () => {
  const fileInput = document.getElementById("img-file") as HTMLInputElement;
  const altInput = document.getElementById("img-alt") as HTMLInputElement;
  const file = fileInput.files?.[0];
  const alt = altInput.value.trim();

  if (!file) {
    toast.show("Select an image file.", "error");
    return;
  }
  if (!validateImageUploadSize(file)) {
    return;
  }
  if (!alt) {
    toast.show("Alt text is required.", "error");
    return;
  }

  uploadBtn.disabled = true;
  uploadStatus.textContent = "Uploading…";

  try {
    const uploadedUrl = await uploadLocalEditorImage(file, alt);
    if (!uploadedUrl) {
      toast.show(
        "Upload failed. Please check file type and try again.",
        "error",
      );
      return;
    }

    uploadStatus.textContent = "";
    toast.show("Image uploaded successfully.", "success");
    previewMediaItems.push({
      url: uploadedUrl,
      alt_text: alt,
      resource_type: "image",
    });
    appendUploadedMediaItem(file.name, undefined, uploadedUrl);
    fileInput.value = "";
    altInput.value = "";
  } catch {
    toast.show("Network error during upload.", "error");
  } finally {
    uploadBtn.disabled = false;
  }
});

async function loadCategories() {
  try {
    const res = await fetch("/api/categories");
    if (!res.ok) return;

    const data = await res.json();
    const categories = Array.isArray(data.categories) ? data.categories : [];

    categorySelect.innerHTML = `<option value="">Uncategorized</option>`;

    for (const category of categories) {
      categorySelect.insertAdjacentHTML(
        "beforeend",
        `<option value="${category.id}">${category.name}</option>`,
      );
    }
  } catch {
    // Keep the editor functional even if category lookup fails.
  }
}

loadCategories();
