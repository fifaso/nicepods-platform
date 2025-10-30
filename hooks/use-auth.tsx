// hooks/use-auth.tsx
// VERSIÓN FINAL REFORZADA CON DATOS DEL PERFIL INTEGRADOS

"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Session, User } from "@supabase/supabase-js";
import type { Tables } from "@/types/supabase";

// Se define un tipo para el perfil completo
type Profile = Tables<'profiles'>;

// Se actualiza el tipo del contexto para incluir el perfil
interface AuthContextType {
  user: User | null;
  profile: Profile | null; // Nuevo
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
  supabase: ReturnType<typeof createClient>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Se actualiza el tipo de las props para aceptar la sesión inicial
export function AuthProvider({ session: initialSession, children }: { session: Session | null; children: React.ReactNode; }) {
  const supabase = createClient();
  const [session, setSession] = useState<Session | null>(initialSession);
  const [user, setUser] = useState<User | null>(initialSession?.user || null);
  const [profile, setProfile] = useState<Profile | null>(null); // Nuevo estado para el perfil
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    async function fetchSessionAndProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (mounted) {
        setSession(session);
        const currentUser = session?.user || null;
        setUser(currentUser);

        // Si hay un usuario, obtenemos su perfil
        if (currentUser) {
          const { data: userProfile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();
            
          if (error) {
            console.error("Error fetching user profile:", error);
            setProfile(null);
          } else {
            setProfile(userProfile);
          }
        } else {
          setProfile(null);
        }
        setIsLoading(false);
      }
    }

    fetchSessionAndProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (mounted) {
          setSession(session);
          const currentUser = session?.user || null;
          setUser(currentUser);

          if (currentUser) {
            const { data: userProfile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', currentUser.id)
              .single();
              
            if (error) {
              console.error("Error fetching user profile on auth change:", error);
              setProfile(null);
            } else {
              setProfile(userProfile);
            }
          } else {
            setProfile(null);
          }
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

  const value = {
    session,
    user,
    profile, // Se expone el perfil en el contexto
    isAdmin,
    isLoading,
    signOut,
    supabase,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}