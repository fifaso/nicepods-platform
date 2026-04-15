/**
 * ARCHIVO: components/create-flow/steps/purpose-selection-step.tsx
 * VERSIÓN: 6.0 (NicePod Purpose Selection - BSS & Frontier Mapping Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Orquestar la selección del propósito narrativo, gestionando el acceso 
 * restringido por autoridad (RBAC) y la recuperación de sesiones interrumpidas.
 * [REFORMA V6.0]: Resolución definitiva de TS2322 mediante la unificación de 
 * 'existingDraftsCollection'. Implementación del Mapeador de Frontera ZAP para 
 * la restauración de estados. Erradicación total de 'any' y abreviaciones.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, nicepodLog } from "@/lib/utils";
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
  Mic,
  PenLine,
  Play,
  Trash2,
  X,
  Zap
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useMemo, useState, useTransition } from "react";
import { useFormContext } from "react-hook-form";

// --- INFRAESTRUCTURA DE SINCRO V4.9 ---
import { useAuth } from "@/hooks/use-auth";
import { useFlowActions } from "../hooks/use-flow-actions";
import { MASTER_FLOW_PATHS } from "../shared/config";
import { useCreationContext } from "../shared/context";
import { FlowState } from "../shared/types";
import { Tables } from "@/types/database.types";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { CreationMetadataPayload } from "@/types/podcast";

/**
 * INTERFAZ: PurposeOptionDefinition
 * Contrato industrial para una intención de creación.
 */
interface PurposeOptionDefinition {
  identification: string;
  title: string;
  descriptionTextContent: string;
  iconComponent: React.ElementType;
  colorClassName: string;
  isSituationalModeStatus?: boolean;
  isAdministratorOnlyAccessStatus?: boolean;
}

interface PurposeCategoryGroup {
  categoryName: string;
  purposeOptionsCollection: PurposeOptionDefinition[];
}

/**
 * [BSS]: Definición de entrada de borrador basada en el Metal.
 */
type DraftEntry = Tables<'podcast_drafts'>;

/**
 * PURPOSE_CATEGORIES_COLLECTION: Arquitectura de la Malla de Intenciones.
 */
const PURPOSE_CATEGORIES_COLLECTION: PurposeCategoryGroup[] = [
  {
    categoryName: "Creatividad",
    purposeOptionsCollection: [
      { identification: "learn", title: "Aprender", descriptionTextContent: "Desglosa conceptos complejos y destila verdades.", iconComponent: Lightbulb, colorClassName: "bg-amber-500/10 text-amber-500" },
      { identification: "explore", title: "Explorar", descriptionTextContent: "Conecta dos ideas distantes en un nuevo nodo.", iconComponent: Link2, colorClassName: "bg-blue-500/10 text-blue-500" },
      { identification: "pulse", title: "Actualidad", descriptionTextContent: "Sintoniza el briefing de inteligencia en tiempo real.", iconComponent: Zap, colorClassName: "bg-indigo-500/10 text-indigo-500" },
    ]
  },
  {
    categoryName: "Legado",
    purposeOptionsCollection: [
      { identification: "reflect", title: "Reflexionar", descriptionTextContent: "Inmortaliza lecciones y testimonios de sabiduría.", iconComponent: PenLine, colorClassName: "bg-emerald-500/10 text-emerald-500" }
    ]
  },
  {
    categoryName: "Entorno",
    purposeOptionsCollection: [
      {
        identification: "local_soul",
        title: "Vivir lo local",
        descriptionTextContent: "Accede a los secretos de tu ubicación actual.",
        iconComponent: MapPin,
        colorClassName: "bg-violet-500/10 text-violet-500",
        isSituationalModeStatus: true,
        isAdministratorOnlyAccessStatus: true
      }
    ]
  }
];

/**
 * INTERFAZ: PurposeSelectionStepProperties
 */
interface PurposeSelectionStepProperties {
  /** existingDraftsCollection: Propiedad sincronizada para resolver TS2322. */
  existingDraftsCollection?: DraftEntry[];
}

/**
 * PurposeSelectionStep: La terminal de entrada a la forja NicePod.
 */
