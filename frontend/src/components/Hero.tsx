import Grainient from "@/components/Grainient";
import { Globe } from "@/components/ui/globe";
import { content, type Locale } from "@/content";
import type { ReactNode } from "react";

export default function Hero({
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

// The hero's title and category list, shared by the landing and /products.
// titleSize overrides the title's font size (default text-display).
export function HeroHeadline({
  locale,
  titleSize = "text-display",
}: {
  locale: Locale;
  titleSize?: string;
}) {
  const hero = content[locale].hero;

  return (
    <>
      <h1 className={`${titleSize} text-balance capitalize`}>{hero.title}</h1>
      <div
        className={`flex items-center text-gray-800 gap-x-2 ${locale === "es" ? "text-[0.65rem] sm:text-[0.75rem] font-medium tracking-tight" : "text-[0.9rem]"}`}
      >
        <p>{"["}</p>
        {hero.categories.map((el, index) => (
          <p className="uppercase" key={el}>
            {index < hero.categories.length - 1 ? `${el},` : el}
          </p>
        ))}
        <p>{"]"}</p>
      </div>
    </>
  );
}
