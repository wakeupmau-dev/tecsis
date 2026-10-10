"use client";

import { CircleArrowUp, CircleCheck, Dot, Send } from "lucide-react";
import Grainient from "@/components/Grainient";
import PixelSwap from "@/components/PixelSwap";
import { Globe } from "@/components/ui/globe";
import Image from "next/image";
import Marquee from "react-fast-marquee";
import { motion } from "motion/react";
import { content, type Content, type Locale } from "@/content";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

export default function Landing() {
  const [locale, setLocale] = useState<Locale>("es");
  const [leadResult, setLeadResult] = useState<LeadResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const text = content[locale];

  const submitStatus = submitting
    ? "loading"
    : leadResult === "sent"
      ? "success"
      : leadResult
        ? "error"
        : null;
  const submitted = submitStatus === "success";
  const submitColor =
    submitStatus === "error"
      ? "bg-red-500 text-white"
      : submitStatus === "success"
        ? "bg-green-600 text-white"
        : "bg-black text-white";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = String(new FormData(form).get("email") ?? "").trim();
    if (!EMAIL_REGEX.test(email)) {
      setLeadResult("invalid");
      return;
    }

    setLeadResult(null);
    setSubmitting(true);
    const result = await submitLead(email, locale);
    setSubmitting(false);
    setLeadResult(result);
    if (result === "sent") form.reset();
  }

  return (
    <main className="min-h-screen flex justify-center bg-bg-light pt-5 pb-20">
      <div className="w-full max-w-280 flex flex-col gap-y-5 sm:px-5 min-[70rem]:px-0">
        <Topbar nav={text.nav} locale={locale} onLocaleChange={setLocale} />
        <Hero globe>
          <div className="flex flex-col justify-end gap-y-6">
            <h1 className="text-display text-balance capitalize">
              {text.hero.title}
            </h1>
            <div
              className={`flex items-center text-gray-800 gap-x-2 ${locale === "es" ? "text-[0.65rem] sm:text-[0.75rem] font-medium tracking-tight" : "text-[0.9rem]"}`}
            >
              <p>{"["}</p>
              {text.hero.categories.map((el, index) => (
                <p className="uppercase" key={el}>
                  {index < text.hero.categories.length - 1 ? `${el},` : el}
                </p>
              ))}
              <p>{"]"}</p>
            </div>
            <div className="flex gap-x-3">
              <button className="h-12 px-6 rounded-full bg-[#122991] text-white">
                {text.hero.primaryCta}
              </button>
              <button className="h-12 px-6 rounded-full bg-[#f3f4fa] text-black">
                {text.hero.secondaryCta}
              </button>
            </div>
          </div>
        </Hero>
        <Brands />
        <Section
          id="about"
          title={text.about.title}
          paragraphs={text.about.paragraphs}
        />
        <Services services={text.services} />
        <Hero
          id="contact"
          className="py-25"
          centered
          height="auto"
          position="right"
        >
          <div className="flex flex-col justify-start gap-y-10">
            <h1 className="text-title text-balance capitalize">
              {text.contact.title}
            </h1>
            <form className="flex items-end" onSubmit={handleSubmit}>
              <motion.div
                initial={false}
                animate={
                  submitted
                    ? { flexGrow: 0, paddingRight: 0, opacity: 0 }
                    : { flexGrow: 1, paddingRight: 12, opacity: 1 }
                }
                transition={SUBMIT_TRANSITION}
                inert={submitted}
                className="basis-0 min-w-0 overflow-hidden"
              >
                <Input
                  name="email"
                  label={text.contact.emailLabel}
                  type="email"
                />
              </motion.div>
              <motion.button
                type="submit"
                disabled={submitStatus === "loading" || submitted}
                initial={false}
                animate={{ flexGrow: submitted ? 1 : 0 }}
                transition={SUBMIT_TRANSITION}
                aria-label={submitted ? text.contact.submitted : text.contact.submit}
                className={`${submitColor} shrink-0 basis-15 sm:basis-1/3 h-15 rounded-full flex items-center justify-center gap-x-2 transition-colors duration-300 ${submitStatus === "loading" ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {submitStatus === "loading" && (
                  <span className="w-4 h-4 border-2 border-current/40 border-t-current rounded-full animate-spin" />
                )}
                {submitStatus === "success" && (
                  <CircleCheck className="w-4 h-4" />
                )}
                {submitStatus !== "loading" && !submitted && (
                  <Send className="w-5 h-5 sm:hidden" />
                )}
                <span className={submitted ? "" : "hidden sm:inline"}>
                  {submitted ? text.contact.submitted : text.contact.submit}
                </span>
              </motion.button>
            </form>
            <p
              aria-live="polite"
              className={`min-h-6 px-6 text-[0.9rem] ${leadResult === "sent" ? "text-gray-800" : "text-red-600"}`}
            >
              {leadResult && text.contact.messages[leadResult]}
            </p>
          </div>
        </Hero>
      </div>
    </main>
  );
}

const SUBMIT_TRANSITION = { duration: 0.6, ease: "easeInOut" } as const;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type LeadResult =
  | "sent"
  | "notSent"
  | "invalid"
  | "exists"
  | "limited"
  | "failed";

async function submitLead(email: string, locale: Locale): Promise<LeadResult> {
  try {
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, locale }),
    });
    if (res.ok) {
      const body: { emailSent?: boolean } = await res.json();
      return body.emailSent ? "sent" : "notSent";
    }
    if (res.status === 400) return "invalid";
    if (res.status === 409) return "exists";
    if (res.status === 429) return "limited";
    return "failed";
  } catch {
    return "failed";
  }
}

function Input({
  name,
  label,
  type = "text",
}: {
  name: string;
  label: string;
  type?: string;
}) {
  return (
    <div className="relative w-full flex flex-col gap-y-1">
      <label
        className="px-6 text-[0.9rem] capitalize font-medium text-[#323232] whitespace-nowrap"
        htmlFor={name}
      >
        {label}
      </label>
      <div className="flex items-end">
        <input
          id={name}
          name={name}
          className="w-full outline-0 h-15 px-5 bg-[#f3f4fa] rounded-full"
          type={type}
        />
      </div>
    </div>
  );
}

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
  nav: Content["nav"];
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
};

function Topbar({ nav, locale, onLocaleChange }: TopbarProps) {
  const [active, setActive] = useState<NavItem>("home");
  const [inView, setInView] = useState(true);
  const topbarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleScroll() {
      setActive(getActiveItem());
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
        <Image
          src="/tecsis-logo.jpg"
          alt="Tecsis"
          width={300}
          height={51}
          priority
          className="h-7 w-auto mix-blend-multiply"
        />
      </h1>
      <div className="flex gap-x-2 items-center">
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
        <button className="ml-4" onClick={handleLocaleClick}>
          <span className={locale === "en" ? "" : "text-gray-500"}>En</span>
          <span className="text-gray-500">/</span>
          <span className={locale === "es" ? "" : "text-gray-500"}>Es</span>
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

const brands = [
  { name: "Power Standards Lab", src: "/logos/logo_01.png" },
  { name: "Moser-Glaser", src: "/logos/logo_02.jpg" },
  { name: "Instron", src: "/logos/logo_03.png" },
  { name: "Soft Noise", src: "/logos/logo_04.png" },
  { name: "Thermo Scientific", src: "/logos/logo_05.png" },
  { name: "Bruel & Kjaer", src: "/logos/logo_06.jpg" },
  { name: "Hipotronics", src: "/logos/logo_08.png" },
  { name: "xrf", src: "/logos/logo_09.png" },
  { name: "Optica Italy", src: "/logos/logo_10.png" },
  { name: "Refatek", src: "/logos/logo_11.png" },
];

function Brands() {
  return (
    <div className="sm:-mx-5 min-[70rem]:mx-0">
      <Marquee
        autoFill
        pauseOnHover
        gradient
        gradientColor="#F6F7FF"
        speed={40}
      >
        {brands.map((brand) => (
          <Image
            key={brand.name}
            src={brand.src}
            alt={brand.name}
            width={160}
            height={80}
            className="h-20 w-auto object-contain mx-8"
          />
        ))}
      </Marquee>
    </div>
  );
}

function Hero({
  id,
  children,
  position = "left",
  height = "h-170",
  centered = false,
  globe = false,
  className,
}: {
  id?: string;
  children: ReactNode;
  position?: "left" | "right";
  height?: string;
  centered?: boolean;
  globe?: boolean;
  className?: string;
}) {
  const grid = centered
    ? "grid-cols-1 place-items-center"
    : "grid-cols-1 md:grid-cols-2";

  return (
    <div
      id={id}
      className={`${height} relative isolate overflow-hidden w-full grid ${grid} sm:rounded-2xl p-10 ${className}`}
    >
      <div className="absolute inset-0 -z-10 opacity-45">
        <Grainient
          color1="#75aee6"
          color2="#122991"
          color3="#75aee6"
          timeSpeed={0.25}
          colorBalance={0}
          warpStrength={1}
          warpFrequency={5}
          warpSpeed={2}
          warpAmplitude={50}
          blendAngle={0}
          blendSoftness={0.05}
          rotationAmount={500}
          noiseScale={2}
          grainAmount={0.1}
          grainScale={2}
          grainAnimated={false}
          contrast={1.5}
          gamma={1}
          saturation={1}
          centerX={0}
          centerY={0}
          zoom={0.9}
        />
      </div>
      {globe && (
        <Globe
          className="-z-10 mix-blend-overlay opacity-50 w-[150vw] md:w-280 max-w-none left-1/2 right-auto mx-0 -translate-x-1/2"
          speed={0.0005}
        />
      )}
      {!centered && position === "right" && (
        <div className="hidden md:block"></div>
      )}
      {children}
      {!centered && position === "left" && (
        <div className="hidden md:block"></div>
      )}
    </div>
  );
}

function Section({
  id,
  title,
  paragraphs,
}: {
  id?: string;
  title: string;
  paragraphs: string[];
}) {
  return (
    <div id={id} className="w-full">
      {/* Title */}
      <div className="w-full h-12 flex justify-between items-center px-3 border-t border-x sm:rounded-t-2xl">
        <h2 className="uppercase">{title}</h2>
        <Dot className="w-6 h-6" />
      </div>
      {/* Title */}
      <div className="w full grid grid-cols-1 md:grid-cols-2 py-10">
        <div className="hidden md:block"></div>
        <div className="flex flex-col gap-y-5 text-body-lg p-5">
          {paragraphs.map((paragraph, index) => (
            <p key={index} className={index > 0 ? "text-gray-600" : ""}>
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      <div className="w-full h-12 flex justify-end items-center px-3 border-b border-x sm:rounded-b-2xl">
        <Dot className="w-6 h-6" />
      </div>
    </div>
  );
}

function Services({ services }: { services: Content["services"] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 md:grid-rows-2 gap-5 sm:rounded-2xl overflow-hidden">
      {services.map((service) => (
        <PixelSwap
          key={service.id}
          firstContent={
            <div
              key={service.id}
              className="click-prompt h-full w-full flex flex-col items-center justify-center aspect-square  text-white bg-[#122991] p-10 gap-y-5"
            >
              <div className="flex flex-col gap-y-2 justify-center items-center">
                <CircleArrowUp className="w-10 h-10" />
                <h2 className="text-card">{service.section}</h2>
              </div>
              <p className="text-[0.9rem]">{service.description}</p>
            </div>
          }
          secondContent={
            <div
              key={service.id}
              className="found-message h-full w-full flex flex-col items-center justify-center bg-[#e7eaf4]  aspect-square p-10 gap-y-5"
            >
              <div className="flex flex-col gap-y-2 justify-center items-center">
                <CircleArrowUp className="w-10 h-10" />
                <h2 className="text-card">{service.section}</h2>
              </div>
              <p className="text-[0.9rem]">{service.description}</p>
            </div>
          }
          aspectRatio="1"
          pixelSize={64}
          gap={0}
          pixelRadius={0}
          pixelSpin={0}
          pixelScale={0.35}
          duration={1400}
          pixelDuration={450}
          pattern="random"
          randomness={0}
          fade
          trigger="hover"
        />
      ))}
    </div>
  );
}
