// components/create-flow/purpose-selection-step.tsx
// VERSIÓN FINAL PULIDA: Ancho controlado (max-w-2xl) para centrado perfecto.

"use client";

import { useCreationContext } from "../podcast-creation-form";
import { Lightbulb, Sparkles, Link as LinkIcon, PenSquare, HelpCircle, Bot, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const purposeOptions = [
  { purpose: "learn", style: "solo", agent: "solo-talk-analyst", nextState: "LEARN_SUB_SELECTION", icon: <Lightbulb className="h-5 w-5 text-amber-400" />, title: "Aprender", description: <span className="hidden md:inline">Explica un concepto complejo con claridad.</span> },
  { purpose: "inspire", style: "archetype", nextState: "INSPIRE_SUB_SELECTION", icon: <Sparkles className="h-5 w-5 text-purple-400" />, title: "Inspirar", description: <span className="hidden md:inline">Historias potentes con estructura narrativa.</span> },
  { purpose: "explore", style: "link", nextState: "LINK_POINTS_INPUT", icon: <LinkIcon className="h-5 w-5 text-blue-400" />, title: "Explorar", description: <span className="hidden md:inline">Conecta dos ideas distintas.</span> },
  { purpose: "reflect", style: "legacy", agent: "legacy-agent", nextState: "LEGACY_INPUT", icon: <PenSquare className="h-5 w-5 text-emerald-400" />, title: "Reflexionar", description: <span className="hidden md:inline">Deja un legado o lección de vida.</span> },
  { purpose: "answer", style: "qa", agent: "qa-agent", nextState: "QUESTION_INPUT", icon: <HelpCircle className="h-5 w-5 text-rose-400" />, title: "Responder", description: <span className="hidden md:inline">Respuesta concisa a una duda específica.</span> },
  { purpose: "freestyle", style: undefined, nextState: "FREESTYLE_SELECTION", icon: <Bot className="h-5 w-5 text-slate-400" />, title: "Libre", description: <span className="hidden md:inline">Para creadores avanzados.</span>, isSecondary: true }
];

export function PurposeSelectionStep() {
  const { updateFormData, transitionTo } = useCreationContext();

  const handleSelectPurpose = (option: typeof purposeOptions[0]) => {
    updateFormData({ purpose: option.purpose as any, style: option.style as any, selectedAgent: option.agent });
    transitionTo(option.nextState as any);
  };

  return (
    <div className="flex flex-col h-full w-full justify-center items-center animate-fade-in px-4">
      
      {/* CABECERA */}
      <div className="text-center mb-6 flex-shrink-0 w-full max-w-lg">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white drop-shadow-md">
          ¿Cuál es tu intención?
        </h2>
        <p className="text-sm text-white/70 mt-2 font-medium">
          Elige un propósito y la IA hará el resto.
        </p>
      </div>
      
      {/* GRID DE BOTONES: Ajustado a max-w-2xl para mantener cohesión visual */}
      <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-3">
        {purposeOptions.map((option) => (
          <button
            key={option.purpose}
            onClick={() => handleSelectPurpose(option)}
            className={cn(
              "group relative flex items-center text-left transition-all duration-300",
              "p-3 md:p-4",
              // Estilo Glass Limpio: Fondo sutil, borde apenas visible, hover luminoso
              "bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/30",
              "rounded-xl overflow-hidden shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]",
              option.isSecondary && "opacity-80 hover:opacity-100"
            )}
          >
            {/* Icono */}
            <div className="flex-shrink-0 mr-4">
              <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-lg bg-black/20 border border-white/5 group-hover:scale-110 transition-transform duration-300">
                {option.icon}
              </div>
            </div>

            {/* Texto */}
            <div className="flex-grow min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm md:text-base font-bold text-white group-hover:text-white transition-colors">
                  {option.title}
                </h3>
                <ArrowRight className="h-4 w-4 text-white/50 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 hidden md:block" />
              </div>
              <p className="text-xs text-white/60 mt-0.5 md:mt-1 line-clamp-1 group-hover:text-white/80 transition-colors">
                {option.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}