// components/podcast/source-evidence-board.tsx
// VERSIÓN: 1.0 (Intelligence Evidence Board - Veracity & Authority UI)

"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Award,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Globe,
  ShieldCheck,
  Zap
} from "lucide-react";

interface SourceEvidenceBoardProps {
  sources: any[]; // Mapeado a la estructura de pulse_staging o ResearchSource
  className?: string;
}

/**
 * getAuthorityColor
 * Sincroniza la estética de autoridad con el resto del ecosistema Pulse.
 */
const getAuthorityColor = (score: number) => {
  if (score >= 9.0) return "text-emerald-400 border-emerald-500/30 bg-emerald-500/5";
  if (score >= 7.0) return "text-amber-400 border-amber-500/30 bg-amber-500/5";
  return "text-indigo-400 border-indigo-500/30 bg-indigo-500/5";
};

export function SourceEvidenceBoard({ sources = [], className }: SourceEvidenceBoardProps) {
  if (sources.length === 0) return null;

  return (
    <div className={cn("w-full space-y-6", className)}>

      {/* 1. HEADER DEL DOSSIER */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black uppercase tracking-tighter text-white">
              Dossier de Evidencia
            </h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">
              Fuentes de alta fidelidad detectadas
            </p>
          </div>
        </div>
        <Badge variant="outline" className="border-white/10 text-white/60 font-mono">
          {sources.length} REF
        </Badge>
      </div>

      {/* 2. GRID DE FUENTES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sources.map((source, idx) => {
          // Normalización de datos para soportar fuentes antiguas y nuevas (Pulse)
          const score = source.authority_score || (source.origin === 'vault' ? 10.0 : 6.0);
          const isVerified = source.veracity_verified || source.origin === 'vault';
          const authStyle = getAuthorityColor(score);

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group relative p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/40 hover:bg-white/10 transition-all overflow-hidden"
            >
              {/* Efecto de fondo sutil */}
              <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-700">
                {source.content_type === 'paper' ? <BookOpen size={60} /> : <Globe size={60} />}
              </div>

              <div className="relative z-10 space-y-3">
                {/* Meta-Info de la Fuente */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("px-2 py-0.5 rounded-md border text-[8px] font-black uppercase tracking-widest", authStyle)}>
                      {source.content_type || 'SOURCE'}
                    </div>
                    {isVerified && (
                      <div className="flex items-center gap-1 text-[8px] font-black text-emerald-400 uppercase tracking-tighter bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        <CheckCircle2 size={10} /> Verificado
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
                    {source.source_name || "Web Intelligence"}
                  </span>
                </div>

                {/* Título y Abstract Corto */}
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-white line-clamp-2 leading-tight uppercase tracking-tight group-hover:text-primary transition-colors">
                    {source.title}
                  </h4>
                  {source.summary && (
                    <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed italic">
                      "{source.summary}"
                    </p>
                  )}
                </div>

                {/* Acción de Salida */}
                <div className="pt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-primary uppercase tracking-widest">
                    <Award size={12} className="opacity-50" />
                    Score: {score.toFixed(1)}
                  </div>

                  {source.url && source.url !== "#" && (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-[9px] font-bold text-white/40 hover:text-white transition-colors"
                    >
                      Ver Fuente Original <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 3. FOOTER DE GARANTÍA */}
      <footer className="pt-4 flex items-center justify-center gap-4 opacity-30">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/20" />
        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-white">
          <Zap size={12} className="text-primary" />
          NicePod Integrity Engine
        </div>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/20" />
      </footer>
    </div>
  );
}