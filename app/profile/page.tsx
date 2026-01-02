// app/profile/page.tsx
// VERSIÓN: 6.2 (Production Ready: Full Data Orchestration & Vault Logic)

import { createClient } from '@/lib/supabase/server'; 
import { redirect } from 'next/navigation';
import { 
  PrivateProfileDashboard, 
  type ProfileData,
  type TestimonialWithAuthor
} from '@/components/profile-client-component';

export default async function PrivateProfileRoute() {
  const supabase = createClient();

  // 1. Verificación de identidad
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirect=/profile');
  
  // 2. Ejecución paralela de alta eficiencia (5 consultas concurrentes)
  const [profileRes, usageRes, testimonialsRes, collectionsRes, vaultRes] = await Promise.all([
    // A. Datos de perfil, rol y suscripción
    supabase
        .from('profiles')
        .select('*, subscriptions(*, plans(*))')
        .eq('id', user.id)
        .single<ProfileData>(),
    
    // B. Uso de cuota del mes actual
    supabase
        .from('user_usage')
        .select('podcasts_created_this_month')
        .eq('user_id', user.id)
        .single(),

    // C. Reseñas recibidas (incluyendo las pendientes de moderar)
    supabase
        .from('profile_testimonials')
        .select('*, author:author_user_id(full_name, avatar_url)')
        .eq('profile_user_id', user.id)
        .order('created_at', { ascending: false })
        .returns<TestimonialWithAuthor[]>(),

    // D. Colecciones propias (Públicas y Privadas)
    supabase
        .from('collections')
        .select('*, collection_items(count)')
        .eq('owner_id', user.id)
        .order('updated_at', { ascending: false }),

    // E. Bóveda de Valor: Podcasts terminados al 100% por este usuario
    supabase
      .from('playback_events')
      .select('podcast_id, micro_pods(id, title, cover_image_url, duration_seconds)')
      .eq('user_id', user.id)
      .eq('event_type', 'completed_playback')
  ]);

  if (!profileRes.data) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <p className="text-white font-black animate-pulse">SINCRONIZANDO PERFIL...</p>
        </div>
    );
  }

  // 3. Procesamiento de la Bóveda (Deduplicación de podcasts escuchados varias veces)
  const finishedPodcastsRaw = (vaultRes.data || [])
    .map(v => v.micro_pods as any)
    .filter(Boolean);

  const finishedPodcasts = Array.from(
    new Map(finishedPodcastsRaw.map(p => [p.id, p])).values()
  );

  return (
    <PrivateProfileDashboard 
      profile={profileRes.data} 
      podcastsCreatedThisMonth={usageRes.data?.podcasts_created_this_month || 0}
      initialTestimonials={testimonialsRes.data || []}
      initialCollections={collectionsRes.data as any || []}
      finishedPodcasts={finishedPodcasts} 
    />
  );
}