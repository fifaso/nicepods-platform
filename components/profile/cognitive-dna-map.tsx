// components/profile/cognitive-dna-map.tsx
// VERSIÓN: 1.0 (Cognitive Map - Visual Interest Galaxy)

"use client";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  BrainCircuit,
  Info,
  Maximize2,
  RefreshCw,
  Sparkles,
  Target,
  Zap
} from "lucide-react";
import { useMemo, useRef, useState } from "react";

// --- TIPOS ---
interface DNAInterest {
  id: string;
  label: string;
  category: 'professional' | 'personal' | 'frontier';
  relevance: number; // 0 a 1 (determina distancia al centro)
  strength: number;  // 0 a 1 (determina brillo/tamaño)
}

/**
 * DNA Constellation Map
 * Una visualización de la "Gravedad Semántica" del usuario.
 */
export function CognitiveDnaMap({
  interests: initialInterests = []
}: {
  interests?: DNAInterest[]
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [interests, setInterests] = useState<DNAInterest[]>(initialInterests);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // --- LÓGICA DE POSICIONAMIENTO ORBITAL ---
  // Generamos posiciones iniciales basadas en la relevancia (Gravedad)
  const nodes = useMemo(() => {
    return interests.map((item, idx) => {
      const angle = (idx / interests.length) * Math.PI * 2;
      const distance = (1 - item.relevance) * 150 + 50; // Más relevancia = más cerca del centro (0,0)
      return {
        ...item,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
      };
    });
  }, [interests]);

  const handleRemoveInterest = (id: string) => {
    setIsUpdating(true);
    setInterests(prev => prev.filter(i => i.id !== id));
    // Simulación de guardado en Supabase (update-user-dna)
    setTimeout(() => setIsUpdating(false), 1500);
  };

  return (
    <TooltipProvider>
      <div className="relative w-full aspect-square md:aspect-video max-h-[600px] bg-slate-950 rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl group/map">

        {/* 1. FONDO ATMOSFÉRICO (AURORA CORE) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] bg-primary/20 blur-[120px] animate-pulse" />
          <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-[0.03] scale-150" />
        </div>

        {/* 2. HEADER DEL MAPA */}
        <div className="absolute top-6 inset-x-8 z-20 flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
              <BrainCircuit className="text-primary h-5 w-5" />
              Tu Constelación de Intereses
            </h3>
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">
              Ajusta los nodos para recalibrar el radar pulse
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="rounded-full bg-white/5 hover:bg-white/10 text-white border border-white/10">
              <RefreshCw className={cn("h-4 w-4", isUpdating && "animate-spin text-primary")} />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full bg-white/5 hover:bg-white/10 text-white border border-white/10">
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* 3. EL LIENZO (GALAXY CANVAS) */}
        <div
          ref={containerRef}
          className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing"
        >
          {/* El Sol Central (Identidad del Usuario) */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 w-24 h-24 bg-primary/30 blur-2xl rounded-full animate-ping" />
            <div className="relative w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.4)] z-10">
              <Target className="text-primary h-6 w-6" />
            </div>

            {/* Órbitas Visuales */}
            <div className="absolute w-[200px] h-[200px] border border-white/5 rounded-full pointer-events-none" />
            <div className="absolute w-[400px] h-[400px] border border-white/[0.03] rounded-full pointer-events-none" />
          </div>

          {/* NODOS DE INTERÉS */}
          <AnimatePresence>
            {nodes.map((node) => (
              <motion.div
                key={node.id}
                layoutId={node.id}
                drag
                dragConstraints={containerRef}
                dragElastic={0.2}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1, x: node.x, y: node.y }}
                exit={{ opacity: 0, scale: 0 }}
                onDragStart={() => setActiveNode(node.id)}
                onDragEnd={() => setActiveNode(null)}
                className="absolute z-20 group/node"
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative flex flex-col items-center">
                      {/* Aura del Nodo */}
                      <div className={cn(
                        "absolute inset-0 blur-xl rounded-full transition-opacity duration-500",
                        node.category === 'professional' ? "bg-blue-500/30" : "bg-purple-500/30",
                        activeNode === node.id ? "opacity-100" : "opacity-40"
                      )} />

                      <button
                        className={cn(
                          "relative px-4 py-2 rounded-full border backdrop-blur-xl transition-all duration-300 flex items-center gap-2",
                          node.category === 'professional'
                            ? "bg-blue-600/10 border-blue-500/30 text-blue-200"
                            : "bg-purple-600/10 border-purple-500/30 text-purple-200",
                          activeNode === node.id && "scale-110 shadow-2xl border-white/40 bg-primary/20 text-white"
                        )}
                      >
                        {node.category === 'professional' ? <Zap size={12} /> : <Sparkles size={12} />}
                        <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                          {node.label}
                        </span>
                      </button>

                      {/* Botón rápido de eliminación (Solo visible en Hover) */}
                      <motion.button
                        initial={{ opacity: 0 }}
                        whileHover={{ scale: 1.2 }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-rose-600 rounded-full flex items-center justify-center text-white shadow-lg opacity-0 group-hover/node:opacity-100 transition-opacity"
                        onClick={() => handleRemoveInterest(node.id)}
                      >
                        <X size={10} strokeWidth={4} />
                      </motion.button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-slate-900 border-white/10 rounded-xl p-3">
                    <div className="space-y-1">
                      <p className="font-bold text-xs text-white uppercase">{node.label}</p>
                      <p className="text-[9px] text-zinc-400">Relevancia Semántica: {Math.round(node.relevance * 100)}%</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* 4. FOOTER LEGEND */}
        <div className="absolute bottom-6 inset-x-8 flex justify-between items-center z-20">
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Profesional</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
              <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Frontera / Personal</span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
            <Info className="h-3 w-3 text-primary" />
            <span className="text-[9px] font-medium text-white/40 italic">
              Arrastra los nodos para darles nueva prioridad
            </span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

function X(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
  );
}