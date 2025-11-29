// components/create-flow/LearnSubStep.tsx
// VERSIÓN FINAL: Compacta, Alto Contraste y Cero Scroll.

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
    description: "Explica un concepto de forma clara y concisa en un solo episodio."
  },
  {
    type: "deep_course",
    nextState: "DETAILS_STEP",
    icon: <Layers className="h-5 w-5 text-blue-400" />,
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
    // CONTENEDOR PRINCIPAL:
    // - h-full: Ocupa el espacio disponible.
    // - justify-center: Centra verticalmente.
    // - overflow-y-auto: Permite scroll interno SOLO si la pantalla es diminuta (ej. iPhone SE), 
    //   pero evita empujar el layout general.
    <div className="flex flex-col h-full w-full justify-center items-center animate-fade-in px-2 md:px-6 overflow-y-auto scrollbar-hide">
      
      {/* CABECERA COMPACTA:
          - mb-4 en vez de mb-8 para subir el contenido.
          - drop-shadow para contraste en cualquier fondo.
      */}
      <div className="text-center mb-4 md:mb-8 flex-shrink-0 w-full max-w-lg">
        <h2 className="text-xl md:text-3xl font-bold tracking-tight text-white drop-shadow-lg">
          Elige la Profundidad
        </h2>
        <p className="text-xs md:text-sm text-white/80 mt-1 font-medium drop-shadow-md">
          ¿Qué nivel de detalle necesitas hoy?
        </p>
      </div>
      
      {/* LISTA DE OPCIONES: 
          - max-w-md: Controla el ancho en escritorio.
          - gap-3: Espacio justo y necesario.
      */}
      <div className="w-full max-w-md flex flex-col gap-3">
        {learnOptions.map((option) => (
          <button
            key={option.type}
            onClick={() => handleSelectOption(option)}
            disabled={option.disabled}
            className={cn(
              "group relative flex items-center text-left transition-all duration-200",
              "p-3 md:p-4",
              // ESTILO VISUAL MEJORADO:
              // - bg-black/20: Fondo oscuro semitransparente para garantizar contraste de texto blanco.
              // - border-white/10: Borde sutil.
              // - backdrop-blur: Efecto premium.
              "bg-black/20 hover:bg-black/30 border border-white/10 hover:border-white/20",
              "rounded-xl overflow-hidden backdrop-blur-sm shadow-sm",
              !option.disabled 
                ? "active:scale-[0.98] cursor-pointer" 
                : "opacity-60 cursor-not-allowed"
            )}
          >
            {/* Icono en contenedor oscuro para resaltar */}
            <div className="flex-shrink-0 mr-4">
              <div className={cn(
                "flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-lg bg-black/40 border border-white/5 transition-transform duration-300 shadow-inner",
                !option.disabled && "group-hover:scale-110"
              )}>
                {option.icon}
              </div>
            </div>

            {/* Textos */}
            <div className="flex-grow min-w-0 flex flex-col justify-center">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm md:text-base font-bold text-white shadow-sm">
                  {option.title}
                </h3>
                
                {option.badge && (
                  <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-white/10 text-white/90 border-white/10 backdrop-blur-md">
                    {option.badge}
                  </Badge>
                )}
              </div>
              
              {/* Descripción con line-clamp para evitar que crezca verticalmente y cause scroll */}
              <p className="text-xs text-white/70 mt-0.5 md:mt-1 line-clamp-2 font-medium leading-snug">
                {option.description}
              </p>
            </div>

            {/* Flecha / Candado */}
            <div className="flex-shrink-0 ml-2 text-white/40">
              {option.disabled ? (
                <Lock className="h-4 w-4" />
              ) : (
                <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}