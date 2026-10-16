"use client";

import { useState } from "react";
import Topbar from "@/components/Topbar";
import type { Locale } from "@/content";

// The page itself is a server component; this holds the topbar's language
// state, which only affects the topbar here.
export default function ProductsTopbar() {
  const [locale, setLocale] = useState<Locale>("es");
  return <Topbar locale={locale} onLocaleChange={setLocale} />;
}
