import fs from 'node:fs';

const src = fs.readFileSync('frontend/src/shared/data/civDescriptions.ts', 'utf8');

// Parse each entry and output its key -> url
function findEntries(src) {
  const entries = [];
  let i = 0;
  let inCivObject = false;
  let inNameObject = false;
  let depth = 0;

  while (i < src.length) {
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

    if ((inCivObject || inNameObject) && depth === 1) {
      if (i === 0 || src[i - 1] === '\n') {
        const lineEnd = src.indexOf('\n', i);
        const line = src.slice(i, lineEnd);
        const keyMatch = line.match(/^  (['"]?)([A-Za-z][A-Za-z0-9_ '\-\u00C0-\u017F]*)\1:\s*\{/);
        if (keyMatch) {
          const key = keyMatch[2];
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
          const urlMatch = entryBody.match(/imageUrl:\s*'([^']*)'/);
          if (urlMatch && urlMatch[1].includes('upload.wikimedia.org')) {
            entries.push({ key, url: urlMatch[1] });
          }
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
console.log(`Found ${entries.length} Wikipedia URLs to test.`);
fs.writeFileSync('scripts/urls_to_test.json', JSON.stringify(entries, null, 2));
console.log(`Written to scripts/urls_to_test.json`);
