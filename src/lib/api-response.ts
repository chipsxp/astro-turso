// Shared JSON response helper for API routes.
//
// Replaces the per-route `function json()` definitions (both signature
// variants: `status: number` required and `status = 200` optional).
// Routes that need extra headers (e.g. Set-Cookie on login) still build
// their own Response.

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
