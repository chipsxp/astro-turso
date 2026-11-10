import {
  buildPreviewHtml,
  createToastManager,
  initializeEditor,
} from "../../lib/editor-utils";
import type {
  ApiErrorResponse,
  EventPayload,
  EventStatus,
  MediaListResponse,
} from "../../lib/event-editor.types";

const form = document.getElementById("event-form") as HTMLFormElement;
const statusEl = document.getElementById(
  "form-status",
) as HTMLParagraphElement;
const submitBtn = document.getElementById("submit-btn") as HTMLButtonElement;
const bodyInput = document.getElementById("body") as HTMLInputElement;
const previewBtn = document.getElementById(
  "preview-btn",
) as HTMLButtonElement;
const previewCloseBtn = document.getElementById(
  "preview-close",
) as HTMLButtonElement;
const previewScroll = document.getElementById(
  "draft-preview-scroll",
) as HTMLDivElement;
const draftPreview = document.getElementById(
  "draft-preview",
) as HTMLDivElement;
const featuredMediaInput = document.getElementById(
  "featured_media_id",
) as HTMLInputElement;
const selectedWrap = document.getElementById(
  "featured-media-selected",
) as HTMLDivElement;
const mediaPicker = document.getElementById("media-picker") as HTMLDivElement;
const loadMediaBtn = document.getElementById(
  "load-media-btn",
) as HTMLButtonElement;
const toast = createToastManager();

const previewMediaItems: Array<{
  url: string;
  alt_text: string;
  resource_type: "image" | "video";
}> = [];

type PickerMedia = {
  id: number;
  url: string;
  alt_text: string;
  resource_type: "image" | "video";
};

let selectedFeaturedMedia: PickerMedia | null = null;

initializeEditor({
  containerId: "body-editor",
  toolbar: [
    ["bold", "italic", "underline"],
    [
      {
        color: [
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
        ],
      },
      {
        background: [
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
        ],
      },
    ],
    ["blockquote", "code-block"],
    [{ header: 2 }, { header: 3 }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link"],
  ],
  placeholder: "Write your event details here...",
  onContentChange: (html) => {
    bodyInput.value = html;
  },
});

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

function renderSelectedMedia() {
  if (!selectedFeaturedMedia) {
    selectedWrap.innerHTML = `<span class="form-hint">No featured media selected.</span>`;
    previewMediaItems.length = 0;
    return;
  }

  selectedWrap.innerHTML = `
    <strong>Selected</strong><br />
    #${selectedFeaturedMedia.id} - ${selectedFeaturedMedia.alt_text || "Untitled"}
    <div style="margin-top: 6px;">
      <button type="button" id="clear-featured-btn" class="btn btn-ghost">Clear</button>
    </div>
  `;

  const clearBtn = document.getElementById(
    "clear-featured-btn",
  ) as HTMLButtonElement;
  clearBtn.addEventListener("click", () => {
    selectedFeaturedMedia = null;
    featuredMediaInput.value = "";
    renderSelectedMedia();
    renderMediaPicker([]);
  });

  previewMediaItems.length = 0;
  previewMediaItems.push({
    url: selectedFeaturedMedia.url,
    alt_text: selectedFeaturedMedia.alt_text,
    resource_type: selectedFeaturedMedia.resource_type,
  });
}

function renderMediaPicker(media: PickerMedia[]) {
  if (media.length === 0) {
    mediaPicker.innerHTML = "";
    return;
  }

  mediaPicker.innerHTML = media
    .map((item) => {
      const isSelected = selectedFeaturedMedia?.id === item.id;
      return `
        <div class="media-picker-card ${isSelected ? "is-selected" : ""}" data-id="${item.id}">
          <img src="${item.url}" alt="${(item.alt_text || "Media").replace(/\"/g, "&quot;")}" loading="lazy" />
          <button type="button" class="btn btn-ghost" data-select-id="${item.id}">
            ${isSelected ? "Selected" : "Select"}
          </button>
        </div>
      `;
    })
    .join("");

  mediaPicker
    .querySelectorAll<HTMLButtonElement>("[data-select-id]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        const id = Number(button.dataset.selectId);
        const match = media.find((item) => item.id === id);
        if (!match) return;

        selectedFeaturedMedia = match;
        featuredMediaInput.value = String(match.id);
        renderSelectedMedia();
        renderMediaPicker(media);
      });
    });
}

async function loadMediaLibrary() {
  loadMediaBtn.disabled = true;
  loadMediaBtn.textContent = "Loading...";
  try {
    const response = await fetch("/api/admin/events/media");
    if (response.status === 401) {
      window.location.href = "/admin";
      return;
    }
    const data = (await response.json()) as MediaListResponse;
    if (!response.ok) {
      const errorData = data as ApiErrorResponse;
      toast.show(errorData.error ?? "Failed to load media.", "error");
      return;
    }

    const images = (data.media ?? [])
      .filter((item) => item.resource_type === "image")
      .map((item) => ({
        id: item.id,
        url: item.url,
        alt_text: item.alt_text,
        resource_type: item.resource_type,
      }));

    renderMediaPicker(images);
  } catch {
    toast.show("Network error while loading media.", "error");
  } finally {
    loadMediaBtn.disabled = false;
    loadMediaBtn.textContent = "Browse My Media";
  }
}

function openPreview() {
  const title = titleInput.value.trim();
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

  previewScroll.innerHTML = html;
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
document.addEventListener("keydown", (event: KeyboardEvent) => {
  if (
    event.key === "Escape" &&
    !draftPreview.classList.contains("is-hidden")
  ) {
    closePreview();
  }
});

loadMediaBtn.addEventListener("click", loadMediaLibrary);

renderSelectedMedia();

function payloadFromForm(formData: FormData) {
  const featuredMediaValue = String(
    formData.get("featured_media_id") ?? "",
  ).trim();

  const payload: EventPayload = {
    title: String(formData.get("title") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    body: bodyInput.value.trim(),
    start_date: String(formData.get("start_date") ?? "").trim(),
    end_date: String(formData.get("end_date") ?? "").trim(),
    start_time: String(formData.get("start_time") ?? "").trim(),
    end_time: String(formData.get("end_time") ?? "").trim(),
    is_all_day: (formData.get("is_all_day") as string | null) ? 1 : 0,
    venue_name: String(formData.get("venue_name") ?? "").trim(),
    venue_address: String(formData.get("venue_address") ?? "").trim(),
    city: String(formData.get("city") ?? "").trim(),
    region: String(formData.get("region") ?? "").trim(),
    postal_code: String(formData.get("postal_code") ?? "").trim(),
    event_url: String(formData.get("event_url") ?? "").trim(),
    color: String(formData.get("color") ?? "").trim() || null,
    status: String(formData.get("status") ?? "draft").trim() as EventStatus,
  };

  payload.featured_media_id = featuredMediaValue
    ? Number(featuredMediaValue)
    : "";

  return payload;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const payload = payloadFromForm(formData);

  submitBtn.disabled = true;
  submitBtn.textContent = "Saving...";
  statusEl.textContent = "Saving event...";

  try {
    const response = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (response.status === 401) {
      window.location.href = "/admin";
      return;
    }

    if (!response.ok) {
      statusEl.textContent = data.error ?? "Failed to create event.";
      toast.show(data.error ?? "Failed to create event.", "error");
      return;
    }

    statusEl.textContent = "Event created.";
    toast.show("Event created successfully.", "success");
    window.location.href = `/admin/events/${data.slug}`;
  } catch {
    statusEl.textContent = "Network error. Try again.";
    toast.show("Network error. Try again.", "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Create Event";
  }
});
