import fs from 'node:fs';

const target = 'frontend/src/shared/data/civDescriptions.ts';

const IMAGE_MAP = {
  rome: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Colosseo_2020.jpg/960px-Colosseo_2020.jpg',
  byzantium: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Hagia_Sophia_%28228968325%29.jpeg/960px-Hagia_Sophia_%28228968325%29.jpeg',
  hre: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Brandenburger_Tor_abends.jpg/960px-Brandenburger_Tor_abends.jpg',
  persia: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Gate_of_All_Nations%2C_Persepolis.jpg/960px-Gate_of_All_Nations%2C_Persepolis.jpg',
  china: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/The_Great_Wall_of_China_at_Jinshanling-edit.jpg/960px-The_Great_Wall_of_China_at_Jinshanling-edit.jpg',
  greece: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/1029_Acropolis_of_Athens_in_Greece_at_night_Photo_by_Giles_Laurent.jpg/960px-1029_Acropolis_of_Athens_in_Greece_at_night_Photo_by_Giles_Laurent.jpg',
  egypt: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Great_Pyramid_of_Giza_-_Pyramid_of_Khufu.jpg/960px-Great_Pyramid_of_Giza_-_Pyramid_of_Khufu.jpg',
  mongolia: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Genghis_Khan_Equestrian_Statue%2C_photo_by_Vaiz_Ha.jpg/960px-Genghis_Khan_Equestrian_Statue%2C_photo_by_Vaiz_Ha.jpg',
  ottoman: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Istanbul_%2834223582516%29_%28cropped%29.jpg/960px-Istanbul_%2834223582516%29_%28cropped%29.jpg',
  arab_caliphates: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Isfahan_Royal_Mosque_general_%28retouched%29.jpg/960px-Isfahan_Royal_Mosque_general_%28retouched%29.jpg',
  britain: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Houses_of_Parliament_in_2022_%28cropped%29.jpg/960px-Houses_of_Parliament_in_2022_%28cropped%29.jpg',
  france: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg/960px-Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg',
  spain: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Dawn_Charles_V_Palace_Alhambra_Granada_Andalusia_Spain.jpg/960px-Dawn_Charles_V_Palace_Alhambra_Granada_Andalusia_Spain.jpg',
  india: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Taj_Mahal_%28Edited%29.jpeg/960px-Taj_Mahal_%28Edited%29.jpeg',
  japan: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Himeji_castle_in_may_2015.jpg/960px-Himeji_castle_in_may_2015.jpg',
  vikings: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Osebergskipet_2016.jpg/960px-Osebergskipet_2016.jpg',
  aztecs: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Templo_Mayor_50.jpg/960px-Templo_Mayor_50.jpg',
  phoenicia: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Byblos_Libanon_2003.JPG/960px-Byblos_Libanon_2003.JPG',
  khmer: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Buddhist_monks_in_front_of_the_Angkor_Wat.jpg/960px-Buddhist_monks_in_front_of_the_Angkor_Wat.jpg',
  babylon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Berl%C3%ADn%2C_Museo_de_P%C3%A9rgamo_05.jpg/960px-Berl%C3%ADn%2C_Museo_de_P%C3%A9rgamo_05.jpg',
  kush: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/NubianMeroePyramids30sep2005%282%29.jpg/960px-NubianMeroePyramids30sep2005%282%29.jpg',
  inca: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Machu_Picchu%2C_2023_%28012%29.jpg/960px-Machu_Picchu%2C_2023_%28012%29.jpg',
  maya: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Chichen_Itza_3.jpg/960px-Chichen_Itza_3.jpg',
  carthage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Montage_ville_de_Carthage.png/960px-Montage_ville_de_Carthage.png',
  mali: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Djenne_great_mud_mosque.jpg/960px-Djenne_great_mud_mosque.jpg',
  songhai: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Askia.jpg/960px-Askia.jpg',
  Sweden: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/The_Vasa_from_the_Bow.jpg/960px-The_Vasa_from_the_Bow.jpg',
  Portugal: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Torre_Bel%C3%A9m_April_2009-4a.jpg/960px-Torre_Bel%C3%A9m_April_2009-4a.jpg',
  Denmark: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Kronborg_002.JPG/960px-Kronborg_002.JPG',
  Poland: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Wawel_%284%29.jpg/960px-Wawel_%284%29.jpg',
  Prussia: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Brandenburger_Tor_abends.jpg/960px-Brandenburger_Tor_abends.jpg',
  Venice: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Venezia_Basilica_di_San_Marco_Fassade_2.jpg/960px-Venezia_Basilica_di_San_Marco_Fassade_2.jpg',
  'Papal States': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Basilica_di_San_Pietro_in_Vaticano_September_2015-1a.jpg/960px-Basilica_di_San_Pietro_in_Vaticano_September_2015-1a.jpg',
  Italy: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Theathres_of_Pompeii.jpg/960px-Theathres_of_Pompeii.jpg',
  'Austrian Empire': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Wien_-_Schloss_Sch%C3%B6nbrunn.JPG/960px-Wien_-_Schloss_Sch%C3%B6nbrunn.JPG',
  'Angevin Empire': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Edinburgh_Castle_-_aerial_-_2025-04-19_03.jpg/960px-Edinburgh_Castle_-_aerial_-_2025-04-19_03.jpg',
  Hittites: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Lion_Gate%2C_Hattusa_13_%28cropped%29.jpg/960px-Lion_Gate%2C_Hattusa_13_%28cropped%29.jpg',
  Assyria: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Iraqi_Museum.jpg/960px-Iraqi_Museum.jpg',
  Urartu: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Van_castle%2C_Turkey.jpg/960px-Van_castle%2C_Turkey.jpg',
  Thrace: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/National_Archaeological_Museum_Sofia_-_Bronze_Head_from_the_Golyama_Kosmatka_Tumulus_near_Shipka.jpg/960px-National_Archaeological_Museum_Sofia_-_Bronze_Head_from_the_Golyama_Kosmatka_Tumulus_near_Shipka.jpg',
  'Kingdom of David and Solomon': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Westernwall2.jpg/960px-Westernwall2.jpg',
  Minoan: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Knossos_-_North_Portico_02.jpg/960px-Knossos_-_North_Portico_02.jpg',
  Olmec: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/San_Lorenzo_Monument_4_crop.jpg/960px-San_Lorenzo_Monument_4_crop.jpg',
  'Indus valley civilization': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Mohenjodaro_-_view_of_the_stupa_mound.JPG/960px-Mohenjodaro_-_view_of_the_stupa_mound.JPG',
  'Nabatean Kingdom': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Treasury_petra_crop.jpeg/960px-Treasury_petra_crop.jpeg',
  Babylonia: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Ishtar_Gate.jpg/960px-Ishtar_Gate.jpg',
  Cycladic: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Cycladic_idol_02.JPG/960px-Cycladic_idol_02.JPG',
  Mycenaean: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Lion_Gate_-_Mycenae_by_Joy_of_Museums.jpg/960px-Lion_Gate_-_Mycenae_by_Joy_of_Museums.jpg',
  'Teotihuac\u00e1n': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Teotihuac%C3%A1n-5973.JPG/960px-Teotihuac%C3%A1n-5973.JPG',
  'Monte Alb\u00e1n': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Monte_Alban_West_Side_Platform.jpg/960px-Monte_Alban_West_Side_Platform.jpg',
  'Rapa Nui': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/AhuTongariki.JPG/960px-AhuTongariki.JPG',
  Polynesians: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Easter_Island_5.jpg/960px-Easter_Island_5.jpg',
  Benin: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Benin_brass_plaque_03_%28cropped%29.jpg/960px-Benin_brass_plaque_03_%28cropped%29.jpg',
  Ethiopia: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Lalibela%2C_san_giorgio%2C_esterno_24.jpg/960px-Lalibela%2C_san_giorgio%2C_esterno_24.jpg',
  Morocco: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Marokko0112_%28retouched%29.jpg/960px-Marokko0112_%28retouched%29.jpg',
  Korea: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/%EA%B4%91%ED%99%94%EB%AC%B8_%EC%9B%94%EB%8C%80.jpg/960px-%EA%B4%91%ED%99%94%EB%AC%B8_%EC%9B%94%EB%8C%80.jpg',
  Tibet: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Potala_Palace_HQ.jpg/960px-Potala_Palace_HQ.jpg',
  'Srivijaya Empire': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Pradaksina.jpg/960px-Pradaksina.jpg',
  Simhala: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Sigiriya_%28141688197%29.jpeg/960px-Sigiriya_%28141688197%29.jpeg',
  Champa: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/2024_-_M%E1%BB%B9_S%C6%A1n_Group_B%2C_C_and_D_-_img_23.jpg/960px-2024_-_M%E1%BB%B9_S%C6%A1n_Group_B%2C_C_and_D_-_img_23.jpg',
  Ayutthaya: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Three_Chedi%28s%29_of_Wat_Phra_Si_Sanphet.jpg/960px-Three_Chedi%28s%29_of_Wat_Phra_Si_Sanphet.jpg',
  'Mauryan Empire': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/East_Gateway_-_Stupa_1_-_Sanchi_Hill_2013-02-21_4398.JPG/960px-East_Gateway_-_Stupa_1_-_Sanchi_Hill_2013-02-21_4398.JPG',
  'Ptolemaic Kingdom': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Temple_de_Louxor_68.jpg/960px-Temple_de_Louxor_68.jpg',
  'Seleucid Kingdom': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Persepolis001.jpg/960px-Persepolis001.jpg',
  Yemen: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/%D9%85%D8%AF%D9%8A%D9%86%D8%A9_%D8%B4%D8%A8%D8%A7%D9%85_%D8%AD%D8%B6%D8%B1%D9%85%D9%88%D8%AA.jpg/960px-%D9%85%D8%AF%D9%8A%D9%86%D8%A9_%D8%B4%D8%A8%D8%A7%D9%85_%D8%AD%D8%B6%D8%B1%D9%85%D9%88%D8%AA.jpg',
  Hadramaut: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/%D9%85%D8%AF%D9%8A%D9%86%D8%A9_%D8%B4%D8%A8%D8%A7%D9%85_%D8%AD%D8%B6%D8%B1%D9%85%D9%88%D8%AA.jpg/960px-%D9%85%D8%AF%D9%8A%D9%86%D8%A9_%D8%B4%D8%A8%D8%A7%D9%85_%D8%AD%D8%B6%D8%B1%D9%85%D9%88%D8%AA.jpg',
  Oman: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Oman_Day1-031_%288479730123%29.jpg/960px-Oman_Day1-031_%288479730123%29.jpg',
  'Expansionist Kingdom of Merina': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Reconstructed_Rova_Antananarivo_Madagascar.jpg/960px-Reconstructed_Rova_Antananarivo_Madagascar.jpg',
  'United States': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Front_view_of_Statue_of_Liberty_%28cropped%29.jpg/960px-Front_view_of_Statue_of_Liberty_%28cropped%29.jpg',
  'Eastern North Amercian hunter-gatherers': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/The_Great_Serpent_Mound.jpg/960px-The_Great_Serpent_Mound.jpg',
};

