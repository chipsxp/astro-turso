/**
 * TypeScript module for event form logic shared between create and edit pages.
 * Provides functions with full type support for the admin event form.
 */

import { buildPreviewHtml, createToastManager } from "./editor-utils";
import type {
  ApiErrorResponse,
  EventData,
  EventPayload,
  EventStatus,
  MediaListResponse,
} from "./event-editor.types";

export type PickerMedia = {
  id: number;
  url: string;
  alt_text: string;
  resource_type: "image" | "video";
};

interface FormElements {
  form: HTMLFormElement;
  titleInput: HTMLInputElement;
  slugInput: HTMLInputElement;
  bodyInput: HTMLInputElement;
  statusEl: HTMLParagraphElement;
  submitBtn: HTMLButtonElement;
  deleteBtn?: HTMLButtonElement;
  previewBtn: HTMLButtonElement;
  previewCloseBtn: HTMLButtonElement;
  previewScroll: HTMLDivElement;
  draftPreview: HTMLDivElement;
  featuredMediaInput: HTMLInputElement;
  selectedWrap: HTMLDivElement;
  mediaPicker: HTMLDivElement;
  loadMediaBtn: HTMLButtonElement;
}

export class EventFormManager {
  private formElements: FormElements;
  private toast = createToastManager();
  private selectedFeaturedMedia: PickerMedia | null = null;
  private previewMediaItems: Array<{
    url: string;
    alt_text: string;
    resource_type: "image" | "video";
  }> = [];

  constructor(
    private isEditMode: boolean = false,
    private slug?: string,
  ) {
    this.formElements = this.collectFormElements();
  }

  private collectFormElements(): FormElements {
    return {
      form: document.getElementById("event-form") as HTMLFormElement,
      titleInput: document.getElementById("title") as HTMLInputElement,
      slugInput: document.getElementById(
        this.isEditMode ? "slug-input" : "slug",
      ) as HTMLInputElement,
      bodyInput: document.getElementById("body") as HTMLInputElement,
      statusEl: document.getElementById("form-status") as HTMLParagraphElement,
      submitBtn: document.getElementById("submit-btn") as HTMLButtonElement,
      deleteBtn: this.isEditMode
        ? (document.getElementById("delete-btn") as HTMLButtonElement)
        : undefined,
      previewBtn: document.getElementById("preview-btn") as HTMLButtonElement,
      previewCloseBtn: document.getElementById(
        "preview-close",
      ) as HTMLButtonElement,
      previewScroll: document.getElementById(
        "draft-preview-scroll",
      ) as HTMLDivElement,
      draftPreview: document.getElementById("draft-preview") as HTMLDivElement,
      featuredMediaInput: document.getElementById(
        "featured_media_id",
      ) as HTMLInputElement,
      selectedWrap: document.getElementById(
        "featured-media-selected",
      ) as HTMLDivElement,
      mediaPicker: document.getElementById("media-picker") as HTMLDivElement,
      loadMediaBtn: document.getElementById(
        "load-media-btn",
      ) as HTMLButtonElement,
    };
  }

  private setValue(id: string, value: string | null | undefined): void {
    const el = document.getElementById(id) as
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement
      | null;
    if (!el) return;
    el.value = value ?? "";
  }

