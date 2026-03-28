import type { APIRoute } from "astro";
import { db } from "../../lib/db";

const VALID_PLATFORMS = new Set([
  "facebook",
  "x",
  "linkedin",
  "reddit",
  "pinterest",
  "whatsapp",
  "threads",
  "bluesky",
  "instagram",
  "medium",
]);

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// POST /api/share — log a social share event
// Requires: Bearer JWT (handled by middleware; locals.user is guaranteed present)
// Body: { article_id: number, platform: string }

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user!;
  let data: Record<string, unknown>;

  try {
    data = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const articleId = Number(data.article_id);
  const platform = typeof data.platform === "string" ? data.platform.trim() : "";

  if (!Number.isInteger(articleId) || articleId < 1) {
    return json({ error: "article_id must be a positive integer" }, 400);
  }

  if (!VALID_PLATFORMS.has(platform)) {
    return json({ error: `platform must be one of: ${[...VALID_PLATFORMS].join(", ")}` }, 400);
  }

  try {
    await db.execute(
      `INSERT INTO shares (article_id, user_id, platform) VALUES (?, ?, ?)`,
      [articleId, Number(user.id), platform],
    );
    return json({ ok: true }, 201);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    // FOREIGN KEY failure means article_id doesn't exist
    if (msg.includes("FOREIGN KEY")) {
      return json({ error: "article_id not found" }, 404);
    }
    console.error("[POST /api/share]", msg);
    return json({ error: "Database error" }, 500);
  }
};
