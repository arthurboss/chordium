console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('VITEST:', process.env.VITEST);
console.log('typeof process:', typeof process);

const isTestEnvironment = typeof process !== 'undefined' && process.env.NODE_ENV === 'test';
const isVitestRunning = typeof process !== 'undefined' && process.env.VITEST === 'true';
const shouldLog = !isTestEnvironment && !isVitestRunning;

console.log('isTestEnvironment:', isTestEnvironment);
console.log('isVitestRunning:', isVitestRunning);
console.log('shouldLog:', shouldLog);
