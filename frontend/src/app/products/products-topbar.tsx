"use client";

import { useState } from "react";
import Topbar from "@/components/Topbar";
import type { Locale } from "@/content";
import HelpButton from "./help-button";

// The page itself is a server component; this holds the language state, which
// only affects the topbar and, when shown, the help button here.
export default function ProductsTopbar({
  helpButton = false,
}: {
  helpButton?: boolean;
}) {
  const [locale, setLocale] = useState<Locale>("es");
  return (
    <>
      <Topbar locale={locale} onLocaleChange={setLocale} />
      {helpButton && <HelpButton locale={locale} />}
    </>
  );
}
