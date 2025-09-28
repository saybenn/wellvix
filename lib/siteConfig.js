// Centralized site data loader. Starts from /data/*.json and can swap to Supabase later.
import siteData from "../data/site.json";

export const site = {
  ...siteData,
};

/**
 * Example async fetcher (placeholder).
 * Swap this to Supabase later:
 *  import { createClient } from '@supabase/supabase-js';
 *  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
 *  const { data } = await supabase.from('site').select('*').single();
 */
export async function loadSite() {
  // For now, static JSON
  return site;
}
