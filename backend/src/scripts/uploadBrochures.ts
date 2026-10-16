import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import {
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, extname, join, relative, sep } from "node:path";
import { promisify } from "node:util";
import { v2 as cloudinary } from "cloudinary";
import { brochureCatalog } from "./brochureCatalog.js";
import { brochureTitles } from "./brochureTitles.js";

const run = promisify(execFile);

const ROOT = join(import.meta.dirname, "../../../Landing page FOREDE");
const WORK_DIR = join(tmpdir(), "tecsis-brochures");
const MANIFEST = join(import.meta.dirname, "../../../frontend/src/data/brochures.json");
const LOGOS = join(import.meta.dirname, "../../../frontend/src/data/logos.json");

// --only=haefely,electron limits a run to those brand slugs.
const onlyArg = process.argv.find((arg) => arg.startsWith("--only="));
const only = onlyArg ? new Set(onlyArg.slice("--only=".length).split(",")) : null;
const scanOnly = process.argv.includes("--scan");
const compressOnly = process.argv.includes("--compress");
const force = process.argv.includes("--force");

type Brochure = {
  file: string;
  folder: string;
  brand: string;
  description: string;
  logo: string;
  title: string;
  publicId: string;
  originalBytes: number;
  sourceHash: string;
  pages?: { first: number; last: number };
};

// Files still over the 10 MB upload limit after compression, split into this
// many parts by page range. Keyed by the whole file's public id.
const SPLITS = new Map([["brochures/pride/1shenzhen-pride-catalog-2027-instruments", 3]]);

// PDFs in the folders that are not brochures. Keyed by public id.
const SKIP = new Set([
  "brochures/pride/pride-r",
  "brochures/pride/pride-iso-certificate",
  // A price quote and a letter to representatives, not brochures. To confirm.
  "brochures/hipotronics/32061209-mta-150-61209",
  "brochures/hipotronics/700-di-letter-to-representatives",
]);

function collectPdfs(dir: string): string[] {
  const found: string[] = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      found.push(...collectPdfs(path));
    } else if (extname(name).toLowerCase() === ".pdf") {
      found.push(path);
    }
  }
  return found;
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Matched ignoring case: macOS folders differing only in case are the same
// folder, so a rename like "ups" → "Ups" may never reach the disk.
const catalogByFolder = new Map(
  Object.entries(brochureCatalog).map(([folder, entry]) => [
    folder.toLowerCase(),
    entry,
  ]),
);

function hashFile(file: string) {
  return createHash("sha256").update(readFileSync(file)).digest("hex");
}

function describe(file: string, hash: string): Brochure | null {
  const folder = relative(ROOT, file).split(sep)[0];
  const entry = catalogByFolder.get(folder.toLowerCase());
  if (!entry) return null;

  // The public id stays derived from the file name, so retitling never
  // changes what is in Cloudinary; the title shown comes from brochureTitles.
  const fileName = basename(file, extname(file));
  const publicId = `brochures/${slugify(entry.brand)}/${slugify(fileName)}`;
  return {
    file,
    folder,
    brand: entry.brand,
    description: entry.description,
    logo: entry.logo,
    title: brochureTitles[publicId] ?? fileName,
    publicId,
    originalBytes: statSync(file).size,
    sourceHash: hash.slice(0, 16),
  };
}

// Copies like "file (1).pdf" go last, so the original name is the one kept
// when the duplicate check finds identical content.
function isNumberedCopy(file: string) {
  return /\s\(\d+\)\.pdf$/i.test(file) ? 1 : 0;
}

function byOriginalFirst(a: string, b: string) {
  return isNumberedCopy(a) - isNumberedCopy(b);
}

type Compressed = { path: string; bytes: number; compressed: boolean };

// Ghostscript's /ebook preset re-encodes images at 150 dpi: sharp on screen,
// usually far smaller for image-heavy brochures. Keeps the original whenever
// re-encoding fails or does not shrink the file.
async function compressPdf(brochure: Brochure): Promise<Compressed | null> {
  const output = join(WORK_DIR, `${brochure.publicId.replaceAll("/", "__")}.pdf`);
  const pageArgs = brochure.pages
    ? [`-dFirstPage=${brochure.pages.first}`, `-dLastPage=${brochure.pages.last}`]
    : [];
  try {
    await run(
      "gs",
      [
        "-sDEVICE=pdfwrite",
        "-dCompatibilityLevel=1.5",
        "-dPDFSETTINGS=/ebook",
        "-dNOPAUSE",
        "-dQUIET",
        "-dBATCH",
        ...pageArgs,
        `-sOutputFile=${output}`,
        brochure.file,
      ],
      { maxBuffer: 10 * 1024 * 1024 },
    );
  } catch (error) {
    console.warn(`  gs failed for ${brochure.publicId}: ${(error as Error).message}`);
    // A part has no original of its own to fall back to.
    if (brochure.pages) return null;
    return { path: brochure.file, bytes: brochure.originalBytes, compressed: false };
  }

  const bytes = statSync(output).size;
  if (brochure.pages) return { path: output, bytes, compressed: true };
  if (bytes >= brochure.originalBytes) {
    return { path: brochure.file, bytes: brochure.originalBytes, compressed: false };
  }
  return { path: output, bytes, compressed: true };
}

