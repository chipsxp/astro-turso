import {
  createToastManager,
  initializeEditor,
} from "../../lib/editor-utils";
import {
  bindReviewsSection,
  bindTestimonialsSection,
  getEl,
  type SalesReview,
  type SalesTestimonial,
  updateSalePricePreview,
} from "./sales-form";

const toast = createToastManager();

const testimonials: SalesTestimonial[] = [];
const reviews: SalesReview[] = [];

// ── Quill editor ──────────────────────────────────────────────────────────
initializeEditor({
  containerId: "body-editor",
  placeholder: "Describe this item…",
  onContentChange: (html) => {
    getEl<HTMLInputElement>("body-input").value = html;
  },
});

// ── Slug auto-generation ──────────────────────────────────────────────────
const titleInput = getEl<HTMLInputElement>("title");
const slugInput = getEl<HTMLInputElement>("slug");
let slugEdited = false;
slugInput.addEventListener("input", () => {
  slugEdited = true;
});
titleInput.addEventListener("input", () => {
  if (!slugEdited) {
    slugInput.value = titleInput.value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }
});

// ── Sale price preview ────────────────────────────────────────────────────
const priceInput = getEl<HTMLInputElement>("price");
const discountInput = getEl<HTMLInputElement>("promo-discount");
const salePricePreview = getEl<HTMLInputElement>("sale-price-preview");

const handlePricePreview = () =>
  updateSalePricePreview(priceInput, discountInput, salePricePreview);
priceInput.addEventListener("input", handlePricePreview);
discountInput.addEventListener("input", handlePricePreview);

// ── Testimonials & Reviews ────────────────────────────────────────────────
bindTestimonialsSection(testimonials);
bindReviewsSection(reviews);

// ── Form submission ───────────────────────────────────────────────────────
getEl<HTMLFormElement>("sales-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();
  if (!title) {
    toast.show("Title is required.", "error");
    return;
  }

  const body: Record<string, unknown> = {
    title,
    slug: slugInput.value.trim() || undefined,
    status: getEl<HTMLSelectElement>("status").value,
    body: getEl<HTMLInputElement>("body-input").value,
    price: priceInput.value ? parseFloat(priceInput.value) : null,
    promo_label: getEl<HTMLInputElement>("promo-label").value || null,
    promo_discount_pct: discountInput.value
      ? Number(discountInput.value)
      : null,
    promo_start: getEl<HTMLInputElement>("promo-start").value || null,
    promo_end: getEl<HTMLInputElement>("promo-end").value || null,
    paypal_link: getEl<HTMLInputElement>("paypal-link").value || null,
    venmo_link: getEl<HTMLInputElement>("venmo-link").value || null,
    cashapp_link: getEl<HTMLInputElement>("cashapp-link").value || null,
    paypal_button_html:
      getEl<HTMLTextAreaElement>("paypal-html").value || null,
    linked_article_slug:
      getEl<HTMLInputElement>("linked-article").value || null,
  };

  const submitBtn = getEl<HTMLButtonElement>("submit-btn");
  submitBtn.disabled = true;
  submitBtn.textContent = "Saving…";

  try {
    let qr_code_url = null;
    const qrFileInput = getEl<HTMLInputElement>("qr-code-file");
    const qrFile = qrFileInput.files?.[0];

    if (qrFile) {
      if (qrFile.size > 10 * 1024 * 1024) {
        throw new Error("QR Code image is too large (max 10 MB).");
      }
      submitBtn.textContent = "Uploading QR Code…";

      const dataUri = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(qrFile);
      });

      const uploadRes = await fetch("/api/admin/sales/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_data: dataUri }),
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        throw new Error(uploadData.error ?? "Failed to upload QR Code");
      }
      qr_code_url = String(uploadData.qr_code_url ?? "");
    }

    if (qr_code_url) {
      body.qr_code_url = qr_code_url;
    }

    submitBtn.textContent = "Saving Posting…";

    const res = await fetch("/api/admin/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.show(data.error ?? "Failed to create posting.", "error");
      submitBtn.disabled = false;
      submitBtn.textContent = "Create Posting";
      return;
    }

    const slug = data.slug;
    for (const t of testimonials) {
      if (!t.author_name || !t.quote) continue;
      await fetch(`/api/admin/sales/${slug}/testimonials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(t),
      });
    }
    for (const r of reviews) {
      if (!r.reviewer_name || !r.review_text) continue;
      await fetch(`/api/admin/sales/${slug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(r),
      });
    }

    window.location.href = `/admin/sales/${slug}`;
  } catch {
    toast.show("Network error. Please try again.", "error");
    submitBtn.disabled = false;
    submitBtn.textContent = "Create Posting";
  }
});
