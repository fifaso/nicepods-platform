// components/create-flow/steps/purpose-selection-step.tsx
// VERSIÓN: 4.5 (Aurora Master - Hybrid Layout & Type Integrity Fix)

"use client";

import React, { useTransition } from "react";
import { useFormContext } from "react-hook-form";
import { motion } from "framer-motion";
import {
  Lightbulb, Link2, MessageCircleQuestion, PenLine,
  MapPin, ChevronRight, History, Play, Trash2, Sparkles, Brain
} from "lucide-react";
import { cn } from "@/lib/utils";

import { useCreationContext } from "../shared/context";
import { useFlowActions } from "../hooks/use-flow-actions";
import { MASTER_FLOW_PATHS } from "../shared/config";
import { Badge } from "@/components/ui/badge";

// --- TIPADO ESTRICTO ---
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

const CATEGORIES: CategoryGroup[] = [
  {
    name: "Creatividad",
    items: [
      { id: "learn", title: "Aprender", desc: "Desglosa conceptos.", icon: Lightbulb, color: "bg-amber-500/10 text-amber-400" },
      { id: "explore", title: "Explorar", desc: "Conecta dos ideas.", icon: Link2, color: "bg-blue-500/10 text-blue-400" },
      { id: "answer", title: "Preguntar", desc: "Respuestas IA.", icon: MessageCircleQuestion, color: "bg-rose-500/10 text-rose-400" },
    ]
  },
  {
    name: "Legado",
    items: [{ id: "reflect", title: "Reflexionar", desc: "Lecciones de vida.", icon: PenLine, color: "bg-emerald-500/10 text-emerald-400" }]
  },
  {
    name: "Entorno",
    items: [{ id: "local_soul", title: "Vive lo local", desc: "Ubicación actual.", icon: MapPin, color: "bg-violet-500/10 text-violet-400", isSituational: true }]
  }
];

export function PurposeSelectionStep({ existingDrafts = [] }: { existingDrafts?: any[] }) {
  const { setValue, reset } = useFormContext();
  const { transitionTo, jumpToStep } = useCreationContext();
  const [isPending, startTransition] = useTransition();
  const { deleteDraft } = useFlowActions({ transitionTo: (s) => transitionTo(s), goBack: () => { }, clearDraft: () => { } });

  const handleSelection = (id: string) => {
    setValue("purpose", id, { shouldValidate: true, shouldDirty: true });
    const targetPath = MASTER_FLOW_PATHS[id];
    if (targetPath && targetPath.length > 1) transitionTo(targetPath[1]);
  };

  const handleResumeDraft = (draft: any) => {
    const { purpose, agentName, inputs } = draft.creation_data;
    reset(); // Saneamiento de estado previo
    setValue("draft_id", draft.id);
    Object.entries(inputs || {}).forEach(([k, v]) => setValue(k as any, v, { shouldValidate: true }));
    setValue("purpose", purpose);
    setValue("agentName", agentName);
    setValue("final_title", draft.title);

    let body = "";
    try {
      const parsed = typeof draft.script_text === 'string' ? JSON.parse(draft.script_text) : draft.script_text;
      body = parsed.script_body || draft.script_text;
    } catch {
      body = draft.script_text;
    }
    setValue("final_script", body);
    setValue("sources", draft.sources || []);

    // [FIJO]: jumpToStep ahora disponible gracias a shared/types.ts
    jumpToStep('SCRIPT_EDITING');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 h-full w-full max-w-6xl mx-auto gap-10 p-4 md:p-12 overflow-hidden">

      {/* SECCIÓN 1: INTENCIONES (Ocupa 2/3 en Desktop) */}
      <div className="lg:col-span-2 space-y-10 flex flex-col justify-center overflow-y-auto custom-scrollbar-hide">
        <header className="text-left space-y-4">
          <motion.h1
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-5xl md:text-7xl font-black tracking-tighter uppercase text-white leading-none drop-shadow-2xl"
          >
            ¿Cuál es tu <br /><span className="text-primary italic">intención?</span>
          </motion.h1>
          <p className="text-[11px] font-black uppercase tracking-[0.4em] text-white/30">Inicia el escaneo cognitivo de IA</p>
        </header>

        <div className="flex flex-col gap-8">
          {CATEGORIES.map((cat) => (
            <div key={cat.name} className="space-y-3">
              <header className="flex items-center gap-3 px-1 opacity-50">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">{cat.name}</span>
                <div className="h-[px] flex-1 bg-white/10" />
              </header>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {cat.items.map((item: PurposeOption) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelection(item.id)}
                    className="relative w-full flex items-center p-4 rounded-[1.5rem] border border-white/5 bg-zinc-900/60 backdrop-blur-xl hover:border-primary/40 transition-all group text-left overflow-hidden shadow-lg"
                  >
                    <div className={cn("p-3 rounded-2xl mr-4 transition-transform group-hover:scale-110 shadow-inner", item.color)}>
                      <item.icon size={20} strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm uppercase text-white tracking-tight">{item.title}</h3>
                        {item.isSituational && (
                          <Badge className="bg-primary/20 text-primary border-none text-[7px] font-black h-3.5 px-1.5 tracking-tighter animate-pulse">
                            SITUACIONAL
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500 font-medium truncate mt-0.5">{item.desc}</p>
                    </div>
                    <ChevronRight size={18} className="text-white/10 group-hover:text-primary transition-all group-hover:translate-x-1" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECCIÓN 2: LA BÓVEDA (Sidebar en Desktop) */}
      <aside className="lg:col-span-1 bg-white/[0.03] border border-white/5 p-8 rounded-[2.5rem] backdrop-blur-3xl flex flex-col shadow-2xl relative">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Brain size={120} />
        </div>

        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl"><History size={20} className="text-primary animate-pulse" /></div>
            <h2 className="font-black uppercase tracking-tighter text-white text-xl">Bóveda</h2>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono border-white/10 text-zinc-500">{existingDrafts.length}</Badge>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar-hide relative z-10 pr-1">
          {existingDrafts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-20">
              <Sparkles size={40} className="mb-4 text-zinc-600" />
              <p className="text-[10px] font-black uppercase tracking-widest leading-loose">Tu memoria <br />está despejada</p>
            </div>
          ) : (
            existingDrafts.map((draft) => (
              <div
                key={draft.id}
                className="group relative flex flex-col p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-primary/30 transition-all cursor-default"
              >
                <p className="text-xs font-bold text-white truncate leading-none mb-3 uppercase tracking-tight">{draft.title || "Sin título"}</p>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-primary uppercase tracking-widest">{draft.creation_data.purpose}</span>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => startTransition(() => deleteDraft(draft.id))}
                      className="p-2 text-zinc-600 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                    <button
                      onClick={() => handleResumeDraft(draft)}
                      className="p-2 bg-primary/20 text-primary rounded-lg hover:bg-primary hover:text-white transition-all shadow-lg"
                    >
                      <Play size={10} fill="currentColor" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <footer className="mt-8 pt-6 border-t border-white/5 relative z-10">
          <p className="text-[9px] font-bold text-zinc-600 text-center leading-relaxed">
            Los borradores se almacenan localmente en tu búnker de conocimiento.
          </p>
        </footer>
      </aside>
    </div>
  );
}