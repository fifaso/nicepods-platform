// app/(platform)/dashboard/page.tsx
// VERSIÓN: 22.0 (NiceCore V2.6 - Hardened SSR Edition)
// Misión: Cosecha de inteligencia blindada contra nulos y errores de infraestructura.
// [ESTABILIZACIÓN]: Implementación de maybeSingle() y Fallbacks Defensivos para evitar colapsos.

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardClient } from "./dashboard-client";

/**
 * DashboardPage: El orquestador de datos en el servidor.
 * Esta pieza es la responsable del Handshake T0. Realiza la cosecha de capital 
 * intelectual antes de que el navegador reciba el primer byte.
 */
export default async function DashboardPage() {
  // 1. INSTANCIACIÓN DEL PUENTE DE RED SOBERANO
  const supabase = createClient();

  /**
   * 2. HANDSHAKE DE IDENTIDAD (T0)
   * Validamos la autoridad en el metal del servidor.
   */
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  // Si el usuario no existe o la sesión es corrupta, expulsión inmediata.
  if (authError || !user) {
    redirect("/login");
  }

  try {
    /**
     * 3. COSECHA PARALELA DE DATOS (THE FAN-OUT PIPELINE)
     * Disparamos las tres peticiones críticas simultáneamente para optimizar el TTFB.
     * [RESILIENCIA]: Cambiamos '.single()' por '.maybeSingle()' para evitar excepciones letales.
     */
    const [feedResponse, profileResponse, resonanceResponse] = await Promise.all([
      supabase.rpc('get_user_discovery_feed', { p_user_id: user.id }),
      supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
      supabase.from('user_resonance_profiles').select('*').eq('user_id', user.id).maybeSingle()
    ]);

    /**
     * 4. BARRERA DE PROTECCIÓN CONTRA NULOS (THE SAFETY NET)
     * NicePod no permite que un dato inexistente tumbe la Workstation.
     */

    // A. Saneamiento del Feed de Inteligencia
    const rawFeed = feedResponse.data || { epicenter: [], semantic_connections: [] };
    const initialFeed = {
      epicenter: Array.isArray(rawFeed.epicenter) ? rawFeed.epicenter : [],
      semantic_connections: Array.isArray(rawFeed.semantic_connections) ? rawFeed.semantic_connections : []
    };

    // B. Saneamiento del Perfil (Protocolo Anti-Latencia de Triggers)
    // Si el perfil es null (caso de registro reciente), inyectamos un objeto seguro.
    const initialProfile = profileResponse.data || {
      id: user.id,
      full_name: user.user_metadata?.full_name || "Voyager",
      username: user.user_metadata?.user_name || "curador",
      role: (user.app_metadata?.user_role as string) || 'user',
      avatar_url: user.user_metadata?.avatar_url || null,
      reputation_score: 0
    };

    // C. Saneamiento de Resonancia
    const initialResonance = resonanceResponse.data || null;

    /**
     * 5. DETERMINACIÓN DE AUTORIDAD
     * Verificación cruzada entre JWT y Tabla de Perfiles.
     */
    const isAdmin = 
      user.app_metadata?.user_role === 'admin' || 
      user.app_metadata?.role === 'admin' ||
      (profileResponse.data?.role === 'admin');

    /**
     * 6. DESPACHO AL CHASIS CLIENTE
     * Entregamos el control a la 'DashboardClient' con la sabiduría ya procesada.
     */
    return (
      <DashboardClient
        initialFeed={initialFeed}
        initialProfile={initialProfile as any}
        initialResonance={initialResonance}
        isAdmin={isAdmin}
      />
    );

  } catch (error: any) {
    /**
     * 7. GESTIÓN DE PÁNICO (EMERGENCY FALLBACK)
     * Si ocurre un error de red imprevisto o Supabase está fuera de línea,
     * evitamos la pantalla negra de Vercel devolviendo un estado 'Offline-Ready'.
     */
    console.error("🔥 [Dashboard-Hardened-Fatal]:", error.message);

    return (
      <DashboardClient
        initialFeed={{ epicenter: [], semantic_connections: [] }}
        initialProfile={{ 
          id: user.id, 
          full_name: "Voyager", 
          username: "curador", 
          role: "user" 
        } as any}
        initialResonance={null}
        isAdmin={false}
      />
    );
  }
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V22.0):
 * 1. Resiliencia Máxima: El paso de '.single()' a '.maybeSingle()' es la cura
 *    definitiva contra el error de página reportado. Permite que la app cargue
 *    incluso si la base de datos tiene una micro-latencia en la creación del perfil.
 * 2. Blindaje de Feed: La validación 'Array.isArray' asegura que el componente 
 *    hijo 'IntelligenceFeed' nunca intente mapear un objeto nulo.
 * 3. Fallback de Marca Blanca: El uso de 'user.user_metadata' como fuente de 
 *    respaldo para el nombre asegura que el Voyager siempre vea su identidad, 
 *    aunque la tabla de perfiles falle.
 */