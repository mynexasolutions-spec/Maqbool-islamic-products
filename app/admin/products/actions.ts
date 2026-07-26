"use server";

import { revalidatePath } from "next/cache";
import { deleteProductAssets } from "@/app/admin/media/actions";
import { AdminAuthorizationError, requireAdmin } from "@/lib/admin-authorization";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  AdminCatalogProduct,
  CatalogActionResult,
  ProductInput,
} from "@/components/admin/catalog-types";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function errorMessage(error: unknown) {
  if (error instanceof AdminAuthorizationError) return "Your admin session has expired.";
  return error instanceof Error ? error.message : "The product operation failed.";
}

function money(value: number, label: string) {
  if (!Number.isFinite(value) || value < 0) throw new Error(`${label} must be zero or greater.`);
  return value;
}

function wholeNumber(value: number, label: string) {
  if (!Number.isInteger(value) || value < 0) throw new Error(`${label} must be a non-negative whole number.`);
  return value;
}

function validate(input: ProductInput) {
  const name = input.name.trim();
  const slug = input.slug.trim().toLowerCase();
  if (!name) throw new Error("Enter a product name.");
  if (!SLUG_PATTERN.test(slug)) throw new Error("Use a lowercase, hyphenated product slug.");
  if (!UUID_PATTERN.test(input.categoryId)) throw new Error("Choose a category.");
  money(input.price, "Base price");
  if (input.compareAtPrice !== null) {
    money(input.compareAtPrice, "Compare-at price");
    if (input.compareAtPrice < input.price) {
      throw new Error("Compare-at price must be at least the base price.");
    }
  }
  if (!Number.isFinite(input.rating) || input.rating < 0 || input.rating > 5) {
    throw new Error("Rating must be between zero and five.");
  }
  wholeNumber(input.reviewCount, "Review count");
  wholeNumber(input.displayOrder, "Product display order");
  input.variants.forEach((item, index) => {
    if (!item.sku.trim() || !item.name.trim() || !item.value.trim()) {
      throw new Error(`Complete variant ${index + 1}, including its unique SKU.`);
    }
    money(item.price, `Variant ${index + 1} price`);
    if (item.compareAtPrice !== null) {
      money(item.compareAtPrice, `Variant ${index + 1} compare-at price`);
      if (item.compareAtPrice < item.price) {
        throw new Error(`Variant ${index + 1} compare-at price must be at least its price.`);
      }
    }
    wholeNumber(item.stock, `Variant ${index + 1} stock`);
  });
  input.information.forEach((item, index) => {
    if (!item.label.trim() || !item.value.trim()) throw new Error(`Complete information row ${index + 1}.`);
  });
  input.faqs.forEach((item, index) => {
    if (!item.question.trim() || !item.answer.trim()) throw new Error(`Complete FAQ ${index + 1}.`);
  });
  const unique = (values: string[]) => new Set(values.map((value) => value.trim().toLowerCase())).size === values.length;
  if (!unique(input.variants.map((item) => item.sku))) throw new Error("Variant SKUs must be unique.");
  if (!unique(input.information.map((item) => item.label))) throw new Error("Product information labels must be unique.");
  if (!unique(input.faqs.map((item) => item.question))) throw new Error("FAQ questions must be unique.");
  return { name, slug };
}

function revalidateProduct(slug?: string) {
  revalidatePath("/admin/products");
  revalidatePath("/admin/categories");
  revalidatePath("/shop");
  revalidatePath("/");
  if (slug) revalidatePath(`/shop/${slug}`);
}

