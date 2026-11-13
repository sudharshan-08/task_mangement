import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { UserProfile } from '@/types/task';

const DEMO_USER_STORAGE_KEY = 'taskflow_demo_user';
const DEMO_COOKIE_NAME = 'taskflow_demo_session';

export const DEMO_USER: UserProfile = {
  id: 'demo-user-1111-2222-3333-444444444444',
  name: 'Alex Morgan',
  email: 'alex.morgan@example.com',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
};

export async function signInWithGoogle(): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    // If Supabase credentials are not configured yet, notify user or start demo
    return {
      success: false,
      error: 'Supabase credentials are not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local, or use Demo Mode to test.',
    };
  }

  try {
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'An unexpected error occurred during Google sign in.' };
  }
}

export function startDemoSession(): UserProfile {
  if (typeof window !== 'undefined') {
    localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(DEMO_USER));
    // Set cookie so Next.js middleware knows demo user is authenticated
    document.cookie = `${DEMO_COOKIE_NAME}=true; path=/; max-age=86400; SameSite=Lax`;
  }
  return DEMO_USER;
}

export async function signOut(): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(DEMO_USER_STORAGE_KEY);
    document.cookie = `${DEMO_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error during Supabase signOut:', err);
    }
  }
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  // Check demo session first
  const demoData = localStorage.getItem(DEMO_USER_STORAGE_KEY);
  if (demoData) {
    try {
      return JSON.parse(demoData) as UserProfile;
    } catch {
      localStorage.removeItem(DEMO_USER_STORAGE_KEY);
    }
  }

  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const supabase = createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    const metadata = user.user_metadata || {};
    return {
      id: user.id,
      email: user.email || '',
      name: metadata.full_name || metadata.name || user.email?.split('@')[0] || 'User',
      avatar_url: metadata.avatar_url || metadata.picture,
    };
  } catch (err) {
    console.error('Failed to get current user:', err);
    return null;
  }
}
