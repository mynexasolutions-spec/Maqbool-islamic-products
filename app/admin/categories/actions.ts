"use server";

import { revalidatePath } from "next/cache";
import { AdminAuthorizationError, requireAdmin } from "@/lib/admin-authorization";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  AdminCatalogCategory,
  CatalogActionResult,
  CategoryInput,
} from "@/components/admin/catalog-types";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function errorMessage(error: unknown) {
  if (error instanceof AdminAuthorizationError) return "Your admin session has expired.";
  return error instanceof Error ? error.message : "The category operation failed.";
}

function validate(input: CategoryInput) {
  const name = input.name.trim();
  const slug = input.slug.trim().toLowerCase();
  if (!name) throw new Error("Enter a category name.");
  if (!SLUG_PATTERN.test(slug)) throw new Error("Use a lowercase, hyphenated category slug.");
  if (!Number.isInteger(input.displayOrder) || input.displayOrder < 0) {
    throw new Error("Display order must be a non-negative whole number.");
  }
  return { name, slug, description: input.description.trim() };
}

function revalidateCatalog() {
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

export async function getAdminCategories(): Promise<AdminCatalogCategory[]> {
  await requireAdmin();
  const supabase = createAdminClient();
  const [{ data, error }, { data: products, error: productError }] = await Promise.all([
    supabase.from("categories").select("*").order("display_order", { ascending: true }).order("name", { ascending: true }),
    supabase.from("products").select("*"),
  ]);
  if (error) throw new Error(`Unable to load categories: ${error.message}`);
  if (productError) throw new Error(`Unable to load category counts: ${productError.message}`);

  return (data ?? []).map((item) => ({
    id: item.id,
    name: item.name,
    slug: item.slug,
    description: item.description ?? "",
    isActive: item.is_active,
    displayOrder: item.display_order,
    productCount: (products ?? []).filter((product) => product.category_id === item.id).length,
  }));
}

export async function saveCategory(input: CategoryInput): Promise<CatalogActionResult> {
  try {
    await requireAdmin();
    const values = validate(input);
    const supabase = createAdminClient();
    const payload = {
      ...values,
      is_active: Boolean(input.isActive),
      display_order: input.displayOrder,
    };
    const operation = UUID_PATTERN.test(input.id)
      ? supabase.from("categories").update(payload).eq("id", input.id).select("id").single()
      : supabase.from("categories").insert(payload).select("id").single();
    const { error } = await operation;
    if (error) throw new Error(error.code === "23505" ? "That category slug is already in use." : error.message);
    revalidateCatalog();
    return { ok: true, message: `${values.name} was saved.` };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function deleteCategory(id: string): Promise<CatalogActionResult> {
  try {
    await requireAdmin();
    if (!UUID_PATTERN.test(id)) throw new Error("Invalid category identifier.");
    const supabase = createAdminClient();
    const { count, error: countError } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("category_id", id);
    if (countError) throw new Error(countError.message);
    if (count) throw new Error("Move or delete this category’s products first.");
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw new Error(error.message);
    revalidateCatalog();
    return { ok: true, message: "Category deleted." };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}
