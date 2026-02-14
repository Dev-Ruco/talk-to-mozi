import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = "https://cmxhvptjfezxjjrrlwgx.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNteGh2cHRqZmV6eGpqcnJsd2d4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNTc0OTgsImV4cCI6MjA4NjYzMzQ5OH0.BSJdJ5wQOdxPqgujdiysNxBgUezxr3VQULlfiajFJwA";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
