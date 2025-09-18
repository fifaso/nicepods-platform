// app/profile/page.tsx

import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { ProfileClientComponent, type ProfileData } from '@/components/profile-client-component';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

export default async function ProfilePage() {
  const supabase = createClient(cookies());

  // --- LÓGICA DE GUARDIÁN EN EL SERVIDOR ---
  // Esta es la primera y más importante capa de seguridad.
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login?redirect=/profile');
  }
  
  // --- LÓGICA DE OBTENCIÓN DE DATOS AMPLIADA ---
  // Ejecutamos todas las consultas en paralelo para máxima eficiencia.
  const [
    profileResponse,
    totalPodcastsResponse,
    totalLikesResponse,
    podcastsThisMonthResponse
  ] = await Promise.all([
    // Consulta 1: Obtener el perfil completo del usuario con su plan.
    supabase
      .from('profiles')
      .select('*, subscriptions(*, plans(*))')
      .eq('id', user.id)
      .single<ProfileData>(),
    
    // Consulta 2: Contar el número total de podcasts creados por el usuario.
    supabase
      .from('micro_pods')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id),

    // Consulta 3: Sumar todos los 'like_count' de los podcasts del usuario.
    supabase
      .from('micro_pods')
      .select('like_count')
      .eq('user_id', user.id),
      
    // Consulta 4: Contar los podcasts creados en el último ciclo de 30 días.
    supabase
      .from('micro_pods')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
  ]);

  const { data: profile, error: profileError } = profileResponse;

  if (profileError || !profile) {
    console.error("Error fetching profile for user:", user.id, profileError);
    return (
      <div className="container py-12">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error al Cargar el Perfil</AlertTitle>
          <AlertDescription>No pudimos encontrar los datos de tu perfil. Por favor, intenta recargar la página o contacta con soporte.</AlertDescription>
        </Alert>
      </div>
    );
  }
    
  const totalPodcasts = totalPodcastsResponse.count ?? 0;
  const podcastsCreatedThisMonth = podcastsThisMonthResponse.count ?? 0;
  const totalLikes = totalLikesResponse.data?.reduce((sum, pod) => sum + (pod.like_count || 0), 0) ?? 0;

  // Pasamos todos los datos, ya procesados, al componente de cliente.
  return (
    <ProfileClientComponent 
      profile={profile} 
      podcastsCreatedThisMonth={podcastsCreatedThisMonth}
      totalPodcasts={totalPodcasts}
      totalLikes={totalLikes}
    />
  );
}