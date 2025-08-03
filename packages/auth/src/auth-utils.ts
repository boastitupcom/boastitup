// packages/auth/src/auth-utils.ts
import { createServerClient, createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

export function createSupabaseServerClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {},
    }
  );
}

export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export function getAuthRedirectPath(path?: string) {
  if (path) {
    return `/auth/login?redirect=${encodeURIComponent(path)}`;
  }
  return '/auth/login';
}

export function getWorkspaceRedirectPath() {
  return '/workspace';
}