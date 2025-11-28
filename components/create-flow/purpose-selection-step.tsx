// components/create-flow/purpose-selection-step.tsx
// VERSIÓN FINAL: Soluciona el error de tipos reemplazando SelectionCard por botones nativos horizontales.

"use client";

import { useCreationContext } from "../podcast-creation-form";
// [CORRECCIÓN]: Eliminamos SelectionCard porque no soporta JSX en la descripción.
import { Lightbulb, Sparkles, Link as LinkIcon, PenSquare, HelpCircle, Bot, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const purposeOptions = [
  {
    purpose: "learn", style: "solo", agent: "solo-talk-analyst", nextState: "LEARN_SUB_SELECTION",
    icon: <Lightbulb className="h-5 w-5 text-amber-400" />, title: "Aprender",
    description: <span className="hidden md:inline">Transforma un tema complejo en un audio claro y memorable.</span>
  },
  {
    purpose: "inspire", style: "archetype", nextState: "INSPIRE_SUB_SELECTION",
    icon: <Sparkles className="h-5 w-5 text-purple-400" />, title: "Inspirar",
    description: <span className="hidden md:inline">Comparte una historia potente usando estructuras narrativas clásicas.</span>
  },
  {
    purpose: "explore", style: "link", nextState: "LINK_POINTS_INPUT",
    icon: <LinkIcon className="h-5 w-5 text-blue-400" />, title: "Ideas",
    description: <span className="hidden md:inline">Conecta dos ideas distintas para revelar una nueva perspectiva.</span>
  },
  {
    purpose: "reflect", style: "legacy", agent: "legacy-agent", nextState: "LEGACY_INPUT",
    icon: <PenSquare className="h-5 w-5 text-emerald-400" />, title: "Reflexionar",
    description: <span className="hidden md:inline">Captura una experiencia o lección de vida para dejar un legado.</span>
  },
  {
    purpose: "answer", style: "qa", agent: "qa-agent", nextState: "QUESTION_INPUT",
    icon: <HelpCircle className="h-5 w-5 text-rose-400" />, title: "Preguntas",
    description: <span className="hidden md:inline">Ofrece una respuesta concisa y bien estructurada a una duda específica.</span>
  },
  {
    purpose: "freestyle", style: undefined, nextState: "FREESTYLE_SELECTION",
    icon: <Bot className="h-5 w-5 text-slate-400" />, title: "Libre",
    description: <span className="hidden md:inline">Para creadores avanzados que ya tienen una visión clara.</span>, 
    isSecondary: true
  }
];

export function PurposeSelectionStep() {
  const { updateFormData, transitionTo } = useCreationContext();

  const handleSelectPurpose = (option: typeof purposeOptions[0]) => {
    updateFormData({
      purpose: option.purpose as any,
      style: option.style as any,
      selectedAgent: option.agent,
    });
    transitionTo(option.nextState as any);
  };

  return (
    <div className="flex flex-col h-full w-full justify-center items-center animate-fade-in">
      
      {/* CABECERA */}
      <div className="text-center mb-4 flex-shrink-0 w-full">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
          ¿Cuál es tu intención?
        </h2>
        <p className="text-xs md:text-sm text-muted-foreground mt-1">
          Elige un propósito y la IA hará el resto.
        </p>
      </div>
      
      {/* GRID: Reemplazo de SelectionCard por Botones Nativos */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-3">
        {purposeOptions.map((option) => (
          <button
            key={option.purpose}
            onClick={() => handleSelectPurpose(option)}
            className={cn(
              "group relative flex items-center text-left transition-all duration-200",
              "p-3",
              "bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20",
              "rounded-xl overflow-hidden shadow-sm active:scale-[0.99]",
              option.isSecondary && "opacity-70 hover:opacity-100"
            )}
          >
            {/* Icono */}
            <div className="flex-shrink-0 mr-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-black/20 border border-white/5 group-hover:scale-105 transition-transform duration-300">
                {option.icon}
              </div>
            </div>

            {/* Texto (Aquí es donde solucionamos el error de tipo) */}
            <div className="flex-grow min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white group-hover:text-primary transition-colors">
                  {option.title}
                </h3>
                <ArrowRight className="h-3.5 w-3.5 text-white/30 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 hidden md:block" />
              </div>
              {/* Al ser un tag <p>, acepta el <span> que definimos en el array sin errores */}
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {option.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}