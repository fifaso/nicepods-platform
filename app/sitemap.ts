import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

const BASE_URL = 'https://nicepod.app'; // Tu dominio real

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient();

  // 1. Obtener Perfiles Públicos Relevantes (ej: verificados o con reputación > 10)
  const { data: profiles } = await supabase
    .from('profiles')
    .select('handle, updated_at')
    .gt('reputation_score', 10) 
    .limit(1000);

  // 2. Obtener Colecciones Públicas
  const { data: collections } = await supabase
    .from('collections')
    .select('id, updated_at')
    .eq('is_public', true)
    .limit(1000);

  // 3. Generar URLs Estáticas
  const routes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/create`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  // 4. Mapear Perfiles
  const profileUrls = (profiles || []).map((p) => ({
    url: `${BASE_URL}/u/${p.handle}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // 5. Mapear Colecciones
  const collectionUrls = (collections || []).map((c) => ({
    url: `${BASE_URL}/collection/${c.id}`,
    lastModified: new Date(c.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...routes, ...profileUrls, ...collectionUrls];
}