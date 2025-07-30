/**
 * Access tracking module barrel export
 * 
 * Note: This module now re-exports from the main access tracking utilities
 * to maintain a clean import path. The actual implementation is centralized
 * in stores/chord-sheets/utils/access-tracking.
 */

export { updateAccess } from "../../../stores/chord-sheets/utils/access-tracking";