  private renderSelectedMedia(): void {
    const { selectedWrap, featuredMediaInput } = this.formElements;

    if (!this.selectedFeaturedMedia) {
      selectedWrap.innerHTML = `<span class="form-hint">No featured media selected.</span>`;
      this.previewMediaItems.length = 0;
      return;
    }

    selectedWrap.innerHTML = `
      <strong>Selected</strong><br />
      #${this.selectedFeaturedMedia.id} - ${this.selectedFeaturedMedia.alt_text || "Untitled"}
      <div style="margin-top: 6px;">
        <button type="button" id="clear-featured-btn" class="btn btn-ghost">Clear</button>
      </div>
    `;

    const clearBtn = document.getElementById(
      "clear-featured-btn",
    ) as HTMLButtonElement;
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        this.selectedFeaturedMedia = null;
        featuredMediaInput.value = "";
        this.renderSelectedMedia();
        this.renderMediaPicker([]);
      });
    }

    this.previewMediaItems.length = 0;
    this.previewMediaItems.push({
      url: this.selectedFeaturedMedia.url,
      alt_text: this.selectedFeaturedMedia.alt_text,
      resource_type: this.selectedFeaturedMedia.resource_type,
    });
  }

  private renderMediaPicker(media: PickerMedia[]): void {
    const { mediaPicker, featuredMediaInput } = this.formElements;

    if (media.length === 0) {
      mediaPicker.innerHTML = "";
      return;
    }

    mediaPicker.innerHTML = media
      .map((item) => {
        const isSelected = this.selectedFeaturedMedia?.id === item.id;
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

          this.selectedFeaturedMedia = match;
          featuredMediaInput.value = String(match.id);
          this.renderSelectedMedia();
          this.renderMediaPicker(media);
        });
      });
  }

  private async loadMediaLibrary(): Promise<void> {
    const { loadMediaBtn } = this.formElements;

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
        this.toast.show(errorData.error ?? "Failed to load media.", "error");
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

      this.renderMediaPicker(images);
    } catch {
      this.toast.show("Network error while loading media.", "error");
    } finally {
      loadMediaBtn.disabled = false;
      loadMediaBtn.textContent = "Browse My Media";
    }
  }

  private openPreview(): void {
    const {
      titleInput,
      bodyInput,
      previewScroll,
      draftPreview,
      previewCloseBtn,
    } = this.formElements;
    const title = titleInput.value.trim();
    const description = (
      document.getElementById("description") as HTMLTextAreaElement
    ).value.trim();
    const body = bodyInput.value.trim();

    const html = buildPreviewHtml({
      title,
      description,
      body,
      media: this.previewMediaItems,
    });

    previewScroll.innerHTML = html;
    previewScroll.scrollTop = 0;
    draftPreview.classList.remove("is-hidden");
    draftPreview.setAttribute("aria-hidden", "false");
    document.body.classList.add("preview-open");
    previewCloseBtn.focus();
  }

  private closePreview(): void {
    const { draftPreview, previewBtn } = this.formElements;

    draftPreview.classList.add("is-hidden");
    draftPreview.setAttribute("aria-hidden", "true");
    document.body.classList.remove("preview-open");
    previewBtn.focus();
  }

  private payloadFromForm(formData: FormData): EventPayload {
    const { bodyInput } = this.formElements;
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
      status: String(formData.get("status") ?? "draft").trim() as EventStatus,
    };

    payload.featured_media_id = featuredMediaValue
      ? Number(featuredMediaValue)
      : "";

    return payload;
  }

  private async loadEvent(): Promise<void> {
    if (!this.isEditMode || !this.slug) return;

    const { statusEl, bodyInput } = this.formElements;
    statusEl.textContent = "Loading event...";

    const response = await fetch(`/api/admin/events/${this.slug}`);
    if (response.status === 401) {
      window.location.href = "/admin";
      return;
    }

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      statusEl.textContent = data.error ?? "Failed to load event.";
      return;
    }

    const event = (await response.json()) as EventData;
    this.setValue("title", event.title);
    this.setValue("slug-input", event.slug);
    this.setValue("description", event.description);
    bodyInput.value = event.body ?? "";
    const editorRoot = document.querySelector(
      "#body-editor .ql-editor",
    ) as HTMLElement | null;
    if (editorRoot) editorRoot.innerHTML = event.body ?? "";
    this.setValue("start_date", event.start_date);
    this.setValue("end_date", event.end_date);
    this.setValue("start_time", event.start_time);
    this.setValue("end_time", event.end_time);
    this.setValue("venue_name", event.venue_name);
    this.setValue("venue_address", event.venue_address);
    this.setValue("city", event.city);
    this.setValue("region", event.region);
    this.setValue("postal_code", event.postal_code);
    this.setValue("event_url", event.event_url);
    this.setValue(
      "featured_media_id",
      event.featured_media_id == null ? "" : String(event.featured_media_id),
    );
    this.setValue("status", event.status);

    const allDay = document.getElementById("is_all_day") as HTMLInputElement;
    allDay.checked = Boolean(event.is_all_day);

    if (event.featured_media_id && event.featured_media_url) {
      this.selectedFeaturedMedia = {
        id: event.featured_media_id,
        url: event.featured_media_url,
        alt_text: event.featured_media_alt_text ?? "",
        resource_type: "image",
      };
      this.formElements.featuredMediaInput.value = String(
        event.featured_media_id,
      );
      this.renderSelectedMedia();
    }

    statusEl.textContent = "";
  }

  private setupAutoSlug(): void {
    const { titleInput, slugInput } = this.formElements;

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
  }

  private setupFormSubmit(): void {
    const { form, submitBtn, statusEl } = this.formElements;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const formData = new FormData(form);
      const payload = this.payloadFromForm(formData);

      submitBtn.disabled = true;
      submitBtn.textContent = this.isEditMode ? "Saving..." : "Creating...";
      statusEl.textContent = this.isEditMode
        ? "Saving event..."
        : "Creating event...";

      try {
        const method = this.isEditMode ? "PUT" : "POST";
        const url = this.isEditMode
          ? `/api/events/${this.slug}`
          : "/api/events";

        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await response.json().catch(() => ({}));

        if (response.status === 401) {
          window.location.href = "/admin";
          return;
        }

        if (!response.ok) {
          statusEl.textContent = data.error ?? "Failed to save event.";
          this.toast.show(data.error ?? "Failed to save event.", "error");
          return;
        }

        if (this.isEditMode) {
          statusEl.textContent = "Saved.";
          this.toast.show("Event saved successfully.", "success");
          if (payload.slug && payload.slug !== this.slug) {
            window.location.href = `/admin/events/${payload.slug}`;
          }
        } else {
          statusEl.textContent = "Event created.";
          this.toast.show("Event created successfully.", "success");
          window.location.href = `/admin/events/${data.slug}`;
        }
      } catch {
        statusEl.textContent = "Network error. Try again.";
        this.toast.show("Network error. Try again.", "error");
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = this.isEditMode ? "Save Event" : "Create Event";
      }
    });
  }

  private setupDeleteButton(): void {
    if (!this.isEditMode || !this.formElements.deleteBtn || !this.slug) return;

    const { deleteBtn, statusEl } = this.formElements;

    deleteBtn.addEventListener("click", async () => {
      if (!window.confirm("Delete this event?")) return;

      deleteBtn.disabled = true;
      deleteBtn.textContent = "Deleting...";
      statusEl.textContent = "Deleting event...";

      try {
        const response = await fetch(`/api/events/${this.slug}`, {
          method: "DELETE",
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          statusEl.textContent = data.error ?? "Delete failed.";
          this.toast.show(data.error ?? "Delete failed.", "error");
          return;
        }

        window.location.href = "/admin/events";
      } catch {
        statusEl.textContent = "Network error. Try again.";
        this.toast.show("Network error. Try again.", "error");
        deleteBtn.disabled = false;
        deleteBtn.textContent = "Delete Event";
      }
    });
  }

  private setupPreviewButtons(): void {
    const { previewBtn, previewCloseBtn } = this.formElements;

    previewBtn.addEventListener("click", () => this.openPreview());
    previewCloseBtn.addEventListener("click", () => this.closePreview());
    document.addEventListener("keydown", (event: KeyboardEvent) => {
      if (
        event.key === "Escape" &&
        !this.formElements.draftPreview.classList.contains("is-hidden")
      ) {
        this.closePreview();
      }
    });
  }

  private setupMediaButtons(): void {
    const { loadMediaBtn } = this.formElements;

    loadMediaBtn.addEventListener("click", () => this.loadMediaLibrary());
  }

  public async initialize(): Promise<void> {
    this.setupAutoSlug();
    this.setupFormSubmit();
    this.setupDeleteButton();
    this.setupPreviewButtons();
    this.setupMediaButtons();
    this.renderSelectedMedia();
    if (this.isEditMode) {
      await this.loadEvent();
    }
  }
}
