import { notFound } from "next/navigation";
import { ProductEditor } from "@/components/admin/product-editor";
import { getAdminCategories } from "../../../categories/actions";
import { getAdminProduct } from "../../actions";

export default async function EditAdminProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const [product, categories] = await Promise.all([
    getAdminProduct(id),
    getAdminCategories(),
  ]);
  if (!product) notFound();
  return (
    <ProductEditor
      product={product}
      categories={categories}
      initialMessage={query.created === "1" ? `${product.name} was created. You can upload images now.` : undefined}
    />
  );
}
