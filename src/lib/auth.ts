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
