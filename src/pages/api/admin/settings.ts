import type { APIRoute } from "astro";
import { getSetting, setSetting } from "../../../lib/settings";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const GET: APIRoute = async (context) => {
  const user = context.locals.user;
  if (!user || user.role !== "admin") {
    return json({ error: "Unauthorized" }, 401);
  }

  try {
    const donation_placement =
      (await getSetting("donation_placement")) || "footer";
    return json({ donation_placement });
  } catch (error: unknown) {
    console.error("GET /api/admin/settings error:", error);
    return json({ error: "Internal server error" }, 500);
  }
};

export const PUT: APIRoute = async (context) => {
  const user = context.locals.user;
  if (!user || user.role !== "admin") {
    return json({ error: "Unauthorized" }, 401);
  }

  try {
    const data = await context.request.json();
    if (data.donation_placement) {
      await setSetting("donation_placement", data.donation_placement);
    }
    return json({ success: true });
  } catch (error: unknown) {
    console.error("PUT /api/admin/settings error:", error);
    return json({ error: "Internal server error" }, 500);
  }
};
