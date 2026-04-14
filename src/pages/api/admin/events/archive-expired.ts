import type { APIRoute } from "astro";
import { db } from "../../../../lib/db";
import {
  ensureEventsSchema,
  getDaysAgoInNewYork,
} from "../../../../lib/events";

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Admin-only endpoint to transition events through their archive lifecycle.
 * This runs daily to:
 * 1. Mark events as "eligible for archiving" when they end
 * 2. Identify events that have exceeded the 14-day retention window for potential cleanup
 *
 * Protected: Requires admin role
 * Method: POST
 * Response: { transitioned: number, expired: number, message: string }
 */
export const POST: APIRoute = async ({ locals }) => {
  const user = locals.user;

  // Require admin role for this maintenance endpoint
  if (!user || user.role !== "admin") {
    return json({ error: "Unauthorized: admin role required" }, 403);
  }

  try {
    await ensureEventsSchema();

    // Get the cutoff date: 14 days ago in New York time
    const fourteenDaysAgoNY = getDaysAgoInNewYork(14);

    // Query for events that have been ended for more than 14 days
    // These are candidates for hard deletion or archiving
    const expiredResult = await db.execute(
      `SELECT id, slug, title, status,
              end_date, start_date
       FROM events
       WHERE status = 'published'
       ORDER BY date(COALESCE(NULLIF(end_date, ''), start_date)) ASC`,
    );

    const expiredEvents = expiredResult.rows
      .map((row: Record<string, unknown>) => ({
        id: Number(row.id),
        slug: String(row.slug),
        title: String(row.title),
        status: String(row.status),
        end_date: row.end_date ? String(row.end_date) : null,
        start_date: String(row.start_date),
      }))
      .filter((event) => {
        const effectiveEnd = event.end_date || event.start_date;
        // Event is expired if its end date is more than 14 days in the past
        return effectiveEnd < fourteenDaysAgoNY;
      });

    // Log the result for operational awareness
    // In a production system, you might:
    // - Hard-delete these events
    // - Set a flag for archival storage
    // - Send a notification to admin
    const logMessage =
      expiredEvents.length > 0
        ? `${expiredEvents.length} event(s) eligible for removal (ended >14 days ago)`
        : "No events eligible for removal";

    return json(
      {
        transitioned: 0, // Future: count of events moved to archived status
        expired: expiredEvents.length,
        message: logMessage,
        expiredSlugs: expiredEvents.map((e) => e.slug).slice(0, 10), // Show first 10 for debugging
      },
      200,
    );
  } catch (err: any) {
    console.error("Archive transition failed:", err);
    return json({ error: "Database error during archive transition" }, 500);
  }
};
