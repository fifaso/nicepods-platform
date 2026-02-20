// app/profile/page.tsx
// VERSIÓN: 8.0 (The Ultimate Dashboard Orchestrator - Atomic Integrity Edition)
// Misión: Orquestar la hidratación total del búnker de datos privado del curador.
// [ESTABILIZACIÓN]: Implementación de force-dynamic y limpieza atómica de la Bóveda de Valor.

import {
  PrivateProfileDashboard,
  type ProfileData,
  type TestimonialWithAuthor
} from '@/components/profile-client-component';
import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

/**
 * [CONFIGURACIÓN DE RED]: force-dynamic
 * Es vital para el perfil privado, ya que gestiona cuotas de uso y estados 
 * de suscripción que cambian en tiempo real. No podemos permitirnos caché aquí.
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * generateMetadata: Define la identidad de la pestaña del navegador.
 */
export const metadata: Metadata = {
  title: "Búnker de Sabiduría | NicePod",
  description: "Centro de mandos operativo y gestión de soberanía de datos.",
  robots: { index: false, follow: false }, // Privacidad absoluta en rutas de gestión
};

/**
 * PrivateProfileRoute: El orquestador de datos soberanos.
 */
export default async function PrivateProfileRoute() {
  const supabase = createClient();

  // 1. PROTOCOLO DE IDENTIDAD (Handshake SSR)
  // Validamos la sesión en el servidor para evitar que invitados accedan al búnker.
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login?redirect=/profile');
  }

  // 2. COSECHA DE INTELIGENCIA 360° (Parallel Fetching)
  // Recuperamos todos los módulos de datos en un único ciclo de I/O concurrente.
  const [
    profileResponse,
    usageResponse,
    testimonialsResponse,
    collectionsResponse,
    vaultResponse
  ] = await Promise.all([
    // A. IDENTIDAD, RANGO Y PLAN: Incluimos reputación y el JOIN con planes.
    supabase
      .from('profiles')
      .select(`
            *,
            subscriptions (
                status,
                plans (
                    name,
                    monthly_creation_limit,
                    max_concurrent_drafts
                )
            )
        `)
      .eq('id', user.id)
      .single<ProfileData>(),

    // B. MÉTRICA DE CONSUMO: Estado real de la cuota mensual de creación.
    supabase
      .from('user_usage')
      .select('podcasts_created_this_month, drafts_created_this_month')
      .eq('user_id', user.id)
      .maybeSingle(),

    // C. MODERACIÓN SOCIAL: Gestión integral de testimonios recibidos.
    supabase
      .from('profile_testimonials')
      .select(`
            id,
            comment_text,
            status,
            created_at,
            author:author_user_id (
                full_name,
                avatar_url
            )
        `)
      .eq('profile_user_id', user.id)
      .order('created_at', { ascending: false })
      .returns<TestimonialWithAuthor[]>(),

    // D. CURADURÍA TEMÁTICA: Colecciones propias con telemetría de ítems.
    supabase
      .from('collections')
      .select('*, collection_items(count)')
      .eq('owner_id', user.id)
      .order('updated_at', { ascending: false }),

    // E. BÓVEDA DE VALOR (Proof of Attention): 
    // Podcasts finalizados por el usuario para alimentar el grafo de conocimiento.
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
        <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] text-center backdrop-blur-3xl shadow-2xl">
          <p className="text-zinc-400 font-medium mb-6">No se pudo establecer conexión con tu Bóveda de Datos.</p>
          <a href="/profile" className="inline-flex h-12 items-center px-8 bg-primary text-white font-black uppercase tracking-widest text-[10px] rounded-full hover:scale-105 transition-all">
            REINTENTAR SINCRO
          </a>
        </div>
      </div>
    );
  }

  // 4. LIMPIEZA BINARIA DE LA BÓVEDA
  // Eliminamos duplicados de podcasts terminados para entregar una lista pura al cliente.
  const rawVaultData = vaultResponse.data || [];
  const uniqueFinishedPods = Array.from(
    new Map(
      rawVaultData
        .map(v => v.micro_pods)
        .filter((p): p is any => p !== null)
        .map(p => [p.id, p])
    ).values()
  );

  // 5. ENTREGA DE CONTROL AL DASHBOARD (Cliente)
  return (
    <main className="min-h-screen bg-transparent animate-in fade-in duration-1000">
      <PrivateProfileDashboard
        key={profileResponse.data.id} // [FIX]: Garantizamos re-montaje limpio en cambios de sesión
        profile={profileResponse.data}
        podcastsCreatedThisMonth={usageResponse.data?.podcasts_created_this_month || 0}
        initialTestimonials={testimonialsResponse.data || []}
        initialCollections={collectionsResponse.data as any || []}
        finishedPodcasts={uniqueFinishedPods}
      />
    </main>
  );
}