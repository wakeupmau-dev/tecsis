"use client";

import { useState } from "react";
import Topbar from "@/components/Topbar";
import { content, type Locale } from "@/content";

export default function NotFound() {
  const [locale, setLocale] = useState<Locale>("es");
  const text = content[locale].notFound;

  return (
    // Screen height minus the layout's pt-5 + pb-20, so the page doesn't scroll.
    <div className="flex flex-col w-full h-[calc(100dvh-6.25rem)]">
      <Topbar locale={locale} onLocaleChange={setLocale} />
      <div className="flex flex-col flex-1 justify-center items-center">
        <h1 className="w-full text-end text-[10rem] sm:text-[18rem] tracking-tighter leading-35 sm:leading-70 text-[#122991]">
          404
        </h1>
        <p className="text-end w-full text-[1.2rem] pr-1 text-[#122991]">
          {text.message}
        </p>
      </div>
    </div>
  );
}
