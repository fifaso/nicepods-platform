// app/compass/page.tsx
// VERSIÓN: 9.0 (Madrid Resonance - Full SSR Sync & Geo-Type Hardening)

import { ResonanceCompass } from "@/components/resonance-compass";
import { createClient } from "@/lib/supabase/server";
import type { PodcastWithProfile } from "@/types/podcast";
import type { Tables } from "@/types/supabase";
import { redirect } from "next/navigation";

/**
 * [DEFINICIÓN DE TIPOS LOCALES]
 * Garantizamos que la lógica de resonancia tenga un contrato de datos estricto.
 */
type ResonanceProfile = Tables<'user_resonance_profiles'>;

/**
 * PAGE: CompassPage
 * Misión: Orquestador de servidor para la visualización geo-semántica.
 * Transforma las coordenadas frías de la base de datos en una experiencia interactiva.
 */
export default async function CompassPage() {
  // [INTEGRACIÓN]: El nuevo createClient gestiona headers y cookies internamente.
  const supabase = createClient();

  // 1. Verificación de identidad en el borde (Edge-Side Auth Check)
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    // Redirección con callback para una UX de retorno fluida
    redirect('/login?redirect=/compass');
  }

  /**
   * 2. CARGA DE DATOS EN PARALELO (Performance Optimization)
   * Reducimos el tiempo de carga total cargando el perfil y los puntos de luz simultáneamente.
   */
  const [
    { data: resonanceProfile, error: profileError },
    { data: allPodcastsData, error: podcastsError }
  ] = await Promise.all([
    supabase
      .from('user_resonance_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('micro_pods')
      .select(`
        id, 
        title, 
        final_coordinates, 
        cover_image_url, 
        ai_tags,
        profiles ( 
          full_name, 
          avatar_url,
          username
        )
      `)
      .not('final_coordinates', 'is', null) // Seguridad: Solo audios anclados a la ciudad
      .eq('status', 'published') // Solo contenido público
  ]);

  // Manejo de errores silencioso con fallback a tipos vacíos (Resiliencia de UI)
  if (podcastsError) {
    console.error("[NicePod-Compass] Fallo crítico al recuperar geodatos:", podcastsError.message);
  }

  // 3. TRANSFORMACIÓN Y SANITIZACIÓN (Data Mapping)
  const allPodcasts: PodcastWithProfile[] = (allPodcastsData as any) || [];
  const userProfile: ResonanceProfile | null = resonanceProfile || null;

  /**
   * 4. EXTRACCIÓN DE CATEGORÍAS (Tag Aggregator)
   * Obtenemos todos los tags únicos presentes en el mapa para alimentar el sistema de filtros.
   */
  const uniqueTags: string[] = Array.from(
    new Set(allPodcasts.flatMap(pod => pod.ai_tags || []))
  ).filter(tag => tag && tag.length > 0);

  return (
    <div className="container mx-auto max-w-7xl py-12 px-4 animate-in fade-in duration-700">
      {/* CABECERA CON TEXTURAS DE MARCA */}
      <header className="text-center mb-10 space-y-2">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase italic">
          Tu Brújula de <span className="text-primary">Resonancia</span>
        </h1>
        <p className="max-w-2xl mx-auto text-base md:text-lg text-muted-foreground font-medium">
          Explora la capa invisible de Madrid a través de las historias que conectan contigo.
        </p>
      </header>

      {/* COMPONENTE MAESTRO DE MAPA 3D / COMPASS */}
      <section className="relative w-full h-[600px] rounded-[3rem] overflow-hidden border border-border/40 bg-zinc-950 shadow-2xl">
        <ResonanceCompass
          userProfile={userProfile}
          podcasts={allPodcasts}
          tags={uniqueTags} // [FIX]: Inyección del contrato de etiquetas para el filtro
        />
      </section>

      {/* FOOTER DE CONTEXTO */}
      <footer className="mt-8 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 opacity-50">
          NicePod Spatial Intelligence v1.0
        </p>
      </footer>
    </div>
  );
}