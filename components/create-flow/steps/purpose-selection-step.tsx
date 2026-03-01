// components/create-flow/steps/purpose-selection-step.tsx
// VERSIÓN: 9.0

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ChevronRight,
  ChevronUp,
  History,
  Lightbulb,
  Link2,
  Lock,
  MapPin,
  PenLine,
  Play,
  Trash2,
  X,
  Zap
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useMemo, useState, useTransition } from "react";
import { useFormContext } from "react-hook-form";

// --- INFRAESTRUCTURA DE SINCRO ---
import { useAuth } from "@/hooks/use-auth";
import { useFlowActions } from "../hooks/use-flow-actions";
import { MASTER_FLOW_PATHS } from "../shared/config";
import { useCreationContext } from "../shared/context";
import { FlowState } from "../shared/types";

// --- INTERFACES DE CATEGORÍA ---
interface PurposeOption {
  id: string;
  title: string;
  desc: string;
  icon: React.ElementType;
  color: string;
  isSituational?: boolean;
  adminOnly?: boolean; // Restringe el acceso a la autoridad administrativa
}

interface CategoryGroup {
  name: string;
  items: PurposeOption[];
}

/**
 * CONFIGURACIÓN SOBERANA DE FLUJOS
 * [REMEDIACIÓN]: La opción 'local_soul' ahora está marcada como adminOnly.
 */
const CATEGORIES: CategoryGroup[] = [
  {
    name: "Creatividad",
    items: [
      { id: "learn", title: "Aprender", desc: "Desglosa conceptos complejos.", icon: Lightbulb, color: "bg-amber-500/10 text-amber-500" },
      { id: "explore", title: "Explorar", desc: "Conecta dos ideas distintas.", icon: Link2, color: "bg-blue-500/10 text-blue-500" },
      { id: "pulse", title: "Actualidad", desc: "Briefing de inteligencia personalizada.", icon: Zap, color: "bg-indigo-500/10 text-indigo-500" },
    ]
  },
  {
    name: "Legado",
    items: [{ id: "reflect", title: "Reflexionar", desc: "Lecciones y testimonios de vida.", icon: PenLine, color: "bg-emerald-500/10 text-emerald-500" }]
  },
  {
    name: "Entorno",
    items: [{
      id: "local_soul",
      title: "Vive lo local",
      desc: "Secretos de tu ubicación actual.",
      icon: MapPin,
      color: "bg-violet-500/10 text-violet-500",
      isSituational: true,
      adminOnly: true // <--- Blindaje de autoridad
    }]
  }
];

