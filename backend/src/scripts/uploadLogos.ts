import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { v2 as cloudinary } from "cloudinary";

const ROOT = join(import.meta.dirname, "../../../Logos representadas");
const OUTPUT = join(import.meta.dirname, "../../../frontend/src/data/logos.json");

// File → brand slug for the public id. The file names do not say the brand
// reliably ("5.jpg" is PRIDE), so the mapping is explicit. "Logo TECSIS
// ALTA.png" is Tecsis's own logo: uploaded separately below, not a carousel item.
const LOGOS: Record<string, string> = {
  "2019_BK_logo_HBK_tagline_RGB.JPG": "bruel-kjaer",
  "5.jpg": "pride",
  "BKV-Logo_2021_4c.jpg": "bruel-kjaer-vibro",
  "CRYSOUND Logo.png": "crysound",
  "Dantec logo.png": "dantec-dynamics",
  "Distribuidor autorizado Thermo Scientific.bmp": "thermo-scientific",
  "HIGHTEST LOGO.jpg": "hightest",
  "Hipotronics_Logo_700p.jpg": "hipotronics",
  "LOGO ELECTRON.jpg": "electron",
  "LOGO REROS.png": "reros",
  "Logo_Haefely.jpg": "haefely",
  "Logo_Lightigo_orange_JPG.jpg": "lightigo",
  "MoserGlaser_CMYK_A5.jpg": "moser-glaser",
  "XRFTVIC-Logo-.jpg": "xrf-technology",
  "logo-reftek-black.png": "reftek",
  "powerside_white.png": "powerside",
};

// How each logo's white background is made transparent. By default the
// effect runs before trimming, on the full image, sampling a corner pixel as
// the background: that keeps working when the artwork, once trimmed, touches
// the edges (HIPOTRONICS). Two logos need it after trimming instead: the
// Thermo Scientific BMP has an off-white background (higher tolerance), and
// the Tecsis "T" touches the corner even in the original, so its background is
// named. Each combination was checked by measuring transparent pixels.
type Transparency = { afterTrim: boolean; tolerance: number; color?: string };
const DEFAULT_TRANSPARENCY: Transparency = { afterTrim: false, tolerance: 10 };
const TRANSPARENCY: Record<string, Transparency> = {
  "thermo-scientific": { afterTrim: true, tolerance: 25 },
  tecsis: { afterTrim: true, tolerance: 10, color: "white" },
};

const TECSIS_LOGO = { file: "Logo TECSIS ALTA.png", slug: "tecsis" };
const TECSIS_OUTPUT = join(
  import.meta.dirname,
  "../../../frontend/src/data/tecsis-logo.json",
);

// Capped first (the free plan refuses transformations over 25 megapixels and
// trim works on the full image), white made transparent, empty margins
// trimmed so every logo fills its height, fitted to 160px, then delivered as a
// small modern format instead of the multi-megabyte originals.
function transformationFor(slug: string) {
  const { afterTrim, tolerance, color } = TRANSPARENCY[slug] ?? DEFAULT_TRANSPARENCY;
  const transparent = {
    effect: `make_transparent:${tolerance}`,
    ...(color && { color }),
  };
  return [
    { width: 2000, crop: "limit" },
    ...(afterTrim ? [] : [transparent]),
    { effect: "trim" },
    { height: 160, crop: "fit" },
    ...(afterTrim ? [transparent] : []),
    { fetch_format: "auto", quality: "auto" },
  ];
}

async function uploadLogo(file: string, slug: string) {
  const result = await cloudinary.uploader.upload(join(ROOT, file), {
    public_id: `logos/${slug}`,
    resource_type: "image",
    overwrite: true,
    invalidate: true,
  });
  const url = cloudinary.url(result.public_id, {
    secure: true,
    version: result.version,
    transformation: transformationFor(slug),
    urlAnalytics: false,
  });
  console.log(`${result.public_id.padEnd(24)} ${url}`);
  return { id: result.public_id, url };
}

const logos: { id: string; url: string }[] = [];
for (const [file, slug] of Object.entries(LOGOS)) {
  logos.push(await uploadLogo(file, slug));
}
writeFileSync(OUTPUT, `${JSON.stringify(logos, null, 2)}\n`);
console.log(`\n${logos.length} logos → frontend/src/data/logos.json`);

// Tecsis's own logo, for the topbar: same treatment, kept out of the carousel.
const tecsis = await uploadLogo(TECSIS_LOGO.file, TECSIS_LOGO.slug);
writeFileSync(TECSIS_OUTPUT, `${JSON.stringify(tecsis, null, 2)}\n`);
console.log("Tecsis logo → frontend/src/data/tecsis-logo.json");
