import type { Metadata } from "next";
import brands from "@/data/brochures.json";
import BrandCard from "./brand-card";
import ProductsTopbar from "./products-topbar";

export const metadata: Metadata = {
  title: "Productos | tecsis",
};

export default function ProductsPage() {
  return (
    <>
      <ProductsTopbar helpButton />
      <section className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {brands.map((brand) => (
          <BrandCard key={brand.brand} brand={brand} />
        ))}
      </section>
    </>
  );
}
