// app/(platform)/map/poi/[id]/page.tsx
// VERSIÓN: 1.0

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

// --- INFRAESTRUCTURA DE VISUALIZACIÓN ---
import { POIDetailView } from '@/components/geo/poi-detail-view';
import { PodcastWithProfile } from '@/types/podcast';

/**
 * INTERFAZ: PageProps
 * Captura el identificador dinámico de la URL (/poi/[id]).
 */
interface PageProps {
  params: {
    id: string;
  };
}

/**
 * FUNCIÓN: generateMetadata
 * Misión: Proyectar la identidad del Punto de Interés hacia indexadores y redes sociales.
 * 
 * [ESTRATEGIA SEO]: El título de la pestaña muta dinámicamente al nombre del POI.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = createClient();
  
  const { data: poi } = await supabase
    .from('points_of_interest')
    .select('name, category')
    .eq('id', params.id)
    .single();

  if (!poi) return { title: "Nodo no detectado | NicePod" };

  return {
    title: `${poi.name} | NicePod Resonance`,
    description: `Descubre la crónica de sabiduría en ${poi.name}. Categoría: ${poi.category}.`,
    openGraph: {
      title: poi.name,
      description: `Inmersión sonora en el corazón de Madrid.`,
      type: 'website',
    }
  };
}

/**
 * COMPONENTE: POIDetailPage (Server Component)
 * El orquestador de datos que alimenta la inmersión total.
 */
export default async function POIDetailPage({ params }: PageProps) {
  const supabase = createClient();

  /**
   * 1. COSECHA DE INTELIGENCIA CONCURRENTE (T0)
   * Recuperamos la data del POI. Si este tiene un audio vinculado, 
   * lo traemos en la misma transacción lógica.
   */
  const { data: poi, error: poiError } = await supabase
    .from('points_of_interest')
    .select('*')
    .eq('id', params.id)
    .single();

  // Protocolo de Existencia: Si el ID es inválido o no existe, disparamos 404.
  if (poiError || !poi) {
    console.error("🛑 [SSR-POI] Error al localizar nodo:", poiError?.message);
    notFound();
  }

  /**
   * 2. RECUPERACIÓN DEL ACTIVO ACÚSTICO (Lógica de Vínculo)
   * Si el POI tiene un reference_podcast_id, traemos el objeto completo 
   * incluyendo el perfil del autor para el AudioProvider.
   */
  let linkedPodcast: PodcastWithProfile | null = null;
  
  if (poi.reference_podcast_id) {
    const { data: podcastData } = await supabase
      .from('micro_pods')
      .select('*, profiles(full_name, avatar_url, username)')
      .eq('id', poi.reference_podcast_id)
      .single();
    
    if (podcastData) {
      linkedPodcast = podcastData as unknown as PodcastWithProfile;
    }
  }

  // 3. NORMALIZACIÓN DE GALERÍA
  // Aseguramos que gallery_urls sea siempre un array para evitar errores de render.
  const gallery = Array.isArray(poi.gallery_urls) ? poi.gallery_urls : [];

  return (
    /**
     * 4. ENTREGA SOBERANA A LA CAPA DE VISUALIZACIÓN
     * Inyectamos la data saneada en el componente de detalle (Client Component).
     * El children hereda el PlatformLayout (Navigation + AudioProvider).
     */
    <POIDetailView 
      poi={{
        id: poi.id,
        name: poi.name,
        category: poi.category,
        historical_fact: poi.historical_fact,
        rich_description: poi.rich_description,
        gallery_urls: gallery,
        reference_podcast_id: poi.reference_podcast_id
      }}
      linkedPodcast={linkedPodcast}
    />
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Rendimiento SSR: Al ser un Server Component, este archivo no añade peso 
 *    al bundle de JavaScript que descarga el usuario. Solo envía el HTML 
 *    final y la data hidratada.
 * 2. Integridad de Tipos: El casting 'as unknown as PodcastWithProfile' 
 *    garantiza que el contrato de tipos de la Fase 1 se respete, permitiendo 
 *    que el reproductor de audio reciba el objeto exacto que espera.
 * 3. Resiliencia: La lógica de 'linkedPodcast' es opcional. Si un POI aún 
 *    no tiene una crónica terminada, la página de detalle cargará la 
 *    información histórica y visual sin romperse, cumpliendo con el Dogma 
 *    de 'La Función debe continuar'.
 */