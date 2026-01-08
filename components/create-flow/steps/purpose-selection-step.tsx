// components/create-flow/steps/purpose-selection-step.tsx
// VERSIÓN: 4.8 (Aurora Master - High Density Linear Mobile & Desktop Sidebar)

"use client";

import React, { useState, useTransition } from "react";
import { useFormContext } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Lightbulb, Link2, MessageCircleQuestion, PenLine, 
  MapPin, ChevronRight, History, Play, Trash2, X, Sparkles 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCreationContext } from "../shared/context";
import { useFlowActions } from "../hooks/use-flow-actions";
import { MASTER_FLOW_PATHS } from "../shared/config";
import { Badge } from "@/components/ui/badge";

interface PurposeOption {
  id: string;
  title: string;
  desc: string;
  icon: React.ElementType;
  color: string;
  isSituational?: boolean;
}

const CATEGORIES = [
  {
    name: "Creatividad",
    items: [
      { id: "learn", title: "Aprender", desc: "Desglosa conceptos complejos.", icon: Lightbulb, color: "bg-amber-500/10 text-amber-400" },
      { id: "explore", title: "Explorar", desc: "Conecta dos ideas distintas.", icon: Link2, color: "bg-blue-500/10 text-blue-400" },
      { id: "answer", title: "Preguntar", desc: "Respuestas directas de la IA.", icon: MessageCircleQuestion, color: "bg-rose-500/10 text-rose-400" },
    ]
  },
  {
    name: "Legado",
    items: [{ id: "reflect", title: "Reflexionar", desc: "Lecciones y testimonios de vida.", icon: PenLine, color: "bg-emerald-500/10 text-emerald-400" }]
  },
  {
    name: "Entorno",
    items: [{ id: "local_soul", title: "Vive lo local", desc: "Secretos de tu ubicación actual.", icon: MapPin, color: "bg-violet-500/10 text-violet-400", isSituational: true }]
  }
];

