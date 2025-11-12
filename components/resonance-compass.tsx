// components/resonance-compass.tsx
// VERSIÓN DE LA VICTORIA ABSOLUTA: Con tipos robustos y programación defensiva.

"use client";

import { useState } from 'react';
import { PodcastWithProfile } from '@/types/podcast';
import type { Tables } from '@/types/supabase';
import { motion } from 'framer-motion';
import { PodcastCard } from './podcast-card';

type ResonanceProfile = Tables<'user_resonance_profiles'>;

interface ResonanceCompassProps {
  userProfile: ResonanceProfile | null;
  podcasts: PodcastWithProfile[];
}

// [INTERVENCIÓN QUIRÚRGICA DE LA VICTORIA]
// Hacemos la función más robusta para que acepte 'unknown' y actúe como un "Type Guard".
const normalizeCoordinates = (point: unknown): { x: number; y: number } => {
  let x = 0;
  let y = 0;

  // Guardián #1: ¿Es un string con el formato esperado "(num,num)"?
  if (typeof point === 'string') {
    const match = point.match(/\(([^,]+),([^)]+)\)/);
    if (match) {
      x = parseFloat(match[1]);
      y = parseFloat(match[2]);
    }
  } 
  // Guardián #2: ¿Es un objeto con las propiedades 'x' e 'y'?
  else if (typeof point === 'object' && point !== null && 'x' in point && 'y' in point) {
    // TypeScript ahora sabe que point tiene 'x' e 'y', por lo que podemos acceder a ellas de forma segura.
    x = point.x as number;
    y = point.y as number;
  }
  // Si no es ninguno de los formatos esperados, x e y permanecerán en 0,
  // devolviendo un punto central seguro por defecto.

  // Normalizar las coordenadas de (-10 a 10) a un porcentaje (0% a 100%) para CSS.
  return {
    x: (x + 10) / 20 * 100,
    y: (y + 10) / 20 * 100,
  };
};

export function ResonanceCompass({ userProfile, podcasts }: ResonanceCompassProps) {
  const [selectedPodcast, setSelectedPodcast] = useState<PodcastWithProfile | null>(null);
  
  // Ahora estas llamadas son 100% seguras a nivel de tipo.
  const userCoords = normalizeCoordinates(userProfile?.current_center);

  return (
    <div className="relative w-full aspect-square max-w-4xl mx-auto bg-gray-900/50 rounded-xl overflow-hidden shadow-lg border border-white/10">
      <div className="absolute rounded-full border border-white/10 opacity-50" style={{ left: `${userCoords.x}%`, top: `${userCoords.y}%`, width: '40%', height: '40%', transform: 'translate(-50%, -50%)' }} />
      <div className="absolute rounded-full border border-white/10 opacity-30" style={{ left: `${userCoords.x}%`, top: `${userCoords.y}%`, width: '80%', height: '80%', transform: 'translate(-50%, -50%)' }} />

      <motion.div
        className="absolute w-4 h-4 bg-purple-400 rounded-full shadow-[0_0_15px_rgba(192,132,252,0.8)]"
        style={{ left: `${userCoords.x}%`, top: `${userCoords.y}%`, transform: 'translate(-50%, -50%)' }}
        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }}
      >
        <div className="absolute w-full h-full bg-purple-400 rounded-full animate-ping"></div>
      </motion.div>

      {podcasts.map((podcast, i) => {
        // Esta llamada ahora también es 100% segura.
        const coords = normalizeCoordinates(podcast.final_coordinates);
        return (
          <motion.button
            key={podcast.id}
            className="absolute w-3 h-3 bg-white rounded-full hover:bg-teal-300 transition-colors"
            style={{ left: `${coords.x}%`, top: `${coords.y}%`, transform: 'translate(-50%, -50%)' }}
            onClick={() => setSelectedPodcast(podcast)}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.8 + i * 0.02, type: 'spring', stiffness: 100 }}
          />
        );
      })}

      {selectedPodcast && (
        <motion.div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedPodcast(null)}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        >
            <motion.div 
                className="w-full max-w-sm" 
                onClick={(e) => e.stopPropagation()}
                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            >
                <PodcastCard podcast={selectedPodcast} />
            </motion.div>
        </motion.div>
      )}
    </div>
  );
}