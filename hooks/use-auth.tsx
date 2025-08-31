// hooks/use-auth.tsx
"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import type { Session, SupabaseClient, User } from '@supabase/supabase-js';

// MEJORA: Simplificamos el contexto. Solo expondrá lo esencial.
type SupabaseContextType = {
  supabase: SupabaseClient;
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

const SupabaseContext = createContext<SupabaseContextType | null>(null);

export const AuthProvider = ({ children, session }: { children: React.ReactNode; session: Session | null }) => {
  const [supabase] = useState(() =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  );
  
  const [user, setUser] = useState<User | null>(session?.user ?? null);
  const [isLoading, setIsLoading] = useState(session === null); // La carga termina cuando la sesión inicial está confirmada.
  const router = useRouter();

  useEffect(() => {
    // Este useEffect ahora solo se preocupa de los cambios de estado de autenticación.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      setUser(newSession?.user ?? null);
      setIsLoading(false);

      if (event === 'SIGNED_OUT') {
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value: SupabaseContextType = {
    supabase,
    user,
    isLoading,
    signOut,
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(SupabaseContext);
  if (context === null) { 
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}