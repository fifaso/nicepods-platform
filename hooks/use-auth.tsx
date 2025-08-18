// hooks/use-auth.tsx

"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Session, SupabaseClient, User } from '@supabase/supabase-js'
import { Tables } from '@/types/supabase'

type Profile = Tables<'profiles'> & {
  role?: string | null;
  subscriptions: (Tables<'subscriptions'> & {
    plans: Tables<'plans'> | null;
  }) | null;
};

type SupabaseContextType = {
  supabase: SupabaseClient;
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
}

const SupabaseContext = createContext<SupabaseContextType | null>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setIsLoading(true);
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        if (currentUser) {
          // --- MODIFICACIÓN CLAVE: Esta consulta ahora es idéntica a la del servidor ---
          // Siempre obtenemos el perfil completo, con la suscripción y el plan anidados.
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('*, subscriptions(*, plans(*))') 
            .eq('id', currentUser.id)
            .single();
          
          setProfile(userProfile as Profile | null);
          
          // El guardián de onboarding sigue funcionando igual
          if (!userProfile && pathname !== '/welcome/select-plan' && pathname !== '/signup') {
            router.push('/welcome/select-plan');
          }

        } else {
          setProfile(null);
        }
        
        setIsLoading(false);
      }
    );

    return () => { subscription.unsubscribe(); };
  }, [supabase, pathname, router]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const value: SupabaseContextType = {
    supabase,
    user,
    profile,
    isAdmin: profile?.role === 'admin',
    isLoading,
    isAuthenticated: !!user,
    signOut,
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(SupabaseContext)
  if (context === null) { throw new Error('useAuth must be used within a AuthProvider') }
  return context
}