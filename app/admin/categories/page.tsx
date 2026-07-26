import { CategoryManager } from "@/components/admin/category-manager";
import { getAdminCategories } from "./actions";

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();
  return <CategoryManager initialCategories={categories} />;
}
