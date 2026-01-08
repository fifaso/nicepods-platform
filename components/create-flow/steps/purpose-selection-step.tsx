// components/create-flow/steps/purpose-selection-step.tsx
// VERSIÓN: 4.7 (Aurora Master - Zero Scroll & Upward Mobile Vault)

"use client";

import React, { useState, useTransition } from "react";
import { useFormContext } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Lightbulb, Link2, MessageCircleQuestion, PenLine, 
  MapPin, ChevronRight, History, Play, Trash2, ChevronUp, X 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCreationContext } from "../shared/context";
import { useFlowActions } from "../hooks/use-flow-actions";
import { MASTER_FLOW_PATHS } from "../shared/config";
import { Badge } from "@/components/ui/badge";

interface PurposeOption {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  isSituational?: boolean;
}

const ALL_PURPOSES: PurposeOption[] = [
  { id: "learn", title: "Aprender", icon: Lightbulb, color: "bg-amber-500/10 text-amber-400" },
  { id: "explore", title: "Explorar", icon: Link2, color: "bg-blue-500/10 text-blue-400" },
  { id: "answer", title: "Preguntar", icon: MessageCircleQuestion, color: "bg-rose-500/10 text-rose-400" },
  { id: "reflect", title: "Reflexionar", icon: PenLine, color: "bg-emerald-500/10 text-emerald-400" },
  { id: "local_soul", title: "Vive lo local", icon: MapPin, color: "bg-violet-500/10 text-violet-400", isSituational: true }
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
      
      {/* SECCIÓN 1: CABECERA Y GRID (Ocupa 2/3 en Desktop) */}
      <div className="flex-1 lg:col-span-2 flex flex-col justify-center gap-6">
        <header className="space-y-1 lg:space-y-3">
          <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl md:text-5xl font-black tracking-tighter uppercase text-white leading-none">
            ¿Cuál es tu <span className="text-primary italic">intención?</span>
          </motion.h1>
          <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-white/20">Escaneo cognitivo activo</p>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 lg:gap-4">
          {ALL_PURPOSES.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => handleSelection(item.id)}
              className={cn(
                "relative flex items-center p-3 lg:p-5 rounded-2xl border border-white/5 bg-zinc-900/40 backdrop-blur-xl hover:border-primary/40 transition-all text-left",
                item.id === "local_soul" && "col-span-2 mt-2"
              )}
            >
              <div className={cn("p-2 lg:p-3 rounded-xl mr-3 lg:mr-4", item.color)}>
                <item.icon size={18} strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-xs lg:text-sm uppercase text-white leading-none">{item.title}</h3>
                {item.isSituational && <Badge className="mt-1 bg-primary text-[7px] font-black h-3 px-1.5 border-none">SITUACIONAL</Badge>}
              </div>
              <ChevronRight size={16} className="text-white/10" />
            </button>
          ))}
        </div>
      </div>

      {/* SECCIÓN 2: BÓVEDA DESKTOP (Barra Lateral) */}
      <aside className="hidden lg:flex lg:col-span-1 bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] backdrop-blur-3xl flex-col shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <History size={20} className="text-primary" />
            <h2 className="font-black uppercase tracking-tighter text-white text-xl">Bóveda</h2>
          </div>
          <Badge variant="outline" className="text-[10px] border-white/10 text-zinc-500">{existingDrafts.length}</Badge>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar-hide">
          {existingDrafts.map((draft) => (
            <div key={draft.id} className="p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-primary/30 transition-all group">
              <p className="text-xs font-bold text-white truncate mb-2 uppercase">{draft.title}</p>
              <div className="flex justify-between items-center">
                <span className="text-[8px] font-black text-primary uppercase">{draft.creation_data.purpose}</span>
                <div className="flex gap-2">
                  <Trash2 size={12} className="text-zinc-600 hover:text-red-400 cursor-pointer" onClick={(e) => { e.stopPropagation(); startTransition(() => deleteDraft(draft.id)); }} />
                  <Play size={12} className="text-white cursor-pointer" onClick={() => handleResumeDraft(draft)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* SECCIÓN 3: BÓVEDA MOBILE (Acordeón Upward) */}
      <div className="lg:hidden flex-shrink-0 mt-4">
        <button 
          onClick={() => setIsVaultOpen(true)}
          className="w-full flex items-center justify-between p-4 bg-zinc-900/80 border border-white/10 rounded-2xl text-white shadow-xl active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center gap-3">
            <History size={16} className="text-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">Bóveda de Borradores</span>
          </div>
          <Badge className="bg-primary/20 text-primary border-none text-[10px]">{existingDrafts.length}</Badge>
        </button>

        <AnimatePresence>
          {isVaultOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsVaultOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-md z-40" />
              <motion.div 
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} 
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed bottom-0 left-0 right-0 h-[70vh] bg-zinc-950 border-t border-white/10 z-50 rounded-t-[2.5rem] p-6 flex flex-col"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black uppercase tracking-tighter text-white">Continuar Proceso</h2>
                  <button onClick={() => setIsVaultOpen(false)} className="p-2 bg-white/5 rounded-full"><X size={20} className="text-white/50" /></button>
                </div>
                <div className="flex-1 space-y-4 overflow-y-auto pb-10">
                  {existingDrafts.map((draft) => (
                    <div key={draft.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-3">
                      <p className="text-sm font-bold text-white leading-tight">{draft.title}</p>
                      <div className="flex justify-between items-center">
                        <Badge variant="ghost" className="p-0 text-[10px] font-black text-primary">{draft.creation_data.purpose.toUpperCase()}</Badge>
                        <div className="flex gap-4">
                          <Trash2 size={16} className="text-zinc-500" onClick={() => startTransition(() => deleteDraft(draft.id))} />
                          <button onClick={() => handleResumeDraft(draft)} className="p-2 px-4 bg-primary text-white rounded-lg text-[10px] font-black uppercase">RETOMAR</button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {existingDrafts.length === 0 && <p className="text-center text-zinc-500 text-xs py-10 uppercase font-bold tracking-widest opacity-20">Bóveda vacía</p>}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}