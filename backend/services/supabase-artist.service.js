// Supabase artist search service
import { createClient } from '@supabase/supabase-js';
import config from '../config/config.js';

const supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey);

async function searchArtistsInSupabase(query) {
  return supabase
    .from('artists')
    .select('*')
    .ilike('displayName', `%${query}%`);
}

export { searchArtistsInSupabase };
