import fs from 'node:fs';

const src = fs.readFileSync('frontend/src/shared/data/civDescriptions.ts', 'utf8');

// Parse the file to find each top-level entry and check if it has imageUrl
function findEntries(src) {
  const entries = [];
  let i = 0;
  let inCivObject = false;
  let inNameObject = false;
  let depth = 0;

  while (i < src.length) {
    // Track object entry start
    if (src.slice(i, i + 20).includes('CIV_DESCRIPTIONS:')) {
      inCivObject = true;
      i += 20;
      continue;
    }
    if (src.slice(i, i + 20).includes('NAME_DESCRIPTIONS:')) {
      inCivObject = false;
      inNameObject = true;
      i += 20;
      continue;
    }

    // At depth 1 inside either object, look for key declaration
    if ((inCivObject || inNameObject) && depth === 1) {
      // Check if line starts with 2 spaces + key
      if (i === 0 || src[i - 1] === '\n') {
        const lineEnd = src.indexOf('\n', i);
        const line = src.slice(i, lineEnd);
        const keyMatch = line.match(/^  (['"]?)([A-Za-z][A-Za-z0-9_ '\-\u00C0-\u017F]*)\1:\s*\{/);
        if (keyMatch) {
          const key = keyMatch[2];
          // Find matching brace
          let braceStart = line.indexOf('{');
          let localDepth = 0;
          let inString = false;
          let stringChar = '';
          let escape = false;
          let j = i + braceStart;
          for (; j < src.length; j++) {
            const c = src[j];
            if (inString) {
              if (escape) { escape = false; continue; }
              if (c === '\\') { escape = true; continue; }
              if (c === stringChar) inString = false;
              continue;
            }
            if (c === "'" || c === '"' || c === '`') {
              inString = true;
              stringChar = c;
              continue;
            }
            if (c === '{') localDepth++;
            else if (c === '}') {
              localDepth--;
              if (localDepth === 0) break;
            }
          }
          const entryBody = src.slice(i + braceStart, j + 1);
          const hasImageUrl = /imageUrl:\s*'[^']*'/.test(entryBody);
          const urlMatch = entryBody.match(/imageUrl:\s*'([^']*)'/);
          entries.push({
            key,
            source: inCivObject ? 'CIV' : 'NAME',
            hasImageUrl,
            url: urlMatch ? urlMatch[1] : null,
            bodyLen: entryBody.length,
          });
          i = j + 1;
          continue;
        }
      }
    }

    const c = src[i];
    if (c === '{') depth++;
    else if (c === '}') depth--;
    i++;
  }

  return entries;
}

const entries = findEntries(src);
const withoutImage = entries.filter((e) => !e.hasImageUrl);
const unsplashEntries = entries.filter((e) => e.hasImageUrl && e.url && e.url.includes('unsplash'));
const wikipediaEntries = entries.filter((e) => e.hasImageUrl && e.url && e.url.includes('wikimedia'));

console.log(`Total entries: ${entries.length}`);
console.log(`  Wikipedia: ${wikipediaEntries.length}`);
console.log(`  Unsplash:  ${unsplashEntries.length}`);
console.log(`  None:      ${withoutImage.length}`);
console.log(``);
console.log(`Entries WITHOUT any imageUrl (${withoutImage.length}):`);
console.log(JSON.stringify(withoutImage.map((e) => e.key), null, 2));
console.log(``);
console.log(`Entries still on Unsplash (${unsplashEntries.length}):`);
console.log(JSON.stringify(unsplashEntries.map((e) => e.key), null, 2));
