// components/create-flow/purpose-selection-step.tsx
// VERSIÓN FINAL ADAPTATIVA: Contraste perfecto Claro/Oscuro y Scroll contenido.

"use client";

import { useCreationContext } from "../podcast-creation-form";
import { Lightbulb, Sparkles, Link as LinkIcon, PenSquare, HelpCircle, Bot, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const purposeOptions = [
  { purpose: "learn", style: "solo", agent: "solo-talk-analyst", nextState: "LEARN_SUB_SELECTION", icon: <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400" />, title: "Aprender", description: <span className="hidden md:inline">Explica un concepto complejo.</span> },
  { purpose: "inspire", style: "archetype", nextState: "INSPIRE_SUB_SELECTION", icon: <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />, title: "Inspirar", description: <span className="hidden md:inline">Historias con estructura narrativa.</span> },
  { purpose: "explore", style: "link", nextState: "LINK_POINTS_INPUT", icon: <LinkIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />, title: "Explorar", description: <span className="hidden md:inline">Conecta dos ideas distintas.</span> },
  { purpose: "reflect", style: "legacy", agent: "legacy-agent", nextState: "LEGACY_INPUT", icon: <PenSquare className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />, title: "Reflexionar", description: <span className="hidden md:inline">Deja un legado o lección.</span> },
  { purpose: "answer", style: "qa", agent: "qa-agent", nextState: "QUESTION_INPUT", icon: <HelpCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />, title: "Responder", description: <span className="hidden md:inline">Respuesta concisa a una duda.</span> },
  { purpose: "freestyle", style: undefined, nextState: "FREESTYLE_SELECTION", icon: <Bot className="h-5 w-5 text-slate-600 dark:text-slate-400" />, title: "Libre", description: <span className="hidden md:inline">Para creadores avanzados.</span>, isSecondary: true }
];

export function PurposeSelectionStep() {
  const { updateFormData, transitionTo } = useCreationContext();

  const handleSelectPurpose = (option: typeof purposeOptions[0]) => {
    updateFormData({ purpose: option.purpose as any, style: option.style as any, selectedAgent: option.agent });
    transitionTo(option.nextState as any);
  };

  return (
    // Contenedor Flex que ocupa el 100% pero no desborda
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto items-center animate-fade-in px-2 md:px-0 pt-2 md:pt-0">
      
      {/* CABECERA FIJA: No scrollea. Texto adaptativo (Negro en claro, Blanco en oscuro) */}
      <div className="text-center mb-4 md:mb-8 flex-shrink-0 w-full">
        <h2 className="text-xl md:text-3xl font-bold tracking-tight text-foreground drop-shadow-sm md:drop-shadow-none">
          ¿Cuál es tu intención?
        </h2>
        <p className="text-xs md:text-sm text-muted-foreground mt-1 font-medium">
          Elige un propósito y la IA hará el resto.
        </p>
      </div>
      
      {/* ÁREA DE CONTENIDO: Ocupa el espacio restante, scrollea internamente si es necesario */}
      <div className="w-full flex-1 min-h-0 overflow-y-auto scrollbar-hide flex flex-col justify-center">
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 pb-2">
          {purposeOptions.map((option) => (
            <button
              key={option.purpose}
              onClick={() => handleSelectPurpose(option)}
              className={cn(
                "group relative flex items-center text-left transition-all duration-200",
                "p-3 md:p-4",
                // ESTILOS ADAPTATIVOS (Clave para arreglar el modo claro):
                // Light: Fondo blanco semitransparente (Glass) + Borde gris suave + Sombra
                // Dark: Fondo blanco muy sutil (5%) + Borde blanco sutil
                "bg-white/60 dark:bg-white/5",
                "hover:bg-white/80 dark:hover:bg-white/10",
                "border border-black/5 dark:border-white/10",
                "hover:border-black/10 dark:hover:border-white/20",
                "rounded-xl overflow-hidden shadow-sm hover:shadow-md active:scale-[0.99]",
                option.isSecondary && "opacity-90 dark:opacity-70 hover:opacity-100"
              )}
            >
              {/* Icono: Fondo blanco sólido en Light mode para resaltar */}
              <div className="flex-shrink-0 mr-3 md:mr-4">
                <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-lg bg-white dark:bg-black/20 border border-black/5 dark:border-white/5 shadow-sm group-hover:scale-105 transition-transform duration-300">
                  {option.icon}
                </div>
              </div>

              {/* Texto: Usa variables del tema (foreground) */}
              <div className="flex-grow min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm md:text-base font-bold text-foreground group-hover:text-primary transition-colors">
                    {option.title}
                  </h3>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/50 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 hidden md:block" />
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 md:mt-1 line-clamp-1">
                  {option.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}