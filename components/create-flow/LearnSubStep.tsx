// components/create-flow/LearnSubStep.tsx
// VERSIÓN PREMIUM: Estándar visual unificado, centrado absoluto y diseño Glass.

"use client";

import { useCreationContext } from "../podcast-creation-form";
import { Zap, Layers, ArrowRight, Lock } from "lucide-react"; // Agregamos Lock para estados deshabilitados
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge"; // Para el badge "Próximamente"

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
    // CONTENEDOR PRINCIPAL: Centrado absoluto y sin scroll
    <div className="flex flex-col h-full w-full justify-center items-center animate-fade-in px-4">
      
      {/* CABECERA */}
      <div className="text-center mb-6 flex-shrink-0 w-full max-w-lg">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white drop-shadow-md">
          Elige la Profundidad
        </h2>
        <p className="text-sm text-white/70 mt-2 font-medium">
          ¿Quieres una explicación rápida o algo más estructurado?
        </p>
      </div>
      
      {/* GRID DE OPCIONES */}
      <div className="w-full max-w-2xl grid grid-cols-1 gap-3">
        {learnOptions.map((option) => (
          <button
            key={option.type}
            onClick={() => handleSelectOption(option)}
            disabled={option.disabled}
            className={cn(
              "group relative flex items-center text-left transition-all duration-300",
              "p-4",
              // Estilo Base (Glass)
              "bg-white/10 border border-white/10 rounded-xl overflow-hidden",
              // Estilo Interactivo (Solo si no está deshabilitado)
              !option.disabled 
                ? "hover:bg-white/20 hover:border-white/30 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer" 
                : "opacity-50 cursor-not-allowed grayscale-[0.5]"
            )}
          >
            {/* Icono */}
            <div className="flex-shrink-0 mr-4">
              <div className={cn(
                "flex items-center justify-center w-12 h-12 rounded-lg bg-black/20 border border-white/5 transition-transform duration-300",
                !option.disabled && "group-hover:scale-110"
              )}>
                {option.icon}
              </div>
            </div>

            {/* Contenido de Texto */}
            <div className="flex-grow min-w-0 flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white group-hover:text-white transition-colors">
                  {option.title}
                </h3>
                
                {/* Badge para opciones deshabilitadas */}
                {option.badge && (
                  <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-white/20 text-white border-0">
                    {option.badge}
                  </Badge>
                )}
              </div>
              
              <p className="text-xs text-white/60 mt-1 line-clamp-1 group-hover:text-white/80 transition-colors">
                {option.description}
              </p>
            </div>

            {/* Icono de Acción (Flecha o Candado) */}
            <div className="flex-shrink-0 ml-2 text-white/30">
              {option.disabled ? (
                <Lock className="h-5 w-5" />
              ) : (
                <ArrowRight className="h-5 w-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}