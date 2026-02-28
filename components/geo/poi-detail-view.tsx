// components/geo/poi-detail-view.tsx
// VERSIÓN: 1.0

"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  MapPin, 
  Zap, 
  Play, 
  Pause,
  BookOpen, 
  History,
  Share2,
  Clock,
  ArrowRight
} from "lucide-react";
import { useRouter } from "next/navigation";

// --- INFRAESTRUCTURA UI ---
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, getSafeAsset, formatTime } from "@/lib/utils";
import { useAudio } from "@/contexts/audio-context";

// --- CONTRATOS DE DATOS ---
import { PodcastWithProfile } from "@/types/podcast";

/**
 * INTERFAZ: POIDetailViewProps
 * Misión: Recibir el Dossier completo del POI y su podcast vinculado.
 */
interface POIDetailViewProps {
  poi: {
    id: string;
    name: string;
    category: string;
    historical_fact: string | null;
    rich_description: string | null;
    gallery_urls: string[];
    reference_podcast_id: number | null;
  };
  linkedPodcast: PodcastWithProfile | null;
}

/**
 * COMPONENTE: POIDetailView
 * El escenario definitivo para la absorción de conocimiento.
 */
export function POIDetailView({ poi, linkedPodcast }: POIDetailViewProps) {
  const router = useRouter();
  const { playPodcast, currentPodcast, isPlaying } = useAudio();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Lógica de reproducción vinculada
  const isCurrentlyPlaying = currentPodcast?.id === linkedPodcast?.id && isPlaying;

  /**
   * handleTuneIn:
   * Dispara la sintonía del audio asociado al punto de interés.
   */
  const handleTuneIn = () => {
    if (linkedPodcast) {
      playPodcast(linkedPodcast);
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] text-zinc-300 pb-32 selection:bg-primary/30">
      
      {/* 1. CABECERA TÁCTICA (NAVIGATION BAR) */}
      <header className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.back()}
          className="rounded-full bg-white/5 border border-white/5 text-white/60 hover:text-white transition-all"
        >
          <ChevronLeft size={24} />
        </Button>
        <div className="flex gap-4">
          <Button variant="ghost" size="icon" className="rounded-full bg-white/5 border border-white/5 text-white/60">
            <Share2 size={18} />
          </Button>
        </div>
      </header>

      {/* 2. ESCENARIO MONUMENTAL (HERO GALLERY) */}
      <section className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeImageIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <Image 
              src={getSafeAsset(poi.gallery_urls[activeImageIndex], 'cover')}
              alt={poi.name}
              fill
              className="object-cover"
              priority
            />
          </motion.div>
        </AnimatePresence>

        {/* Filtros Atmosféricos Aurora */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-[#020202]/20 to-transparent z-10" />
        <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] z-10" />

        {/* Identidad del Nodo (Overlay sobre imagen) */}
        <div className="absolute bottom-10 left-6 md:left-12 z-20 space-y-4 max-w-4xl animate-in fade-in slide-in-from-bottom-6 duration-1000">
          <div className="flex items-center gap-3">
            <Badge className="bg-primary text-white border-none font-black text-[9px] uppercase tracking-[0.4em] px-3 py-1 rounded-md">
              {poi.category}
            </Badge>
            <div className="flex items-center gap-2 text-white/40">
              <History size={12} />
              <span className="text-[9px] font-bold uppercase tracking-widest">Crónica Validada</span>
            </div>
          </div>
          <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter text-white leading-none drop-shadow-2xl">
            {poi.name}
          </h1>
        </div>
      </section>

      {/* 3. BLOQUE DE ACCIÓN ACÚSTICA (CONSOLA FLOTANTE) */}
      <section className="max-w-4xl mx-auto px-6 -mt-10 relative z-30">
        <div className="p-8 rounded-[2.5rem] bg-zinc-900/50 border border-white/10 backdrop-blur-3xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="relative h-16 w-16 rounded-2xl overflow-hidden border border-white/10 shrink-0 shadow-inner bg-zinc-800">
               {linkedPodcast?.cover_image_url && (
                 <Image src={linkedPodcast.cover_image_url} alt="" fill className="object-cover opacity-60" />
               )}
               <Zap size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary animate-pulse" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Frecuencia Disponible</p>
              <h4 className="text-white font-bold text-lg leading-tight uppercase tracking-tight">
                {linkedPodcast?.title || "Escuchar Crónica del Lugar"}
              </h4>
              <div className="flex items-center gap-3 text-zinc-500">
                <div className="flex items-center gap-1.5">
                  <Clock size={12} />
                  <span className="text-[10px] font-bold tabular-nums">
                    {linkedPodcast?.duration_seconds ? formatTime(linkedPodcast.duration_seconds) : 'V-NUL'}
                  </span>
                </div>
                <span className="h-1 w-1 rounded-full bg-white/10" />
                <span className="text-[10px] font-black uppercase tracking-widest">Podcast Neuronal</span>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleTuneIn}
            className={cn(
              "w-full md:w-auto h-16 px-10 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all duration-500",
              isCurrentlyPlaying ? "bg-white text-black scale-105" : "bg-primary text-white hover:scale-105"
            )}
          >
            {isCurrentlyPlaying ? (
              <><Pause className="mr-3 h-5 w-5 fill-current" /> Pausar Eco</>
            ) : (
              <><Play className="mr-3 h-5 w-5 fill-current" /> Sintonizar</>
            )}
          </Button>
        </div>
      </section>

      {/* 4. CUERPO NARRATIVO (RICH CONTENT) */}
      <section className="max-w-4xl mx-auto px-6 mt-20 space-y-16 animate-in fade-in duration-1000 delay-500">
        
        {/* Hecho Rápido (Callout) */}
        {poi.historical_fact && (
          <div className="border-l-4 border-primary pl-8 py-2">
            <p className="text-2xl md:text-3xl font-black italic text-white/90 leading-tight uppercase tracking-tighter">
              "{poi.historical_fact}"
            </p>
          </div>
        )}

        {/* Descripción Extensa */}
        <div className="space-y-8">
           <div className="flex items-center gap-3 opacity-30">
              <BookOpen size={16} className="text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em]">Archivo de Sabiduría</span>
           </div>
           
           <div className="prose prose-invert max-w-none">
              <p className="text-lg md:text-xl font-medium leading-relaxed text-zinc-400 first-letter:text-5xl first-letter:font-black first-letter:text-white first-letter:mr-3 first-letter:float-left first-letter:italic">
                {poi.rich_description || "Descifrando la memoria histórica de este nodo..."}
              </p>
           </div>
        </div>

        {/* Galería de Evidencia (Thumbnail Grid) */}
        {poi.gallery_urls.length > 1 && (
          <div className="space-y-6 pt-10 border-t border-white/5">
             <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Evidencia Visual</h5>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {poi.gallery_urls.map((url, i) => (
                  <div 
                    key={i} 
                    onClick={() => setActiveImageIndex(i)}
                    className={cn(
                      "relative aspect-square rounded-2xl overflow-hidden cursor-pointer border-2 transition-all duration-500",
                      activeImageIndex === i ? "border-primary scale-95 shadow-lg" : "border-transparent opacity-40 hover:opacity-100"
                    )}
                  >
                    <Image src={getSafeAsset(url, 'cover')} alt="" fill className="object-cover" />
                  </div>
                ))}
             </div>
          </div>
        )}

      </section>

      {/* FOOTER DE CIERRE DE SESIÓN URBANA */}
      <footer className="mt-40 flex flex-col items-center gap-6 opacity-10 py-20 border-t border-white/5">
         <Zap size={24} className="text-primary" />
         <p className="text-[8px] font-black uppercase tracking-[0.8em]">NicePod V2.5 • Madrid Resonance Node</p>
      </footer>

    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Performance LCP: La primera imagen de la galería usa la propiedad 'priority' 
 *    para forzar el renderizado antes que el Javascript pesado.
 * 2. Integridad Acústica: El botón de 'Sintonizar' está vinculado directamente al 
 *    AudioProvider, lo que permite que el usuario comience la escucha y luego 
 *    pueda salir de la página de detalle sin que el audio se detenga (Persistencia).
 * 3. Diseño de Inmersión: Al no usar un Layout estándar (Navbar/Sidebar), 
 *    creamos un 'Focus Mode' absoluto que obliga al Voyager a conectar con el lugar.
 */