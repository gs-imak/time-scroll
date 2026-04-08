import fs from 'node:fs';
const src = fs.readFileSync('frontend/src/shared/data/civDescriptions.ts', 'utf8');
// Find all top-level entries with Unsplash URLs
const lines = src.split('\n');
let depth = 0;
let inObj = false;
let currentKey = null;
let remaining = [];
for (const line of lines) {
  if (line.includes('CIV_DESCRIPTIONS:') || line.includes('NAME_DESCRIPTIONS:')) inObj = true;
  if (inObj && depth === 1) {
    const m = line.match(/^  (['"]?)([A-Za-z][A-Za-z0-9_ '\-\u00C0-\u017F]*)\1:\s*\{/);
    if (m) currentKey = m[2];
  }
  if (currentKey && line.includes('images.unsplash.com')) {
    remaining.push(currentKey);
    currentKey = null;
  }
  for (const c of line) {
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth <= 1) currentKey = null;
    }
  }
}
console.log(`Remaining Unsplash entries: ${remaining.length}`);
console.log(JSON.stringify(remaining, null, 2));
