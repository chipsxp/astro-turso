export type ToastType = "success" | "error";

let timer: number | undefined;

function ensureStack(): HTMLDivElement {
  let stack = document.getElementById("toast-stack") as HTMLDivElement | null;
  if (!stack) {
    stack = document.createElement("div");
    stack.id = "toast-stack";
    stack.className = "toast-stack";
    stack.setAttribute("role", "status");
    stack.setAttribute("aria-live", "polite");
    document.body.appendChild(stack);
  }
  return stack;
}

// Styles live in src/styles/layouts/admin-layout.css (.toast-stack, .toast).
export function showToast(
  message: string,
  type: ToastType = "success",
  durationMs = 3500,
): void {
  const stack = ensureStack();
  const el = document.createElement("div");
  el.className = `toast toast--${type}`;
  el.textContent = message;
  stack.replaceChildren(el);
  stack.classList.add("is-visible");

  if (timer) window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    stack.classList.remove("is-visible");
  }, durationMs);
}
