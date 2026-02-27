// app/(platform)/podcasts/page.tsx
// VERSIÓN: 12.1

import { createClient } from '@/lib/supabase/server';
import { PodcastWithProfile } from '@/types/podcast';
import { Metadata } from 'next';

// --- COMPONENTE CLIENTE DE RENDERIZADO CLÁSICO ---
// Restablecemos la conexión con el componente que usted prefiere,
// el cual maneja su propia interfaz de búsqueda, tabs y diseño visual.
import { PodcastLibraryClient } from './podcast-library-client';

/**
 * [METADATA API]: Identidad SEO
 * Garantiza que la biblioteca tenga autoridad de indexación.
 */
export const metadata: Metadata = {
  title: 'Intelligence Archive | NicePod',
  description: 'Explora cápsulas de conocimiento audibles de alta densidad.',
};

/**
 * COMPONENTE SSR: PodcastsPage
 * Actúa como el puente de datos (Data Fetcher) antes de entregar 
 * el control de la UI al navegador del usuario.
 */
export default async function PodcastsPage() {
  // 1. INICIALIZACIÓN DEL MOTOR DE BASE DE DATOS
  const supabase = createClient();

  // Realizamos el Handshake de Identidad en el servidor
  const { data: { user } } = await supabase.auth.getUser();

  // 2. CONFIGURACIÓN DE CONSULTA DE ALTA DENSIDAD
  // Este query asegura que cuando nos traemos un podcast, también nos 
  // traemos la identidad de su creador (JOIN automático en Supabase).
  const profileQuery = '*, profiles(full_name, avatar_url, username)';

  /**
   * 3. COSECHA DE INTELIGENCIA (Fase Asíncrona Paralela)
   * Utilizamos Promise.all para optimizar el Time To First Byte (TTFB).
   * No bloqueamos el servidor esperando secuencialmente.
   */
  const [
    userPodcastsResult,
    totalPodcastsResult
  ] = await Promise.all([

    // A. Extracción de Crónicas: 
    // Recupera todos los podcasts que tienen estado 'published'.
    // Esto asegura que la biblioteca no muestre borradores incompletos.
    supabase
      .from('micro_pods')
      .select(profileQuery)
      .eq('status', 'published')
      .order('created_at', { ascending: false }),

    // B. Telemetría Total:
    // Extrae el conteo exacto de los activos en la red sin descargar
    // el peso de todos los objetos, optimizando la RAM del servidor.
    supabase
      .from('micro_pods')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')
  ]);

  // 4. NORMALIZACIÓN DE HALLAZGOS Y SANEAMIENTO DE TIPOS
  // Si la consulta fallara, pasamos un array vacío para no romper la hidratación.
  const allPodcasts: PodcastWithProfile[] = (userPodcastsResult.data as any[]) || [];
  const totalPodcastsCount = totalPodcastsResult.count || 0;

  return (
    /**
     * 5. EL LIENZO TRANSPARENTE
     * [FIX ESTRUCTURAL]: Usamos 'bg-transparent' para asegurar que este contenedor 
     * no actúe como una pared opaca. Esto permite que los "Blobs Aurora" del 
     * Root Layout (app/layout.tsx) sean visibles a través de la biblioteca.
     */
    <div className="w-full bg-transparent min-h-screen relative z-10 selection:bg-primary/20">

      {/* 
          6. DELEGACIÓN DE SOBERANÍA VISUAL
          Inyectamos los datos saneados en el cliente de la biblioteca clásica.
          Este componente ya contiene su propio Header Monumental, su buscador 
          (con el input estilo oscuro) y sus pestañas de navegación.
      */}
      <PodcastLibraryClient
        podcasts={allPodcasts}
        totalPodcasts={totalPodcastsCount}
      />

    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * Al restaurar este archivo, el conflicto de "doble cabecera" 
 * ("CENTRO DE DESCUBRIMIENTO" vs "ARCHIVO GLOBAL") que vimos en sus imágenes
 * se resolverá instantáneamente, ya que este Server Component no renderiza 
 * ningún HTML adicional; solo orquesta datos para 'PodcastLibraryClient'.
 */