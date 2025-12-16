// app/profile/[username]/page.tsx
// VERSIÓN: 4.0 (Security: Canonical Redirect & Public View)

import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { PublicProfilePage, type ProfileData, type PublicPodcast } from '@/components/profile-client-component';

type ProfilePageProps = {
  params: { username: string };
};

export default async function PublicProfileRoute({ params }: ProfilePageProps) {
  const supabase = createClient(cookies());

  // 1. Identificar al visitante (si existe)
  const { data: { user: visitor } } = await supabase.auth.getUser();

  // 2. Buscar al dueño del perfil por USERNAME (no ID)
  // IMPORTANTE: decodeURIComponent para manejar espacios o caracteres especiales en URL
  const targetUsername = decodeURIComponent(params.username);
  
  const { data: targetProfile, error } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url, bio')
    .eq('username', targetUsername)
    .single<ProfileData>();
  
  if (error || !targetProfile) {
    notFound(); // 404 si el usuario no existe
  }
  
  // 3. CHECK DE ESPEJO: ¿Soy yo mismo?
  // Si el ID del visitante coincide con el ID del perfil buscado, redirigir al panel privado.
  // Esto evita tener dos URLs para lo mismo y mejora la seguridad.
  if (visitor?.id === targetProfile.id) {
    redirect('/profile');
  }

  // 4. Cargar datos PÚBLICOS (Solo podcasts published)
  const [podcastsResponse, likesResponse] = await Promise.all([
    supabase
      .from('micro_pods')
      .select('id, title, description, audio_url, created_at, duration_seconds')
      .eq('user_id', targetProfile.id)
      .eq('status', 'published') // SEGURIDAD: Solo lo publicado
      .order('created_at', { ascending: false }),
      
    supabase
      .from('micro_pods')
      .select('like_count')
      .eq('user_id', targetProfile.id)
      .eq('status', 'published')
  ]);

  const podcasts = (podcastsResponse.data || []) as PublicPodcast[];
  const totalLikes = likesResponse.data?.reduce((sum, p) => sum + (p.like_count || 0), 0) ?? 0;

  // 5. Renderizar Vista Pública
  return (
    <PublicProfilePage 
      profile={targetProfile} 
      podcasts={podcasts}
      totalLikes={totalLikes}
    />
  );
}