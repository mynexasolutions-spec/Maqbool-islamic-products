import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { ProductDetailView } from "@/components/catalog/product-detail-view";
import { getProductBySlug, getRelatedProducts } from "@/lib/catalog-repository";

export const dynamicParams = true;
const getProduct = cache(getProductBySlug);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product not found - Maqbool Islamic Products" };
  return {
    title: product.seoTitle || `${product.name} - Maqbool Islamic Products`,
    description: product.seoDescription || product.description,
    alternates: { canonical: `/shop/${product.slug}` },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  const related = await getRelatedProducts(product, 4);

  return (
    <>
      <Header />
      <ProductDetailView product={product} related={related} />
      <Footer />
    </>
  );
}
