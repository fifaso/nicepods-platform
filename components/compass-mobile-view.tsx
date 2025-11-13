// components/compass-mobile-view.tsx
// VERSIÓN DE PRODUCCIÓN FINAL: Una vista lineal y optimizada para pantallas pequeñas.

"use client";

import { useMemo } from 'react';
import { PodcastWithProfile } from '@/types/podcast';
import type { Tables } from '@/types/supabase';
import { PodcastCard } from './podcast-card';
import { motion } from 'framer-motion';

type ResonanceProfile = Tables<'user_resonance_profiles'>;

interface CompassMobileViewProps {
  userProfile: ResonanceProfile | null;
  podcasts: PodcastWithProfile[];
}

// Función auxiliar para calcular la distancia euclidiana entre dos puntos.
const calculateDistance = (p1: {x: number, y: number}, p2: {x: number, y: number}) => {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

// Función auxiliar para parsear el tipo POINT de la base de datos a un objeto.
const parsePoint = (point: unknown): {x: number, y: number} => {
    if (typeof point === 'string') {
        const match = point.match(/\(([^,]+),([^)]+)\)/);
        return match ? { x: parseFloat(match[1]), y: parseFloat(match[2]) } : { x: 0, y: 0 };
    }
    if (typeof point === 'object' && point !== null && 'x' in point && 'y' in point) {
        return { x: point.x as number, y: point.y as number };
    }
    return { x: 0, y: 0 };
}

export function CompassMobileView({ userProfile, podcasts }: CompassMobileViewProps) {
  // Memoizamos los cálculos para un rendimiento óptimo.
  const userCenter = useMemo(() => parsePoint(userProfile?.current_center), [userProfile]);

  const sortedPodcasts = useMemo(() => {
    return podcasts
      .map(podcast => {
        const podcastCoords = parsePoint(podcast.final_coordinates);
        const distance = calculateDistance(userCenter, podcastCoords);
        return { ...podcast, distance };
      })
      .sort((a, b) => a.distance - b.distance);
  }, [podcasts, userCenter]);

  // Dividimos los podcasts en "órbitas" basadas en la cercanía.
  const orbit1 = sortedPodcasts.slice(0, 3);  // Máxima Resonancia
  const orbit2 = sortedPodcasts.slice(3, 8); // Alta Resonancia
  const orbit3 = sortedPodcasts.slice(8);   // Exploración Extendida

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {orbit1.length > 0 && (
        <motion.div variants={itemVariants} className="p-4 bg-accent/20 rounded-lg border border-border">
          <h2 className="text-xl font-bold mb-2 text-primary">Máxima Resonancia</h2>
          <p className="text-muted-foreground mb-4">Estas son las ideas más cercanas a tu centro de gravedad actual.</p>
          <div className="space-y-4">
            {orbit1.map(p => <PodcastCard key={p.id} podcast={p} />)}
          </div>
        </motion.div>
      )}
      
      {orbit2.length > 0 && (
        <motion.div variants={itemVariants} className="space-y-4">
          <h2 className="text-xl font-bold">Alta Resonancia</h2>
          {orbit2.map(p => <PodcastCard key={p.id} podcast={p} />)}
        </motion.div>
      )}

      {orbit3.length > 0 && (
        <motion.div variants={itemVariants} className="space-y-4">
          <h2 className="text-xl font-bold text-muted-foreground">Exploración Extendida</h2>
          {orbit3.map(p => <PodcastCard key={p.id} podcast={p} />)}
        </motion.div>
      )}
    </motion.div>
  );
}