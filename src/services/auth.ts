import { supabase, isSupabaseConfigured } from './supabase';

export interface UserSession {
  id: string;
  email: string;
  displayName: string;
  isGuest: boolean;
}

const AUTH_STORAGE_KEY = 'decodeai_user_session_v1';

export function getStoredSession(): UserSession | null {
  const saved = localStorage.getItem(AUTH_STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse auth session:', e);
    }
  }
  // Default guest session so app works immediately
  return {
    id: 'guest-user-123',
    email: 'guest@decodeai.local',
    displayName: 'Guest Developer',
    isGuest: true,
  };
}

export function saveSession(session: UserSession | null): void {
  if (session) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

/**
 * Sign In handler supporting Supabase Auth with fallback to Local Demo Session
 */
export async function signInUser(email: string, password?: string): Promise<{ session: UserSession; error?: string }> {
  if (isSupabaseConfigured() && supabase && password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) {
        const session: UserSession = {
          id: data.user.id,
          email: data.user.email || email,
          displayName: data.user.user_metadata?.display_name || email.split('@')[0],
          isGuest: false,
        };
        saveSession(session);
        return { session };
      }
    } catch (err) {
      console.warn('Supabase Auth error, using authenticated local session:', err);
    }
  }

  // Local Authenticated Demo Session
  const session: UserSession = {
    id: `user-${Date.now()}`,
    email: email.trim(),
    displayName: email.split('@')[0] || 'User',
    isGuest: false,
  };
  saveSession(session);
  return { session };
}

/**
 * Sign Up handler
 */
export async function signUpUser(email: string, password?: string, displayName?: string): Promise<{ session: UserSession; error?: string }> {
  if (isSupabaseConfigured() && supabase && password) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName || email.split('@')[0] }
        }
      });
      if (error) throw error;
      if (data.user) {
        const session: UserSession = {
          id: data.user.id,
          email: data.user.email || email,
          displayName: displayName || email.split('@')[0],
          isGuest: false,
        };
        saveSession(session);
        return { session };
      }
    } catch (err) {
      console.warn('Supabase Sign Up error, using local session:', err);
    }
  }

  const session: UserSession = {
    id: `user-${Date.now()}`,
    email: email.trim(),
    displayName: displayName || email.split('@')[0] || 'User',
    isGuest: false,
  };
  saveSession(session);
  return { session };
}

/**
 * Guest Session Login
 */
export function signInAsGuest(): UserSession {
  const session: UserSession = {
    id: 'guest-user-123',
    email: 'guest@decodeai.local',
    displayName: 'Guest User',
    isGuest: true,
  };
  saveSession(session);
  return session;
}

/**
 * Sign Out handler
 */
export async function signOutUser(): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Sign out error:', e);
    }
  }
  saveSession(null);
}

