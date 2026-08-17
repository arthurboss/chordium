import { unifiedSearch } from "@chordium/scraping";
import logger from "../../utils/logger.js";
import { getSql } from "../db.js";
import type { SearchHit } from "../../../shared/types/index.js";

/**
 * Searches artists and songs together from a single query string, the same way
 * the deployed serverless function does, so local behaviour matches production
 * apart from the database being optional here.
 */
export async function performSearch(query: string): Promise<SearchHit[]> {
  const sql = await getSql();

  logger.info(
    `Searching for: "${query}" (database ${sql ? "included" : "not configured, source only"})`
  );

  const results = await unifiedSearch({ query, sql });

  logger.debug(`Found ${results.length} results`);

  return results;
}
