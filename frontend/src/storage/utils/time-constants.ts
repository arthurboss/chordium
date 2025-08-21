/**
 * Time constants for storage system
 * 
 * Centralized time calculations to avoid duplication and ensure consistency
 * across all storage modules.
 */

/** Milliseconds in one day */
export const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

/** Milliseconds in one hour */
export const MILLISECONDS_PER_HOUR = 60 * 60 * 1000;

/**
 * Calculate days since a timestamp
 * 
 * @param timestamp - The timestamp to compare against current time
 * @returns Number of days since the timestamp
 */
export function daysSince(timestamp: number): number {
  return (Date.now() - timestamp) / MILLISECONDS_PER_DAY;
}

/**
 * Calculate timestamp for N days ago
 * 
 * @param days - Number of days ago
 * @returns Timestamp for that many days ago
 */
export function daysAgo(days: number): number {
  return Date.now() - (days * MILLISECONDS_PER_DAY);
}

/**
 * Calculate timestamp for N days in the future
 * 
 * @param days - Number of days in the future
 * @returns Timestamp for that many days from now
 */
export function daysFromNow(days: number): number {
  return Date.now() + (days * MILLISECONDS_PER_DAY);
}