export function PurposeSelectionStep({ existingDrafts = [] }: { existingDrafts?: any[] }) {
  const { setValue, reset } = useFormContext();
  const { transitionTo, jumpToStep } = useCreationContext();
  const [isPending, startTransition] = useTransition();
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const { deleteDraft } = useFlowActions({ transitionTo: (s) => transitionTo(s), goBack: () => {}, clearDraft: () => {} });

  const handleSelection = (id: string) => {
    setValue("purpose", id, { shouldValidate: true, shouldDirty: true });
    const targetPath = MASTER_FLOW_PATHS[id];
    if (targetPath && targetPath.length > 1) transitionTo(targetPath[1]);
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
    <div className="relative h-full w-full max-w-6xl mx-auto flex flex-col lg:grid lg:grid-cols-3 gap-0 lg:gap-10 p-4 md:p-10 overflow-hidden">
      
      {/* SECCIÓN 1: INTENCIONES (Linear Vertical en Mobile, 2 Cols en Desktop) */}
      <div className="flex-1 lg:col-span-2 flex flex-col justify-center gap-4 lg:gap-10">
        <header className="text-center lg:text-left space-y-1">
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-7xl font-black tracking-tighter uppercase text-white leading-[0.85]">
            ¿Cuál es tu <br/><span className="text-primary italic">intención?</span>
          </motion.h1>
          <p className="text-[9px] md:text-xs font-black uppercase tracking-[0.4em] text-white/20">Escaneo cognitivo de IA activo</p>
        </header>

        <div className="flex flex-col gap-5 lg:gap-8 overflow-y-auto lg:overflow-visible custom-scrollbar-hide">
          {CATEGORIES.map((cat, catIdx) => (
            <div key={cat.name} className="space-y-2">
              {/* Título de Categoría Estilo Imagen 2 */}
              <div className="flex items-center gap-3 px-1">
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/60">{cat.name}</span>
                <div className="h-[px] flex-1 bg-white/5" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
                {cat.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelection(item.id)}
                    className="relative flex items-center p-3 lg:p-5 rounded-xl lg:rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-xl hover:border-primary/40 transition-all text-left overflow-hidden group"
                  >
                    <div className={cn("p-2 lg:p-3 rounded-lg mr-3 lg:mr-4 transition-transform group-hover:scale-110", item.color)}>
                      <item.icon size={18} strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-xs lg:text-sm uppercase text-white leading-none">{item.title}</h3>
                        {item.isSituational && <Badge className="bg-primary/20 text-primary border-none text-[7px] font-black h-3.5 px-1.5 tracking-tighter animate-pulse">SITUACIONAL</Badge>}
                      </div>
                      <p className="text-[10px] lg:text-xs text-zinc-500 font-medium truncate mt-0.5">{item.desc}</p>
                    </div>
                    <ChevronRight size={16} className="text-white/10 group-hover:text-primary transition-all group-hover:translate-x-1" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECCIÓN 2: BÓVEDA DESKTOP */}
      <aside className="hidden lg:flex lg:col-span-1 bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] backdrop-blur-3xl flex flex-col shadow-2xl relative">
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl"><History size={20} className="text-primary" /></div>
            <h2 className="font-black uppercase tracking-tighter text-white text-xl">Bóveda</h2>
          </div>
          <Badge variant="outline" className="text-[10px] border-white/10 text-zinc-500 font-mono">{existingDrafts.length}</Badge>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar-hide pr-1">
          {existingDrafts.map((draft) => (
            <div key={draft.id} className="p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-primary/30 transition-all group">
              <p className="text-xs font-bold text-white truncate mb-2 uppercase tracking-tight">{draft.title}</p>
              <div className="flex justify-between items-center">
                <span className="text-[8px] font-black text-primary uppercase opacity-60">{draft.creation_data.purpose}</span>
                <div className="flex gap-2">
                  <Trash2 size={12} className="text-zinc-600 hover:text-red-400 cursor-pointer" onClick={(e) => { e.stopPropagation(); startTransition(() => deleteDraft(draft.id)); }} />
                  <div className="p-1 bg-primary/10 rounded text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer" onClick={() => handleResumeDraft(draft)}><Play size={10} fill="currentColor" /></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* SECCIÓN 3: BÓVEDA MOBILE (Trigger en la base) */}
      <div className="lg:hidden flex-shrink-0 pt-2">
        <button 
          onClick={() => setIsVaultOpen(true)}
          className="w-full flex items-center justify-between p-3.5 bg-white/5 border border-white/10 rounded-xl text-white shadow-xl"
        >
          <div className="flex items-center gap-3">
            <History size={16} className="text-primary" />
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Sesiones en Bóveda</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-white">{existingDrafts.length}</span>
            <ChevronUp size={14} className="text-primary" />
          </div>
        </button>

        <AnimatePresence>
          {isVaultOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsVaultOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60]" />
              <motion.div 
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} 
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 h-[70vh] bg-zinc-950 border-t border-white/10 z-[70] rounded-t-[2.5rem] p-6 flex flex-col shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
              >
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <History size={20} className="text-primary" />
                        <h2 className="text-xl font-black uppercase tracking-tighter text-white">Continuar</h2>
                    </div>
                  <button onClick={() => setIsVaultOpen(false)} className="p-2 bg-white/5 rounded-full"><X size={20} className="text-white/50" /></button>
                </div>
                <div className="flex-1 space-y-4 overflow-y-auto pb-10">
                  {existingDrafts.map((draft) => (
                    <div key={draft.id} onClick={() => handleResumeDraft(draft)} className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col gap-4 active:scale-[0.98] transition-all">
                      <p className="text-sm font-bold text-white uppercase tracking-tight leading-tight line-clamp-2">{draft.title || "Sin título"}</p>
                      <div className="flex justify-between items-center">
                        <Badge variant="ghost" className="p-0 text-[10px] font-black text-primary uppercase">{draft.creation_data.purpose}</Badge>
                        <div className="flex gap-6">
                          <button onClick={(e) => { e.stopPropagation(); startTransition(() => deleteDraft(draft.id)); }} className="text-zinc-600 active:text-red-400"><Trash2 size={18}/></button>
                          <span className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">RETOMAR <Play size={10} fill="currentColor"/></span>
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