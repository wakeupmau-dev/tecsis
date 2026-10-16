import { notFound } from "next/navigation";
import brands from "@/data/brochures.json";
import ProductsTopbar from "../products-topbar";

export function generateStaticParams() {
  return brands.map(toParams);
}

function toParams(brand: (typeof brands)[number]) {
  return { slug: brand.slug };
}

export default async function BrandPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  function isRequestedBrand(item: (typeof brands)[number]) {
    return item.slug === slug;
  }

  const brand = brands.find(isRequestedBrand);
  // Only brands in the manifest exist; any other slug is a 404.
  if (!brand) notFound();

  return (
    <>
      <ProductsTopbar />
      <h1>{brand.brand}</h1>
    </>
  );
}
