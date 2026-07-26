import { ProductEditor } from "@/components/admin/product-editor";
import { createEmptyAdminProduct } from "@/components/admin/catalog-types";
import { getAdminCategories } from "../../categories/actions";

export default async function NewAdminProductPage() {
  const categories = await getAdminCategories();
  return <ProductEditor product={createEmptyAdminProduct()} categories={categories} />;
}
