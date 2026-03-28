import type { APIRoute } from "astro";
import { cloudinary } from "../../../../lib/cloudinary-server";
import {
  deleteUploadSession,
  ensureUploadSessionSchema,
  listExpiredUnconsumedUploadSessions,
  listUnconsumedUploadSessions,
  listUploadSessionMedia,
} from "../../../../lib/media";

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user!;

  if (user.role !== "admin") {
    return json({ error: "Forbidden" }, 403);
  }

  let cleanupScope: "expired" | "all_unconsumed" = "expired";

  try {
    const payload = await request.json();
    if (
      payload &&
      typeof payload === "object" &&
      (payload as Record<string, unknown>).scope === "all_unconsumed"
    ) {
      cleanupScope = "all_unconsumed";
    }
  } catch {
    // Keep default cleanup scope when no/invalid JSON body is provided.
  }

  try {
    await ensureUploadSessionSchema();
    const expiredSessions =
      cleanupScope === "all_unconsumed"
        ? await listUnconsumedUploadSessions()
        : await listExpiredUnconsumedUploadSessions();

    let sessionsDeleted = 0;
    let mediaDeleted = 0;
    let cdnDeleteFailures = 0;

    for (const session of expiredSessions) {
      const stagedMedia = await listUploadSessionMedia(session.id);
      let sessionHasDeleteFailure = false;

      for (const media of stagedMedia) {
        if (media.public_id) {
          try {
            const destroyResult = await cloudinary.uploader.destroy(
              media.public_id,
              {
                resource_type: media.resource_type,
                invalidate: true,
              },
            );

            const result = String(destroyResult?.result ?? "").toLowerCase();
            if (
              result &&
              result !== "ok" &&
              result !== "not found" &&
              result !== "not_found"
            ) {
              cdnDeleteFailures += 1;
              sessionHasDeleteFailure = true;
              continue;
            }
          } catch {
            cdnDeleteFailures += 1;
            sessionHasDeleteFailure = true;
            continue;
          }
        }

        mediaDeleted += 1;
      }

      if (sessionHasDeleteFailure) {
        continue;
      }

      await deleteUploadSession(session.id);
      sessionsDeleted += 1;
    }

    return json(
      {
        scope: cleanupScope,
        sessions_deleted: sessionsDeleted,
        media_deleted: mediaDeleted,
        cdn_delete_failures: cdnDeleteFailures,
      },
      200,
    );
  } catch {
    return json({ error: "Database error" }, 500);
  }
};
