// lib/supabaseClient.js
// Browser/client-side Supabase instance.
// Jargon: "client" here means the SDK object you call to talk to Supabase.
//
// Analogy: This is your “front-desk phone” to Supabase.
// TODO: Make sure env vars are set in .env.local

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // keeps user logged in via local storage
    autoRefreshToken: true,
    detectSessionInUrl: true, // handles magic-link redirect params
  },
});

// TODO: When moving to server actions / API routes that need RLS-safe access,
// use a service-role key on the server ONLY (never on the client).
