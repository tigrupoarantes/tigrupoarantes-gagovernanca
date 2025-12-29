
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';

async function withTimeout<T>(promise: PromiseLike<T>, ms: number, label: string): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`Timeout (${ms}ms) em ${label}`)), ms);
  });

  try {
    return await Promise.race([Promise.resolve(promise), timeoutPromise]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}
export const useAuth = () => {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined); 
  const [loading, setLoading] = useState(true);
  const inFlightProfileFetch = useRef<Promise<void> | null>(null);

  const fetchProfile = async (user: any) => {
    if (!user?.id) {
      setProfile(null);
      setLoading(false);
      return;
    }

    if (inFlightProfileFetch.current) return inFlightProfileFetch.current;

    setLoading(true);

    inFlightProfileFetch.current = (async () => {
      try {
        // eslint-disable-next-line no-console
        console.debug('[Auth] fetchProfile start', { userId: user?.id });

        const { data, error } = await withTimeout(
          supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle(),
          15000,
          'profiles.select(maybeSingle)'
        );

        if (error) {
          console.error("Erro ao buscar perfil (verifique se a coluna 'user_id' existe):", error);
          setProfile(null);
          return;
        }

        if (data) {
          setProfile(data as Profile);
          return;
        }

        const fullName =
          user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0];

        const newProfile = {
          user_id: user.id,
          full_name: fullName,
          role: 'viewer',
          active: false,
          avatar_url: user.user_metadata?.avatar_url || `https://picsum.photos/seed/${user.id}/100`,
        };

        const { data: createdData, error: insertError } = await withTimeout(
          supabase
            .from('profiles')
            .insert([newProfile])
            .select()
            .maybeSingle(),
          15000,
          'profiles.insert(select maybeSingle)'
        );

        if (insertError) {
          console.error('Erro na auto-criação do perfil:', insertError.message);
          setProfile(null);
          return;
        }

        setProfile((createdData as Profile) ?? null);
      } catch (err: any) {
        console.error('Exceção em fetchProfile:', err);
        setProfile(null);
      } finally {
        setLoading(false);
        inFlightProfileFetch.current = null;
        // eslint-disable-next-line no-console
        console.debug('[Auth] fetchProfile end');
      }
    })();

    return inFlightProfileFetch.current;
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session: initialSession } } = await withTimeout(
          supabase.auth.getSession(),
          15000,
          'supabase.auth.getSession'
        );
        setSession(initialSession);
        if (initialSession) {
          await fetchProfile(initialSession.user);
        } else {
          setProfile(null);
          setLoading(false);
        }
      } catch (err) {
        console.error("Erro na inicialização do Auth:", err);
        setProfile(null);
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      if (newSession) {
        await fetchProfile(newSession.user);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  };

  return { session, profile, loading, signOut };
};