let src = fs.readFileSync(target, 'utf8');
let replacedCount = 0;
let insertedCount = 0;
const hitKeys = new Set();

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Find the start index of a top-level entry by key in the source. */
function findEntryStart(haystack, key) {
  // Quoted or unquoted
  const unquoted = new RegExp(`^  (${escapeRegex(key)}):\\s*\\{`, 'm');
  const quoted = new RegExp(`^  (['"])${escapeRegex(key)}\\1:\\s*\\{`, 'm');
  const m1 = haystack.match(unquoted);
  if (m1 && m1.index !== undefined) return m1.index;
  const m2 = haystack.match(quoted);
  if (m2 && m2.index !== undefined) return m2.index;
  return -1;
}

/** Find the matching closing brace + comma for an entry that starts at `start`.
 *  Walks through the string counting braces, respecting strings and escapes.
 *  Returns the index immediately after the closing `}` (not the comma). */
function findEntryEnd(haystack, start) {
  // Find the opening `{` on the starting line
  let i = start;
  while (i < haystack.length && haystack[i] !== '{') i++;
  if (i >= haystack.length) return -1;
  let depth = 0;
  let inString = false;
  let stringChar = '';
  let escape = false;
  for (; i < haystack.length; i++) {
    const c = haystack[i];
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
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) return i + 1;
    }
  }
  return -1;
}

