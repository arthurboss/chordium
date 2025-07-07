import { generateUnifiedCacheKey } from './src/storage/utils/unified-cache-key-generator';
import { generateChordSheetId } from './src/utils/chord-sheet-id-generator';

const testCases = [
  ['Natiruts', 'Quero Ser Feliz Também'],
  ['CPM 22', 'Dias Atrás'],
  ['AC/DC', 'Back in Black'],
  ['Oasis', 'Wonderwall']
];

console.log('Comparing cache key generators...\n');

testCases.forEach(([artist, title]) => {
  const unified = generateUnifiedCacheKey(artist, title);
  const chordSheetId = generateChordSheetId(artist, title);
  const match = unified === chordSheetId ? '✅' : '❌';
  console.log(`${match} ${artist} - ${title}`);
  console.log(`  Unified: ${unified}`);
  console.log(`  ChordId: ${chordSheetId}`);
  console.log('');
});