export function PurposeSelectionStep({ existingDrafts = [] }: { existingDrafts?: any[] }) {
  const router = useRouter();
  const { profile, isAdmin } = useAuth(); // [SINCRO]: Consumo de rango de usuario
  const { setValue, reset } = useFormContext();
  const { transitionTo, jumpToStep } = useCreationContext();
  const [isPending, startTransition] = useTransition();
  const [isVaultOpen, setIsVaultOpen] = useState(false);

  /**
   * [FILTRADO]: Borradores Narrativos
   * Aseguramos que el usuario solo pueda retomar flujos autorizados.
   */
  const narrativeDrafts = useMemo(() => {
    const narrativePurposes = ['learn', 'explore', 'reflect', 'pulse'];
    return existingDrafts.filter(draft =>
      narrativePurposes.includes(draft.creation_data?.purpose)
    );
  }, [existingDrafts]);

  const { deleteDraft } = useFlowActions({
    transitionTo: (s) => transitionTo(s as FlowState),
    goBack: () => { },
    clearDraft: () => { }
  });

  /**
   * handleSelection: Orquestador de redirección por propósito.
   */
  const handleSelection = (item: PurposeOption) => {
    // [RBAC]: Si es GEO y el usuario no es admin, bloqueamos la acción.
    if (item.adminOnly && !isAdmin) return;

    if (item.id === 'local_soul') {
      startTransition(() => {
        router.push('/geo');
      });
      return;
    }

    setValue("purpose", item.id, { shouldValidate: true, shouldDirty: true });
    const targetPath = MASTER_FLOW_PATHS[item.id];
    if (targetPath && targetPath.length > 1) {
      transitionTo(targetPath[1]);
    }
  };

  /**
   * handleResumeDraft: Protocolo de recuperación de sesión.
   */
  const handleResumeDraft = (draft: any) => {
    const { purpose, agentName, inputs } = draft.creation_data;
    reset();
    setValue("draft_id", draft.id);
    if (inputs) {
      Object.entries(inputs).forEach(([k, v]) => setValue(k as any, v, { shouldValidate: true }));
    }
    setValue("purpose", purpose);
    setValue("agentName", agentName);
    setValue("final_title", draft.title);

    const parsed = typeof draft.script_text === 'string' ? JSON.parse(draft.script_text) : draft.script_text;
    setValue("final_script", parsed?.script_body || draft.script_text);
    setValue("sources", draft.sources || []);

    jumpToStep('SCRIPT_EDITING');
  };

  const userName = profile?.full_name?.split(' ')[0] || "Curador";

  return (
    <div className="relative h-full w-full max-w-7xl mx-auto flex flex-col p-4 md:px-12 lg:pt-4 lg:pb-10 selection:bg-primary/20">

      {/* HEADER DE INTENCIÓN */}
      <header className="flex-shrink-0 text-left mt-4 mb-10 animate-in fade-in slide-in-from-top-4 duration-1000">
        <div className="flex items-center gap-3 mb-2 opacity-60">
          <div className="h-1 w-1 rounded-full bg-primary animate-ping" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 dark:text-zinc-400">NicePod Workstation</span>
        </div>
        <h1 className="text-4xl lg:text-6xl font-black tracking-tighter uppercase text-zinc-900 dark:text-white leading-none italic">
          ¿Cuál es tu <span className="text-primary not-italic">intención?</span>
        </h1>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500 mt-2">
          Selecciona una frecuencia para iniciar la forja de sabiduría
        </p>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row gap-10 min-h-0 overflow-hidden">

        {/* COLUMNA DE SELECCIÓN (MALLA DE PROPÓSITOS) */}
        <div className="lg:flex-[1.6] flex flex-col gap-8 overflow-y-auto custom-scrollbar pr-2">
          {CATEGORIES.map((cat) => (
            <div key={cat.name} className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 whitespace-nowrap">{cat.name}</span>
                <div className="h-px w-full bg-white/5" />
              </div>

              <div className="grid grid-cols-1 gap-3">
                {cat.items.map((item) => {
                  const isDisabled = item.adminOnly && !isAdmin;

                  return (
                    <button
                      key={item.id}
                      onClick={() => !isDisabled && handleSelection(item)}
                      disabled={isDisabled && false} // Mantenemos habilitado para mostrar el 'Velo'
                      className={cn(
                        "relative flex items-center p-4 rounded-[1.5rem] border transition-all duration-500 text-left group overflow-hidden",
                        isDisabled
                          ? "bg-black/20 border-white/5 opacity-60 cursor-not-allowed"
                          : "bg-white/[0.03] border-white/5 hover:border-primary/40 hover:bg-white/[0.06] shadow-xl"
                      )}
                    >
                      {/* Icono con escala dinámica */}
                      <div className={cn(
                        "p-3 rounded-xl mr-5 transition-transform duration-700",
                        !isDisabled && "group-hover:scale-110 shadow-inner",
                        item.color
                      )}>
                        {isDisabled ? <Lock size={20} className="text-zinc-600" /> : <item.icon size={20} strokeWidth={2.5} />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h3 className={cn(
                            "font-black text-sm lg:text-base uppercase leading-none tracking-tight",
                            isDisabled ? "text-zinc-600" : "text-white"
                          )}>
                            {item.title}
                          </h3>
                          {item.isSituational && !isDisabled && (
                            <Badge className="bg-primary/20 text-primary border-primary/30 text-[8px] font-black px-2 py-0.5 animate-pulse">
                              SINTONÍA GEO
                            </Badge>
                          )}
                          {isDisabled && (
                            <Badge variant="outline" className="border-white/10 text-zinc-500 text-[8px] font-black px-2 py-0.5">
                              PRÓXIMAMENTE
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-500 font-medium truncate mt-1.5 uppercase tracking-wide">
                          {isDisabled ? "Flujo de sabiduría geolocalizada en desarrollo." : item.desc}
                        </p>
                      </div>

                      {!isDisabled && (
                        <ChevronRight size={20} className="text-white/10 group-hover:text-primary transition-all group-hover:translate-x-1" />
                      )}

                      {/* Efecto de 'Velo' para opciones bloqueadas */}
                      {isDisabled && (
                        <div className="absolute inset-0 bg-black/40 backdrop-grayscale-[0.5] pointer-events-none" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* ASIDE: BÓVEDA DE SESIONES (DESKTOP) */}
        <aside className="hidden lg:flex lg:flex-[1.2] bg-white/[0.01] border border-white/5 p-10 rounded-[3rem] backdrop-blur-3xl flex-col shadow-2xl h-full max-h-full overflow-hidden">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-2xl">
                <History size={24} className="text-primary" />
              </div>
              <div>
                <h2 className="font-black uppercase tracking-tighter text-white text-lg leading-none italic">Tu Bóveda</h2>
                <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-[0.3em] mt-1">Sesiones de Inteligencia</p>
              </div>
            </div>
            <Badge className="bg-zinc-900 text-zinc-400 border-white/5 px-3 py-1 text-[10px] font-mono">
              {narrativeDrafts.length}
            </Badge>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2">
            {narrativeDrafts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-10 text-center py-20 grayscale">
                <Mic size={60} className="mb-6" />
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500">Sin ondas detectadas</p>
              </div>
            ) : (
              narrativeDrafts.map((draft) => (
                <div
                  key={draft.id}
                  onClick={() => handleResumeDraft(draft)}
                  className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-primary/40 transition-all group cursor-pointer relative shadow-inner overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  <p className="text-sm font-black text-white truncate mb-3 uppercase tracking-tight pr-10 italic">
                    {draft.title || "Crónica sin título"}
                  </p>
                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className="text-[8px] font-black text-primary border-primary/20 uppercase tracking-widest px-2">
                      {draft.creation_data.purpose}
                    </Badge>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("¿Purgar esta sesión de la memoria?")) {
                          startTransition(() => { deleteDraft(draft.id); });
                        }
                      }}
                      className="p-2 text-zinc-700 hover:text-red-500 transition-colors z-20"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="absolute top-6 right-6 text-zinc-800 group-hover:text-primary transition-all duration-500">
                    <Play size={18} fill="currentColor" className="opacity-20 group-hover:opacity-100" />
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>

      {/* FOOTER MOBILE: ACTIVADOR DE BÓVEDA */}
      <div className="lg:hidden flex-shrink-0 mt-6 pb-4">
        <button
          onClick={() => setIsVaultOpen(true)}
          className="w-full flex items-center justify-between p-5 bg-zinc-900 border border-white/10 rounded-[1.5rem] text-white shadow-[0_20px_40px_rgba(0,0,0,0.4)] active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <History size={18} className="text-primary animate-pulse" />
              <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Continuar Sesión</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-black text-white tabular-nums">{narrativeDrafts.length}</span>
            <ChevronUp size={16} className="text-primary" />
          </div>
        </button>
      </div>

      {/* DRAWER DE BÓVEDA MÓVIL (PORTAL) */}
      <AnimatePresence>
        {isVaultOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsVaultOpen(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100]"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 h-[80dvh] bg-[#050505] border-t border-white/10 z-[110] rounded-t-[3rem] p-8 flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-8 mb-8">
                <div className="flex items-center gap-4">
                  <History size={24} className="text-primary" />
                  <h2 className="text-2xl font-black uppercase tracking-tighter text-white italic">Retomar Forja</h2>
                </div>
                <Button variant="ghost" onClick={() => setIsVaultOpen(false)} className="rounded-full h-12 w-12 bg-white/5">
                  <X size={24} className="text-zinc-500" />
                </Button>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pb-10">
                {narrativeDrafts.map((draft) => (
                  <div key={draft.id} onClick={() => handleResumeDraft(draft)} className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 flex flex-col gap-6 active:bg-white/[0.06] transition-all">
                    <p className="text-lg font-black text-white uppercase tracking-tight leading-tight italic line-clamp-2">
                      {draft.title || "Crónica sin nombre"}
                    </p>
                    <div className="flex justify-between items-center">
                      <Badge variant="outline" className="text-[10px] font-black text-primary border-primary/20 uppercase tracking-widest">{draft.creation_data.purpose}</Badge>
                      <div className="flex items-center gap-8">
                        <button onClick={(e) => { e.stopPropagation(); if (confirm("¿Eliminar?")) deleteDraft(draft.id); }} className="text-zinc-600 active:text-red-500"><Trash2 size={22} /></button>
                        <span className="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-3">
                          REANUDAR <ArrowRight size={14} className="text-primary" />
                        </span>
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
  );
}

/**
 * SUB-COMPONENTE: Mic (Icono auxiliar)
 */
function Mic(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 8-9.04 9.06a2.82 2.82 0 1 0 3.98 3.98L16 12" />
      <circle cx="17" cy="7" r="5" />
    </svg>
  )
}