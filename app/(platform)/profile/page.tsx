/**
 * ARCHIVE: app/(platform)/profile/page.tsx
 * VERSION: 9.0 (NicePod Private Bunker - Industrial Standard & Traceability Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * MISSION: Server-side orchestration for the private intellectual capital bunker,
 * ensuring session integrity and parallel intelligence harvesting.
 * INTEGRITY LEVEL: 100% (Sovereign / Zero Abbreviations / Production-Ready)
 */

import { createClient } from '@/lib/supabase/server';
import { nicepodLog } from '@/lib/utils';
import PostHogClient from '@/posthog';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

// --- NUEVAS IMPORTACIONES MODULARES ---
// Importamos el orquestador de cliente que ensambla los sub-módulos del Dashboard.
import { PrivateProfileDashboard } from '@/components/profile/private-profile-dashboard';

// --- CONTRATOS DE DATOS (NIVEL 1) ---
import {
  Collection,
  ProfileData,
  TestimonialWithAuthor
} from '@/types/profile';

/**
 * [CONFIGURACIÓN DE RED]: force-dynamic
 * El perfil privado gestiona cuotas de creación y estados de suscripción que cambian 
 * dinámicamente. Forzamos la consulta a la Bóveda en cada petición para evitar 
 * que el usuario vea límites de uso desactualizados.
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * generateMetadata: Define la identidad de la terminal en el navegador.
 */
export const metadata: Metadata = {
  title: "Búnker de Sabiduría | NicePod Intelligence",
  description: "Centro de mandos operativo y gestión de soberanía de datos personales.",
  robots: { index: false, follow: false }, // Privacidad absoluta para áreas de gestión.
};

/**
 * PrivateProfileRoute: El orquestador de datos soberanos del servidor (SSR T0).
 *
 * Misión: Validar la autoridad del Voyager y realizar la cosecha paralela
 * de inteligencia privada (identidad, consumo, testimonios y colecciones)
 * para la hidratación instantánea de la terminal de peritaje.
 *
 * @returns {Promise<JSX.Element>} El chasis de la interfaz del Búnker de Sabiduría.
 */
export default async function PrivateProfileRoute() {
  const supabaseSovereignClient = createClient();

  // 1. PROTOCOLO DE IDENTIDAD (Handshake SSR)
  // Validamos la sesión en el servidor para proteger el acceso al área privada.
  const { data: { user: authenticatedUser }, error: authenticationHardwareException } = await supabaseSovereignClient.auth.getUser();

  if (authenticationHardwareException || !authenticatedUser) {
    // Redirección de seguridad con preservación de intención de retorno.
    redirect('/login?redirect=/profile');
  }

  // TELEMETRÍA: Registro de acceso al Búnker
  nicepodLog("🔐 [Bunker] Iniciando hidratación de peritaje privado.");
  const posthogSovereignClient = PostHogClient();
  posthogSovereignClient.capture({
    distinctId: authenticatedUser.id,
    event: 'voyager_bunker_access_start',
  });
  await posthogSovereignClient.shutdown();

  // 2. COSECHA DE INTELIGENCIA 360° (Parallel Fetching)
  // Recuperamos todos los dominios de datos en un único ciclo de I/O concurrente para minimizar el TTFB.
  const [
    profileIntelligenceQueryResponse,
    usageMetricsQueryResponse,
    testimonialsModerationQueryResponse,
    collectionsCuratedQueryResponse,
    vaultIntelligenceQueryResponse
  ] = await Promise.all([
    // A. IDENTIDAD & RANGO: Datos base, reputación y JOIN con planes de suscripción.
    supabaseSovereignClient
      .from('profiles')
      .select(`
            *,
            subscriptions (
                status,
                plans (
                    name,
                    monthly_creation_limit,
                    max_concurrent_drafts,
                    features
                )
            )
        `)
      .eq('id', authenticatedUser.id)
      .single<ProfileData>(),

    // B. MÉTRICA DE CONSUMO: Estado real de la forja mensual y slots de borradores.
    supabaseSovereignClient
      .from('user_usage')
      .select('podcasts_created_this_month, drafts_created_this_month')
      .eq('user_id', authenticatedUser.id)
      .maybeSingle(),

    // C. MODERACIÓN SOCIAL: Todos los testimonios (Aprobados y Pendientes) para gestión.
    supabaseSovereignClient
      .from('profile_testimonials')
      .select(`
            id,
            comment_text,
            status,
            created_at,
            profile_user_id,
            author_user_id,
            author:author_user_id (
                full_name,
                avatar_url
            )
        `)
      .eq('profile_user_id', authenticatedUser.id)
      .order('created_at', { ascending: false })
      .returns<TestimonialWithAuthor[]>(),

    // D. CURADURÍA TEMÁTICA: Colecciones propias con conteo de items en el hilo.
    supabaseSovereignClient
      .from('collections')
      .select('*, collection_items(count)')
      .eq('owner_id', authenticatedUser.id)
      .order('updated_at', { ascending: false }),

    // E. BÓVEDA DE VALOR (Proof of Attention): 
    // Recuperamos podcasts completados para alimentar el creador de colecciones.
    supabaseSovereignClient
      .from('playback_events')
      .select(`
          podcast_id,
          micro_pods (
              id,
              title,
              description,
              cover_image_url,
              duration_seconds,
              like_count,
              play_count,
              status
          )
      `)
      .eq('user_id', authenticatedUser.id)
      .eq('event_type', 'completed_playback')
      .order('created_at', { ascending: false })
  ]);

  // 3. PROTOCOLO DE SEGURIDAD ANTE FALLO DE DATOS
  if (profileIntelligenceQueryResponse.error || !profileIntelligenceQueryResponse.data) {
    console.error("🔥 [NicePod-Bunker-Error]:", profileIntelligenceQueryResponse.error?.message);
    redirect('/login'); // Fallback de seguridad si el perfil es inaccesible.
  }

  // 4. LIMPIEZA BINARIA DE LA BÓVEDA (NKV Sync)
  // Un usuario puede completar un audio varias veces; generamos una lista única de IDs.
  const rawVaultIntelligenceData = vaultIntelligenceQueryResponse.data || [];
  const uniqueFinishedPodcastsCollection = Array.from(
    new Map(
      rawVaultIntelligenceData
        .map(playbackEvent => playbackEvent.micro_pods)
        .filter((podcast): podcast is any => podcast !== null)
        .map(podcast => [podcast.id, podcast])
    ).values()
  );

  /**
   * 5. ENTREGA DE CONTROL AL DASHBOARD (Cliente)
   * Inyectamos el ID del perfil como 'key' para garantizar un re-montaje limpio 
   * y evitar errores de reconciliación de React entre sesiones.
   */
  return (
    <main className="min-h-screen bg-transparent animate-in fade-in duration-1000">
      <PrivateProfileDashboard
        key={profileIntelligenceQueryResponse.data.id}
        profile={profileIntelligenceQueryResponse.data}
        podcastsCreatedThisMonth={usageMetricsQueryResponse.data?.podcasts_created_this_month || 0}
        initialTestimonials={testimonialsModerationQueryResponse.data || []}
        initialCollections={(collectionsCuratedQueryResponse.data || []) as unknown as Collection[]}
        finishedPodcasts={uniqueFinishedPodcastsCollection}
      />
    </main>
  );
}