export async function getAdminProducts(): Promise<AdminCatalogProduct[]> {
  await requireAdmin();
  const supabase = createAdminClient();
  const [productResult, categoryResult, variantResult, informationResult, faqResult, imageResult] =
    await Promise.all([
      supabase.from("products").select("*").order("display_order", { ascending: true }).order("name", { ascending: true }),
      supabase.from("categories").select("*"),
      supabase.from("product_variants").select("*").order("display_order", { ascending: true }),
      supabase.from("product_information").select("*").order("display_order", { ascending: true }),
      supabase.from("product_faqs").select("*").order("display_order", { ascending: true }),
      supabase.from("product_images").select("*").order("display_order", { ascending: true }),
    ]);
  const failure = [productResult, categoryResult, variantResult, informationResult, faqResult, imageResult]
    .find((result) => result.error)?.error;
  if (failure) throw new Error(`Unable to load products: ${failure.message}`);

  return (productResult.data ?? []).map((item) => ({
    id: item.id,
    categoryId: item.category_id,
    categoryName: categoryResult.data?.find((category) => category.id === item.category_id)?.name ?? "",
    name: item.name,
    slug: item.slug,
    description: item.description ?? "",
    price: Number(item.price),
    compareAtPrice: item.compare_at_price === null ? null : Number(item.compare_at_price),
    rating: Number(item.rating),
    reviewCount: item.review_count,
    badge: item.badge ?? "",
    isFeatured: item.is_featured,
    isActive: item.is_active,
    displayOrder: item.display_order,
    seoTitle: item.seo_title ?? "",
    seoDescription: item.seo_description ?? "",
    variants: (variantResult.data ?? []).filter((variant) => variant.product_id === item.id).map((variant) => ({
      id: variant.id,
      sku: variant.sku ?? "",
      name: variant.name,
      value: variant.value,
      price: Number(variant.price),
      compareAtPrice: variant.compare_at_price === null ? null : Number(variant.compare_at_price),
      stock: variant.stock,
      color: variant.color ?? "",
      imageUrl: variant.image_url ?? "",
      isActive: variant.is_active,
      displayOrder: variant.display_order,
    })),
    information: (informationResult.data ?? []).filter((row) => row.product_id === item.id).map((row) => ({
      id: row.id,
      label: row.label,
      value: row.value,
      displayOrder: row.display_order,
    })),
    faqs: (faqResult.data ?? []).filter((faq) => faq.product_id === item.id).map((faq) => ({
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
      isActive: faq.is_active,
      displayOrder: faq.display_order,
    })),
    images: (imageResult.data ?? []).filter((image) => image.product_id === item.id).map((image) => ({
      id: image.id,
      secureUrl: image.secure_url,
      altText: image.alt_text ?? "",
      isFeatured: image.is_featured,
      isActive: image.is_active,
      displayOrder: image.display_order,
      colorVariantId: image.color_variant_id,
    })),
  }));
}

