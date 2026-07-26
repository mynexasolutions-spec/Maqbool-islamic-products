import { ProductManager } from "@/components/admin/product-manager";
import { getAdminCategories } from "../categories/actions";
import { getAdminProducts } from "./actions";

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    getAdminProducts(),
    getAdminCategories(),
  ]);
  return <ProductManager initialProducts={products} categories={categories} />;
}
