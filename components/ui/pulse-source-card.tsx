// components/create-flow/ui/pulse-source-card.tsx
// VERSIÓN: 1.0 (Atomic Intelligence Dossier - High Authority UI)

"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PulseMatchResult } from "@/types/pulse";
import { motion } from "framer-motion";
import {
  Award,
  Check,
  ExternalLink,
  FileText,
  Globe,
  TrendingUp
} from "lucide-react";

interface PulseSourceCardProps {
  signal: PulseMatchResult;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

/**
 * getAuthorityVisuals
 * Determina el color y brillo de la "Gema" según el score de la IA.
 */
const getAuthorityVisuals = (score: number) => {
  if (score >= 9.0) return {
    color: "bg-emerald-500",
    glow: "shadow-[0_0_15px_rgba(16,185,129,0.5)]",
    label: "Máxima Autoridad"
  };
  if (score >= 7.0) return {
    color: "bg-amber-500",
    glow: "shadow-[0_0_15px_rgba(245,158,11,0.4)]",
    label: "Alta Autoridad"
  };
  return {
    color: "bg-indigo-500",
    glow: "shadow-[0_0_10px_rgba(99,102,241,0.3)]",
    label: "Señal Verificada"
  };
};

export function PulseSourceCard({ signal, isSelected, onToggle }: PulseSourceCardProps) {
  const visuals = getAuthorityVisuals(signal.authority_score);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onClick={() => onToggle(signal.id)}
      className={cn(
        "relative flex flex-col p-5 rounded-[2rem] border transition-all duration-300 cursor-pointer group overflow-hidden",
        isSelected
          ? "bg-white dark:bg-zinc-900 border-primary shadow-2xl scale-[1.02]"
          : "bg-white/5 border-white/10 hover:border-primary/40 hover:bg-white/10"
      )}
    >
      {/* 1. LAYER DE FONDO: EFECTO AURORA (Solo en selección) */}
      {isSelected && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50" />
      )}

      {/* 2. HEADER: METADATOS Y RESONANCIA */}
      <header className="relative z-10 flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          {/* La Gema de Autoridad */}
          <div className={cn(
            "w-2.5 h-2.5 rounded-full",
            visuals.color,
            visuals.glow
          )} />
          <span className={cn(
            "text-[9px] font-black uppercase tracking-[0.2em]",
            isSelected ? "text-primary" : "text-white/40"
          )}>
            {signal.source_name}
          </span>
        </div>

        <Badge variant="outline" className={cn(
          "h-6 px-2.5 rounded-full border-none font-bold text-[10px] flex gap-1.5",
          isSelected ? "bg-primary text-white" : "bg-primary/10 text-primary"
        )}>
          <TrendingUp size={10} />
          {signal.match_percentage}% Match
        </Badge>
      </header>

      {/* 3. TÍTULO Y TIPO */}
      <div className="relative z-10 space-y-2 mb-4">
        <div className="flex gap-3">
          <div className={cn(
            "p-2 rounded-xl flex-shrink-0",
            isSelected ? "bg-primary/10 text-primary" : "bg-white/5 text-white/60"
          )}>
            {signal.content_type === 'paper' ? <FileText size={18} /> : <Globe size={18} />}
          </div>
          <h3 className={cn(
            "font-black text-sm md:text-base leading-tight uppercase tracking-tight line-clamp-2",
            isSelected ? "text-zinc-900 dark:text-white" : "text-white"
          )}>
            {signal.title}
          </h3>
        </div>
      </div>

      {/* 4. ABSTRACT IA: Caja de Inteligencia */}
      <div className={cn(
        "relative z-10 p-4 rounded-2xl mb-4 transition-colors",
        isSelected ? "bg-zinc-100 dark:bg-black/40" : "bg-black/20"
      )}>
        <p className={cn(
          "text-[11px] leading-relaxed line-clamp-3 font-medium",
          isSelected ? "text-zinc-600 dark:text-zinc-400" : "text-muted-foreground"
        )}>
          {signal.summary}
        </p>
      </div>

      {/* 5. FOOTER: ACCIONES Y STATUS */}
      <footer className="relative z-10 mt-auto pt-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-500",
            isSelected ? "bg-primary border-primary" : "border-white/10 bg-white/5"
          )}>
            {isSelected && <Check size={14} className="text-white" />}
          </div>
          <span className={cn(
            "text-[10px] font-black uppercase tracking-widest",
            isSelected ? "text-primary" : "text-white/20"
          )}>
            {isSelected ? "Seleccionada" : "Incluir"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {signal.authority_score >= 8.5 && (
            <Award size={14} className="text-primary opacity-60 animate-pulse" />
          )}
          <a
            href={signal.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-2 rounded-lg hover:bg-primary/10 transition-colors group/link"
          >
            <ExternalLink size={14} className="text-white/20 group-hover/link:text-primary" />
          </a>
        </div>
      </footer>

      {/* Indicador visual de "Alta Autoridad" en el borde */}
      {signal.authority_score >= 9.0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/40 to-emerald-500/0" />
      )}
    </motion.div>
  );
}