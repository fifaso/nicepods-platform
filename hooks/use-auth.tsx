// hooks/use-auth.tsx
// VERSIÓN FINAL REFORZADA CON SINCRONIZACIÓN DE SESIÓN SERVER-CLIENT

"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Session, User } from "@supabase/supabase-js";
import type { Tables } from "@/types/supabase";

type Profile = Tables<'profiles'>;

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
  supabase: ReturnType<typeof createClient>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// [INTERVENCIÓN ARQUITECTÓNICA #1]: El AuthProvider ahora acepta la sesión inicial del servidor.
export function AuthProvider({ session: initialSession, children }: { session: Session | null; children: React.ReactNode; }) {
  const supabase = createClient();
  
  // [INTERVENCIÓN ARQUITECTÓNICA #2]: El estado se inicializa con los datos del servidor, no con null.
  const [session, setSession] = useState<Session | null>(initialSession);
  const [user, setUser] = useState<User | null>(initialSession?.user || null);
  const [profile, setProfile] = useState<Profile | null>(null);
  // La carga inicial ahora solo se activa si el servidor no nos dio una sesión.
  const [isLoading, setIsLoading] = useState(!initialSession);

  useEffect(() => {
    let mounted = true;
    
    // Función para obtener el perfil del usuario actual.
    async function getProfile(currentUser: User | null) {
      if (currentUser) {
        const { data: userProfile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single();
        
        if (mounted) {
          if (error) {
            console.error("Error fetching user profile:", error);
            setProfile(null);
          } else {
            setProfile(userProfile);
          }
        }
      } else {
        if (mounted) setProfile(null);
      }
    }

    // Obtenemos el perfil para la sesión inicial si existe.
    getProfile(session?.user || null).finally(() => {
      if (mounted) setIsLoading(false);
    });

    // El listener de onAuthStateChange se mantiene para actualizaciones en tiempo real (login/logout en otra pestaña).
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        if (mounted) {
          setSession(newSession);
          const currentUser = newSession?.user || null;
          setUser(currentUser);
          getProfile(currentUser); // Obtenemos el perfil para la nueva sesión.
        }
      }
    );
    
    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [supabase]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  const isAdmin = profile?.role === 'admin';

  const value = { session, user, profile, isAdmin, isLoading, signOut, supabase };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}