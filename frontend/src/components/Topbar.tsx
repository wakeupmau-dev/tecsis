"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Content, Locale } from "@/content";
import tecsisLogo from "@/data/tecsis-logo.json";

type NavItem = "home" | "about" | "contact";

const navItems: NavItem[] = ["home", "about", "contact"];

function scrollToItem(item: NavItem) {
  if (item === "home") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  document.getElementById(item)?.scrollIntoView({ behavior: "smooth" });
}

function getActiveItem(): NavItem {
  const atBottom =
    window.innerHeight + window.scrollY >=
    document.documentElement.scrollHeight - 2;
  if (atBottom) return "contact";

  const line = window.innerHeight / 3;
  let current: NavItem = "home";
  for (const item of navItems) {
    const element = document.getElementById(item);
    if (element && element.getBoundingClientRect().top <= line) current = item;
  }
  return current;
}

type TopbarProps = {
  // Section buttons for the home page. Without it the topbar shows only the
  // logo and the language switch, and does not track scroll position.
  nav?: Content["nav"];
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
};

export default function Topbar({ nav, locale, onLocaleChange }: TopbarProps) {
  const [active, setActive] = useState<NavItem>("home");
  const [inView, setInView] = useState(true);
  const topbarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!nav) return;

    function handleScroll() {
      setActive(getActiveItem());
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [nav]);

  useEffect(() => {
    const topbar = topbarRef.current;
    if (!topbar) return;

    function handleIntersect([entry]: IntersectionObserverEntry[]) {
      setInView(entry.isIntersecting);
    }

    const observer = new IntersectionObserver(handleIntersect);
    observer.observe(topbar);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={topbarRef} className="hidden sm:block w-full">
        <TopbarContent
          active={active}
          nav={nav}
          locale={locale}
          onLocaleChange={onLocaleChange}
        />
      </div>
      {!inView && (
        <div className="fixed top-0 inset-x-0 z-50 flex justify-center py-3 bg-bg-light">
          <div className="w-full max-w-280 px-2 md:px-0">
            <TopbarContent
              active={active}
              nav={nav}
              locale={locale}
              onLocaleChange={onLocaleChange}
            />
          </div>
        </div>
      )}
    </>
  );
}

function TopbarContent({
  active,
  nav,
  locale,
  onLocaleChange,
}: TopbarProps & { active: NavItem }) {
  function handleLocaleClick() {
    onLocaleChange(locale === "en" ? "es" : "en");
  }

  return (
    <div className="flex justify-between items-center w-full">
      <h1>
        <Link href="/" aria-label="Tecsis">
          <Image
            src={tecsisLogo.url}
            alt="Tecsis"
            width={949}
            height={160}
            priority
            unoptimized
            className="h-7 w-auto"
          />
        </Link>
      </h1>
      <div className="flex gap-x-2 items-center">
        {nav && (
          <div className="hidden md:flex gap-x-2 items-center">
            {navItems.map((item) => (
              <NavButton
                key={item}
                item={item}
                label={nav[item]}
                active={item === active}
                onSelect={scrollToItem}
              />
            ))}
          </div>
        )}
        <button
          className="ml-4 h-8 px-3 border border-[#c9c9cf] rounded-md"
          onClick={handleLocaleClick}
          aria-label={locale === "es" ? "Cambiar a inglés" : "Switch to Spanish"}
        >
          {locale === "es" ? "Es" : "En"}
        </button>
      </div>
    </div>
  );
}

function NavButton({
  item,
  label,
  active,
  onSelect,
}: {
  item: NavItem;
  label: string;
  active: boolean;
  onSelect: (item: NavItem) => void;
}) {
  function handleClick() {
    onSelect(item);
  }

  return (
    <button className={active ? "" : "text-gray-500"} onClick={handleClick}>
      {active ? `[ ${label} ]` : label}
    </button>
  );
}
