import type { APIRoute } from "astro";
import { getSetting, getDonationConfig, setSetting } from "../../../lib/settings";

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
    const config = await getDonationConfig();
    return json({
      donation_placement,
      donation_link: config.link,
      donation_title: config.title,
      donation_text: config.text,
      donation_button_label: config.button,
    });
  } catch (error: unknown) {
    console.error("GET /api/admin/settings error:", error);
    return json({ error: "Internal server error" }, 500);
  }
};

const VALID_PLACEMENTS = new Set([
  "dashboard_sidebar",
  "user_dashboard",
  "article_index_top",
  "shop_index_top",
  "footer",
  "homepage_grid",
  "event_index_top",
]);

function isSafeHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export const PUT: APIRoute = async (context) => {
  const user = context.locals.user;
  if (!user || user.role !== "admin") {
    return json({ error: "Unauthorized" }, 401);
  }

  try {
    const data = await context.request.json();

    if (data.donation_placement !== undefined) {
      const list = String(data.donation_placement)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (list.some((p) => p !== "hidden" && !VALID_PLACEMENTS.has(p))) {
        return json({ error: "Invalid placement" }, 400);
      }
      const cleaned = list.filter((p) => p !== "hidden");
      await setSetting(
        "donation_placement",
        cleaned.length ? cleaned.join(",") : "hidden",
      );
    }

    if (data.donation_link !== undefined) {
      const link = String(data.donation_link).trim();
      if (link && !isSafeHttpsUrl(link)) {
        return json({ error: "Donation link must be a valid https URL" }, 400);
      }
      await setSetting("donation_link", link);
    }
    for (const key of [
      "donation_title",
      "donation_text",
      "donation_button_label",
    ]) {
      if (data[key] !== undefined) {
        await setSetting(key, String(data[key]).trim().slice(0, 300));
      }
    }

    return json({ success: true });
  } catch (error: unknown) {
    console.error("PUT /api/admin/settings error:", error);
    return json({ error: "Internal server error" }, 500);
  }
};
