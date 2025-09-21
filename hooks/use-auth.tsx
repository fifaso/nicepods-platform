"use client";

import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import type { Session, SupabaseClient, User } from '@supabase/supabase-js';

type AuthProviderProps = {
  children: React.ReactNode;
  session: (Pick<Session, 'user'> & Partial<Omit<Session, 'user'>>) | null;
};

type SupabaseContextType = {
  supabase: SupabaseClient;
  user: User | null;
  isAdmin: boolean;
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
  
  const [user, setUser] = useState<User | null>(session?.user ?? null);
  const [isLoading, setIsLoading] = useState(session === undefined);
  const router = useRouter();

  const isAdmin = useMemo(() => {
    return user?.user_metadata?.user_role === 'admin';
  }, [user]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setUser(newSession?.user ?? null);
      setIsLoading(false);
      
      // ================== INTERVENCIÓN QUIRÚRGICA: ELIMINACIÓN DEL LOOP ==================
      //
      // Se ha eliminado la llamada a `router.refresh()`.
      //
      // JUSTIFICACIÓN ESTRATÉGICA: Esta línea causaba un ciclo infinito de
      // re-renderizado al hacer que el AuthProvider se desmontara y montara
      // repetidamente en cada cambio de estado de autenticación. El estado local
      // 'user' ya se actualiza a través de 'setUser', lo que es suficiente para
      // que la UI reaccione. Eliminar esta línea rompe el ciclo y estabiliza la aplicación.
      //
      // router.refresh(); // LÍNEA CRÍTICA ELIMINADA
      // ==================================================================================
    });

    if (session) {
      setIsLoading(false);
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth, session]); // Se elimina 'router' de las dependencias para evitar re-ejecuciones innecesarias.

  const signOut = async () => {
    await supabase.auth.signOut();
    // Se añade una redirección explícita al hacer logout para una mejor experiencia de usuario.
    router.push('/');
  };

  const value: SupabaseContextType = {
    supabase,
    user,
    isAdmin,
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