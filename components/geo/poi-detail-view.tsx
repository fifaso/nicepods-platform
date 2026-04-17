/**
 * ARCHIVO: components/geo/poi-detail-view.tsx
 * VERSIÓN: 5.0 (Madrid Resonance - Sovereign Edition)
 * PROTOCOLO: MADRID RESONANCE V7.0
 * 
 * Misión: Proyectar el dossier de inteligencia urbana en su totalidad.
 * [REFORMA V5.0]: Sincronización axial completa con el contrato purificado V7.0.
 * Eliminación de fugas snake_case y alineación absoluta con la Doctrina ZAP.
 *
 * Nivel de Integridad: 100% (Soberanía Nominal V7.0)
 */

"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  Zap, 
  Play, 
  Pause,
  BookOpen, 
  Share2,
  Clock,
  ExternalLink,
  ShieldCheck,
  CalendarDays,
  Fingerprint,
  Info
} from "lucide-react";
import { useRouter } from "next/navigation";

// --- INFRAESTRUCTURA UI ---
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, getSafeAsset, formatTime, nicepodLog } from "@/lib/utils";
import { useAudio } from "@/contexts/audio-context";

// --- SOBERANÍA DE TIPOS ---
import { 
  CategoryMission, 
  CategoryEntity, 
  HistoricalEpoch 
} from "@/types/geo-sovereignty";
import { PodcastWithProfile } from "@/types/podcast";

/**
 * INTERFAZ SOBERANA: PointOfInterestDetailViewProperties
 */
interface PointOfInterestDetailViewProperties {
  pointOfInterest: {
    identification: number;
    name: string;
    categoryMission: CategoryMission;
    categoryEntity: CategoryEntity;
    historicalEpoch: HistoricalEpoch;
    historicalFact: string | null;
    richDescription: string | null;
    galleryUniformResourceLocators: string[];
    externalReferenceUniformResourceLocator?: string | null;
    groundingAnalysisSummary?: string | null;
    referencePodcastIdentification: number | null;
  };
  linkedPodcast: PodcastWithProfile | null;
}

/**
 * TRADUCCIÓN DE ÉPOCAS
 */
const EPOCH_LABELS: Record<HistoricalEpoch, string> = {
  origen_geologico: "Origen Geológico",
  pre_industrial: "Madrid Pre-Industrial",
  siglo_de_oro: "Siglo de Oro Español",
  ilustracion_borbonica: "Ilustración Borbónica",
  modernismo_expansion: "Expansión Modernista",
  contemporaneo: "Era Contemporánea",
  futuro_especulativo: "Futuro Especulativo",
  atemporal: "Legado Atemporal"
};

