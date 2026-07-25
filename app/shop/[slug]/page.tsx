import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { ProductDetailView } from "@/components/catalog/product-detail-view";
import { catalogProducts, findCatalogProduct } from "@/data/catalog-products";

export function generateStaticParams() {
  return catalogProducts.filter((product) => product.active).map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = findCatalogProduct(slug);
  if (!product) return { title: "Product not found - Maqbool Islamic Products" };
  return { title: `${product.name} - Maqbool Islamic Products`, description: product.description };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = findCatalogProduct(slug);
  if (!product) notFound();
  const related = catalogProducts
    .filter((item) => item.active && item.id !== product.id)
    .sort((a, b) => Number(b.category === product.category) - Number(a.category === product.category))
    .slice(0, 4);

  return (
    <>
      <Header />
      <ProductDetailView product={product} related={related} />
      <Footer />
    </>
  );
}
