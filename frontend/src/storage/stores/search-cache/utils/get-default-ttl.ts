import type { DataSource } from "@chordium/types";
import { TTL } from "../../../core/ttl/constants";

/**
 * Get default TTL for data source
 * 
 * Returns appropriate cache TTL based on data source reliability and performance requirements:
 * - All sources: 30 days (performance prioritized over freshness)
 * - CifraClub: Static content, scraping minimized, future cron jobs will handle updates
 */
export function getDefaultTTL(dataSource: DataSource): number {
  switch (dataSource) {
    case "supabase":
      return TTL.SEARCH_CACHE.SUPABASE;
    case "s3":
      return TTL.SEARCH_CACHE.S3;
    case "cifraclub":
      return TTL.SEARCH_CACHE.CIFRACLUB;
    default:
      return TTL.SEARCH_CACHE.DEFAULT;
  }
}
