/**
 * ARCHIVO: components/podcast/source-evidence-board.tsx
 * VERSIÓN: 2.0 (NicePod Intelligence Evidence Board - Veracity & Authority Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Proyectar el dossier de evidencia técnica, visualizando las fuentes 
 * de alta fidelidad y sus respectivos niveles de autoridad pericial.
 * [REFORMA V2.0]: Cumplimiento absoluto de la Zero Abbreviations Policy y 
 * blindaje total de tipos mediante el contrato ResearchSource.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

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

// --- SOBERANÍA DE TIPOS ---
import { ResearchSource } from "@/types/podcast";

/**
 * INTERFAZ: SourceEvidenceBoardProperties
 */
interface SourceEvidenceBoardProperties {
  /** intelligenceEvidenceSources: Colección de fuentes bibliográficas y de investigación. */
  intelligenceEvidenceSources: ResearchSource[];
  /** additionalClassName: Inyección de estilos adicionales para el contenedor. */
  additionalClassName?: string;
}

/**
 * getAuthorityAtmosphereStyle:
 * Misión: Sincronizar la estética de autoridad visual con el ecosistema Pulse 
 * basándose en la puntuación de fiabilidad de la fuente.
 */
const getAuthorityAtmosphereStyle = (authorityScore: number) => {
  if (authorityScore >= 9.0) {
    return "text-emerald-400 border-emerald-500/30 bg-emerald-500/5";
  }
  if (authorityScore >= 7.0) {
    return "text-amber-400 border-amber-500/30 bg-amber-500/5";
  }
  return "text-indigo-400 border-indigo-500/30 bg-indigo-500/5";
};

/**
 * SourceEvidenceBoard: El componente de auditoría de fuentes de inteligencia.
 */
export function SourceEvidenceBoard({ 
  intelligenceEvidenceSources = [], 
  additionalClassName 
}: SourceEvidenceBoardProperties) {
  
  // Si la colección de fuentes está vacía, el componente entra en modo pasivo.
  if (intelligenceEvidenceSources.length === 0) {
    return null;
  }

  return (
    <div className={cn("w-full space-y-6", additionalClassName)}>

      {/* 1. CABECERA DEL DOSSIER DE INTELIGENCIA */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black uppercase tracking-tighter text-white font-serif italic">
              Dossier de Evidencia
            </h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">
              Fuentes de alta fidelidad detectadas por el Oráculo
            </p>
          </div>
        </div>
        <Badge variant="outline" className="border-white/10 text-white/60 font-mono text-[10px]">
          {intelligenceEvidenceSources.length} REFERENCIAS
        </Badge>
      </div>

      {/* 2. MALLA DE FUENTES Y RECURSOS (GRID) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {intelligenceEvidenceSources.map((evidenceSourceItem, sourceIndex) => {
          
          // Normalización de metadatos para la visualización de autoridad
          const sourceAuthorityScore = evidenceSourceItem.authority_score || 
            (evidenceSourceItem.origin === 'vault' ? 10.0 : 6.0);
          
          const isVeracityVerified = evidenceSourceItem.veracity_verified || 
            evidenceSourceItem.origin === 'vault';
            
          const currentAuthorityStyle = getAuthorityAtmosphereStyle(sourceAuthorityScore);

          return (
            <motion.div
              key={sourceIndex}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: sourceIndex * 0.1 }}
              className="group relative p-5 rounded-3xl bg-white/5 border border-white/10 hover:border-primary/40 hover:bg-white/[0.08] transition-all overflow-hidden"
            >
              {/* Marca de agua decorativa de tipo de contenido */}
              <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none group-hover:scale-110 group-hover:opacity-[0.06] transition-all duration-700">
                {evidenceSourceItem.content_type === 'paper' 
                    ? <BookOpen size={64} /> 
                    : <Globe size={64} />
                }
              </div>

              <div className="relative z-10 space-y-4">
                {/* Meta-Información de la Fuente de Autoridad */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                        "px-2.5 py-0.5 rounded-md border text-[8px] font-black uppercase tracking-widest", 
                        currentAuthorityStyle
                    )}>
                      {evidenceSourceItem.content_type || 'RESEARCH_SOURCE'}
                    </div>
                    {isVeracityVerified && (
                      <div className="flex items-center gap-1 text-[8px] font-black text-emerald-400 uppercase tracking-tighter bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <CheckCircle2 size={10} /> Verificado
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest truncate max-w-[100px]">
                    {evidenceSourceItem.source_name || "Web Intelligence"}
                  </span>
                </div>

                {/* Título Monumental y Resumen Ejecutivo */}
                <div className="space-y-1.5">
                  <h4 className="font-black text-sm text-white line-clamp-2 leading-tight uppercase tracking-tight group-hover:text-primary transition-colors">
                    {evidenceSourceItem.title}
                  </h4>
                  {evidenceSourceItem.summary && (
                    <p className="text-[10px] text-zinc-500 line-clamp-2 leading-relaxed italic font-medium">
                      "{evidenceSourceItem.summary}"
                    </p>
                  )}
                </div>

                {/* Acción de Salida y Puntuación de Autoridad */}
                <div className="pt-2 flex items-center justify-between border-t border-white/5">
                  <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                    <Award size={12} className="opacity-50" />
                    <span className="opacity-40 text-white">Score:</span> 
                    {sourceAuthorityScore.toFixed(1)}
                  </div>

                  {evidenceSourceItem.url && evidenceSourceItem.url !== "#" && (
                    <a
                      href={evidenceSourceItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-[9px] font-black text-zinc-500 hover:text-white transition-all uppercase tracking-widest"
                    >
                      Origen <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 3. PIE DE PÁGINA: GARANTÍA DE INTEGRIDAD */}
      <footer className="pt-6 flex items-center justify-center gap-4 opacity-30">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.4em] text-white">
          <Zap size={12} className="text-primary fill-primary" />
          NicePod Integrity Engine
        </div>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-white/10 to-transparent" />
      </footer>
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V2.0):
 * 1. Zero Abbreviations Policy: Se purificaron términos como 'Props', 'idx', 'authStyle', 
 *    'sources' y 'score' para cumplir con el estándar Madrid Resonance V4.0.
 * 2. High-Fidelity Typing: Se integró la interfaz 'ResearchSource' para garantizar 
 *    que el dossier de evidencia no sufra degradación de datos por el uso de 'any'.
 * 3. Layout Industrial: El uso de 'rounded-3xl' y espaciados densos proyecta la 
 *    estética de herramienta técnica y profesional necesaria para el peritaje.
 */