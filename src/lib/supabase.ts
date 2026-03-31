import { createClient } from "@supabase/supabase-js";

type SupabaseLike = {
  auth: {
    signInWithPassword: (credentials: { email: string; password: string }) => Promise<{
      data: { user: null; session: null; weakPassword?: null };
      error: { message: string } | null;
    }>;
    signUp: (credentials: {
      email: string;
      password: string;
      options?: Record<string, unknown>;
    }) => Promise<{
      data: { user: null; session: null };
      error: { message: string } | null;
    }>;
    signOut: () => Promise<{ error: { message: string } | null }>;
  };
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase credentials missing. Auth will not work until NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env"
  );
}

const mockSupabase: SupabaseLike = {
  auth: {
    async signInWithPassword() {
      return {
        data: { user: null, session: null },
        error: { message: "Supabase credentials are missing." },
      };
    },
    async signUp() {
      return {
        data: { user: null, session: null },
        error: { message: "Supabase credentials are missing." },
      };
    },
    async signOut() {
      return {
        error: null,
      };
    },
  },
};

export const supabase = (
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : mockSupabase
) as SupabaseLike;
