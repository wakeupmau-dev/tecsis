"use client";

import { useState } from "react";
import Hero, { HeroHeadline } from "@/components/Hero";
import Topbar from "@/components/Topbar";
import type { Locale } from "@/content";
import HelpButton from "./help-button";

// The page itself is a server component; this holds the language state, which
// only affects the topbar and, when shown, the hero and help button here.
export default function ProductsTopbar({
  hero = false,
  helpButton = false,
}: {
  hero?: boolean;
  helpButton?: boolean;
}) {
  const [locale, setLocale] = useState<Locale>("es");
  return (
    <>
      <Topbar locale={locale} onLocaleChange={setLocale} />
      {hero && (
        // Half the landing hero's h-170.
        <Hero globe height="h-85">
          <div className="flex flex-col justify-end gap-y-6">
            {/* text-display, but capped at 2.5rem instead of 3rem. */}
            <HeroHeadline
              locale={locale}
              titleSize="text-[clamp(2rem,1.497rem+2.148vw,2.5rem)] leading-none"
            />
          </div>
        </Hero>
      )}
      {helpButton && <HelpButton locale={locale} />}
    </>
  );
}
