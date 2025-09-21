"use client";

import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import type { Session, SupabaseClient, User } from '@supabase/supabase-js';

type AuthProviderProps = {
  children: React.ReactNode;
  session: (Pick<Session, 'user'> & Partial<Omit<Session, 'user'>>) | null;
};

// ================== INTERVENCIÓN QUIRÚRGICA #1: ENRIQUECER EL TIPO DEL CONTEXTO ==================
//
// Se añade la propiedad 'isAdmin' al tipo que define la "forma" de nuestro contexto.
// Esto le informa a TypeScript que el hook 'useAuth' devolverá este valor booleano.
//
type SupabaseContextType = {
  supabase: SupabaseClient;
  user: User | null;
  isAdmin: boolean; // Propiedad añadida
  isLoading: boolean;
  signOut: () => Promise<void>;
};
// ==============================================================================================

const SupabaseContext = createContext<SupabaseContextType | null>(null);

export const AuthProvider = ({ children, session }: AuthProviderProps) => {
  const [supabase] = useState(() =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  );
  
  const [user, setUser] = useState<User | null>(session?.user ?? null);
  const [isLoading, setIsLoading] = useState(session === undefined);
  const router = useRouter();

  // ================== INTERVENCIÓN QUIRÚRGICA #2: CÁLCULO DEL ESTADO DE ADMINISTRADOR ==================
  //
  // Se utiliza 'useMemo' para calcular de forma eficiente si el usuario actual es un administrador.
  // La lógica lee el 'user_role' directamente del 'user_metadata' del objeto de usuario,
  // que es donde nuestro trigger de base de datos inyecta el custom claim del JWT.
  // Este valor se recalculará automáticamente solo si el objeto 'user' cambia.
  //
  const isAdmin = useMemo(() => {
    return user?.user_metadata?.user_role === 'admin';
  }, [user]);
  // ================================================================================================

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setUser(newSession?.user ?? null);
      setIsLoading(false);
      router.refresh(); 
    });

    if (session) {
      setIsLoading(false);
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router, session]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // ================== INTERVENCIÓN QUIRÚRGICA #3: PROPORCIONAR EL NUEVO VALOR ==================
  //
  // Se añade la propiedad 'isAdmin' al objeto 'value' que se pasa al proveedor del contexto.
  // Ahora, cualquier componente que consuma 'useAuth()' tendrá acceso a este booleano.
  //
  const value: SupabaseContextType = {
    supabase,
    user,
    isAdmin, // Propiedad añadida
    isLoading,
    signOut,
  };
  // ==========================================================================================

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