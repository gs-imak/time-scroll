/**
 * Extracts ALL civilization illustration packs from zip files,
 * converts PNGs to web-optimized WebP (800px wide, ~50-100KB each).
 *
 * Usage: node scripts/extract-civilizations.mjs
 */

import { execSync } from 'child_process';
import { readdirSync, mkdirSync, existsSync, rmSync, statSync } from 'fs';
import { join, basename, extname } from 'path';
import sharp from 'sharp';
import { tmpdir } from 'os';

const SOURCE_DIR = 'C:/Users/33769/Desktop/Projects/Personal Projets Dev/Time scroll';
const DEST_DIR = 'C:/Users/33769/Desktop/Projects/Personal Projets Dev/Time scroll/time-scroll/frontend/public/assets/civilizations';
const MAX_WIDTH = 800;
const WEBP_QUALITY = 75;

// Clean destination
if (existsSync(DEST_DIR)) rmSync(DEST_DIR, { recursive: true });
mkdirSync(DEST_DIR, { recursive: true });

// Get all zip files
const zips = readdirSync(SOURCE_DIR).filter(f => f.endsWith('.zip'));
console.log(`Found ${zips.length} civilization packs\n`);

let totalImages = 0;
const manifest = {};

for (const zipFile of zips) {
  const civName = zipFile.replace('.zip', '');
  const slug = civName.toLowerCase().replace(/[& ]+/g, '-').replace(/'/g, '');
  const destPath = join(DEST_DIR, slug);
  mkdirSync(destPath, { recursive: true });

  // Extract to temp dir
  const tmpDir = join(tmpdir(), `civ-${slug}-${Date.now()}`);
  mkdirSync(tmpDir, { recursive: true });

  try {
    execSync(`unzip -q -o "${join(SOURCE_DIR, zipFile)}" -d "${tmpDir}"`, { stdio: 'pipe' });
  } catch {
    console.log(`  SKIP: ${civName} (unzip failed)`);
    continue;
  }

  // Find all PNGs
  function findPngs(dir) {
    const results = [];
    try {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
          results.push(...findPngs(fullPath));
        } else if (extname(entry.name).toLowerCase() === '.png') {
          results.push(fullPath);
        }
      }
    } catch {}
    return results;
  }

  const pngs = findPngs(tmpDir).sort();
  let converted = 0;

  for (let i = 0; i < pngs.length; i++) {
    try {
      await sharp(pngs[i])
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toFile(join(destPath, `${i + 1}.webp`));
      converted++;
    } catch {
      // Skip broken images
    }
  }

  // Cleanup temp
  try { rmSync(tmpDir, { recursive: true }); } catch {}

  totalImages += converted;
  manifest[slug] = { name: civName, count: converted };
  console.log(`  ${slug}: ${converted} images`);
}

// Write manifest
const manifestPath = join(DEST_DIR, 'manifest.json');
const fs = await import('fs');
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

console.log(`\nDone! ${totalImages} total images across ${Object.keys(manifest).length} civilizations`);
console.log(`Manifest written to ${manifestPath}`);
