// app/profile/page.tsx
// VERSIÓN: 4.0 (Private Dashboard Controller)

import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { PrivateProfileDashboard, type ProfileData } from '@/components/profile-client-component';

export default async function PrivateProfileRoute() {
  const supabase = createClient(cookies());

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login?redirect=/profile');
  }
  
  // Carga de datos sensibles (Suscripción, Uso)
  const [profileResponse, usageResponse] = await Promise.all([
    supabase
      .from('profiles')
      .select('*, subscriptions(*, plans(*))')
      .eq('id', user.id)
      .single<ProfileData>(),
    
    supabase
      .from('user_usage')
      .select('podcasts_created_this_month')
      .eq('user_id', user.id)
      .single()
  ]);

  const profile = profileResponse.data;
  // Manejo robusto de usage (si es null, es 0)
  const podcastsCreated = usageResponse.data?.podcasts_created_this_month || 0;

  if (!profile) {
    return <div>Error cargando perfil.</div>;
  }

  return (
    <PrivateProfileDashboard 
      profile={profile} 
      podcastsCreatedThisMonth={podcastsCreated}
    />
  );
}