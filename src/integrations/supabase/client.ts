import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = "https://kwwzfhpamciilgmknsov.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3d3pmaHBhbWNpaWxnbWtuc292Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxNDM2MTksImV4cCI6MjA4NTcxOTYxOX0.ayBcKlQcbyfd58aWwIm7uGzxPus2fZtkuc5UbGg-Ik0";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