async function pageCount(file: string) {
  const { stdout } = await run("gs", [
    "-q",
    "-dNODISPLAY",
    "-dNOSAFER",
    "-c",
    `(${file}) (r) file runpdfbegin pdfpagecount = quit`,
  ]);
  return Number(stdout.trim());
}

async function splitIntoParts(brochure: Brochure): Promise<Brochure[]> {
  const parts = SPLITS.get(brochure.publicId);
  if (!parts) return [brochure];

  const total = await pageCount(brochure.file);
  const size = Math.ceil(total / parts);
  const result: Brochure[] = [];
  for (let i = 0; i < parts; i++) {
    result.push({
      ...brochure,
      title: `${brochure.title} (${i + 1}/${parts})`,
      publicId: `${brochure.publicId}-part-${i + 1}`,
      pages: { first: i * size + 1, last: Math.min((i + 1) * size, total) },
    });
  }
  return result;
}

// PDFs go up as the image type, which is what lets Cloudinary serve and
// render them. asset_folder mirrors the public id so the Media Library shows
// the same brochures/<brand> folders.
async function uploadPdf(brochure: Brochure, path: string) {
  const folder = brochure.publicId.slice(0, brochure.publicId.lastIndexOf("/"));
  const result = await cloudinary.uploader.upload(path, {
    public_id: brochure.publicId,
    asset_folder: folder,
    resource_type: "image",
    overwrite: true,
    invalidate: true,
    context: { source: brochure.sourceHash },
  });
  return result.secure_url;
}

type Uploaded = { url: string; bytes: number; sourceHash: string | null };

// Everything already under brochures/, with the source fingerprint each
// upload recorded, so unchanged files can be skipped.
async function listUploaded() {
  const uploaded = new Map<string, Uploaded>();
  let cursor: string | undefined;
  do {
    const page = await cloudinary.api.resources({
      type: "upload",
      resource_type: "image",
      prefix: "brochures/",
      max_results: 500,
      context: true,
      next_cursor: cursor,
    });
    for (const resource of page.resources) {
      uploaded.set(resource.public_id, {
        url: resource.secure_url,
        bytes: resource.bytes,
        sourceHash: resource.context?.custom?.source ?? null,
      });
    }
    cursor = page.next_cursor;
  } while (cursor);
  return uploaded;
}

function toMb(bytes: number) {
  return (bytes / 1024 / 1024).toFixed(1);
}

const files = collectPdfs(ROOT).sort(byOriginalFirst);
const brochures: Brochure[] = [];
const uncatalogued: string[] = [];
const duplicates: string[] = [];
const hashes = new Map<string, string>();

for (const file of files) {
  const hash = hashFile(file);
  const original = hashes.get(hash);
  if (original) {
    duplicates.push(`${relative(ROOT, file)} (same as ${relative(ROOT, original)})`);
    continue;
  }
  hashes.set(hash, file);

  const brochure = describe(file, hash);
  if (brochure) brochures.push(brochure);
  else uncatalogued.push(relative(ROOT, file));
}

const seen = new Map<string, string>();
const collisions: string[] = [];
for (const brochure of brochures) {
  const previous = seen.get(brochure.publicId);
  if (previous) collisions.push(`${brochure.publicId}: ${previous} | ${brochure.file}`);
  seen.set(brochure.publicId, brochure.file);
}

console.log(`${brochures.length} PDFs found`);
if (uncatalogued.length) console.log("Not in catalog:", uncatalogued);
if (duplicates.length) console.log("Skipped duplicates:", duplicates);
if (collisions.length) console.log("Public id collisions:", collisions);

function isPublished(brochure: Brochure) {
  return !SKIP.has(brochure.publicId);
}

function isSelected(brochure: Brochure) {
  return !only || only.has(slugify(brochure.brand));
}

const published: Brochure[] = [];
for (const brochure of brochures.filter(isPublished)) {
  published.push(...(await splitIntoParts(brochure)));
}
const selected = published.filter(isSelected);

