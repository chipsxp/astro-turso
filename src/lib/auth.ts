export interface UserRecord {
  id: number | string;
  email: string;
  password_hash: string;
  role: "admin" | "author";
  status: "active" | "pending" | "suspended";
}

// ── Shared auth cookie helpers ────────────────────────────────────────────────
//
// Both login.ts (Set-Cookie) and logout.ts (clear-Cookie) use the same cookie
// spec. Define it once here to keep them in sync.

const COOKIE_OPTS = "HttpOnly; Secure; SameSite=Strict; Path=/";
const MAX_AGE_SESSION = 86400; // 24 h

export function setAuthCookie(token: string): string {
  return `auth_token=${token}; ${COOKIE_OPTS}; Max-Age=${MAX_AGE_SESSION}`;
}

export function clearAuthCookie(): string {
  return `auth_token=; ${COOKIE_OPTS}; Max-Age=0`;
}

// ── Route-handler auth guards (D2) ────────────────────────────────────────────
//
// Minimal helpers for API routes whose 401/403 checks live in the handler
// because middleware enforcement does not cover them (public routes with
// protected methods). Routes the middleware fully guards keep using
// `locals.user!` directly. Both helpers return the locals user shape or null.

type LocalsUser = { id: string; role: string };

/** Returns locals.user, or null when the request is unauthenticated. */
export function requireUser(locals: App.Locals): LocalsUser | null {
  return locals.user ?? null;
}

/** Returns locals.user only when the role is "admin", otherwise null. */
export function requireAdmin(locals: App.Locals): LocalsUser | null {
  const user = locals.user;
  if (!user || user.role !== "admin") return null;
  return user;
}
