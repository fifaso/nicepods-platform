// app/profile/page.tsx
// VERSIÓN: 7.0 (The Ultimate Dashboard Orchestrator: Multi-Source Curation & Reputation Hub)

import { createClient } from '@/lib/supabase/server'; 
import { redirect } from 'next/navigation';
import { 
  PrivateProfileDashboard, 
  type ProfileData,
  type TestimonialWithAuthor
} from '@/components/profile-client-component';

/**
 * PAGE COMPONENT: PrivateProfileRoute
 * Encargado de la hidratación total de datos para el Dashboard de Gestión.
 * Implementa fetch paralelo para minimizar el Time To Interactive (TTI).
 */
export default async function PrivateProfileRoute() {
  const supabase = createClient();

  // 1. SEGURIDAD: Auth Check de sesión activa
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect('/login?redirect=/profile');
  }
  
  // 2. ORQUESTACIÓN DE DATOS 360°
  // Ejecutamos todas las consultas en paralelo para máxima velocidad.
  const [
    profileResponse, 
    usageResponse, 
    testimonialsResponse, 
    collectionsResponse, 
    vaultResponse
  ] = await Promise.all([
    // A. IDENTIDAD & PLAN: Datos base, suscripción y metadatos de reputación.
    supabase
        .from('profiles')
        .select(`
            *,
            subscriptions (
                status,
                plans (
                    name,
                    monthly_creation_limit
                )
            )
        `)
        .eq('id', user.id)
        .single<ProfileData>(),
    
    // B. CUOTA DE USO: Métrica crítica para la barra de progreso de creación.
    supabase
        .from('user_usage')
        .select('podcasts_created_this_month')
        .eq('user_id', user.id)
        .single(),

    // C. MODERACIÓN SOCIAL: Todos los testimonios para gestión (Aprobados, Pendientes, Rechazados).
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

    // D. CURADURÍA: Colecciones completas con conteo de items.
    supabase
        .from('collections')
        .select('*, collection_items(count)')
        .eq('owner_id', user.id)
        .order('updated_at', { ascending: false }),

    // E. BÓVEDA DE VALOR (PROOF OF ATTENTION): 
    // Recuperamos podcasts que el usuario ha terminado al 100%. 
    // Este dato es vital para alimentar el "Smart Selector" de nuevas listas curadas.
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
              play_count
          )
      `)
      .eq('user_id', user.id)
      .eq('event_type', 'completed_playback')
  ]);

  // 3. VALIDACIÓN DE CARGA CRÍTICA
  if (profileResponse.error || !profileResponse.data) {
    console.error("Critical Profile Load Error:", profileResponse.error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <div className="text-center space-y-4">
          <p className="text-white/60 font-medium">No pudimos sincronizar tu búnker de datos.</p>
          <a href="/profile" className="text-primary font-black uppercase tracking-widest text-xs underline">
            Reintentar Conexión
          </a>
        </div>
      </div>
    );
  }

  // 4. PROCESAMIENTO ESTRATÉGICO DE LA BÓVEDA
  // Un usuario puede terminar un podcast varias veces. Necesitamos una lista única (Set) para la curaduría.
  const rawVaultData = vaultResponse.data || [];
  const uniqueFinishedPods = Array.from(
    new Map(
      rawVaultData
        .map(v => v.micro_pods)
        .filter((p): p is any => p !== null)
        .map(p => [p.id, p])
    ).values()
  );

  // 5. HANDOFF AL CLIENTE (PrivateProfileDashboard)
  // Entregamos el objeto de datos completo para poblar todas las opciones (Biblioteca, Offline, Reseñas, Ajustes).
  return (
    <main className="min-h-screen bg-transparent">
      <PrivateProfileDashboard 
        profile={profileResponse.data} 
        podcastsCreatedThisMonth={usageResponse.data?.podcasts_created_this_month || 0}
        initialTestimonials={testimonialsResponse.data || []}
        initialCollections={collectionsResponse.data as any || []}
        finishedPodcasts={uniqueFinishedPods} 
      />
    </main>
  );
}