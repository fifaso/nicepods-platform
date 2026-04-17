/**
 * ARCHIVO: components/ui/pulse-source-card.tsx
 * VERSIÓN: 5.1 (Madrid Resonance)
 * PROTOCOLO: Nominal Sovereignty
 * MISIÓN: Visualizar un nodo de inteligencia (Pulse) con tipado industrial.
 * [REFORMA V5.1]: Aplicación integral de la Zero Abbreviations Policy (ZAP).
 * Sincronización con el contrato purificado de 'PulseMatchResult'.
 * NIVEL DE INTEGRIDAD: 100%
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { classNamesUtility } from "@/lib/utils";
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

/**
 * INTERFAZ: PulseSourceCardComponentProperties
 */
interface PulseSourceCardComponentProperties {
  pulseSignalSnapshot: PulseMatchResult;
  isSourceSelectedStatus: boolean;
  onSourceToggleAction: (identification: string) => void;
}

/**
 * getAuthorityVisualsDictionary:
 * Misión: Determinar la atmósfera visual basada en la magnitud de autoridad.
 */
const getAuthorityVisualsDictionary = (authorityScoreMagnitude: number) => {
  if (authorityScoreMagnitude >= 9.0) return {
    colorClassName: "bg-emerald-500",
    glowClassName: "shadow-[0_0_15px_rgba(16,185,129,0.5)]",
    displayLabel: "Máxima Autoridad"
  };
  if (authorityScoreMagnitude >= 7.0) return {
    colorClassName: "bg-amber-500",
    glowClassName: "shadow-[0_0_15px_rgba(245,158,11,0.4)]",
    displayLabel: "Alta Autoridad"
  };
  return {
    colorClassName: "bg-indigo-500",
    glowClassName: "shadow-[0_0_10px_rgba(99,102,241,0.3)]",
    displayLabel: "Señal Verificada"
  };
};

/**
 * PulseSourceCard: La proyección visual de un activo de conocimiento proactivo.
 */
export function PulseSourceCard({
  pulseSignalSnapshot,
  isSourceSelectedStatus,
  onSourceToggleAction
}: PulseSourceCardComponentProperties) {

  const visualsAestheticConfiguration = getAuthorityVisualsDictionary(pulseSignalSnapshot.authorityScoreValue);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onClick={() => onSourceToggleAction(pulseSignalSnapshot.identification)}
      className={classNamesUtility(
        "relative flex flex-col p-5 rounded-[2rem] border transition-all duration-300 cursor-pointer group overflow-hidden",
        isSourceSelectedStatus
          ? "bg-white dark:bg-zinc-900 border-primary shadow-2xl scale-[1.02]"
          : "bg-white/5 border-white/10 hover:border-primary/40 hover:bg-white/10"
      )}
    >
      {/* 1. LAYER DE FONDO: EFECTO AURORA (Solo en selección) */}
      {isSourceSelectedStatus && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50" />
      )}

      {/* 2. HEADER: METADATOS Y RESONANCIA */}
      <header className="relative z-10 flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          {/* La Gema de Autoridad */}
          <div className={classNamesUtility(
            "w-2.5 h-2.5 rounded-full",
            visualsAestheticConfiguration.colorClassName,
            visualsAestheticConfiguration.glowClassName
          )} />
          <span className={classNamesUtility(
            "text-[9px] font-black uppercase tracking-[0.2em]",
            isSourceSelectedStatus ? "text-primary" : "text-white/40"
          )}>
            {pulseSignalSnapshot.sourceAuthorityName}
          </span>
        </div>

        <Badge variant="outline" className={classNamesUtility(
          "h-6 px-2.5 rounded-full border-none font-bold text-[10px] flex gap-1.5",
          isSourceSelectedStatus ? "bg-primary text-white" : "bg-primary/10 text-primary"
        )}>
          <TrendingUp size={10} />
          {pulseSignalSnapshot.matchPercentageMagnitude}% Match
        </Badge>
      </header>

      {/* 3. TÍTULO Y TIPO */}
      <div className="relative z-10 space-y-2 mb-4">
        <div className="flex gap-3">
          <div className={classNamesUtility(
            "p-2 rounded-xl flex-shrink-0",
            isSourceSelectedStatus ? "bg-primary/10 text-primary" : "bg-white/5 text-white/60"
          )}>
            {pulseSignalSnapshot.sourceContentType === 'paper' ? <FileText size={18} /> : <Globe size={18} />}
          </div>
          <h3 className={classNamesUtility(
            "font-black text-sm md:text-base leading-tight uppercase tracking-tight line-clamp-2",
            isSourceSelectedStatus ? "text-zinc-900 dark:text-white" : "text-white"
          )}>
            {pulseSignalSnapshot.titleTextContent}
          </h3>
        </div>
      </div>

      {/* 4. ABSTRACT IA: Caja de Inteligencia */}
      <div className={classNamesUtility(
        "relative z-10 p-4 rounded-2xl mb-4 transition-colors",
        isSourceSelectedStatus ? "bg-zinc-100 dark:bg-black/40" : "bg-black/20"
      )}>
        <p className={classNamesUtility(
          "text-[11px] leading-relaxed line-clamp-3 font-medium",
          isSourceSelectedStatus ? "text-zinc-600 dark:text-zinc-400" : "text-muted-foreground"
        )}>
          {pulseSignalSnapshot.summaryContentText}
        </p>
      </div>

      {/* 5. FOOTER: ACCIONES Y STATUS */}
      <footer className="relative z-10 mt-auto pt-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={classNamesUtility(
            "w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-500",
            isSourceSelectedStatus ? "bg-primary border-primary" : "border-white/10 bg-white/5"
          )}>
            {isSourceSelectedStatus && <Check size={14} className="text-white" />}
          </div>
          <span className={classNamesUtility(
            "text-[10px] font-black uppercase tracking-widest",
            isSourceSelectedStatus ? "text-primary" : "text-white/20"
          )}>
            {isSourceSelectedStatus ? "Seleccionada" : "Incluir"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {pulseSignalSnapshot.authorityScoreValue >= 8.5 && (
            <Award size={14} className="text-primary opacity-60 animate-pulse" />
          )}
          <a
            href={pulseSignalSnapshot.uniformResourceLocator}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(inputEvent) => inputEvent.stopPropagation()}
            className="p-2 rounded-lg hover:bg-primary/10 transition-colors group/link"
          >
            <ExternalLink size={14} className="text-white/20 group-hover/link:text-primary" />
          </a>
        </div>
      </footer>

      {/* Indicador visual de "Alta Autoridad" en el borde */}
      {pulseSignalSnapshot.authorityScoreValue >= 9.0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/40 to-emerald-500/0" />
      )}
    </motion.div>
  );
}
