// hooks/use-auth.tsx
"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import type { Session, SupabaseClient, User } from '@supabase/supabase-js';

// --- MODIFICACIÓN #1: HACEMOS LA PROP DE ENTRADA MÁS FLEXIBLE ---
// Definimos un tipo que puede aceptar la sesión completa O solo el objeto de usuario.
// Esto hace que nuestro AuthProvider sea compatible con CUALQUIER método de obtención de sesión
// del lado del servidor (getSession o getUser).
type AuthProviderProps = {
  children: React.ReactNode;
  session: (Pick<Session, 'user'> & Partial<Omit<Session, 'user'>>) | null;
};

type SupabaseContextType = {
  supabase: SupabaseClient;
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

const SupabaseContext = createContext<SupabaseContextType | null>(null);

export const AuthProvider = ({ children, session }: AuthProviderProps) => {
  const [supabase] = useState(() =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  );
  
  // --- MODIFICACIÓN #2: LA LÓGICA DE INICIALIZACIÓN NO CAMBIA ---
  // El estado interno 'user' se inicializa correctamente desde la prop 'session',
  // ya sea que venga como un objeto Session completo o uno simplificado.
  const [user, setUser] = useState<User | null>(session?.user ?? null);
  
  // La carga inicial ahora es más simple: solo está cargando si no hemos recibido una sesión del servidor.
  const [isLoading, setIsLoading] = useState(session === undefined);
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setUser(newSession?.user ?? null);
      setIsLoading(false);
      // Refrescamos la ruta en cambios de estado para re-ejecutar Server Components.
      router.refresh(); 
    });

    // Aseguramos que el estado de carga se resuelva si ya hay una sesión al montar.
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