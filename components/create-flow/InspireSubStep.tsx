// components/create-flow/InspireSubStep.tsx
// VERSIÓN FINAL COMPACTA: Textos de una línea, botones delgados y cero scroll.

"use client";

import { useCreationContext } from "../podcast-creation-form";
import { cn } from "@/lib/utils";
import { ArrowRight, Shield, BookOpen, Compass, Zap, Construction, Heart } from "lucide-react";

// COPYWRITING OPTIMIZADO: Textos breves para garantizar 1 sola línea.
const archetypeOptions = [
    { 
        value: 'archetype-hero', 
        icon: <Shield className="h-5 w-5 text-indigo-400" />, 
        title: 'El Héroe', 
        description: "Superar desafíos y transformarse." 
    },
    { 
        value: 'archetype-sage', 
        icon: <BookOpen className="h-5 w-5 text-emerald-400" />, 
        title: 'El Sabio', 
        description: "Buscar la verdad y la sabiduría." 
    },
    { 
        value: 'archetype-explorer', 
        icon: <Compass className="h-5 w-5 text-amber-400" />, 
        title: 'El Explorador', 
        description: "Descubrir lo desconocido con libertad." 
    },
    { 
        value: 'archetype-rebel', 
        icon: <Zap className="h-5 w-5 text-rose-400" />, 
        title: 'El Rebelde', 
        description: "Romper reglas y cambia el sistema." 
    },
    { 
        value: 'archetype-creator', 
        icon: <Construction className="h-5 w-5 text-cyan-400" />, 
        title: 'El Creador', 
        description: "Materializar una visión única." 
    },
    { 
        value: 'archetype-caregiver', 
        icon: <Heart className="h-5 w-5 text-pink-400" />, 
        title: 'El Cuidador', 
        description: "Proteger y ayudar con empatía." 
    },
];

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
    // 1. CONTENEDOR PRINCIPAL: Centrado absoluto
    <div className="flex flex-col h-full w-full justify-center items-center animate-fade-in px-4">
      
      {/* CABECERA: Margen reducido (mb-4) para compactar */}
      <div className="text-center mb-4 flex-shrink-0 w-full max-w-lg">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white drop-shadow-md">
          Elige tu Narrativa
        </h2>
        <p className="text-sm text-white/70 mt-1 font-medium">
          Selecciona el tono emocional para tu historia.
        </p>
      </div>
      
      {/* GRID OPTIMIZADO:
          - max-w-4xl: Ancho controlado.
          - gap-3: Espacio más ajustado.
      */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-3">
        {archetypeOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => handleSelectArchetype(option.value)}
            className={cn(
              "group relative flex items-center text-left transition-all duration-300",
              // PADDING REDUCIDO: p-3 reduce la altura total del botón significativamente.
              "p-3",
              // ESTILO GLASS:
              "bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/30",
              "rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99]"
            )}
          >
            {/* ICONO: Tamaño reducido a w-10 h-10 para acompañar la menor altura */}
            <div className="flex-shrink-0 mr-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-black/20 border border-white/5 group-hover:scale-110 transition-transform duration-300">
                {option.icon}
              </div>
            </div>

            {/* TEXTOS */}
            <div className="flex-grow min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white group-hover:text-white transition-colors">
                  {option.title}
                </h3>
                <ArrowRight className="h-4 w-4 text-white/50 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 hidden md:block" />
              </div>
              
              {/* DESCRIPCIÓN: line-clamp-1 + textos reescritos aseguran 1 sola línea */}
              <p className="text-xs text-white/60 mt-0.5 line-clamp-1 group-hover:text-white/80 transition-colors font-medium">
                {option.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}