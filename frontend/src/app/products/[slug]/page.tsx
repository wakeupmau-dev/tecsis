import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import brands from "@/data/brochures.json";
import ProductsTopbar from "../products-topbar";

export function generateStaticParams() {
  return brands.map(toParams);
}

function toParams(brand: (typeof brands)[number]) {
  return { slug: brand.slug };
}

type BrandPageProps = { params: Promise<{ slug: string }> };

// The topbar renders straight away; the part that reads the URL sits behind
// Suspense so navigations are not held up waiting for it.
export default function BrandPage({ params }: BrandPageProps) {
  return (
    <>
      <ProductsTopbar />
      <Suspense>
        <BrandContent params={params} />
      </Suspense>
    </>
  );
}

async function BrandContent({ params }: BrandPageProps) {
  const { slug } = await params;
  function isRequestedBrand(item: (typeof brands)[number]) {
    return item.slug === slug;
  }

  const brand = brands.find(isRequestedBrand);
  // Only brands in the manifest exist; any other slug is a 404.
  if (!brand) notFound();

  return (
    <>
      <nav aria-label="Breadcrumb" className="mt-10">
        <ol className="flex items-center gap-x-2 text-[0.9rem] text-gray-600">
          <li>
            <Link href="/products" className="transition-colors hover:text-[#122991]">
              Productos
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-black">
            {brand.brand}
          </li>
        </ol>
      </nav>
      <h1 className="w-full flex justify-end">
        <Image
          src={brand.logo.url}
          alt={brand.brand}
          width={320}
          height={80}
          unoptimized
          className="h-12 w-auto max-w-full object-contain object-right"
        />
      </h1>
      <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {brand.brochures.map((brochure) => (
          <li key={brochure.url}>
            <a
              href={brochure.url}
              target="_blank"
              rel="noopener noreferrer"
              className="h-full flex flex-col border border-[#c9c9cf] shadow-xl shadow-[#e9e9ef] sm:rounded-2xl overflow-hidden"
            >
              <Image
                src={brochure.cover}
                alt=""
                width={400}
                height={566}
                unoptimized
                className="w-full aspect-[210/297] object-cover"
              />
              <footer className="px-5 py-3 border-t border-[#c9c9cf] bg-white">
                <p className="h-[3lh] line-clamp-3">{brochure.title}</p>
              </footer>
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}
