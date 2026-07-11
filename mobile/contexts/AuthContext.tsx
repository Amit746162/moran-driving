import { createContext, useContext, useEffect, useState } from 'react';

import { type Session } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'athlete' | 'coach' | 'admin';
}

interface AuthContextValue {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role: 'athlete' | 'coach',
  ) => Promise<string | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, role')
      .eq('id', userId)
      .single();
    setProfile((data as Profile) ?? null);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) loadProfile(data.session.user.id);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s) loadProfile(s.user.id);
      else setProfile(null);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const value: AuthContextValue = {
    session,
    profile,
    loading,
    async signIn(email, password) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return error?.message ?? null;
    },
    async signUp(email, password, fullName, role) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, role } },
      });
      return error?.message ?? null;
    },
    async signOut() {
      await supabase.auth.signOut();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
