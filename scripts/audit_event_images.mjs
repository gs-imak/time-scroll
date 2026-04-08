import fs from 'node:fs';

const files = [
  'frontend/src/shared/utils/constants.ts',
  'frontend/src/shared/data/newEvents.ts',
];

let total = 0;
let missing = 0;
let unsplash = 0;
let wiki = 0;
let other = 0;
const noImage = [];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  const src = fs.readFileSync(file, 'utf8');

  // Parse event entries — looking for `{ id: '...', ..., imageUrl: '...' }` patterns
  // Events are in SEED_EVENTS or NEW_EVENTS arrays, objects at depth 2 (inside array)
  const eventRe = /\{\s*id:\s*'([^']+)'[\s\S]*?\}/g;
  const entries = [];
  let match;
  while ((match = eventRe.exec(src)) !== null) {
    const entry = match[0];
    const id = match[1];
    const urlMatch = entry.match(/imageUrl:\s*'([^']*)'/);
    entries.push({ id, url: urlMatch ? urlMatch[1] : null, file });
  }

  for (const e of entries) {
    total++;
    if (!e.url) { missing++; noImage.push(e.id); continue; }
    if (e.url.includes('unsplash')) unsplash++;
    else if (e.url.includes('wikimedia')) wiki++;
    else other++;
  }
}

console.log(`Total events: ${total}`);
console.log(`  Wikipedia: ${wiki}`);
console.log(`  Unsplash:  ${unsplash}`);
console.log(`  Other:     ${other}`);
console.log(`  No image:  ${missing}`);
if (noImage.length > 0) {
  console.log(``);
  console.log(`Events with no imageUrl (${noImage.length}):`);
  console.log(JSON.stringify(noImage.slice(0, 30), null, 2));
}
