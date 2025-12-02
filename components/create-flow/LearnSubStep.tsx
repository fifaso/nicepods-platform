// components/create-flow/LearnSubStep.tsx
// VERSIÓN FINAL ADAPTATIVA: Contraste perfecto en Light/Dark Mode.

"use client";

import { useCreationContext } from "../podcast-creation-form";
import { Zap, Layers, ArrowRight, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// COLORES AJUSTADOS: Tono 600 para Light, 400 para Dark.
const learnOptions = [
  {
    type: "quick_lesson",
    nextState: "SOLO_TALK_INPUT",
    agent: "solo-talk-analyst",
    style: "solo",
    icon: <Zap className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
    title: "Lección Rápida",
    description: "Explica un concepto de forma clara y concisa en un solo episodio."
  },
  {
    type: "deep_course",
    nextState: "DETAILS_STEP",
    icon: <Layers className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
    title: "Curso Profundo",
    description: "Estructura un tema en un plan de aprendizaje de varios episodios.",
    disabled: true,
    badge: "Próximamente"
  }
];

export function LearnSubStep() {
  const { updateFormData, transitionTo } = useCreationContext();

  const handleSelectOption = (option: typeof learnOptions[0]) => {
    if (option.disabled) return;
    
    updateFormData({
      style: option.style as any,
      selectedAgent: option.agent,
    });
    transitionTo(option.nextState as any);
  };

  return (
    <div className="flex flex-col h-full w-full justify-center items-center animate-fade-in px-2 md:px-6 overflow-y-auto scrollbar-hide">
      
      {/* CABECERA ADAPTATIVA */}
      <div className="text-center mb-4 md:mb-8 flex-shrink-0 w-full max-w-lg">
        <h2 className="text-xl md:text-3xl font-bold tracking-tight text-foreground drop-shadow-sm md:drop-shadow-none">
          Elige la Profundidad
        </h2>
        <p className="text-xs md:text-sm text-muted-foreground mt-1 font-medium">
          ¿Qué nivel de detalle necesitas hoy?
        </p>
      </div>
      
      {/* LISTA DE OPCIONES */}
      <div className="w-full max-w-md flex flex-col gap-3">
        {learnOptions.map((option) => (
          <button
            key={option.type}
            onClick={() => handleSelectOption(option)}
            disabled={option.disabled}
            className={cn(
              "group relative flex items-center text-left transition-all duration-300",
              "p-3 md:p-4",
              // ESTILOS ADAPTATIVOS (GLASS):
              // Light: Fondo blanco semitransparente (60%).
              // Dark: Fondo oscuro semitransparente (20%).
              "bg-white/60 dark:bg-black/20",
              "border border-black/5 dark:border-white/10",
              "rounded-xl overflow-hidden backdrop-blur-sm shadow-sm",
              !option.disabled 
                ? "hover:bg-white/80 dark:hover:bg-black/30 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer" 
                : "opacity-60 cursor-not-allowed grayscale-[0.5]"
            )}
          >
            {/* ICONO: Fondo blanco en Light para resaltar */}
            <div className="flex-shrink-0 mr-4">
              <div className={cn(
                "flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-lg transition-transform duration-300 shadow-sm border",
                "bg-white dark:bg-black/40 border-black/5 dark:border-white/5",
                !option.disabled && "group-hover:scale-110"
              )}>
                {option.icon}
              </div>
            </div>

            {/* TEXTOS */}
            <div className="flex-grow min-w-0 flex flex-col justify-center">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Título Semántico */}
                <h3 className="text-sm md:text-base font-bold text-foreground group-hover:text-primary transition-colors">
                  {option.title}
                </h3>
                
                {option.badge && (
                  <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-muted text-muted-foreground border-0">
                    {option.badge}
                  </Badge>
                )}
              </div>
              
              {/* Descripción Semántica */}
              <p className="text-xs text-muted-foreground mt-0.5 md:mt-1 line-clamp-2 font-medium leading-snug">
                {option.description}
              </p>
            </div>

            {/* FLECHA / CANDADO */}
            <div className="flex-shrink-0 ml-2 text-muted-foreground/50">
              {option.disabled ? (
                <Lock className="h-4 w-4 md:h-5 md:w-5" />
              ) : (
                <ArrowRight className="h-4 w-4 md:h-5 md:w-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}