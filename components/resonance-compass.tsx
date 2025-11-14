// components/resonance-compass.tsx
/**
 * =================================================================================
 * Resonance Compass Orchestrator - v1.0.0
 * =================================================================================
 *
 * Rol en la Arquitectura:
 * Este componente es el "cerebro" orquestador de la Brújula de Resonancia.
 * No se encarga del renderizado visual del mapa o la lista, sino que:
 * 1. Gestiona el estado de los filtros (las "Lentes Temáticas").
 * 2. Detecta el entorno del usuario (móvil vs. escritorio).
 * 3. Delega el renderizado al componente de vista especializado apropiado.
 *
 * Principios de Diseño:
 * - Orquestación, no Implementación: Separa la lógica de control de la lógica de presentación.
 * - Mobile First: Utiliza el hook 'useMobile' para renderizar la experiencia correcta para cada dispositivo.
 * - Eficiencia: El filtrado de datos se realiza una vez en este componente padre.
 *
 */

"use client";

import { useState } from 'react';
import { PodcastWithProfile } from '@/types/podcast';
import type { Tables } from '@/types/supabase';
import { useMobile } from '@/hooks/use-mobile';
import { CompassFilterBar } from './compass-filter-bar';
import { CompassDesktopView } from './compass-desktop-view';
import { CompassMobileView } from './compass-mobile-view';

type ResonanceProfile = Tables<'user_resonance_profiles'>;

// La interfaz de props, ahora completa y sincronizada con sus componentes padres e hijos.
export interface ResonanceCompassProps {
  userProfile: ResonanceProfile | null;
  podcasts: PodcastWithProfile[];
  tags: string[];
}

export function ResonanceCompass({ userProfile, podcasts, tags }: ResonanceCompassProps) {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const isMobile = useMobile();

  // Filtramos la lista de podcasts una sola vez, aquí en el orquestador.
  // Esta lista filtrada se pasará al componente de vista correspondiente.
  const filteredPodcasts = podcasts.filter(podcast => 
    !activeTag || (podcast.ai_tags && podcast.ai_tags.includes(activeTag))
  );

  return (
    <>
      <CompassFilterBar 
        tags={tags}
        activeTag={activeTag}
        onTagSelect={setActiveTag}
      />

      {/* 
        Renderizado condicional: El corazón de nuestra estrategia adaptativa.
        Si 'isMobile' es true, renderizamos la vista lineal y optimizada.
        Si no, renderizamos la experiencia inmersiva de escritorio.
      */}
      {isMobile ? (
        <CompassMobileView 
          userProfile={userProfile}
          podcasts={filteredPodcasts} 
        />
      ) : (
        <CompassDesktopView
          userProfile={userProfile}
          podcasts={filteredPodcasts}
        />
      )}
    </>
  );
}