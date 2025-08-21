/**
 * TTL (Time-To-Live) utilities and constants
 * 
 * Provides centralized TTL management for all storage systems:
 * - validation: TTL expiration checking
 * - constants: Global TTL values and limits
 * - limits: Storage limits (re-export for compatibility)
 */

export * from "./validation";
export * from "./constants";
export * from "./limits";
