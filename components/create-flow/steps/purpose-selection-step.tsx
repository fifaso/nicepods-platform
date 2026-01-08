// components/create-flow/steps/purpose-selection-step.tsx
// VERSIÓN: 3.2 (Aurora Standard - Active Hydration & Quota Management)

"use client";

import React, { useTransition } from "react";
import { useFormContext } from "react-hook-form";
import { motion } from "framer-motion";
import {
  Lightbulb, Link2, MessageCircleQuestion, PenLine,
  MapPin, ChevronRight, History, Play, Trash2, Sparkles
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
    items: [
      { id: "reflect", title: "Reflexionar", desc: "Lecciones de vida.", icon: PenLine, color: "bg-emerald-500/10 text-emerald-400" }
    ]
  },
  {
    name: "Entorno",
    items: [
      { id: "local_soul", title: "Vive lo local", desc: "Ubicación actual.", icon: MapPin, color: "bg-violet-500/10 text-violet-400", isSituational: true }
    ]
  }
];

export function PurposeSelectionStep({ existingDrafts = [] }: { existingDrafts?: any[] }) {
  const { setValue } = useFormContext();
  const { transitionTo } = useCreationContext();
  const [isPending, startTransition] = useTransition();
  const { deleteDraft } = useFlowActions({ transitionTo: () => { }, goBack: () => { }, clearDraft: () => { } });

  const handleSelection = (id: string) => {
    setValue("purpose", id, { shouldValidate: true, shouldDirty: true });
    const targetPath = MASTER_FLOW_PATHS[id];
    if (targetPath && targetPath.length > 1) transitionTo(targetPath[1]);
  };

  const handleResumeDraft = (draft: any) => {
    const { purpose, agentName, inputs } = draft.creation_data;

    // HIDRATACIÓN ATÓMICA
    // 1. Inyectar ID para promoción
    setValue("draft_id", draft.id);

    // 2. Inyectar Semilla
    Object.entries(inputs || {}).forEach(([k, v]) => {
      setValue(k as any, v, { shouldValidate: true });
    });

    // 3. Inyectar Resultados
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

    transitionTo('SCRIPT_EDITING');
  };

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // Evita disparar el 'resume'
    if (confirm("¿Eliminar este borrador definitivamente?")) {
      startTransition(async () => {
        await deleteDraft(id);
      });
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto px-4 py-2 justify-start overflow-y-auto custom-scrollbar-hide">

      {/* BANDEJA DE BORRADORES ACTIVOS */}
      {existingDrafts.length > 0 && (
        <section className="mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <History size={14} className="text-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Sesiones Abiertas</span>
            </div>
            <Badge variant="outline" className="text-[8px] border-white/10 font-mono text-zinc-500">
              {existingDrafts.length} activos
            </Badge>
          </div>

          <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto custom-scrollbar-hide pr-1">
            {existingDrafts.map((draft) => (
              <div
                key={draft.id}
                onClick={() => handleResumeDraft(draft)}
                className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-primary/30 transition-all group cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-white truncate uppercase tracking-tight">{draft.title || "Sin título"}</p>
                  <p className="text-[9px] text-zinc-500 font-black uppercase tracking-tighter italic opacity-60">
                    {draft.creation_data.purpose}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => handleDelete(e, draft.id)}
                    className="p-2 text-zinc-600 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                  <div className="p-2 bg-primary/20 text-primary rounded-lg group-hover:scale-105 transition-transform">
                    <Play size={10} fill="currentColor" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CABECERA INTENCIÓN */}
      <header className="text-center mb-8 pt-2">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-black tracking-tighter uppercase text-zinc-900 dark:text-white leading-tight"
        >
          ¿Cuál es tu <span className="text-primary italic font-black">intención?</span>
        </motion.h1>
      </header>

      {/* CATEGORÍAS */}
      <div className="flex flex-col gap-5 pb-10">
        {CATEGORIES.map((cat) => (
          <div key={cat.name} className="space-y-2">
            <header className="flex items-center gap-2 px-1">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/80">{cat.name}</span>
              <div className="h-[1px] flex-1 bg-white/5" />
            </header>
            <div className="grid gap-2">
              {cat.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelection(item.id)}
                  className="relative w-full flex items-center p-3.5 rounded-xl border border-white/5 bg-zinc-900/60 backdrop-blur-md hover:border-primary/40 transition-all group text-left overflow-hidden shadow-sm"
                >
                  <div className={cn("p-2.5 rounded-lg mr-4 transition-transform group-hover:scale-110", item.color)}>
                    <item.icon size={18} strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm uppercase text-white leading-none">{item.title}</h3>
                      {item.isSituational && (
                        <Badge className="bg-primary/20 text-primary border-primary/20 text-[7px] font-black h-3.5 px-1 tracking-tighter animate-pulse">
                          SITUACIONAL
                        </Badge>
                      )}
                    </div>
                    <p className="text-[10px] text-zinc-500 font-medium leading-tight mt-1 truncate">{item.desc}</p>
                  </div>
                  <ChevronRight size={16} className="text-zinc-600 group-hover:text-primary transition-all group-hover:translate-x-1" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}