async function replaceChildren(
  supabase: ReturnType<typeof createAdminClient>,
  productId: string,
  input: ProductInput,
) {
  const [variantsResult, informationResult, faqsResult] = await Promise.all([
    supabase.from("product_variants").select("*").eq("product_id", productId),
    supabase.from("product_information").select("*").eq("product_id", productId),
    supabase.from("product_faqs").select("*").eq("product_id", productId),
  ]);
  const loadFailure = [variantsResult, informationResult, faqsResult].find((result) => result.error)?.error;
  if (loadFailure) throw new Error(`Unable to inspect existing product content: ${loadFailure.message}`);

  const existingVariantIds = new Set((variantsResult.data ?? []).map((item) => item.id));
  const existingInformationIds = new Set((informationResult.data ?? []).map((item) => item.id));
  const existingFaqIds = new Set((faqsResult.data ?? []).map((item) => item.id));
  const retainedVariantIds = new Set(input.variants.flatMap((item) => item.id && existingVariantIds.has(item.id) ? [item.id] : []));
  const retainedInformationIds = new Set(input.information.flatMap((item) => item.id && existingInformationIds.has(item.id) ? [item.id] : []));
  const retainedFaqIds = new Set(input.faqs.flatMap((item) => item.id && existingFaqIds.has(item.id) ? [item.id] : []));
  const { data: indiaMarket, error: indiaMarketError } = await supabase.from("markets").select("id").eq("code", "IN").single();
  if (indiaMarketError) throw new Error(`Unable to load the India market: ${indiaMarketError.message}`);

  const removals = [
    {
      table: "product_variants" as const,
      ids: [...existingVariantIds].filter((id) => !retainedVariantIds.has(id)),
    },
    {
      table: "product_information" as const,
      ids: [...existingInformationIds].filter((id) => !retainedInformationIds.has(id)),
    },
    {
      table: "product_faqs" as const,
      ids: [...existingFaqIds].filter((id) => !retainedFaqIds.has(id)),
    },
  ];
  for (const removal of removals) {
    if (!removal.ids.length) continue;
    const { error } = await supabase
      .from(removal.table)
      .delete()
      .eq("product_id", productId)
      .in("id", removal.ids);
    if (error) throw new Error(`Unable to remove old product content: ${error.message}`);
  }

  for (const [index, item] of input.variants.entries()) {
    const payload = {
      product_id: productId,
      sku: item.sku.trim(),
      name: item.name.trim(),
      value: item.value.trim(),
      price: item.price,
      compare_at_price: item.compareAtPrice,
      stock: item.stock,
      color: item.color.trim() || null,
      image_url: item.imageUrl.trim() || null,
      is_active: item.isActive,
      display_order: index,
    };
    const operation = item.id && existingVariantIds.has(item.id)
      ? supabase.from("product_variants").update(payload).eq("product_id", productId).eq("id", item.id).select("id").single()
      : supabase.from("product_variants").insert(payload).select("id").single();
    const { data: savedVariant, error } = await operation;
    if (error) throw new Error(`Unable to save variants: ${error.message}`);
    const { error: offerError } = await supabase.from("variant_market_prices").upsert({
      variant_id: savedVariant.id,
      market_id: indiaMarket.id,
      price: item.price,
      compare_at_price: item.compareAtPrice,
      is_active: item.isActive,
    }, { onConflict: "variant_id,market_id" });
    if (offerError) throw new Error(`Unable to save the India market price: ${offerError.message}`);
  }

  for (const [index, item] of input.information.entries()) {
    const payload = {
      product_id: productId,
      label: item.label.trim(),
      value: item.value.trim(),
      display_order: index,
    };
    const operation = item.id && existingInformationIds.has(item.id)
      ? supabase.from("product_information").update(payload).eq("product_id", productId).eq("id", item.id)
      : supabase.from("product_information").insert(payload);
    const { error } = await operation;
    if (error) throw new Error(`Unable to save product information: ${error.message}`);
  }

  for (const [index, item] of input.faqs.entries()) {
    const payload = {
      product_id: productId,
      question: item.question.trim(),
      answer: item.answer.trim(),
      is_active: item.isActive,
      display_order: index,
    };
    const operation = item.id && existingFaqIds.has(item.id)
      ? supabase.from("product_faqs").update(payload).eq("product_id", productId).eq("id", item.id)
      : supabase.from("product_faqs").insert(payload);
    const { error } = await operation;
    if (error) throw new Error(`Unable to save FAQs: ${error.message}`);
  }
}

export async function saveProduct(input: ProductInput): Promise<CatalogActionResult> {
  try {
    await requireAdmin();
    const values = validate(input);
    const supabase = createAdminClient();
    const payload = {
      category_id: input.categoryId,
      name: values.name,
      slug: values.slug,
      description: input.description.trim(),
      price: input.price,
      compare_at_price: input.compareAtPrice,
      rating: input.rating,
      review_count: input.reviewCount,
      badge: input.badge.trim() || null,
      is_featured: input.isFeatured,
      is_active: input.isActive,
      display_order: input.displayOrder,
      seo_title: input.seoTitle.trim().slice(0, 70) || null,
      seo_description: input.seoDescription.trim().slice(0, 160) || null,
    };
    const operation = UUID_PATTERN.test(input.id)
      ? supabase.from("products").update(payload).eq("id", input.id).select("id").single()
      : supabase.from("products").insert(payload).select("id").single();
    const { data, error } = await operation;
    if (error) throw new Error(error.code === "23505" ? "That product slug is already in use." : error.message);
    await replaceChildren(supabase, data.id, input);
    revalidateProduct(values.slug);
    return { ok: true, message: `${values.name} was saved.` };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function deleteProduct(id: string, slug: string): Promise<CatalogActionResult> {
  try {
    await requireAdmin();
    if (!UUID_PATTERN.test(id)) throw new Error("Invalid product identifier.");
    const assetCleanup = await deleteProductAssets(id);
    if (!assetCleanup.ok) {
      throw new Error(assetCleanup.message);
    }
    const supabase = createAdminClient();
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw new Error(error.message);
    revalidateProduct(slug);
    return { ok: true, message: "Product deleted." };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}
