import { escapeAttr, escapeHtml } from "../../lib/editor-utils";

export interface SalesTestimonial {
  id?: number;
  author_name: string;
  quote: string;
  rating: number | null;
}

export interface SalesReview {
  id?: number;
  reviewer_name: string;
  review_text: string;
  rating: number | null;
  is_verified: boolean;
  review_date: string;
}

export function getEl<T extends HTMLElement>(id: string): T {
  const el = document.querySelector<T>(`#${id}`);
  if (!el) throw new Error(`Element #${id} not found`);
  return el;
}

export function updateSalePricePreview(
  priceInput: HTMLInputElement,
  discountInput: HTMLInputElement,
  salePricePreview: HTMLInputElement,
): void {
  const price = parseFloat(priceInput.value);
  const pct = parseFloat(discountInput.value);
  if (isNaN(price) || isNaN(pct) || pct <= 0) {
    salePricePreview.value = "";
    return;
  }
  const saleVal = price * (1 - pct / 100);
  salePricePreview.value = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(saleVal);
}

export function renderTestimonials(
  testimonials: SalesTestimonial[],
  listEl: HTMLElement = getEl<HTMLElement>("testimonials-list"),
  jsonEl: HTMLInputElement = getEl<HTMLInputElement>("testimonials-json"),
): void {
  listEl.innerHTML = testimonials
    .map(
      (t: SalesTestimonial, i: number) => `
      <div class="sub-item" data-index="${i}">
        <input class="form-input" placeholder="Name" value="${escapeAttr(t.author_name || "")}" data-field="author_name" data-idx="${i}" />
        <textarea class="form-input" placeholder="Quote" rows="2" data-field="quote" data-idx="${i}">${escapeHtml(t.quote || "")}</textarea>
        <input class="form-input" type="number" min="1" max="5" placeholder="Rating (1-5)" value="${t.rating ?? ""}" data-field="rating" data-idx="${i}" />
        <button type="button" class="btn btn-ghost btn--sm js-remove-testimonial" data-idx="${i}">Remove</button>
      </div>`,
    )
    .join("");
  jsonEl.value = JSON.stringify(testimonials);
}

export function bindTestimonialsSection(
  testimonials: SalesTestimonial[],
): void {
  const testimonialsListEl = getEl<HTMLElement>("testimonials-list");
  const testimonialsJsonEl = getEl<HTMLInputElement>("testimonials-json");

  testimonialsListEl.addEventListener("input", (e) => {
    const el = e.target as HTMLInputElement | HTMLTextAreaElement;
    const idx = Number(el.dataset.idx);
    const field = el.dataset.field;
    if (!field || isNaN(idx) || !testimonials[idx]) return;
    if (field === "rating") {
      testimonials[idx].rating = el.value ? Number(el.value) : null;
    } else if (field === "author_name") {
      testimonials[idx].author_name = el.value;
    } else if (field === "quote") {
      testimonials[idx].quote = el.value;
    }
    testimonialsJsonEl.value = JSON.stringify(testimonials);
  });

  testimonialsListEl.addEventListener("click", (e) => {
    const btn = (e.target as Element).closest<HTMLButtonElement>(
      ".js-remove-testimonial",
    );
    if (!btn) return;
    testimonials.splice(Number(btn.dataset.idx), 1);
    renderTestimonials(testimonials, testimonialsListEl, testimonialsJsonEl);
  });

  getEl<HTMLButtonElement>("add-testimonial-btn").addEventListener(
    "click",
    () => {
      testimonials.push({ author_name: "", quote: "", rating: null });
      renderTestimonials(testimonials, testimonialsListEl, testimonialsJsonEl);
    },
  );
}

export function renderReviews(
  reviews: SalesReview[],
  listEl: HTMLElement = getEl<HTMLElement>("reviews-list"),
  jsonEl: HTMLInputElement = getEl<HTMLInputElement>("reviews-json"),
): void {
  listEl.innerHTML = reviews
    .map(
      (r: SalesReview, i: number) => `
      <div class="sub-item" data-index="${i}">
        <input class="form-input" placeholder="Reviewer Name" value="${escapeAttr(r.reviewer_name || "")}" data-field="reviewer_name" data-idx="${i}" />
        <textarea class="form-input" rows="2" placeholder="Review text" data-field="review_text" data-idx="${i}">${escapeHtml(r.review_text || "")}</textarea>
        <input class="form-input" type="number" min="1" max="5" placeholder="Rating (1-5)" value="${r.rating ?? ""}" data-field="rating" data-idx="${i}" />
        <label><input type="checkbox" data-field="is_verified" data-idx="${i}" ${r.is_verified ? "checked" : ""} /> Verified Buyer</label>
        <input class="form-input" type="date" placeholder="Review date" value="${r.review_date ?? ""}" data-field="review_date" data-idx="${i}" />
        <button type="button" class="btn btn-ghost btn--sm js-remove-review" data-idx="${i}">Remove</button>
      </div>`,
    )
    .join("");
  jsonEl.value = JSON.stringify(reviews);
}

export function bindReviewsSection(reviews: SalesReview[]): void {
  const reviewsListEl = getEl<HTMLElement>("reviews-list");
  const reviewsJsonEl = getEl<HTMLInputElement>("reviews-json");

  reviewsListEl.addEventListener("input", (e) => {
    const el = e.target as HTMLInputElement | HTMLTextAreaElement;
    const idx = Number(el.dataset.idx);
    const field = el.dataset.field;
    if (!field || isNaN(idx) || !reviews[idx]) return;
    if (field === "rating") {
      reviews[idx].rating = el.value ? Number(el.value) : null;
    } else if (field === "reviewer_name") {
      reviews[idx].reviewer_name = el.value;
    } else if (field === "review_text") {
      reviews[idx].review_text = el.value;
    } else if (field === "review_date") {
      reviews[idx].review_date = el.value;
    }
    reviewsJsonEl.value = JSON.stringify(reviews);
  });

  reviewsListEl.addEventListener("change", (e) => {
    const el = e.target as HTMLInputElement;
    const idx = Number(el.dataset.idx);
    const field = el.dataset.field;
    if (field === "is_verified" && !isNaN(idx) && reviews[idx]) {
      reviews[idx].is_verified = el.checked;
      reviewsJsonEl.value = JSON.stringify(reviews);
    }
  });

  reviewsListEl.addEventListener("click", (e) => {
    const btn = (e.target as Element).closest<HTMLButtonElement>(
      ".js-remove-review",
    );
    if (!btn) return;
    reviews.splice(Number(btn.dataset.idx), 1);
    renderReviews(reviews, reviewsListEl, reviewsJsonEl);
  });

  getEl<HTMLButtonElement>("add-review-btn").addEventListener("click", () => {
    reviews.push({
      reviewer_name: "",
      review_text: "",
      rating: null,
      is_verified: false,
      review_date: "",
    });
    renderReviews(reviews, reviewsListEl, reviewsJsonEl);
  });
}