for (const [key, url] of Object.entries(IMAGE_MAP)) {
  const start = findEntryStart(src, key);
  if (start < 0) continue;
  const end = findEntryEnd(src, start);
  if (end < 0) continue;

  const entry = src.slice(start, end);
  let newEntry;

  if (/imageUrl:\s*'[^']*'/.test(entry)) {
    newEntry = entry.replace(/imageUrl:\s*'[^']*'/, `imageUrl: '${url}'`);
    replacedCount++;
  } else {
    // Insert imageUrl before the final `}`. Ensure preceding content has a comma.
    // Entry ends with `}`, so we back up to find the last non-whitespace char
    // before it and ensure a comma.
    let beforeCloseEnd = entry.length - 1; // position of '}'
    // Back up across whitespace
    let before = beforeCloseEnd - 1;
    while (before >= 0 && /\s/.test(entry[before])) before--;
    const lastChar = entry[before];
    let insertion;
    if (lastChar === ',') {
      insertion = ` imageUrl: '${url}',`;
    } else {
      // Add a comma before the imageUrl
      insertion = `, imageUrl: '${url}'`;
    }
    newEntry = entry.slice(0, before + 1) + insertion + entry.slice(before + 1);
    insertedCount++;
  }

  src = src.slice(0, start) + newEntry + src.slice(end);
  hitKeys.add(key);
}

fs.writeFileSync(target, src, 'utf8');
console.log(`Replaced ${replacedCount} existing imageUrls.`);
console.log(`Inserted ${insertedCount} missing imageUrls.`);
console.log(`Total hits: ${hitKeys.size} / ${Object.keys(IMAGE_MAP).length}`);
const missed = Object.keys(IMAGE_MAP).filter((k) => !hitKeys.has(k));
if (missed.length > 0) {
  console.log(`Missed keys (${missed.length}):`, missed);
}
