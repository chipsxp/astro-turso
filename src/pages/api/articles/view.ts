import type { APIRoute } from "astro";
import { db } from "../../../lib/db";

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const id = data.id;

    if (!id || typeof id !== "number") {
      return new Response(JSON.stringify({ error: "Invalid article ID" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    await db.execute("UPDATE articles SET views = views + 1 WHERE id = ?", [
      id,
    ]);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating article views:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
