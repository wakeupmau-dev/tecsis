import { NextResponse, type NextRequest } from "next/server";
import brands from "@/data/brochures.json";

const SLUGS = new Set(brands.map(toSlug));

function toSlug(brand: (typeof brands)[number]) {
  return brand.slug;
}

// The brand page streams before it can call notFound(), so an unknown slug
// would show the not-found UI with a 200. Rejecting it here, before rendering,
// gives a real 404: the rewrite target matches no route.
export function proxy(request: NextRequest) {
  const slug = request.nextUrl.pathname.split("/")[2];
  if (SLUGS.has(slug)) return NextResponse.next();
  return NextResponse.rewrite(new URL("/not-found", request.url));
}

export const config = {
  matcher: "/products/:slug",
};
