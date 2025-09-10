/**
 * Shared types between frontend and backend
 * This ensures type consistency across the entire application
 */

// Domain types
export * from './domain/artist.js';
export * from './domain/song.js';
export * from './domain/song-metadata.js';
export * from './domain/chord-sheet.js';
export * from './domain/chord-sheet-content.js';

// Metadata types
export * from './metadata/note.js';
export * from './metadata/guitar-tuning.js';

// Search types
export * from './search.js';

// API types
export * from './api/requests.js';
export * from './api/responses.js';
export * from './errors.js';

// Internal types
export * from './internal/index.js';
