import type { APIRoute } from "astro";
import {
  ensurePanelSchema,
  getCurrentPanelAssignments,
  getRecentPanelMedia,
} from "../../../../lib/panels";

// --- Helper ---

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// --- GET /api/admin/panels ---
// Returns all 4 slot assignments and the recent image gallery (last 7 days).
// Auth: Bearer JWT required (enforced by middleware for all /api/admin/ paths).

export const GET: APIRoute = async () => {
  try {
    await ensurePanelSchema();

    const [assignments, gallery] = await Promise.all([
      getCurrentPanelAssignments(),
      getRecentPanelMedia(),
    ]);

    return json({ assignments, gallery }, 200);
  } catch (err) {
    console.error("[panels] GET failed:", err);
    return json({ error: "Database error" }, 500);
  }
};

export const POST: APIRoute = () => json({ error: "Method not allowed" }, 405);
