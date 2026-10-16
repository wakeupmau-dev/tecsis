import Image from "next/image";
import Link from "next/link";
import type brands from "@/data/brochures.json";

type Brand = (typeof brands)[number];

export default function BrandCard({ brand }: { brand: Brand }) {
  return (
    <Link href={`/products/${brand.slug}`}>
      <article className="aspect-square flex flex-col border sm:rounded-2xl overflow-hidden">
        <div className="grow flex items-center justify-center p-5">
          <Image
            src={brand.logo.url}
            alt={brand.brand}
            width={320}
            height={80}
            unoptimized
            className="h-12 w-auto max-w-full object-contain"
          />
        </div>
        <footer className="px-5 py-3 border-t">
          <p className="min-h-[2lh]">{brand.description}</p>
        </footer>
      </article>
    </Link>
  );
}
