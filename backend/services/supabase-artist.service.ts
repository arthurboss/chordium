// Supabase artist search service
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import config from '../config/config.js';
import type { Artist } from '../../shared/types/domain/artist.js';

interface SupabaseResponse<T> {
  data: T[] | null;
  error: any;
}

let supabase: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    if (!config.supabase.url || !config.supabase.serviceRoleKey) {
      throw new Error('Supabase configuration is missing');
    }
    supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey);
  }
  return supabase;
}

async function searchArtistsInSupabase(query: string): Promise<SupabaseResponse<Artist>> {
  const client = getSupabaseClient();
  return client
    .from('artists')
    .select('*')
    .ilike('displayName', `%${query}%`);
}

export { searchArtistsInSupabase };
