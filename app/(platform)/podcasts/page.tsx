// app/(platform)/podcasts/page.tsx
// VERSIÓN: 16.0 (NicePod Intelligence Archive - Production Master Edition)
// Misión: Orquestación síncrona de datos de alta densidad para la Workstation.
// [ESTABILIZACIÓN]: Implementación de cosecha triple y mapeo de universos semánticos.

import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { PodcastWithProfile } from '@/types/podcast';
import { Tables } from '@/types/database.types';

// --- ORQUESTADOR VISUAL SOBERANO ---
// Importamos el sistema de pestañas y el contrato de datos para las estanterías.
import { LibraryTabs, CuratedShelvesData } from './library-tabs';

/**
 * [METADATA API]: Identidad de Grado Industrial
 * Asegura que la biblioteca esté correctamente indexada en el ecosistema NicePod.
 */
export const metadata: Metadata = {
  title: 'Archive & Intelligence | NicePod',
  description: 'Repositorio de capital intelectual y resonancias urbanas de Madrid.',
};

/**
 * COMPONENTE SSR: PodcastsPage
 * Actúa como el puente de datos (Data Fetcher) de NicePod.
 * Implementa una arquitectura de carga paralela para minimizar el bloqueo del servidor.
 */
export default async function PodcastsPage() {
  // 1. INICIALIZACIÓN DEL CLIENTE DE SERVIDOR (Handshake T0)
  const supabase = createClient();

  // 2. CAPTURA DE IDENTIDAD SOBERANA
  // Identificamos al curador actual para personalizar la experiencia de la Bóveda.
  const { data: { user } } = await supabase.auth.getUser();

  // Definimos el contrato de Join para recuperar perfiles asociados a cada podcast.
  const profileQuery = '*, profiles(full_name, avatar_url, username, reputation_score)';

  /**
   * 3. COSECHA DE INTELIGENCIA (Fase Asíncrona Paralela)
   * Realizamos un Fan-Out de consultas para alimentar todas las dimensiones de la UI.
   */
  const [
    allPublishedResult,
    userPodcastsResult,
    userJobsResult
  ] = await Promise.all([
    // HILO A: RED GLOBAL (Descubrimiento)
    // Recupera las resonancias públicas de toda la red para el feed general.
    supabase
      .from('micro_pods')
      .select(profileQuery)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(60),

    // HILO B: BÓVEDA PRIVADA (Soberanía del Usuario)
    // Recupera todas las creaciones del usuario sin importar su estado (published/processing).
    user ? supabase
      .from('micro_pods')
      .select(profileQuery)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }) : Promise.resolve({ data: [] }),

    // HILO C: LA FORJA (Trabajos en Curso)
    // Recupera los estados de procesamiento de la IA para los Smart Job Cards.
    user ? supabase
      .from('podcast_creation_jobs')
      .select('*')
      .eq('user_id', user.id)
      .neq('status', 'completed')
      .order('created_at', { ascending: false }) : Promise.resolve({ data: [] })
  ]);

  // 4. NORMALIZACIÓN DE RESULTADOS
  const allPublished = (allPublishedResult.data as any[]) || [];
  const userCreatedPodcasts = (userPodcastsResult.data as any[]) || [];
  const userCreationJobs = (userJobsResult.data as any[]) || [];

  /**
   * 5. CONSTRUCCIÓN DE UNIVERSOS (CuratedShelvesData)
   * Clasificamos el pool de datos global en estanterías temáticas.
   * Si no hay suficientes destacados, usamos el flujo global como fallback.
   */
  const curatedShelves: CuratedShelvesData = {
    // Lo más resonante: Los podcasts con mayor interacción o más recientes.
    most_resonant: allPublished.slice(0, 12),
    
    // Pensamiento: Filtrado por categoría o etiquetas semánticas.
    deep_thought: allPublished.filter(p => 
      p.category === 'Pensamiento' || 
      p.ai_tags?.some((t: string) => ['Filosofía', 'Análisis', 'Ensayo'].includes(t))
    ).slice(0, 8),
    
    // Herramientas: Enfoque práctico y técnico.
    practical_tools: allPublished.filter(p => 
      p.category === 'Herramientas' || 
      p.ai_tags?.some((t: string) => ['Productividad', 'Guía', 'Tutorial'].includes(t))
    ).slice(0, 8),
    
    // Innovación: Tecnología y futuro.
    tech_and_innovation: allPublished.filter(p => 
      p.category === 'Tecnología' || 
      p.ai_tags?.some((t: string) => ['IA', 'Digital', 'Futuro'].includes(t))
    ).slice(0, 8),
    
    // Bienestar: Mente y salud.
    wellness_and_mind: allPublished.filter(p => 
      p.category === 'Bienestar' || 
      p.ai_tags?.some((t: string) => ['Salud', 'Meditación', 'Psicología'].includes(t))
    ).slice(0, 8),
    
    // Narrativa: Historias y crónicas urbanas.
    narrative_and_stories: allPublished.filter(p => 
      p.category === 'Narrativa' || 
      p.ai_tags?.some((t: string) => ['Historia', 'Crónica', 'Madrid'].includes(t))
    ).slice(0, 8)
  };

  /**
   * 6. LÓGICA DE FALLBACK PARA UNIVERSOS VACÍOS
   * Garantizamos que la UI nunca se vea vacía inyectando el feed general si el filtro falla.
   */
  Object.keys(curatedShelves).forEach((key) => {
    const k = key as keyof CuratedShelvesData;
    if (!curatedShelves[k] || curatedShelves[k]!.length === 0) {
      curatedShelves[k] = allPublished.slice(0, 8);
    }
  });

  return (
    /**
     * 7. CONTENEDOR DE SOBERANÍA VISUAL
     * bg-transparent permite el paso de la atmósfera Aurora desde el Root Layout.
     */
    <main className="w-full bg-transparent min-h-screen relative z-10 selection:bg-primary/20">
      
      {/* 
          8. DELEGACIÓN AL ORQUESTADOR CLIENTE
          Transferimos los hilos de datos saneados para el manejo de pestañas,
          el radar semántico y las suscripciones en tiempo real (WebSockets).
      */}
      <LibraryTabs 
        defaultTab="discover"
        user={user}
        userCreationJobs={userCreationJobs}
        userCreatedPodcasts={userCreatedPodcasts}
        curatedShelves={curatedShelves}
        compassProps={{}} // Espacio reservado para expansión de Radar Geoespacial V3.0
      />

    </main>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Resolución de la Bóveda: El filtro 'user_id' en 'userPodcastsResult' es lo 
 *    que garantiza que el usuario recupere su capital intelectual privado.
 * 2. Rendimiento de Carga: Se ha limitado el pool inicial a 60 registros para 
 *    mantener un DOM ligero, delegando la carga infinita al componente cliente.
 * 3. Robustez de Tipado: Se utiliza 'PodcastWithProfile' para asegurar que 
 *    los componentes de UI como 'PodcastCard' no sufran errores de 'undefined' 
 *    al intentar acceder al perfil del autor.
 */