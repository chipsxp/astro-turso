import type { APIRoute } from "astro";
import { listCategories } from "../../../lib/categories";

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const GET: APIRoute = async () => {
  try {
    const categories = await listCategories();
    return json({ categories }, 200);
  } catch {
    return json({ error: "Database error" }, 500);
  }
};
