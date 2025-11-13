// components/compass-desktop-view.tsx
// VERSIÓN DE PRODUCCIÓN FINAL: La experiencia inmersiva del mapa estelar para pantallas grandes.

"use client";

import { useState } from 'react';
import { PodcastWithProfile } from '@/types/podcast';
import type { Tables } from '@/types/supabase';
import { motion } from 'framer-motion';
import { PodcastCard } from './podcast-card';

type ResonanceProfile = Tables<'user_resonance_profiles'>;

// Hacemos que las props sean explícitas para este componente.
interface CompassDesktopViewProps {
  userProfile: ResonanceProfile | null;
  podcasts: PodcastWithProfile[];
}

const normalizeCoordinates = (point: unknown): { x: number; y: number } => {
  let x = 0;
  let y = 0;
  if (typeof point === 'string') {
    const match = point.match(/\(([^,]+),([^)]+)\)/);
    if (match) {
      x = parseFloat(match[1]);
      y = parseFloat(match[2]);
    }
  } else if (typeof point === 'object' && point !== null && 'x' in point && 'y' in point) {
    x = point.x as number;
    y = point.y as number;
  }
  return {
    x: (x + 10) / 20 * 100,
    y: 100 - ((y + 10) / 20 * 100),
  };
};

export function CompassDesktopView({ userProfile, podcasts }: CompassDesktopViewProps) {
  const [selectedPodcast, setSelectedPodcast] = useState<PodcastWithProfile | null>(null);
  const userCoords = normalizeCoordinates(userProfile?.current_center);

  return (
    <div className="relative w-full aspect-square max-w-4xl mx-auto bg-gradient-to-br from-gray-900 to-slate-800 rounded-xl overflow-hidden shadow-2xl border border-white/10">
      <div className="absolute rounded-full border border-purple-400/20" style={{ left: `${userCoords.x}%`, top: `${userCoords.y}%`, width: '30%', paddingTop: '30%', transform: 'translate(-50%, -50%)' }} />
      <div className="absolute rounded-full border border-purple-400/10" style={{ left: `${userCoords.x}%`, top: `${userCoords.y}%`, width: '60%', paddingTop: '60%', transform: 'translate(-50%, -50%)' }} />
      <div className="absolute rounded-full border border-purple-400/5" style={{ left: `${userCoords.x}%`, top: `${userCoords.y}%`, width: '90%', paddingTop: '90%', transform: 'translate(-50%, -50%)' }} />

      <motion.div
        className="absolute w-4 h-4 bg-purple-400 rounded-full shadow-[0_0_15px_rgba(192,132,252,0.8)]"
        style={{ left: `${userCoords.x}%`, top: `${userCoords.y}%` }}
        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }}
      >
        <div className="absolute w-full h-full bg-purple-400 rounded-full animate-ping -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute w-full h-full rounded-full -translate-x-1/2 -translate-y-1/2" />
      </motion.div>

      {podcasts.map((podcast, i) => {
        const coords = normalizeCoordinates(podcast.final_coordinates);
        return (
          <motion.button
            key={podcast.id}
            className="absolute w-2.5 h-2.5 bg-white rounded-full hover:bg-teal-300 transition-colors shadow-[0_0_8px_rgba(255,255,255,0.5)]"
            style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
            onClick={() => setSelectedPodcast(podcast)}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.8 + i * 0.01, type: 'spring', stiffness: 120 }}
            whileHover={{ scale: 2.5 }}
          />
        );
      })}

      {selectedPodcast && (
        <motion.div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-10"
            onClick={() => setSelectedPodcast(null)}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        >
            <motion.div 
                className="w-full max-w-sm" 
                onClick={(e) => e.stopPropagation()}
                initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            >
                <PodcastCard podcast={selectedPodcast} />
            </motion.div>
        </motion.div>
      )}
    </div>
  );
}