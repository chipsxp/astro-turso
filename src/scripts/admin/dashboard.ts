import { showToast as sharedShowToast } from "../../lib/admin-toast";

type Article = {
  id: number;
  title: string;
  slug: string;
  status: "published" | "draft";
  author_email: string | null;
  created_at: string;
  tags: string[];
};

let allArticles: Article[] = [];
let currentFilter = "all";
let armedDeleteSlug: string | null = null;
let armedDeleteBtn: HTMLButtonElement | null = null;
let armedDeleteTimer: number | null = null;

const stateLoading = document.getElementById("state-loading")!;
const stateError = document.getElementById("state-error")!;
const stateEmpty = document.getElementById("state-empty")!;
const stateTable = document.getElementById("state-table")!;
const tbody = document.getElementById("articles-tbody")!;
const cleanupUploadsBtn = document.getElementById(
  "cleanup-uploads-btn",
) as HTMLButtonElement;

function showToast(message: string, type: "success" | "error") {
  sharedShowToast(message, type);
}

function clearArmedDelete() {
  if (armedDeleteBtn) armedDeleteBtn.textContent = "Delete";
  armedDeleteBtn = null;
  armedDeleteSlug = null;
  if (armedDeleteTimer) {
    window.clearTimeout(armedDeleteTimer);
    armedDeleteTimer = null;
  }
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso.split("T")[0] ?? iso;
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderRows(articles: Article[]) {
  if (articles.length === 0) {
    stateTable.style.display = "none";
    stateEmpty.style.display = "block";
    return;
  }
  stateEmpty.style.display = "none";
  stateTable.style.display = "block";

  tbody.innerHTML = articles
    .map((a) => {
      const tags = (a.tags ?? [])
        .map(
          (t: string) =>
            `<span class="badge badge--draft dashboard-tag-badge">${escapeHtml(t)}</span>`,
        )
        .join("");

      return `
        <tr>
          <td>
            <a href="/admin/articles/${escapeHtml(a.slug)}" class="dashboard-article-link">
              ${escapeHtml(a.title)}
            </a>
            <div class="dashboard-article-slug">${escapeHtml(a.slug)}</div>
          </td>
          <td>
            <span
              class="badge badge--${a.status}"
              title="${a.status === "published" ? "Published" : "Draft"}"
              aria-label="${a.status === "published" ? "Published" : "Draft"}"
            >${a.status === "published" ? "P" : "D"}</span>
          </td>
          <td class="dashboard-author-cell">${escapeHtml(a.author_email ?? "—")}</td>
          <td class="dashboard-date-cell">${formatDate(a.created_at)}</td>
          <td>${tags || '<span class="dashboard-empty-tags">—</span>'}</td>
          <td class="table-actions-col">
            <div class="dashboard-actions-wrap">
              <a href="/blog/${escapeHtml(a.slug)}" target="_blank" class="btn btn-ghost dashboard-action-btn">View</a>
              <a href="/admin/articles/${escapeHtml(a.slug)}" class="btn btn-ghost dashboard-action-btn">Edit</a>
              <button
                class="btn btn-danger delete-btn dashboard-action-btn"
                data-slug="${escapeHtml(a.slug)}"
                data-title="${escapeHtml(a.title)}"
              >Delete</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");

  tbody.querySelectorAll<HTMLButtonElement>(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const slug = btn.dataset.slug ?? "";
      const title = btn.dataset.title ?? slug;
      handleDelete(slug, title, btn);
    });
  });
}

function applyFilter() {
  const filtered =
    currentFilter === "all"
      ? allArticles
      : allArticles.filter((a) => a.status === currentFilter);
  renderRows(filtered);
}

async function loadArticles() {
  stateLoading.style.display = "block";
  stateError.style.display = "none";
  stateTable.style.display = "none";
  stateEmpty.style.display = "none";

  try {
    const res = await fetch("/api/admin/articles");

    if (res.status === 401) {
      window.location.href = "/admin";
      return;
    }

    if (!res.ok) {
      throw new Error(`Server error ${res.status}`);
    }

    const data = await res.json();
    allArticles = data.articles ?? [];
    stateLoading.style.display = "none";
    applyFilter();
  } catch (err) {
    stateLoading.style.display = "none";
    stateError.style.display = "block";
    stateError.textContent =
      err instanceof Error ? err.message : "Failed to load articles.";
  }
}

async function handleDelete(
  slug: string,
  title: string,
  button: HTMLButtonElement,
) {
  if (armedDeleteSlug !== slug) {
    clearArmedDelete();
    armedDeleteSlug = slug;
    armedDeleteBtn = button;
    button.textContent = "Confirm";
    showToast(`Click Confirm to delete "${title}".`, "error");
    armedDeleteTimer = window.setTimeout(() => {
      clearArmedDelete();
    }, 3500);
    return;
  }

  clearArmedDelete();

  try {
    const res = await fetch(`/api/articles/${slug}`, {
      method: "DELETE",
    });

    if (res.status === 401) {
      window.location.href = "/admin";
      return;
    }

    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      showToast(d.error ?? "Delete failed.", "error");
      return;
    }

    allArticles = allArticles.filter((a) => a.slug !== slug);
    applyFilter();
    showToast("Article deleted successfully.", "success");
  } catch {
    showToast("Network error. Could not delete article.", "error");
  }
}

async function runUploadCleanup() {
  showToast(
    "Cleanup targets all unsaved draft uploads across users.",
    "error",
  );

  cleanupUploadsBtn.disabled = true;
  cleanupUploadsBtn.textContent = "Cleaning…";

  try {
    const res = await fetch("/api/admin/uploads/cleanup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ scope: "all_unconsumed" }),
    });

    if (res.status === 401) {
      window.location.href = "/admin";
      return;
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      showToast(data.error ?? "Cleanup failed.", "error");
      return;
    }

    showToast(
      `Cleanup done: ${Number(data.sessions_deleted ?? 0)} sessions, ${Number(data.media_deleted ?? 0)} media removed${Number(data.cdn_delete_failures ?? 0) ? `, ${Number(data.cdn_delete_failures)} CDN failures` : ""}.`,
      Number(data.cdn_delete_failures ?? 0) > 0 ? "error" : "success",
    );
  } catch {
    showToast("Network error during cleanup.", "error");
  } finally {
    cleanupUploadsBtn.disabled = false;
    cleanupUploadsBtn.textContent = "Cleanup Uploads";
  }
}

document.querySelectorAll<HTMLButtonElement>(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".filter-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter ?? "all";
    applyFilter();
  });
});

cleanupUploadsBtn.addEventListener("click", runUploadCleanup);

loadArticles();
