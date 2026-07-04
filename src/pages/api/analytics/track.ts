import type { APIRoute } from "astro";
import { logAnalyticsEvent } from "../../../lib/monetization";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const rawBody = await request.text();
    if (!rawBody) return json({ ok: false, error: "Empty body" }, 400);

    const payload = JSON.parse(rawBody);

    const { event_type, target_type, target_id, page_path } = payload;

    if (!event_type || !target_type || !page_path) {
      return json({ ok: false, error: "Missing required fields" }, 400);
    }

    // Extract user ID from Locals if they are logged in
    const userId = locals?.user?.id ? Number(locals.user.id) : null;

    // Log the event asynchronously (don't wait/block the client response strictly if we don't have to,
    // but in serverless we should await it to ensure it completes).
    await logAnalyticsEvent(
      event_type,
      target_type,
      target_id ? Number(target_id) : null,
      page_path,
      userId,
    );

    return json({ ok: true }, 201);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    console.error("Failed to process analytics track:", errorMsg);
    // Return 200 anyway so beacon doesn't fail loudly on client side
    return json({ ok: false, error: errorMsg }, 200);
  }
};
