import {
  createToastManager,
  initializeEditor,
} from "../../lib/editor-utils";
import {
  bindReviewsSection,
  bindTestimonialsSection,
  getEl,
  renderReviews,
  renderTestimonials,
  type SalesReview,
  type SalesTestimonial,
  updateSalePricePreview,
} from "./sales-form";

const toast = createToastManager();

const initialBody = getEl<HTMLInputElement>("body-input").value;
const currentSlug = getEl<HTMLFormElement>("sales-form").dataset.slug ?? "";

const currentTestimonials: SalesTestimonial[] = JSON.parse(
  getEl<HTMLInputElement>("testimonials-json").value || "[]",
);
const currentReviews: SalesReview[] = JSON.parse(
  getEl<HTMLInputElement>("reviews-json").value || "[]",
);

// ── Quill ─────────────────────────────────────────────────────────────────
await initializeEditor({
  containerId: "body-editor",
  initialContent: initialBody ?? "",
  placeholder: "Describe this item…",
  onContentChange: (html: string) => {
    getEl<HTMLInputElement>("body-input").value = html;
  },
});
getEl<HTMLInputElement>("body-input").value = initialBody ?? "";

// ── Sale price preview ────────────────────────────────────────────────────
const priceInput = getEl<HTMLInputElement>("price");
const discountInput = getEl<HTMLInputElement>("promo-discount");
const salePricePreview = getEl<HTMLInputElement>("sale-price-preview");

const handlePricePreview = () =>
  updateSalePricePreview(priceInput, discountInput, salePricePreview);
priceInput.addEventListener("input", handlePricePreview);
discountInput.addEventListener("input", handlePricePreview);
handlePricePreview();

// ── Testimonials & Reviews ────────────────────────────────────────────────
bindTestimonialsSection(currentTestimonials);
renderTestimonials(currentTestimonials);

bindReviewsSection(currentReviews);
renderReviews(currentReviews);

// ── Form submission ───────────────────────────────────────────────────────
getEl<HTMLFormElement>("sales-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = getEl<HTMLInputElement>("title").value.trim();
  if (!title) {
    toast.show("Title is required.", "error");
    return;
  }

  const priceVal = getEl<HTMLInputElement>("price").value;
  const body: Record<string, unknown> = {
    title,
    slug: getEl<HTMLInputElement>("slug").value.trim() || undefined,
    status: getEl<HTMLSelectElement>("status").value,
    body: getEl<HTMLInputElement>("body-input").value,
    price: priceVal ? parseFloat(priceVal) : null,
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

    submitBtn.textContent = "Saving Changes…";

    const res = await fetch(`/api/admin/sales/${currentSlug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.show(data.error ?? "Failed to save.", "error");
      submitBtn.disabled = false;
      submitBtn.textContent = "Save Changes";
      return;
    }

    await Promise.all([
      ...currentTestimonials
        .filter((t) => !t.id && t.author_name && t.quote)
        .map((t) =>
          fetch(`/api/admin/sales/${currentSlug}/testimonials`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(t),
          }),
        ),
      ...currentReviews
        .filter((r) => !r.id && r.reviewer_name && r.review_text)
        .map((r) =>
          fetch(`/api/admin/sales/${currentSlug}/reviews`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(r),
          }),
        ),
    ]);

    toast.show("Saved!", "success");
    submitBtn.disabled = false;
    submitBtn.textContent = "Save Changes";
    const newSlug = body.slug ?? currentSlug;
    if (newSlug !== currentSlug) {
      window.location.href = `/admin/sales/${newSlug}`;
    }
  } catch {
    toast.show("Network error.", "error");
    submitBtn.disabled = false;
    submitBtn.textContent = "Save Changes";
  }
});
