// components/resonance-compass.tsx
// VERSIÓN DE LA VICTORIA ABSOLUTA: Antifrágil, adaptativa, dinámica y con el tipo de retorno de useEffect corregido.

"use client";

import { useState, useEffect, useRef } from 'react';
import { PodcastWithProfile } from '@/types/podcast';
import type { Tables } from '@/types/supabase';
import { motion } from 'framer-motion';
import Image from 'next/image';
import * as d3 from 'd3';
import { PodcastCard } from './podcast-card';
import { Compass, Loader2 } from 'lucide-react';
import useResizeObserver from 'use-resize-observer';

type ResonanceProfile = Tables<'user_resonance_profiles'>;

interface SimulationNode extends d3.SimulationNodeDatum {
  id: number;
  podcast: PodcastWithProfile;
}

interface ResonanceCompassProps {
  userProfile: ResonanceProfile | null;
  podcasts: PodcastWithProfile[];
  tags: string[];
}

function PodcastBubble({ node, onSelect }: { node: SimulationNode; onSelect: () => void }) {
  const bubbleRadius = 48;

  return (
    <motion.div
      className="absolute flex flex-col items-center gap-2 cursor-pointer group"
      style={{
        left: `${node.x}px`,
        top: `${node.y}px`,
        transform: 'translate(-50%, -50%)',
      }}
      onClick={onSelect}
      whileHover={{ scale: 1.1 }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 100 }}
    >
      <div 
        className="relative rounded-full overflow-hidden shadow-lg border-2 border-transparent group-hover:border-purple-400 transition-all bg-slate-800"
        style={{ width: `${bubbleRadius * 2}px`, height: `${bubbleRadius * 2}px` }}
      >
        {node.podcast.cover_image_url ? (
          <Image src={node.podcast.cover_image_url} alt={node.podcast.title} fill style={{ objectFit: 'cover' }} />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Compass className="w-8 h-8 text-slate-600" />
          </div>
        )}
      </div>
      <p className="text-xs text-center text-white truncate w-28">{node.podcast.title}</p>
    </motion.div>
  );
}

export function ResonanceCompass({ userProfile, podcasts, tags }: ResonanceCompassProps) {
  const [nodes, setNodes] = useState<SimulationNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPodcast, setSelectedPodcast] = useState<PodcastWithProfile | null>(null);
  const { ref: containerRef, width = 0, height = 0 } = useResizeObserver<HTMLDivElement>();

  useEffect(() => {
    if (!width || !height || podcasts.length === 0) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    const centerX = width / 2;
    const centerY = height / 2;
    const noFlyZoneRadius = Math.min(width, height) * 0.15;

    const initialNodes: SimulationNode[] = podcasts.map((p: PodcastWithProfile) => ({
      id: p.id,
      x: centerX + (Math.random() - 0.5) * 200,
      y: centerY + (Math.random() - 0.5) * 200,
      podcast: p,
    }));

    const simulation = d3.forceSimulation(initialNodes)
      .force('charge', d3.forceManyBody().strength(50))
      .force('radial', d3.forceRadial(noFlyZoneRadius, centerX, centerY).strength(0.6))
      .force('collision', d3.forceCollide().radius(60))
      .on('tick', () => {
        setNodes([...initialNodes]);
      })
      .on('end', () => {
        setIsLoading(false);
      });

    return () => {
      simulation.stop();
    };
  }, [podcasts, width, height]);

  return (
    <div ref={containerRef} className="relative w-full aspect-video max-h-[70vh] max-w-6xl mx-auto bg-gradient-to-br from-gray-900 to-slate-800 rounded-xl overflow-hidden shadow-2xl border border-white/10">
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/30 backdrop-blur-sm z-20">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          <p className="text-muted-foreground">Calibrando tu universo...</p>
        </div>
      )}
      {!isLoading && podcasts.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
           <Compass className="w-12 h-12 text-slate-700" />
           <p className="text-muted-foreground max-w-xs text-center">Aún no hay suficientes datos para construir tu universo. ¡Sigue explorando!</p>
        </div>
      )}
      
      {!isLoading && podcasts.length > 0 && (
        <>
          <motion.div
            className="absolute w-6 h-6 bg-purple-400 rounded-full shadow-[0_0_20px_rgba(192,132,252,0.9)]"
            style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
          >
            <div className="absolute w-full h-full bg-purple-400 rounded-full animate-ping"></div>
          </motion.div>

          {nodes.map((node) => (
            <PodcastBubble key={node.podcast.id} node={node} onSelect={() => setSelectedPodcast(node.podcast)} />
          ))}

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
        </>
      )}
    </div>
  );
}