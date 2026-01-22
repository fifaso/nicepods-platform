// components/create-flow/steps/purpose-selection-step.tsx
// VERSIÓN: 5.8 (Aurora Master - FlowState Type Fix & Pulse Integration)

"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronRight,
  ChevronUp,
  History,
  Lightbulb,
  Link2,
  MapPin,
  PenLine,
  Play,
  Trash2,
  X,
  Zap
} from "lucide-react";
import React, { useState, useTransition } from "react";
import { useFormContext } from "react-hook-form";
import { useFlowActions } from "../hooks/use-flow-actions";
import { MASTER_FLOW_PATHS } from "../shared/config";
import { useCreationContext } from "../shared/context";
import { FlowState } from "../shared/types"; // [SISTEMA]: Importación para validación de tipos

// --- DEFINICIÓN DE TIPOS ---
interface PurposeOption {
  id: string;
  title: string;
  desc: string;
  icon: React.ElementType;
  color: string;
  isSituational?: boolean;
}

interface CategoryGroup {
  name: string;
  items: PurposeOption[];
}

/**
 * CATEGORIES
 * Estructura de intenciones de creación de NicePod.
 */
const CATEGORIES: CategoryGroup[] = [
  {
    name: "Creatividad",
    items: [
      { id: "learn", title: "Aprender", desc: "Desglosa conceptos complejos.", icon: Lightbulb, color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
      { id: "explore", title: "Explorar", desc: "Conecta dos ideas distintas.", icon: Link2, color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
      {
        id: "pulse",
        title: "Actualidad",
        desc: "Briefing de inteligencia personalizada.",
        icon: Zap,
        color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
      },
    ]
  },
  {
    name: "Legado",
    items: [{ id: "reflect", title: "Reflexionar", desc: "Lecciones y testimonios de vida.", icon: PenLine, color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" }]
  },
  {
    name: "Entorno",
    items: [{ id: "local_soul", title: "Vive lo local", desc: "Secretos de tu ubicación actual.", icon: MapPin, color: "bg-violet-500/10 text-violet-600 dark:text-violet-400", isSituational: true }]
  }
];

export function PurposeSelectionStep({ existingDrafts = [] }: { existingDrafts?: any[] }) {
  const { setValue, reset } = useFormContext();
  const { transitionTo, jumpToStep } = useCreationContext();
  const [isPending, startTransition] = useTransition();
  const [isVaultOpen, setIsVaultOpen] = useState(false);

  /**
   * [FIX]: useFlowActions con Type Casting
   * Soluciona el error ts(2345) asegurando que el string recibido se trate como FlowState.
   */
  const { deleteDraft } = useFlowActions({
    transitionTo: (s) => transitionTo(s as FlowState),
    goBack: () => { },
    clearDraft: () => { }
  });

  const handleSelection = (id: string) => {
    setValue("purpose", id, { shouldValidate: true, shouldDirty: true });
    const targetPath = MASTER_FLOW_PATHS[id];
    // En flujos definidos, saltamos al primer paso operativo tras la selección
    if (targetPath && targetPath.length > 1) {
      transitionTo(targetPath[1]);
    }
  };

  const handleResumeDraft = (draft: any) => {
    const { purpose, agentName, inputs } = draft.creation_data;
    reset();
    setValue("draft_id", draft.id);
    Object.entries(inputs || {}).forEach(([k, v]) => setValue(k as any, v, { shouldValidate: true }));
    setValue("purpose", purpose);
    setValue("agentName", agentName);
    setValue("final_title", draft.title);
    const parsed = typeof draft.script_text === 'string' ? JSON.parse(draft.script_text) : draft.script_text;
    setValue("final_script", parsed.script_body || draft.script_text);
    setValue("sources", draft.sources || []);
    jumpToStep('SCRIPT_EDITING');
  };

  return (
    <div className="relative h-full w-full max-w-6xl mx-auto flex flex-col p-4 md:px-10 lg:pt-0 lg:pb-2 overflow-hidden">

      {/* 1. HEADER - Optimización de aire vertical para pantallas grandes */}
      <header className="flex-shrink-0 text-center lg:text-left mt-2 mb-4 lg:mb-2">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl lg:text-4xl font-black tracking-tighter uppercase text-zinc-900 dark:text-white leading-none mb-1"
        >
          ¿Cuál es tu <span className="text-primary italic">intención?</span>
        </motion.h1>
        <p className="text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-white/40">
          Aprende desde diferentes perspectivas
        </p>
      </header>

      {/* 2. ÁREA DE TRABAJO DUAL */}
      <div className="flex-1 flex flex-col lg:flex-row gap-0 lg:gap-14 min-h-0 overflow-hidden">

        {/* COLUMNA INTENCIONES */}
        <div className="lg:flex-[1.8] flex flex-col gap-4 lg:gap-2 overflow-y-auto lg:overflow-visible custom-scrollbar-hide justify-start pr-1">
          {CATEGORIES.map((cat) => (
            <div key={cat.name} className="space-y-2 lg:space-y-1">
              <div className="flex items-center gap-3 px-1">
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/80">{cat.name}</span>
                <div className="h-[1px] flex-1 bg-zinc-200 dark:bg-white/5 opacity-50" />
              </div>

              <div className="flex flex-col gap-2">
                {cat.items.map((item: PurposeOption) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelection(item.id)}
                    className="relative flex items-center p-3 rounded-xl lg:rounded-2xl border border-black/5 dark:border-white/5 bg-white/95 dark:bg-zinc-900/60 backdrop-blur-xl hover:border-primary/40 transition-all text-left group overflow-hidden shadow-sm"
                  >
                    <div className={cn("p-2 rounded-lg mr-3 lg:mr-4 transition-transform group-hover:scale-110 shadow-inner flex-shrink-0", item.color)}>
                      <item.icon size={18} strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-xs lg:text-sm uppercase text-zinc-900 dark:text-white leading-none tracking-tight">{item.title}</h3>
                        {item.isSituational && (
                          <Badge className="bg-primary text-white border-none text-[7px] font-black h-3.5 px-1.5 tracking-tighter animate-pulse">
                            SITUACIONAL
                          </Badge>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium truncate mt-0.5">{item.desc}</p>
                    </div>
                    <ChevronRight size={16} className="text-zinc-300 dark:text-white/10 group-hover:text-primary transition-all group-hover:translate-x-1" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* COLUMNA BÓVEDA (SIDEBAR) */}
        <aside className="hidden lg:flex lg:flex-[1.2] bg-zinc-100/50 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 p-8 rounded-[2.5rem] backdrop-blur-3xl flex-col shadow-2xl h-full max-h-full overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-xl"><History size={20} className="text-primary" /></div>
              <h2 className="font-black uppercase tracking-tighter text-zinc-900 dark:text-white text-base leading-none whitespace-nowrap">Bóveda de borradores</h2>
            </div>
            <Badge variant="secondary" className="text-[10px] font-mono border-none px-2 bg-zinc-200 dark:bg-black/40 text-zinc-600 dark:text-zinc-400">
              {existingDrafts.length}
            </Badge>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar-hide pr-1">
            {existingDrafts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-20 text-center py-20">
                <Play size={40} className="mb-4 text-zinc-400" />
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Sin sesiones activas</p>
              </div>
            ) : (
              existingDrafts.map((draft) => (
                <div
                  key={draft.id}
                  onClick={() => handleResumeDraft(draft)}
                  className="p-5 rounded-2xl bg-white dark:bg-black/40 border border-black/5 dark:border-white/5 hover:border-primary/40 transition-all group cursor-pointer relative shadow-sm"
                >
                  <p className="text-xs font-bold text-zinc-900 dark:text-white truncate mb-2 uppercase tracking-tight pr-8">{draft.title || "Sesión sin título"}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-black text-primary uppercase tracking-widest opacity-80">{draft.creation_data.purpose}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); startTransition(() => { deleteDraft(draft.id); }); }}
                      className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors z-20"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="absolute top-5 right-5 text-zinc-200 dark:text-white/5 group-hover:text-primary transition-colors">
                    <Play size={14} fill="currentColor" />
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>

      {/* FOOTER MOBILE (Mantenido intacto) */}
      <div className="lg:hidden flex-shrink-0 mt-4">
        <button
          onClick={() => setIsVaultOpen(true)}
          className="w-full flex items-center justify-between p-4 bg-zinc-900/90 border border-white/10 rounded-2xl text-white shadow-xl"
        >
          <div className="flex items-center gap-3">
            <History size={16} className="text-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Bóveda de Borradores</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-white">{existingDrafts.length}</span>
            <ChevronUp size={14} className="text-primary" />
          </div>
        </button>

        <AnimatePresence>
          {isVaultOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsVaultOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] lg:hidden" />
              <motion.div
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 h-[70vh] bg-zinc-950 border-t border-white/10 z-[70] rounded-t-[3rem] p-6 flex flex-col shadow-[0_-20px_50px_rgba(0,0,0,0.5)] lg:hidden"
              >
                <div className="p-4 flex items-center justify-between border-b border-white/5 mb-6">
                  <div className="flex items-center gap-3">
                    <History size={20} className="text-primary" />
                    <h2 className="text-xl font-black uppercase tracking-tighter text-white">Continuar</h2>
                  </div>
                  <button onClick={() => setIsVaultOpen(false)} className="p-2 bg-white/5 rounded-full"><X size={20} className="text-white/50" /></button>
                </div>
                <div className="flex-1 space-y-4 overflow-y-auto pb-10 custom-scrollbar-hide">
                  {existingDrafts.map((draft) => (
                    <div key={draft.id} onClick={() => handleResumeDraft(draft)} className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 flex flex-col gap-4 active:scale-[0.98] transition-all">
                      <p className="text-sm font-bold text-white uppercase tracking-tight leading-tight line-clamp-2">{draft.title || "Sin título"}</p>
                      <div className="flex justify-between items-center">
                        <Badge variant="outline" className="text-[9px] font-black text-primary border-primary/30 uppercase">
                          {draft.creation_data.purpose}
                        </Badge>
                        <div className="flex gap-6">
                          <button onClick={(e) => { e.stopPropagation(); startTransition(() => { deleteDraft(draft.id); }); }} className="text-zinc-600 active:text-red-400"><Trash2 size={20} /></button>
                          <span className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2 underline underline-offset-8 decoration-primary">RETOMAR <Play size={10} fill="currentColor" /></span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}