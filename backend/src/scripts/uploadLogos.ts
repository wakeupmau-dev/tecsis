import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { v2 as cloudinary } from "cloudinary";

const ROOT = join(import.meta.dirname, "../../../Logos representadas");
const OUTPUT = join(import.meta.dirname, "../../../frontend/src/data/logos.json");

// File → brand slug for the public id. The file names do not say the brand
// reliably ("5.jpg" is PRIDE), so the mapping is explicit. "Logo TECSIS
// ALTA.png" is Tecsis's own logo and is left out on purpose.
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

// Background tolerance for make_transparent; a few files have an off-white
// background that the default leaves behind.
const TOLERANCE: Record<string, number> = { "thermo-scientific": 25 };
const DEFAULT_TOLERANCE = 10;

const logos: { id: string; url: string }[] = [];

for (const [file, slug] of Object.entries(LOGOS)) {
  const result = await cloudinary.uploader.upload(join(ROOT, file), {
    public_id: `logos/${slug}`,
    resource_type: "image",
    overwrite: true,
    invalidate: true,
  });
  // Empty margins trimmed so every logo fills its height, fitted to 160px,
  // white backgrounds made transparent (the marquee's transforms stop CSS
  // blend modes from reaching the page), then delivered as a small modern
  // format instead of the multi-megabyte originals.
  const url = cloudinary.url(result.public_id, {
    secure: true,
    version: result.version,
    transformation: [
      // Capped first: the free plan refuses transformations over 25 megapixels,
      // and trim works on the full image (the PRIDE file is 26.7).
      { width: 2000, crop: "limit" },
      { effect: "trim" },
      { height: 160, crop: "fit" },
      { effect: `make_transparent:${TOLERANCE[slug] ?? DEFAULT_TOLERANCE}` },
      { fetch_format: "auto", quality: "auto" },
    ],
    urlAnalytics: false,
  });
  logos.push({ id: result.public_id, url });
  console.log(`${result.public_id.padEnd(24)} ${url}`);
}

writeFileSync(OUTPUT, `${JSON.stringify(logos, null, 2)}\n`);
console.log(`\n${logos.length} logos → frontend/src/data/logos.json`);
