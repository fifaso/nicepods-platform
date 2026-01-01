// app/profile/page.tsx
// VERSIÓN: 5.1 (Curator Integration: Library Management)

import { createClient } from '@/lib/supabase/server'; // [NOTA]: Ya no requiere cookies()
import { redirect } from 'next/navigation';
import { 
  PrivateProfileDashboard, 
  type ProfileData,
  type TestimonialWithAuthor
  // Asumo que tendrás que exportar un tipo para Colección en tu componente cliente
  // o definirlo aquí si es nuevo.
} from '@/components/profile-client-component';

export default async function PrivateProfileRoute() {
  const supabase = createClient();

  // 1. Auth Check Estricto
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login?redirect=/profile');
  }
  
  // 2. CARGA DE DATOS DE GESTIÓN (Ahora con Colecciones)
  const [profileResponse, usageResponse, testimonialsResponse, collectionsResponse] = await Promise.all([
    // A. Perfil Completo
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

    // C. Testimonios
    supabase
      .from('profile_testimonials')
      .select('*, author:author_user_id(full_name, avatar_url)')
      .eq('profile_user_id', user.id)
      .order('created_at', { ascending: false })
      .returns<TestimonialWithAuthor[]>(),

    // D. [NUEVO] Mis Colecciones (Curaduría)
    // Traemos TODAS (públicas y privadas) para gestión
    supabase
      .from('collections')
      .select('*, collection_items(count)')
      .eq('owner_id', user.id)
      .order('updated_at', { ascending: false })
  ]);

  const profile = profileResponse.data;
  const podcastsCreated = usageResponse.data?.podcasts_created_this_month || 0;
  const testimonials = testimonialsResponse.data || [];
  const myCollections = collectionsResponse.data || []; // [NUEVO]

  if (!profile) {
    return <div className="p-8 text-center text-white">Error cargando perfil. Recarga la página.</div>;
  }

  // 3. Renderizado del Dashboard
  // Nota: Deberás actualizar <PrivateProfileDashboard> para aceptar 'collections'
  return (
    <PrivateProfileDashboard 
      profile={profile} 
      podcastsCreatedThisMonth={podcastsCreated}
      initialTestimonials={testimonials}
      initialCollections={myCollections} // [INYECCIÓN DE DATOS]
    />
  );
}