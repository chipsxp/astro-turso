export type ToastType = "success" | "error";

const DEFAULT_DURATION_MS: Record<ToastType, number> = {
  success: 3500,
  error: 8000,
};

let timer: number | undefined;
let remainingMs = 0;
let timerStartedAt = 0;

function clearTimer(): void {
  if (timer !== undefined) {
    window.clearTimeout(timer);
    timer = undefined;
  }
}

function hideStack(stack: HTMLDivElement): void {
  clearTimer();
  stack.classList.remove("is-visible");
  // Removing the toast also removes its dismiss button, so no hidden focusable
  // controls are left behind for keyboard users.
  stack.replaceChildren();
}

function pauseTimer(): void {
  if (timer === undefined) return;
  window.clearTimeout(timer);
  timer = undefined;
  remainingMs = Math.max(0, remainingMs - (Date.now() - timerStartedAt));
}

function resumeTimer(stack: HTMLDivElement): void {
  if (timer !== undefined || !stack.classList.contains("is-visible")) return;
  timerStartedAt = Date.now();
  timer = window.setTimeout(() => {
    timer = undefined;
    hideStack(stack);
  }, remainingMs);
}

function startTimer(stack: HTMLDivElement, durationMs: number): void {
  clearTimer();
  remainingMs = durationMs;
  resumeTimer(stack);
}

function ensureStack(): HTMLDivElement {
  let stack = document.getElementById("toast-stack") as HTMLDivElement | null;
  if (!stack) {
    stack = document.createElement("div");
    stack.id = "toast-stack";
    stack.className = "toast-stack";
    stack.setAttribute("role", "status");
    stack.setAttribute("aria-live", "polite");
    // Hovering or keyboard-focusing the toast pauses auto-dismiss so users
    // have enough time to read it (WCAG 2.2.1 timing adjustable).
    const liveStack = stack;
    liveStack.addEventListener("mouseenter", pauseTimer);
    liveStack.addEventListener("mouseleave", () => resumeTimer(liveStack));
    liveStack.addEventListener("focusin", pauseTimer);
    liveStack.addEventListener("focusout", () => resumeTimer(liveStack));
    document.body.appendChild(stack);
  }
  return stack;
}

// Styles live in src/styles/layouts/admin-layout.css (.toast-stack, .toast).
export function showToast(
  message: string,
  type: ToastType = "success",
  durationMs = DEFAULT_DURATION_MS[type],
): void {
  const stack = ensureStack();
  const el = document.createElement("div");
  el.className = `toast toast--${type}`;

  const text = document.createElement("span");
  text.className = "toast__message";
  text.textContent = message;

  const dismiss = document.createElement("button");
  dismiss.type = "button";
  dismiss.className = "toast__dismiss";
  dismiss.setAttribute("aria-label", "Dismiss notification");
  dismiss.textContent = "×";
  dismiss.addEventListener("click", () => hideStack(stack));

  el.append(text, dismiss);
  stack.replaceChildren(el);
  stack.classList.add("is-visible");
  startTimer(stack, durationMs);
}
