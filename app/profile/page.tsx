// app/profile/page.tsx
// VERSIÓN: 5.0 (Management Dashboard: Full Data Access)

import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { 
  PrivateProfileDashboard, 
  type ProfileData,
  type TestimonialWithAuthor
} from '@/components/profile-client-component';

export default async function PrivateProfileRoute() {
  const supabase = createClient(cookies());

  // 1. Auth Check Estricto
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login?redirect=/profile');
  }
  
  // 2. CARGA DE DATOS DE GESTIÓN
  const [profileResponse, usageResponse, testimonialsResponse] = await Promise.all([
    // A. Perfil Completo con Suscripción
    supabase
      .from('profiles')
      .select('*, subscriptions(*, plans(*))')
      .eq('id', user.id)
      .single<ProfileData>(),
    
    // B. Uso de Cuota
    supabase
      .from('user_usage')
      .select('podcasts_created_this_month')
      .eq('user_id', user.id)
      .single(),

    // C. TODOS los Testimonios (Incluyendo pendientes para moderar)
    supabase
      .from('profile_testimonials')
      .select('*, author:author_user_id(full_name, avatar_url)')
      .eq('profile_user_id', user.id)
      .order('created_at', { ascending: false })
      .returns<TestimonialWithAuthor[]>()
  ]);

  const profile = profileResponse.data;
  const podcastsCreated = usageResponse.data?.podcasts_created_this_month || 0;
  const testimonials = testimonialsResponse.data || [];

  if (!profile) {
    return <div className="p-8 text-center">Error cargando perfil. Recarga la página.</div>;
  }

  // 3. Renderizado del Dashboard
  return (
    <PrivateProfileDashboard 
      profile={profile} 
      podcastsCreatedThisMonth={podcastsCreated}
      initialTestimonials={testimonials}
    />
  );
}