export function POIDetailView({ 
  pointOfInterest, 
  linkedPodcast 
}: PointOfInterestDetailViewProperties) {
  const router = useRouter();
  const { playPodcastAction, currentActivePodcast, isAudioPlayingStatus } = useAudio();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const isCurrentlyPlaying = currentActivePodcast?.identification === linkedPodcast?.identification && isAudioPlayingStatus;

  const configuracionVisual = useMemo(() => {
    switch (pointOfInterest.categoryMission) {
      case 'infraestructura_vital': return { primary: "text-amber-500", background: "bg-amber-500", glow: "shadow-amber-500/20" };
      case 'memoria_soberana': return { primary: "text-emerald-500", background: "bg-emerald-500", glow: "shadow-emerald-500/20" };
      case 'capital_intelectual': return { primary: "text-primary", background: "bg-primary", glow: "shadow-primary/20" };
      case 'resonancia_sensorial': return { primary: "text-rose-500", background: "bg-rose-500", glow: "shadow-rose-500/20" };
      default: return { primary: "text-white", background: "bg-zinc-800", glow: "shadow-white/10" };
    }
  }, [pointOfInterest.categoryMission]);

  const handleTuneIn = () => {
    if (linkedPodcast) {
      nicepodLog(`📻 [DetailView] Sintonizando frecuencia: ${linkedPodcast.titleTextContent}`);
      playPodcastAction(linkedPodcast);
    }
  };

  return (
    <div className="min-h-screen bg-[#010101] text-zinc-400 pb-40 selection:bg-primary/30 antialiased selection:text-white">
      
      <header className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-center bg-gradient-to-b from-black via-black/40 to-transparent backdrop-blur-[2px]">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.back()}
          className="rounded-2xl bg-white/[0.03] border border-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all"
        >
          <ChevronLeft size={24} />
        </Button>
        <div className="flex gap-3">
            <Button variant="ghost" size="icon" className="rounded-2xl bg-white/[0.03] border border-white/5 text-white/60 hover:text-white">
                <Share2 size={18} />
            </Button>
        </div>
      </header>

      <section className="relative w-full h-[60vh] md:h-[75vh] overflow-hidden bg-black">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeImageIndex}
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "circOut" }}
            className="absolute inset-0"
          >
            <Image 
              src={getSafeAsset(pointOfInterest.galleryUniformResourceLocators[activeImageIndex], 'cover')}
              alt={pointOfInterest.name}
              fill
              className="object-cover brightness-75"
              priority
            />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-t from-[#010101] via-transparent to-transparent z-10" />

        <div className="absolute bottom-12 left-6 md:left-16 z-20 space-y-4 max-w-5xl">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className={cn("border-none font-black text-[10px] uppercase tracking-[0.2em] px-4 py-1.5 rounded-lg shadow-2xl", configuracionVisual.background, "text-white")}>
              {pointOfInterest.categoryMission.replace('_', ' ')}
            </Badge>
            <div className="flex items-center gap-2.5 bg-black/60 backdrop-blur-xl px-4 py-1.5 rounded-lg border border-white/10">
              <CalendarDays size={13} className={configuracionVisual.primary} />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">
                {EPOCH_LABELS[pointOfInterest.historicalEpoch]}
              </span>
            </div>
          </div>
          <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter text-white leading-[0.9] font-serif">
            {pointOfInterest.name}
          </h1>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 -mt-16 relative z-30">
        <div className="p-8 rounded-[2.5rem] bg-[#0A0A0A] border border-white/10 backdrop-blur-3xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          
          <div className="flex items-center gap-6">
            <div className="relative h-20 w-20 rounded-[1.5rem] overflow-hidden border border-white/10 bg-zinc-900 shrink-0">
               {linkedPodcast?.coverImageUniformResourceLocator && (
                 <Image src={linkedPodcast.coverImageUniformResourceLocator} alt="" fill className="object-cover opacity-60" />
               )}
               <Zap size={24} className={cn("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2", configuracionVisual.primary, "animate-pulse")} />
            </div>
            <div className="space-y-1">
              <span className={cn("text-[9px] font-black uppercase tracking-[0.4em]", configuracionVisual.primary)}>Frecuencia de Sabiduría</span>
              <h4 className="text-white font-black text-xl uppercase tracking-tight italic">
                {linkedPodcast?.titleTextContent || "Procesando Eco Sonoro..."}
              </h4>
              <div className="flex items-center gap-3 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                 <Clock size={12} className="opacity-40" />
                 <span>{linkedPodcast?.playbackDurationSecondsTotal ? formatTime(linkedPodcast.playbackDurationSecondsTotal) : 'PENDIENTE'}</span>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleTuneIn}
            className={cn(
              "w-full md:w-auto h-16 px-10 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all",
              isCurrentlyPlaying ? "bg-white text-black" : cn(configuracionVisual.background, "text-white hover:scale-105")
            )}
          >
            {isCurrentlyPlaying ? <Pause className="mr-2 h-5 w-5 fill-current" /> : <Play className="mr-2 h-5 w-5 fill-current" />}
            {isCurrentlyPlaying ? "Detener" : "Sintonizar"}
          </Button>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-20 space-y-24">
        
        {pointOfInterest.groundingAnalysisSummary && (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="p-8 rounded-3xl bg-emerald-500/5 border border-emerald-500/20 flex flex-col md:flex-row gap-8 items-start"
            >
                <div className="p-4 rounded-2xl bg-emerald-500/10">
                    <ShieldCheck className="text-emerald-500" size={32} />
                </div>
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Peritaje del Agente 42</span>
                        <Badge className="bg-emerald-500/20 text-emerald-500 text-[8px] border-none uppercase">Verificado</Badge>
                    </div>
                    <p className="text-zinc-300 font-medium leading-relaxed italic">
                        "{pointOfInterest.groundingAnalysisSummary}"
                    </p>
                </div>
            </motion.div>
        )}

        <div className="grid md:grid-cols-[1fr_320px] gap-16">
          <div className="space-y-12">
             <div className="flex items-center gap-3 opacity-30">
                <BookOpen size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Crónica de Sabiduría Anclada</span>
             </div>
             
             <div className="prose prose-zinc prose-invert max-w-none">
                <p className="text-xl md:text-2xl font-medium leading-relaxed text-zinc-300 first-letter:text-6xl first-letter:font-black first-letter:text-white first-letter:mr-3 first-letter:float-left">
                  {pointOfInterest.richDescription}
                </p>
             </div>

             {pointOfInterest.externalReferenceUniformResourceLocator && (
               <div className="pt-6">
                 <a 
                   href={pointOfInterest.externalReferenceUniformResourceLocator} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="inline-flex items-center gap-4 px-8 py-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-primary/50 transition-all group"
                 >
                   <ExternalLink size={20} className="text-zinc-500 group-hover:text-primary transition-colors" />
                   <div className="flex flex-col">
                     <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Fuente Documental Externa</span>
                     <span className="text-[11px] font-bold text-white uppercase tracking-tight">Consultar Registro de Autoridad</span>
                   </div>
                 </a>
               </div>
             )}
          </div>

          <aside className="space-y-10">
             <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 space-y-8">
                <div className="space-y-4">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Malla Técnica</h5>
                    <div className="flex flex-col gap-4">
                        <div className="space-y-1">
                            <span className="text-[8px] font-black text-zinc-600 uppercase">Clasificación Pericial</span>
                            <p className="text-xs font-bold text-white uppercase">{pointOfInterest.categoryEntity.replace('_', ' ')}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[8px] font-black text-zinc-600 uppercase">Identificación Única</span>
                            <p className="text-[10px] font-mono text-zinc-500">#{pointOfInterest.identification.toString().padStart(6, '0')}</p>
                        </div>
                    </div>
                </div>
                
                <div className="pt-6 border-t border-white/5 space-y-4">
                    <div className="flex items-center gap-3">
                        <Fingerprint size={16} className={configuracionVisual.primary} />
                        <span className="text-[9px] font-black uppercase text-zinc-400">Huella Digital Sellada</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Info size={12} className="text-zinc-700" />
                        <span className="text-[8px] font-bold text-zinc-700 uppercase tracking-tighter">Bóveda NKV v4.0.1</span>
                    </div>
                </div>
             </div>
          </aside>
        </div>

        {pointOfInterest.galleryUniformResourceLocators.length > 1 && (
          <div className="pt-20 border-t border-white/5">
             <div className="flex justify-between items-center mb-10">
               <h5 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600">Registro de Evidencia Visual</h5>
               <span className="text-[9px] font-bold text-zinc-500 italic">{pointOfInterest.galleryUniformResourceLocators.length} Capturas en Archivo</span>
             </div>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {pointOfInterest.galleryUniformResourceLocators.map((url, index) => (
                  <motion.div 
                    key={index} 
                    whileHover={{ scale: 0.98 }}
                    onClick={() => setActiveImageIndex(index)}
                    className={cn(
                      "relative aspect-square rounded-[2rem] overflow-hidden cursor-pointer border-2 transition-all duration-500 shadow-2xl",
                      activeImageIndex === index ? cn("border-primary shadow-primary/20") : "border-transparent opacity-40 hover:opacity-100"
                    )}
                  >
                    <Image src={getSafeAsset(url, 'cover')} alt="" fill className="object-cover" />
                  </motion.div>
                ))}
             </div>
          </div>
        )}

      </section>

      <footer className="mt-40 flex flex-col items-center gap-6 opacity-30 py-20 border-t border-white/5">
         <Zap size={24} className="text-white" />
         <div className="text-center">
           <p className="text-[10px] font-black uppercase tracking-[1em] text-white">NicePod Workstation</p>
           <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-500 mt-2 italic">Inteligencia Industrial • Madrid Resonance</p>
         </div>
      </footer>

    </div>
  );
}
