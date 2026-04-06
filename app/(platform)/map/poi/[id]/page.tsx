/**
 * ARCHIVO: app/(platform)/map/poi/[id]/page.tsx
 * VERSIÓN: 2.0 (NicePod Sovereign Explorer - Full Multidimensional SSR Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Orquestar la recuperación de capital intelectual desde el servidor, 
 * garantizando la sintonía total con la Constitución de Tipos V8.5.
 * [FIX V2.0]: Resolución de error TS2322 mediante el mapeo descriptivo de 
 * propiedades multidimensionales hacia la vista de detalle.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

// --- INFRAESTRUCTURA DE VISUALIZACIÓN SOBERANA ---
import { POIDetailView } from '@/components/geo/poi-detail-view';
import { PodcastWithProfile } from '@/types/podcast';
import { nicepodLog } from '@/lib/utils';

/**
 * INTERFAZ: PageParameters
 * Misión: Capturar la identificación dinámica de la trayectoria.
 */
interface PageParameters {
  params: {
    id: string;
  };
}

/**
 * generateMetadata:
 * Misión: Proyectar la identidad del hito hacia indexadores externos.
 * [ESTRATEGIA V4.0]: Inyección de taxonomía en el título SEO.
 */
export async function generateMetadata({ params }: PageParameters): Promise<Metadata> {
  const supabaseClient = createClient();
  
  const { data: pointOfInterestRecord } = await supabaseClient
    .from('points_of_interest')
    .select('name, category_mission, category_entity')
    .eq('id', params.id)
    .single();

  if (!pointOfInterestRecord) {
    return { title: "Nodo no detectado | NicePod Intelligence" };
  }

  const pointOfInterstName = pointOfInterestRecord.name;
  const missionLabel = pointOfInterestRecord.category_mission.replace('_', ' ');

  return {
    title: `${pointOfInterstName} | ${missionLabel}`,
    description: `Peritaje de capital intelectual urbano en Madrid. Misión: ${missionLabel}.`,
    openGraph: {
      title: pointOfInterstName,
      description: `Inmersión sonora y documental en el corazón de la Malla.`,
      type: 'website',
    }
  };
}

/**
 * POIDetailPage: El orquestador de datos para la inmersión total.
 */
export default async function POIDetailPage({ params }: PageParameters) {
  const supabaseClient = createClient();
  const pointOfInterestIdentification = parseInt(params.id);

  /**
   * 1. COSECHA DE INTELIGENCIA MULTIDIMENSIONAL (T0)
   * Misión: Recuperar el expediente completo alineado con la V4.0.
   */
  const { 
    data: pointOfInterestRecord, 
    error: databaseError 
  } = await supabaseClient
    .from('points_of_interest')
    .select(`
      id,
      name,
      category_mission,
      category_entity,
      historical_epoch,
      historical_fact,
      rich_description,
      gallery_urls,
      external_reference_url,
      reference_podcast_id
    `)
    .eq('id', pointOfInterestIdentification)
    .single();

  // Protocolo de Seguridad: Si el hito no existe, abortamos renderizado.
  if (databaseError || !pointOfInterestRecord) {
    console.error("🛑 [SSR-POI] Error al localizar nodo:", databaseError?.message);
    notFound();
  }

  /**
   * 2. RECUPERACIÓN DEL ACTIVO ACÚSTICO VINCULADO
   * Misión: Traer el podcast y el perfil del autor para el AudioProvider.
   */
  let linkedPodcastRecord: PodcastWithProfile | null = null;
  
  if (pointOfInterestRecord.reference_podcast_id) {
    const { data: podcastData } = await supabaseClient
      .from('micro_pods')
      .select('*, profiles(full_name, avatar_url, username)')
      .eq('id', pointOfInterestRecord.reference_podcast_id)
      .single();
    
    if (podcastData) {
      linkedPodcastRecord = podcastData as unknown as PodcastWithProfile;
    }
  }

  /**
   * 3. NORMALIZACIÓN DE GALERÍA (HYGIENE GUARD)
   */
  const galleryUniformResourceLocators = Array.isArray(pointOfInterestRecord.gallery_urls) 
    ? pointOfInterestRecord.gallery_urls 
    : [];

  return (
    /**
     * 4. ENTREGA SOBERANA A LA VISTA (POINT-OF-INTEREST MAPPING)
     * [MANDATO V2.0]: Sincronía total con el componente POIDetailView V4.0.
     * Mapeamos las columnas del metal a las propiedades descriptivas completas.
     */
    <POIDetailView 
      pointOfInterest={{
        identification: pointOfInterestRecord.id,
        name: pointOfInterestRecord.name,
        categoryMission: pointOfInterestRecord.category_mission,
        categoryEntity: pointOfInterestRecord.category_entity,
        historicalEpoch: pointOfInterestRecord.historical_epoch,
        historicalFact: pointOfInterestRecord.historical_fact,
        richDescription: pointOfInterestRecord.rich_description,
        galleryUniformResourceLocators: galleryUniformResourceLocators,
        externalReferenceUniformResourceLocator: pointOfInterestRecord.external_reference_url || undefined,
        referencePodcastIdentification: pointOfInterestRecord.reference_podcast_id
      }}
      linkedPodcast={linkedPodcastRecord}
    />
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V2.0):
 * 1. Build Shield Implementation: Se han sustituido los nombres de propiedades 
 *    abreviados por descriptores completos (identification, categoryMission, etc.), 
 *    erradicando el error de compilación detectado por Vercel.
 * 2. SSR Efficiency: La captura de datos ocurre en el servidor, alimentando a la 
 *    vista cliente con un objeto ya hidratado y validado, eliminando parpadeos.
 * 3. Type Resilience: La página ahora soporta las nuevas dimensiones del tiempo 
 *    y documentación (historical_epoch y external_reference_url), permitiendo 
 *    que el Voyager consuma el 100% del capital intelectual forjado.
 */