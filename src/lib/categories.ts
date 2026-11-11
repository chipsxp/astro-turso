import { db } from "./db";

export interface CategoryRecord {
  id: number;
  name: string;
  slug: string;
}

export class CategoryInputError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function toSlug(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function mapCategoryRow(row: Record<string, unknown>): CategoryRecord {
  return {
    id: Number(row.id),
    name: String(row.name),
    slug: String(row.slug),
  };
}

let categoriesCache: { data: CategoryRecord[]; expiresAt: number } | null = null;

export function invalidateCategoriesCache(): void {
  categoriesCache = null;
}

export async function listCategories(): Promise<CategoryRecord[]> {
  const now = Date.now();
  if (categoriesCache && now < categoriesCache.expiresAt) {
    return categoriesCache.data;
  }

  const result = await db.execute(
    "SELECT id, name, slug FROM categories ORDER BY name ASC",
  );

  const data = result.rows.map((row: Record<string, unknown>) => mapCategoryRow(row));
  categoriesCache = { data, expiresAt: now + 60_000 };
  return data;
}

async function findCategoryById(
  id: number,
): Promise<CategoryRecord | null> {

  const result = await db.execute(
    "SELECT id, name, slug FROM categories WHERE id = ?",
    [id],
  );

  const row = result.rows[0] as Record<string, unknown> | undefined;
  return row ? mapCategoryRow(row) : null;
}

async function findCategoryByNameOrSlug(
  value: string,
): Promise<CategoryRecord | null> {

  const normalized = value.trim();
  if (!normalized) return null;

  const slug = toSlug(normalized);

  const result = await db.execute(
    "SELECT id, name, slug FROM categories WHERE slug = ? OR name = ? LIMIT 1",
    [slug, normalized],
  );

  const row = result.rows[0] as Record<string, unknown> | undefined;
  return row ? mapCategoryRow(row) : null;
}

async function createCategory(name: string): Promise<CategoryRecord> {

  const normalizedName = name.trim();
  if (!normalizedName) {
    throw new CategoryInputError("category name cannot be empty", 400);
  }

  const slug = toSlug(normalizedName);
  if (!slug) {
    throw new CategoryInputError("Invalid category name", 400);
  }

  await db.execute(
    "INSERT OR IGNORE INTO categories (name, slug) VALUES (?, ?)",
    [normalizedName, slug],
  );

  const existing = await findCategoryByNameOrSlug(normalizedName);
  if (!existing) {
    throw new CategoryInputError("Unable to resolve category", 500);
  }

  invalidateCategoriesCache();
  return existing;
}

export async function resolveCategoryId(
  data: Record<string, unknown>,
  isAdmin: boolean,
): Promise<number | null | undefined> {
  const hasCategoryField =
    Object.prototype.hasOwnProperty.call(data, "category_id") ||
    Object.prototype.hasOwnProperty.call(data, "category_name") ||
    Object.prototype.hasOwnProperty.call(data, "category");

  if (!hasCategoryField) return undefined;

  const rawCategoryId = data.category_id;
  if (rawCategoryId === null || rawCategoryId === "") return null;

  if (rawCategoryId !== undefined) {
    const id = Number(rawCategoryId);
    if (!Number.isFinite(id) || id <= 0) {
      throw new CategoryInputError("Invalid category_id", 400);
    }

    const byId = await findCategoryById(id);
    if (!byId) {
      throw new CategoryInputError("Category not found", 400);
    }

    return byId.id;
  }

  const rawCategoryName = data.category_name ?? data.category;
  if (rawCategoryName === null || rawCategoryName === "") return null;

  const categoryName = String(rawCategoryName).trim();
  if (!categoryName) return null;

  const existing = await findCategoryByNameOrSlug(categoryName);
  if (existing) return existing.id;

  if (!isAdmin) {
    throw new CategoryInputError("Only admins can create new categories", 403);
  }

  const created = await createCategory(categoryName);
  return created.id;
}
