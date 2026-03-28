import type { APIRoute } from "astro";
import {
  UPLOAD_SESSION_TTL_SECONDS,
  createUploadSession,
  ensureUploadSessionSchema,
} from "../../../../lib/media";

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const POST: APIRoute = async ({ locals }) => {
  const user = locals.user!;

  try {
    await ensureUploadSessionSchema();
    const session = await createUploadSession(Number(user.id));

    return json(
      {
        upload_session_id: session.id,
        expires_at: session.expires_at,
        ttl_seconds: UPLOAD_SESSION_TTL_SECONDS,
      },
      201,
    );
  } catch {
    return json({ error: "Database error" }, 500);
  }
};
