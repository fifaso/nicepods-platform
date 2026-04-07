/**
 * ARCHIVO: app/(platform)/compass/page.tsx
 * VERSIÓN: 10.0 (Madrid Resonance - Full Sovereign SSR & Contract Alignment)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Orquestador de servidor para la visualización geo-semántica de la Malla.
 * Transforma los registros del Metal en una experiencia vectorial interactiva.
 * [REFORMA V10.0]: Sincronización nominal total con ResonanceCompass V2.0 y 
 * cumplimiento absoluto de la Zero Abbreviations Policy.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

import { ResonanceCompass } from "@/components/feed/resonance-compass";
import { createClient } from "@/lib/supabase/server";
import type { PodcastWithProfile } from "@/types/podcast";
import type { Tables } from "@/types/database.types";
import { redirect } from "next/navigation";

/**
 * [DEFINICIÓN DE TIPOS SOBERANOS]
 */
type UserResonanceProfile = Tables<'user_resonance_profiles'>;

/**
 * CompassPage: El director de datos en el servidor para la Brújula.
 * Misión: Garantizar el Handshake T0 y recolectar el capital intelectual geolocalizado.
 */
export default async function CompassPage() {
  // 1. INSTANCIACIÓN DEL PUENTE DE RED SOBERANO
  const supabaseClient = createClient();

  /**
   * 2. HANDSHAKE DE IDENTIDAD (Edge-Side Authentication)
   * Validamos la autoridad del Voyager en el metal del servidor.
   */
  const { 
    data: { user: authenticatedUser }, 
    error: authenticationError 
  } = await supabaseClient.auth.getUser();

  if (authenticationError || !authenticatedUser) {
    // Redirección con trazabilidad de retorno para optimizar la navegación del usuario.
    redirect('/login?redirect=/compass');
  }

  const userIdentification = authenticatedUser.id;

  /**
   * 3. COSECHA PARALELA DE INTELIGENCIA (Performance Fan-Out)
   * Adquisición concurrente del perfil de resonancia y la colección de crónicas.
   */
  const [
    resonanceProfileResponse,
    publishedPodcastsResponse
  ] = await Promise.all([
    supabaseClient
      .from('user_resonance_profiles')
      .select('*')
      .eq('user_id', userIdentification)
      .maybeSingle(), // Resiliencia ante perfiles de nueva creación
    supabaseClient
      .from('micro_pods')
      .select(`
        id, 
        title, 
        final_coordinates,
        geo_location, 
        cover_image_url, 
        ai_tags,
        profiles:user_id ( 
          full_name, 
          avatar_url,
          username
        )
      `)
      .not('status', 'eq', 'failed')
      .eq('status', 'published') // Solo permitimos resonancia de activos verificados
      .limit(100) // Control de densidad para el hilo principal del cliente
  ]);

  // Auditoría de errores de infraestructura
  if (publishedPodcastsResponse.error) {
    console.error(
        "🔥 [Compass-SSR-Fatal] Error al recuperar la colección de crónicas:", 
        publishedPodcastsResponse.error.message
    );
  }

  /**
   * 4. SANEAMIENTO Y TRANSFORMACIÓN (Data Engineering)
   */
  const podcastCollection: PodcastWithProfile[] = (publishedPodcastsResponse.data as unknown as PodcastWithProfile[]) || [];
  const userResonanceProfile: UserResonanceProfile | null = resonanceProfileResponse.data || null;

  /**
   * 5. EXTRACCIÓN DE CATEGORÍAS SEMÁNTICAS (Tag Intelligence)
   * Misión: Consolidar un set de etiquetas únicas para el sistema de filtrado del radar.
   */
  const uniqueSemanticTags: string[] = Array.from(
    new Set(
        podcastCollection.flatMap((podcastItem) => podcastItem.ai_tags || [])
    )
  ).filter((tagLabel) => tagLabel && tagLabel.length > 0);

  return (
    <div className="container mx-auto max-w-7xl py-12 px-4 animate-in fade-in duration-1000 selection:bg-primary/30">
      
      {/* CABECERA TÁCTICA DE LA WORKSTATION */}
      <header className="text-center mb-12 space-y-3">
        <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-white uppercase italic font-serif">
          Brújula de <span className="text-primary drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]">Resonancia</span>
        </h1>
        <p className="max-w-2xl mx-auto text-base md:text-xl text-zinc-500 font-medium leading-relaxed uppercase tracking-tight">
          Explora la capa invisible de Madrid a través de las historias que resuenan en tu frecuencia.
        </p>
      </header>

      {/* SECCIÓN DEL REACTOR VISUAL (COMPASS) */}
      <section className="relative w-full aspect-video md:h-[650px] rounded-[3.5rem] overflow-hidden border border-white/5 bg-zinc-950/50 backdrop-blur-3xl shadow-[0_50px_100px_rgba(0,0,0,0.8)] isolate">
        <ResonanceCompass
          userResonanceProfile={userResonanceProfile} // [FIX TS2322]: Sincronía nominal absoluta
          podcastCollection={podcastCollection}        // [FIX TS2322]: Sincronía nominal absoluta
          semanticTags={uniqueSemanticTags}           // [FIX TS2322]: Sincronía nominal absoluta
        />
      </section>

      {/* PIE DE PÁGINA DE INTEGRIDAD TÉCNICA */}
      <footer className="mt-12 text-center opacity-20 hover:opacity-100 transition-opacity duration-1000">
        <p className="text-[9px] font-black uppercase tracking-[1em] text-white">
          NicePod Spatial Intelligence Terminal
        </p>
        <p className="text-[7px] font-bold uppercase tracking-[0.4em] text-zinc-500 mt-2">
          Protocolo Madrid Resonance V4.0.1 • Brain-Metal Link Active
        </p>
      </footer>
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V10.0):
 * 1. Build Shield Compliance: Se corrigieron las propiedades inyectadas al componente 
 *    ResonanceCompass para coincidir con la interfaz 'ResonanceCompassProperties' (V2.0).
 * 2. Zero Abbreviations Policy: Se purificaron términos como 'user', 'pod', 'authError', 
 *    y 'id', garantizando una semántica industrial infranqueable.
 * 3. SSR Resilience: El uso de 'maybeSingle()' en el perfil de resonancia evita que 
 *    un usuario nuevo sin perfil generado provoque un error 500 en la página.
 */