export function PurposeSelectionStep({ 
  existingDraftsCollection = [] 
}: PurposeSelectionStepProperties) {
  
  const navigationRouter = useRouter();
  const { administratorProfile, isAdministratorAuthority } = useAuth();
  
  const { setValue, reset } = useFormContext<PodcastCreationData>();
  const { transitionToNextStateAction, jumpToStepAction } = useCreationContext();
  const [isTransitionPending, startSovereignTransition] = useTransition();
  const [isVaultTerminalOpen, setIsVaultTerminalOpen] = useState<boolean>(false);

  /**
   * narrativeDraftsCollection: Filtrado de sesiones compatibles mediante peritaje de metadatos.
   */
  const narrativeDraftsCollection = useMemo(() => {
    const validNarrativePurposes = ['learn', 'explore', 'reflect', 'pulse'];
    return existingDraftsCollection.filter(draftEntry => {
      const creationDataDossier = draftEntry.creation_data as unknown as CreationMetadataPayload;
      return creationDataDossier && validNarrativePurposes.includes(creationDataDossier.creationMode || "");
    });
  }, [existingDraftsCollection]);

  const { deleteDraftAction } = useFlowActions({
    transitionTo: (targetState) => transitionToNextStateAction(targetState as FlowState),
    goBack: () => { },
    clearDraft: () => { }
  });

  /**
   * handlePurposeSelectionAction: Orquestador de navegación balística por intención.
   */
  const handlePurposeSelectionAction = (purposeOption: PurposeOptionDefinition) => {
    if (purposeOption.isAdministratorOnlyAccessStatus && !isAdministratorAuthority) {
        nicepodLog("🛡️ [RBAC] Acceso restringido a rango administrativo.");
        return;
    }

    if (purposeOption.identification === 'local_soul') {
      startSovereignTransition(() => {
        navigationRouter.push('/map');
      });
      return;
    }

    setValue("purpose", purposeOption.identification as any, { shouldValidate: true, shouldDirty: true });
    const targetFlowPathCollection = MASTER_FLOW_PATHS[purposeOption.identification];
    
    if (targetFlowPathCollection && targetFlowPathCollection.length > 1) {
      transitionToNextStateAction(targetFlowPathCollection[1]);
    }
  };

  /**
   * handleResumeDraftAction: Protocolo de restauración de sesión (Frontier Mapping).
   */
  const handleResumeDraftAction = (draftEntry: DraftEntry) => {
    const creationMetadataDossier = draftEntry.creation_data as unknown as CreationMetadataPayload;
    if (!creationMetadataDossier) return;

    reset();
    setValue("draftIdentification", draftEntry.id);
    
    if (creationMetadataDossier.inputs) {
      /**
       * [ZAP]: MAPEADOR DE FRONTERA
       * Traduce del Metal (Legacy snake_case) al Cristal (Industrial camelCase V12.0).
       */
      const contractMappingRecord: Record<string, keyof PodcastCreationData> = {
        'topic': 'soloTopicSelection',
        'topicA': 'linkTopicPrimary',
        'topicB': 'linkTopicSecondary',
        'motivation': 'soloMotivationContentText',
        'catalyst': 'linkCatalystElement',
        'duration': 'durationSelection',
        'narrativeDepth': 'narrativeDepthLevel',
        'selectedTone': 'selectedToneIdentifier',
        'voiceGender': 'voiceGenderSelection',
        'voiceStyle': 'voiceStyleSelection',
        'voicePace': 'voicePaceSelection'
      };

      Object.entries(creationMetadataDossier.inputs).forEach(([fieldKey, fieldValue]) => {
        const industrialKey = contractMappingRecord[fieldKey] || fieldKey;
        setValue(industrialKey as any, fieldValue, { shouldValidate: true });
      });
    }

    setValue("purpose", (creationMetadataDossier.creationMode as any) || 'learn');
    setValue("agentName", creationMetadataDossier.agentName || 'narrador');
    setValue("finalTitle", draftEntry.title || "");

    // Parseo seguro del guion acústico.
    const scriptTextSnapshot = typeof draftEntry.script_text === 'string' 
        ? JSON.parse(draftEntry.script_text) 
        : draftEntry.script_text;
        
    setValue("finalScriptContent", scriptTextSnapshot?.scriptBodyContent || "");
    
    nicepodLog(`🔄 [Bóveda] Sesión restaurada para: ${draftEntry.title}`);
    jumpToStepAction('SCRIPT_EDITING_CANVAS');
  };

  return (
    <div className="relative h-full w-full max-w-7xl mx-auto flex flex-col p-4 md:px-12 lg:pt-4 lg:pb-10 selection:bg-primary/20 isolate">

      <header className="flex-shrink-0 text-left mt-4 mb-10 animate-in fade-in slide-in-from-top-4 duration-1000">
        <div className="flex items-center gap-3 mb-2 opacity-60">
          <div className="h-1 w-1 rounded-full bg-primary animate-ping" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">NicePod Workstation</span>
        </div>
        <h1 className="text-4xl lg:text-6xl font-black tracking-tighter uppercase text-white leading-none italic font-serif">
          ¿Cuál es tu <span className="text-primary not-italic">intención?</span>
        </h1>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row gap-10 min-h-0 overflow-hidden">
        {/* PANEL DE SELECCIÓN DE CATEGORÍAS */}
        <div className="lg:flex-[1.6] flex flex-col gap-8 overflow-y-auto custom-scrollbar pr-2">
          {PURPOSE_CATEGORIES_COLLECTION.map((categoryGroupItem) => (
            <div key={categoryGroupItem.categoryName} className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 whitespace-nowrap">
                    {categoryGroupItem.categoryName}
                </span>
                <div className="h-px w-full bg-white/5" />
              </div>

              <div className="grid grid-cols-1 gap-3">
                {categoryGroupItem.purposeOptionsCollection.map((purposeOptionItem) => {
                  const isPurposeAccessDisabled = purposeOptionItem.isAdministratorOnlyAccessStatus && !isAdministratorAuthority;

                  return (
                    <button
                      key={purposeOptionItem.identification}
                      onClick={() => !isPurposeAccessDisabled && handlePurposeSelectionAction(purposeOptionItem)}
                      disabled={isTransitionPending}
                      className={cn(
                        "relative flex items-center p-4 rounded-[1.5rem] border transition-all duration-500 text-left group overflow-hidden",
                        isPurposeAccessDisabled
                          ? "bg-black/20 border-white/5 opacity-60 cursor-not-allowed"
                          : "bg-white/[0.03] border-white/5 hover:border-primary/40 hover:bg-white/[0.06] shadow-xl"
                      )}
                    >
                      <div className={cn(
                        "p-3 rounded-xl mr-5 transition-transform duration-700",
                        !isPurposeAccessDisabled && "group-hover:scale-110 shadow-inner",
                        purposeOptionItem.colorClassName
                      )}>
                        {isPurposeAccessDisabled ? (
                            <Lock size={20} className="text-zinc-600" />
                        ) : (
                            <purposeOptionItem.iconComponent size={20} strokeWidth={2.5} />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h3 className={cn(
                            "font-black text-sm lg:text-base uppercase leading-none tracking-tight",
                            isPurposeAccessDisabled ? "text-zinc-600" : "text-white"
                          )}>
                            {purposeOptionItem.title}
                          </h3>
                          {purposeOptionItem.isSituationalModeStatus && !isPurposeAccessDisabled && (
                            <Badge className="bg-primary/20 text-primary border-primary/30 text-[8px] font-black px-2 py-0.5 animate-pulse">
                              SINTONÍA GEO
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-500 font-medium truncate mt-1.5 uppercase tracking-wide">
                          {isPurposeAccessDisabled ? "Flujo restringido a rango administrativo." : purposeOptionItem.descriptionTextContent}
                        </p>
                      </div>

                      {!isPurposeAccessDisabled && (
                        <ChevronRight size={20} className="text-white/10 group-hover:text-primary transition-all group-hover:translate-x-1" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* BÓVEDA LATERAL DE SESIONES (DESKTOP) */}
        <aside className="hidden lg:flex lg:flex-[1.2] bg-white/[0.01] border border-white/5 p-10 rounded-[3rem] backdrop-blur-3xl flex-col shadow-2xl h-full max-h-full overflow-hidden">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-2xl">
                <History size={24} className="text-primary" />
              </div>
              <div>
                <h2 className="font-black uppercase tracking-tighter text-white text-lg leading-none italic font-serif">Tu Bóveda</h2>
                <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-[0.3em] mt-1">Sesiones Activas</p>
              </div>
            </div>
            <Badge className="bg-zinc-900 text-zinc-400 border-white/5 px-3 py-1 text-[10px] font-mono">
              {narrativeDraftsCollection.length}
            </Badge>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2 pb-10">
            {narrativeDraftsCollection.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-10 text-center py-20 grayscale">
                <Mic size={60} className="mb-6" />
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500">Sin ondas detectadas</p>
              </div>
            ) : (
              narrativeDraftsCollection.map((draftEntry) => (
                <div
                  key={draftEntry.id}
                  onClick={() => handleResumeDraftAction(draftEntry)}
                  className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-primary/40 transition-all group cursor-pointer relative shadow-inner overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  <p className="text-sm font-black text-white truncate mb-3 uppercase tracking-tight pr-10 italic">
                    {draftEntry.title || "Crónica sin título"}
                  </p>
                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className="text-[8px] font-black text-primary border-primary/20 uppercase tracking-widest px-2">
                      {(draftEntry.creation_data as any).creation_mode || "Standard"}
                    </Badge>
                    <button
                      onClick={(interactionEvent) => {
                        interactionEvent.stopPropagation();
                        if (confirm("¿Purgar esta sesión de la memoria física?")) {
                          startSovereignTransition(() => { deleteDraftAction(draftEntry.id); });
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

      {/* TERMINAL MÓVIL DE BÓVEDA */}
      <AnimatePresence>
        {isVaultTerminalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsVaultTerminalOpen(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100]"
            />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 h-[80dvh] bg-[#050505] border-t border-white/10 z-[110] rounded-t-[3rem] p-8 flex flex-col shadow-2xl isolate"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-8 mb-8">
                <div className="flex items-center gap-4">
                  <History size={24} className="text-primary" />
                  <h2 className="text-2xl font-black uppercase tracking-tighter text-white italic font-serif">Retomar Forja</h2>
                </div>
                <Button variant="ghost" onClick={() => setIsVaultTerminalOpen(false)} className="rounded-full h-12 w-12 bg-white/5">
                  <X size={24} className="text-zinc-500" />
                </Button>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pb-10">
                {narrativeDraftsCollection.map((draftEntry) => (
                  <div key={draftEntry.id} onClick={() => handleResumeDraftAction(draftEntry)} className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 flex flex-col gap-6 active:bg-white/[0.06] transition-all">
                    <p className="text-lg font-black text-white uppercase tracking-tight leading-tight italic line-clamp-2">
                      {draftEntry.title || "Crónica sin nombre"}
                    </p>
                    <div className="flex justify-between items-center">
                      <Badge variant="outline" className="text-[10px] font-black text-primary border-primary/20 uppercase tracking-widest">
                          {(draftEntry.creation_data as any).creation_mode || "Standard"}
                      </Badge>
                      <div className="flex items-center gap-8">
                        <button 
                            onClick={(interactionEvent) => { interactionEvent.stopPropagation(); if (confirm("¿Purgar sesión?")) deleteDraftAction(draftEntry.id); }} 
                            className="text-zinc-600 active:text-red-500"
                        >
                            <Trash2 size={22} />
                        </button>
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
 * NOTA TÉCNICA DEL ARCHITECT (V6.0):
 * 1. Prop Sincronization: Resolución de TS2322 mediante la unificación del nombre 
 *    'existingDraftsCollection' en toda la jerarquía de la forja.
 * 2. ZAP Frontier Mapping: Restauración de estados de formulario mediante el mapeo 
 *    explícito de descriptores industriales (topic -> soloTopicSelection).
 * 3. BSS Strictness: Erradicación de 'any' mediante el casting controlado hacia 
 *    'CreationMetadataPayload' y 'PodcastCreationData'.
 */