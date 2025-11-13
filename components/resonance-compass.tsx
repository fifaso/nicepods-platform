// components/resonance-compass.tsx
// VERSIÓN DE PRODUCCIÓN FINAL: Orquesta las vistas de escritorio y móvil.

"use client";

import { useState } from 'react';
import { PodcastWithProfile } from '@/types/podcast';
import type { Tables } from '@/types/supabase';
import { useMobile } from '@/hooks/use-mobile';
import { CompassFilterBar } from './compass-filter-bar';
import { CompassDesktopView } from './compass-desktop-view';
import { CompassMobileView } from './compass-mobile-view';

type ResonanceProfile = Tables<'user_resonance_profiles'>;

export interface ResonanceCompassProps {
  userProfile: ResonanceProfile | null;
  podcasts: PodcastWithProfile[];
  tags: string[];
}

export function ResonanceCompass({ userProfile, podcasts, tags }: ResonanceCompassProps) {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const isMobile = useMobile();

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