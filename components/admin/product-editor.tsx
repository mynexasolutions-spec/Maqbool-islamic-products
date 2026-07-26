"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { saveProduct } from "@/app/admin/products/actions";
import type {
  AdminCatalogCategory,
  AdminCatalogProduct,
  ProductInput,
  ProductSaveResult,
} from "@/components/admin/catalog-types";
import { AdminPageHeader, AdminPanel } from "@/components/admin/admin-ui";
import { ProductForm } from "@/components/admin/product-manager";
import { Button } from "@/components/ui/button";
import { productDraftStorageKey } from "@/lib/admin-product-draft";

export function ProductEditor({
  product,
  categories,
  initialMessage,
}: {
  product: AdminCatalogProduct;
  categories: AdminCatalogCategory[];
  initialMessage?: string;
}) {
  const router = useRouter();
  const isNew = product.id === "new";
  const storageKey = productDraftStorageKey(product.id);

  async function persist(input: ProductInput): Promise<ProductSaveResult> {
    const result = await saveProduct(input);
    if (!result.ok) return result;
    if (isNew) {
      router.replace(`/admin/products/${result.id}/edit?created=1`);
    } else {
      router.refresh();
    }
    return result;
  }

  return (
    <div className="mx-auto max-w-5xl">
      <AdminPageHeader
        eyebrow="Catalog editor"
        title={isNew ? "Add product" : `Edit ${product.name}`}
        description={isNew
          ? "Build the product carefully. Your unsaved work is kept on this device while you edit."
          : "Update product details, variants, stock, content, search metadata, and images in one place."}
        action={
          <Button asChild variant="outline" className="min-h-11 border-[#cfc7b7] bg-white text-[#35584d]">
            <Link href="/admin/products">
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" /> Back to products
            </Link>
          </Button>
        }
      />
      <div className="mb-5 flex items-start gap-3 rounded-xl border border-[#d8cfba] bg-[#fbf8ef] p-4 text-sm leading-6 text-[#596861]">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#9a7428]" aria-hidden="true" />
        <p>
          Draft protection is active. If this page reloads unexpectedly, the latest unsaved details
          can be restored on this device.
        </p>
      </div>
      <AdminPanel className="overflow-visible p-4 sm:p-7">
        <ProductForm
          key={product.id}
          product={product}
          categories={categories}
          storageKey={storageKey}
          initialMessage={initialMessage}
          onCancel={() => router.push("/admin/products")}
          onSave={persist}
        />
      </AdminPanel>
    </div>
  );
}
