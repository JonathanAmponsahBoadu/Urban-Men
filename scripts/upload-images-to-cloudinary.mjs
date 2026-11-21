/**
 * Uploads every file in apps/web/public/images/products/ to Cloudinary
 * and patches apps/web/src/data/products.ts with the returned URLs.
 *
 * Usage:
 *   node scripts/upload-images-to-cloudinary.mjs
 *
 * Reads credentials from apps/web/.env.local automatically.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// ── 1. Load env from apps/web/.env.local ─────────────────────────────────────
const envPath = path.join(ROOT, "apps", "web", ".env.local");
const envText = fs.readFileSync(envPath, "utf8");
const env = Object.fromEntries(
  envText
    .split("\n")
    .filter((l) => l.trim() && !l.trim().startsWith("#"))
    .map((l) => {
      const eq = l.indexOf("=");
      return [l.slice(0, eq).trim(), l.slice(eq + 1).trim()];
    }),
);

const CLOUD_NAME = env["NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME"];
const UPLOAD_PRESET = env["NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET"];

if (!CLOUD_NAME || !UPLOAD_PRESET) {
  console.error("❌  Missing NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME or NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in .env.local");
  process.exit(1);
}

// ── 2. Find all images ────────────────────────────────────────────────────────
const IMG_DIR = path.join(ROOT, "apps", "web", "public", "images", "products");
const files = fs.readdirSync(IMG_DIR).filter((f) => /\.(jpe?g|png|webp|gif)$/i.test(f));

console.log(`\n📁  Found ${files.length} images in public/images/products/\n`);

// ── 3. Upload each file ───────────────────────────────────────────────────────
const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
const mapping = {}; // localPath → cloudinaryUrl

for (const file of files) {
  const filePath = path.join(IMG_DIR, file);
  const bytes = fs.readFileSync(filePath);
  const blob = new Blob([bytes]);

  const form = new FormData();
  form.append("file", blob, file);
  form.append("upload_preset", UPLOAD_PRESET);
  // Store in a consistent folder on Cloudinary
  form.append("folder", "urban-men/products");
  // Use the filename (without extension) as the public_id so URLs are predictable
  form.append("public_id", path.basename(file, path.extname(file)));

  process.stdout.write(`  ⬆  Uploading ${file} … `);
  try {
    const res = await fetch(uploadUrl, { method: "POST", body: form });
    const json = await res.json();
    if (!res.ok || !json.secure_url) {
      const msg = json?.error?.message ?? JSON.stringify(json);
      console.log(`❌ FAILED: ${msg}`);
      continue;
    }
    const url = json.secure_url;
    // Map both /images/products/<file> and the bare filename
    mapping[`/images/products/${file}`] = url;
    console.log(`✅ ${url}`);
  } catch (err) {
    console.log(`❌ Network error: ${err.message}`);
  }
}

// ── 4. Patch products.ts ──────────────────────────────────────────────────────
const productsPath = path.join(ROOT, "apps", "web", "src", "data", "products.ts");
let source = fs.readFileSync(productsPath, "utf8");

let patchCount = 0;
for (const [local, cloud] of Object.entries(mapping)) {
  // Replace every occurrence of the local path string with the Cloudinary URL
  const escaped = local.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const before = source;
  source = source.replace(new RegExp(escaped, "g"), cloud);
  if (source !== before) patchCount++;
}

// Also replace the dir constant if it's still pointing to the local folder
// (const dir = "/images/products") — replace it with a Cloudinary base URL
// so any future code that uses `dir` also works
const cloudBase = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/urban-men/products`;
source = source.replace(
  /const dir\s*=\s*["']\/images\/products["']/,
  `const dir = "${cloudBase}"`,
);

fs.writeFileSync(productsPath, source, "utf8");

console.log(`\n✅  Patched ${patchCount} image paths in products.ts`);
console.log(`🔗  Cloudinary base: https://res.cloudinary.com/${CLOUD_NAME}/image/upload/urban-men/products`);
console.log("\n🎉  Done! Commit the updated products.ts and deploy.\n");