function byBrandThenTitle(a: Brochure, b: Brochure) {
  return a.brand.localeCompare(b.brand) || a.title.localeCompare(b.title);
}

// Built from what Cloudinary holds after the run, so it covers every
// published brochure, not only the ones this run touched.
type ManifestBrochure = {
  title: string;
  url: string;
  cover: string;
  originalBytes: number;
  bytes: number;
  pages?: { first: number; last: number };
};

type ManifestBrand = {
  brand: string;
  // URL-safe brand name for /products/<slug>; same slug as the Cloudinary folder.
  slug: string;
  description: string;
  logo: { id: string; url: string };
  brochures: ManifestBrochure[];
};

// Page 1 of the PDF as a 400px-wide image. Cloudinary renders PDF pages for
// image-type assets; the extension switches delivery from PDF to image.
function coverUrl(pdfUrl: string) {
  return pdfUrl
    .replace("/image/upload/", "/image/upload/pg_1,w_400,f_auto,q_auto/")
    .replace(/\.pdf$/, ".jpg");
}

// Logo urls come from the logo script's output, so each brand carries its own.
function readLogos() {
  const logos: { id: string; url: string }[] = JSON.parse(readFileSync(LOGOS, "utf8"));
  return new Map(logos.map(toLogoEntry));
}

function toLogoEntry(logo: { id: string; url: string }): [string, string] {
  return [logo.id, logo.url];
}

// Built from what Cloudinary holds after the run, so it covers every
// published brochure, not only the ones this run touched. Grouped by brand.
async function writeManifest() {
  const uploaded = await listUploaded();
  const logoUrls = readLogos();
  const brands = new Map<string, ManifestBrand>();
  const missing: string[] = [];
  const missingLogos = new Set<string>();
  let count = 0;

  for (const brochure of [...published].sort(byBrandThenTitle)) {
    const asset = uploaded.get(brochure.publicId);
    if (!asset) {
      missing.push(brochure.publicId);
      continue;
    }

    let group = brands.get(brochure.brand);
    if (!group) {
      const logoUrl = logoUrls.get(brochure.logo);
      if (!logoUrl) missingLogos.add(brochure.logo);
      group = {
        brand: brochure.brand,
        slug: slugify(brochure.brand),
        description: brochure.description,
        logo: { id: brochure.logo, url: logoUrl ?? "" },
        brochures: [],
      };
      brands.set(brochure.brand, group);
    }

    group.brochures.push({
      title: brochure.title,
      url: asset.url,
      cover: coverUrl(asset.url),
      originalBytes: brochure.originalBytes,
      bytes: asset.bytes,
      ...(brochure.pages && { pages: brochure.pages }),
    });
    count++;
  }

  const manifest = [...brands.values()];
  mkdirSync(join(MANIFEST, ".."), { recursive: true });
  writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(
    `\nManifest: ${manifest.length} brands, ${count} brochures → ${relative(process.cwd(), MANIFEST)}`,
  );
  if (missing.length) console.log(`Not uploaded yet: ${missing.length}`);
  if (missingLogos.size) console.log("Logo ids not in logos.json:", [...missingLogos]);
}

if (scanOnly) {
  for (const brochure of selected) {
    const range = brochure.pages ? `  pages ${brochure.pages.first}-${brochure.pages.last}` : "";
    console.log(`${toMb(brochure.originalBytes).padStart(6)} MB  ${brochure.publicId}${range}`);
  }
} else {
  mkdirSync(WORK_DIR, { recursive: true });
  const uploaded = compressOnly ? new Map<string, Uploaded>() : await listUploaded();
  for (const brochure of selected) {
    const existing = uploaded.get(brochure.publicId);
    if (!force && existing?.sourceHash === brochure.sourceHash) {
      console.log(`already uploaded             ${brochure.publicId}`);
      continue;
    }

    const started = Date.now();
    const result = await compressPdf(brochure);
    const seconds = ((Date.now() - started) / 1000).toFixed(1);
    if (!result) continue;
    const change = result.compressed
      ? `${toMb(brochure.originalBytes)} → ${toMb(result.bytes)} MB`
      : `${toMb(brochure.originalBytes)} MB (kept original)`;
    console.log(`${change.padEnd(28)} ${seconds.padStart(5)}s  ${brochure.publicId}`);
    if (compressOnly) continue;

    try {
      const url = await uploadPdf(brochure, result.path);
      console.log(`  uploaded  ${url}`);
    } catch (error) {
      const message =
        (error as { error?: { message?: string } }).error?.message ??
        (error as Error).message;
      console.warn(`  upload failed: ${message}`);
    }
  }
}

if (!scanOnly && !compressOnly) await writeManifest();
