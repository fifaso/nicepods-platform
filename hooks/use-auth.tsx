// hooks/use-auth.tsx

"use client"
import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Session, SupabaseClient, User } from '@supabase/supabase-js'

type SupabaseContextType = {
  supabase: SupabaseClient
  user: User | null
  isLoading: boolean
  signOut: () => Promise<void>
}

const SupabaseContext = createContext<SupabaseContextType | null>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChange es la única fuente de verdad para el estado del cliente.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/'; // Redirección simple y efectiva
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
  )
}

export const useAuth = () => {
  const context = useContext(SupabaseContext)
  if (context === null) {
    throw new Error('useAuth must be used within a AuthProvider')
  }
  return context
}