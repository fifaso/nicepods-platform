// components/create-flow/LearnSubStep.tsx
// VERSIÓN FINAL PRO: Cero Scroll, Contraste Mejorado y Diseño Elástico.

"use client";

import { useCreationContext } from "../podcast-creation-form";
import { Zap, Layers, ArrowRight, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const learnOptions = [
  {
    type: "quick_lesson",
    nextState: "SOLO_TALK_INPUT",
    agent: "solo-talk-analyst",
    style: "solo",
    icon: <Zap className="h-5 w-5 text-amber-400" />,
    title: "Lección Rápida",
    description: "Explica un concepto de forma clara y concisa."
  },
  {
    type: "deep_course",
    nextState: "DETAILS_STEP",
    icon: <Layers className="h-5 w-5 text-blue-400" />,
    title: "Curso Profundo",
    description: "Estructura un tema en varios episodios.",
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
    // CONTENEDOR PRINCIPAL: 
    // - h-full: Ocupa toda la altura disponible del padre.
    // - justify-center: Centra el contenido verticalmente.
    // - overflow-hidden: Previene scroll accidental.
    <div className="flex flex-col h-full w-full justify-center items-center animate-fade-in px-4 overflow-hidden">
      
      {/* CABECERA: Márgenes optimizados para móvil (mb-2) y escritorio (mb-6) */}
      <div className="text-center mb-4 md:mb-8 flex-shrink-0 w-full max-w-lg">
        {/* Título con sombra suave para garantizar lectura en cualquier fondo */}
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white drop-shadow-md">
          Elige la Profundidad
        </h2>
        {/* Subtítulo con mejor contraste */}
        <p className="text-sm text-white/80 md:text-white/70 mt-1 md:mt-2 font-medium drop-shadow-sm">
          ¿Quieres una explicación rápida o algo más estructurado?
        </p>
      </div>
      
      {/* GRID DE OPCIONES: 
          - flex-shrink-0: Evita que se aplasten demasiado.
          - max-h...: Asegura que quepan.
      */}
      <div className="w-full max-w-md flex flex-col gap-3">
        {learnOptions.map((option) => (
          <button
            key={option.type}
            onClick={() => handleSelectOption(option)}
            disabled={option.disabled}
            className={cn(
              "group relative flex items-center text-left transition-all duration-300",
              // Padding responsivo: más compacto en móvil
              "p-3 md:p-4",
              // Estilo Base (Glass con mejor contraste de borde)
              "bg-white/10 border border-white/20 rounded-xl overflow-hidden backdrop-blur-sm",
              // Estilo Interactivo
              !option.disabled 
                ? "hover:bg-white/20 hover:border-white/40 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer" 
                : "opacity-60 cursor-not-allowed grayscale-[0.3]"
            )}
          >
            {/* Icono */}
            <div className="flex-shrink-0 mr-3 md:mr-4">
              <div className={cn(
                "flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-lg bg-black/30 border border-white/10 transition-transform duration-300 shadow-inner",
                !option.disabled && "group-hover:scale-110"
              )}>
                {option.icon}
              </div>
            </div>

            {/* Contenido de Texto */}
            <div className="flex-grow min-w-0 flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <h3 className="text-sm md:text-base font-bold text-white group-hover:text-white transition-colors shadow-sm">
                  {option.title}
                </h3>
                
                {option.badge && (
                  <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-white/20 text-white border-0 backdrop-blur-md">
                    {option.badge}
                  </Badge>
                )}
              </div>
              
              <p className="text-xs text-white/70 mt-0.5 md:mt-1 line-clamp-2 group-hover:text-white/90 transition-colors font-medium">
                {option.description}
              </p>
            </div>

            {/* Icono de Acción */}
            <div className="flex-shrink-0 ml-2 text-white/50">
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