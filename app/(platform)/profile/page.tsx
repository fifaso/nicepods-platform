// app/(platform)/profile/page.tsx
// VERSIÓN: 8.5 (Private Dashboard Orchestrator - Atomic Integrity Standard)
// Misión: Orquestar la hidratación total del búnker de datos privado del curador logueado.
// [ESTABILIZACIÓN]: Resolución de error TS2307 y optimización de carga paralela de cuotas y activos.

import { createClient } from '@/lib/supabase/server';
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
 * PrivateProfileRoute: El orquestador de datos soberanos del servidor.
 */
export default async function PrivateProfileRoute() {
  const supabase = createClient();

  // 1. PROTOCOLO DE IDENTIDAD (Handshake SSR)
  // Validamos la sesión en el servidor para proteger el acceso al área privada.
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    // Redirección de seguridad con preservación de intención de retorno.
    redirect('/login?redirect=/profile');
  }

  // 2. COSECHA DE INTELIGENCIA 360° (Parallel Fetching)
  // Recuperamos todos los dominios de datos en un único ciclo de I/O concurrente para minimizar el TTFB.
  const [
    profileResponse,
    usageResponse,
    testimonialsResponse,
    collectionsResponse,
    vaultResponse
  ] = await Promise.all([
    // A. IDENTIDAD & RANGO: Datos base, reputación y JOIN con planes de suscripción.
    supabase
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
      .eq('id', user.id)
      .single<ProfileData>(),

    // B. MÉTRICA DE CONSUMO: Estado real de la forja mensual y slots de borradores.
    supabase
      .from('user_usage')
      .select('podcasts_created_this_month, drafts_created_this_month')
      .eq('user_id', user.id)
      .maybeSingle(),

    // C. MODERACIÓN SOCIAL: Todos los testimonios (Aprobados y Pendientes) para gestión.
    supabase
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
      .eq('profile_user_id', user.id)
      .order('created_at', { ascending: false })
      .returns<TestimonialWithAuthor[]>(),

    // D. CURADURÍA TEMÁTICA: Colecciones propias con conteo de items en el hilo.
    supabase
      .from('collections')
      .select('*, collection_items(count)')
      .eq('owner_id', user.id)
      .order('updated_at', { ascending: false }),

    // E. BÓVEDA DE VALOR (Proof of Attention): 
    // Recuperamos podcasts completados para alimentar el creador de colecciones.
    supabase
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
      .eq('user_id', user.id)
      .eq('event_type', 'completed_playback')
      .order('created_at', { ascending: false })
  ]);

  // 3. PROTOCOLO DE SEGURIDAD ANTE FALLO DE DATOS
  if (profileResponse.error || !profileResponse.data) {
    console.error("🔥 [NicePod-Bunker-Error]:", profileResponse.error?.message);
    redirect('/login'); // Fallback de seguridad si el perfil es inaccesible.
  }

  // 4. LIMPIEZA BINARIA DE LA BÓVEDA (NKV Sync)
  // Un usuario puede completar un audio varias veces; generamos una lista única de IDs.
  const rawVaultData = vaultResponse.data || [];
  const uniqueFinishedPods = Array.from(
    new Map(
      rawVaultData
        .map(v => v.micro_pods)
        .filter((p): p is any => p !== null)
        .map(p => [p.id, p])
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
        key={profileResponse.data.id}
        profile={profileResponse.data}
        podcastsCreatedThisMonth={usageResponse.data?.podcasts_created_this_month || 0}
        initialTestimonials={testimonialsResponse.data || []}
        initialCollections={(collectionsResponse.data || []) as unknown as Collection[]}
        finishedPodcasts={uniqueFinishedPods}
      />
    </main>
  );
}