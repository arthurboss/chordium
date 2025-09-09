/**
 * IndexedDB database configuration constants
 *
 * Centralizes database name and version settings to ensure consistency
 * across all database operations and prevent magic numbers.
 */

/**
 * Name of the IndexedDB database
 *
 * Used by both chord-sheets and search-cache stores to ensure
 * they operate on the same database instance.
 * Versioned for future migration support.
 */
export const DB_NAME = "chordium-v1";

/**
 * Version of the IndexedDB database schema
 *
 * Increment this when making schema changes (adding/removing stores, indexes, etc.)
 * to trigger the onupgradeneeded event for migration.
 */
export const DB_VERSION = 3;
