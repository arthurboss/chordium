// Test script to verify unified cache key generation is working
import { generateUnifiedCacheKey } from './src/storage/utils/unified-cache-key-generator.js';

console.log('Testing unified cache key generation...\n');

// Test cases that were creating duplicates
const testCases = [
  { artist: 'Natiruts', title: 'Quero Ser Feliz Também' },
  { artist: 'Natiruts', title: 'Quero ser' },
  { artist: 'The Beatles', title: 'Hey Jude' },
  { artist: 'João Vitor', title: 'Canção de Amor' }
];

testCases.forEach(({ artist, title }) => {
  const key = generateUnifiedCacheKey(artist, title);
  console.log(`Artist: "${artist}", Title: "${title}"`);
  console.log(`Cache Key: "${key}"`);
  console.log('---');
});

console.log('\nTesting the specific case from the issue:');
console.log('Expected normalized key for "Natiruts" + "Quero Ser Feliz Também":');
const normalizedKey = generateUnifiedCacheKey('Natiruts', 'Quero Ser Feliz Também');
console.log(`"${normalizedKey}"`);

console.log('\nThis should match the save operation and prevent duplicates.');
