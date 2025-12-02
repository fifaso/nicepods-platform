// components/create-flow/InspireSubStep.tsx
// VERSIÓN FINAL PREMIUM: Diseño Horizontal Compacto, Cero Scroll, Estética Unificada.

"use client";

import { useCreationContext } from "../podcast-creation-form";
import { archetypeOptions } from "./archetype-step";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export function InspireSubStep() {
  const { updateFormData, transitionTo } = useCreationContext();

  const handleSelectArchetype = (archetypeValue: string) => {
    updateFormData({
      style: "archetype",
      selectedArchetype: archetypeValue,
    });
    transitionTo('ARCHETYPE_INPUT');
  };

  return (
    // 1. CONTENEDOR PRINCIPAL
    // - h-full + justify-center: Centrado vertical absoluto.
    // - px-4: Margen de seguridad lateral.
    <div className="flex flex-col h-full w-full justify-center items-center animate-fade-in px-4">
      
      {/* CABECERA COMPACTA */}
      <div className="text-center mb-6 flex-shrink-0 w-full max-w-lg">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white drop-shadow-md">
          Elige tu Narrativa
        </h2>
        <p className="text-sm text-white/70 mt-2 font-medium">
          Selecciona un arquetipo para dar un impacto emocional a tu historia.
        </p>
      </div>
      
      {/* GRID COMPACTO (2 Columnas)
          - max-w-2xl: Mantiene los botones con un ancho elegante de lectura.
          - gap-3: Espacio optimizado.
      */}
      <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-3">
        {archetypeOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => handleSelectArchetype(option.value)}
            className={cn(
              "group relative flex items-center text-left transition-all duration-300",
              // PADDING:
              "p-3 md:p-4",
              // ESTILO GLASS (Funciona en Claro y Oscuro sobre el fondo degradado):
              "bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/30",
              "rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]"
            )}
          >
            {/* ICONO (Contenedor Oscuro para contraste) */}
            <div className="flex-shrink-0 mr-4">
              <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-lg bg-black/20 border border-white/5 group-hover:scale-110 transition-transform duration-300">
                {option.icon}
              </div>
            </div>

            {/* TEXTOS */}
            <div className="flex-grow min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm md:text-base font-bold text-white group-hover:text-white transition-colors">
                  {option.title}
                </h3>
                {/* Flecha decorativa (Hover) */}
                <ArrowRight className="h-4 w-4 text-white/50 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 hidden md:block" />
              </div>
              
              {/* DESCRIPCIÓN: line-clamp-1 es vital para evitar scroll en móviles */}
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