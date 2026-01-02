// components/social/reputation-explainer.tsx
// VERSIÓN: 1.2 (Aurora System: Production Syntax Fix)

"use client";

import { Info, Sparkles, Trophy, Users, Star } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function ReputationExplainer() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="p-1.5 rounded-full hover:bg-white/10 text-muted-foreground hover:text-primary transition-all duration-300 focus:outline-none">
          <Info size={16} />
        </button>
      </PopoverTrigger>
      
      <PopoverContent 
        side="top" 
        align="center"
        className="w-80 bg-black/80 backdrop-blur-2xl border-white/10 text-white p-6 shadow-[0_0_50px_rgba(168,85,247,0.25)] rounded-[2rem] z-50 animate-in fade-in zoom-in-95"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-violet-500/20 rounded-2xl">
              <Sparkles className="text-violet-400" size={20} />
            </div>
            <h4 className="font-black uppercase tracking-tighter text-xl leading-none">
              Valor y Reputación
            </h4>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed font-medium">
            En NicePod, el estatus no se compra con viralidad, se construye con generosidad intelectual.
          </p>

          <div className="space-y-5">
            <div className="flex gap-4 items-start">
              <div className="mt-1 p-1 bg-amber-500/10 rounded-lg">
                <Trophy className="text-amber-400" size={14} />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase text-white tracking-[0.1em]">Impacto Directo (+5)</p>
                <p className="text-[10px] text-zinc-500 font-medium leading-normal mt-0.5">Puntos ganados cada vez que un usuario termina de escuchar una de tus colecciones curadas.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="mt-1 p-1 bg-blue-500/10 rounded-lg">
                <Users className="text-blue-400" size={14} />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase text-white tracking-[0.1em]">Resonancia Social (+10)</p>
                <p className="text-[10px] text-zinc-500 font-medium leading-normal mt-0.5">Cuando otros curadores verificados deciden incluir tus audios en sus propias bibliotecas.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="mt-1 p-1 bg-emerald-500/10 rounded-lg">
                <Star className="text-emerald-400" size={14} />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase text-white tracking-[0.1em]">Curador de Verdad (+20)</p>
                <p className="text-[10px] text-zinc-500 font-medium leading-normal mt-0.5">Al aportar bibliografía y fuentes de alta calidad que enriquecen la inteligencia colectiva.</p>
              </div>
            </div>
          </div>

          <div className="pt-5 border-t border-white/5">
            <p className="text-[10px] font-black italic text-center text-zinc-600 uppercase tracking-widest">
              "El conocimiento es el único bien que crece cuando se comparte."
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}