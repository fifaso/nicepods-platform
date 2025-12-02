// components/create-flow/InspireSubStep.tsx
// VERSIÓN FINAL OPTIMIZADA: Contenedor ancho (Wide) y Textos Sintetizados.

"use client";

import { useCreationContext } from "../podcast-creation-form";
import { cn } from "@/lib/utils";
import { ArrowRight, Shield, BookOpen, Compass, Zap, Construction, Heart } from "lucide-react";

// Definimos las opciones localmente para controlar la longitud exacta del texto (4-8 palabras)
const archetypeOptions = [
    { 
        value: 'archetype-hero', 
        icon: <Shield className="h-5 w-5 text-indigo-400" />, 
        title: 'El Héroe', 
        description: "Superar desafíos para transformar tu realidad." 
    },
    { 
        value: 'archetype-sage', 
        icon: <BookOpen className="h-5 w-5 text-emerald-400" />, 
        title: 'El Sabio', 
        description: "Buscar la verdad con claridad y sabiduría." 
    },
    { 
        value: 'archetype-explorer', 
        icon: <Compass className="h-5 w-5 text-amber-400" />, 
        title: 'El Explorador', 
        description: "Descubrir lo desconocido con libertad y curiosidad." 
    },
    { 
        value: 'archetype-rebel', 
        icon: <Zap className="h-5 w-5 text-rose-400" />, 
        title: 'El Rebelde', 
        description: "Romper las reglas para cambiar el sistema." 
    },
    { 
        value: 'archetype-creator', 
        icon: <Construction className="h-5 w-5 text-cyan-400" />, 
        title: 'El Creador', 
        description: "Dar vida a una visión única e innovadora." 
    },
    { 
        value: 'archetype-caregiver', 
        icon: <Heart className="h-5 w-5 text-pink-400" />, 
        title: 'El Cuidador', 
        description: "Proteger, ayudar y servir con empatía." 
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
    // 1. CONTENEDOR PRINCIPAL
    // - max-w-5xl: Aumentado (antes 2xl) para dar amplitud a los botones.
    <div className="flex flex-col h-full w-full justify-center items-center animate-fade-in px-4">
      
      {/* CABECERA */}
      <div className="text-center mb-6 flex-shrink-0 w-full max-w-lg">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white drop-shadow-md">
          Elige tu Narrativa
        </h2>
        <p className="text-sm text-white/70 mt-2 font-medium">
          Selecciona el tono emocional para tu historia.
        </p>
      </div>
      
      {/* GRID DE OPCIONES
          - max-w-5xl: Permite que los botones sean anchos.
          - gap-4: Más aire entre elementos.
      */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-4">
        {archetypeOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => handleSelectArchetype(option.value)}
            className={cn(
              "group relative flex items-center text-left transition-all duration-300",
              // PADDING MÁS GENEROSO:
              "p-4 md:p-5",
              // ESTILO GLASS:
              "bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/30",
              "rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.99]"
            )}
          >
            {/* ICONO */}
            <div className="flex-shrink-0 mr-5">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-black/20 border border-white/5 group-hover:scale-110 transition-transform duration-300">
                {option.icon}
              </div>
            </div>

            {/* TEXTOS */}
            <div className="flex-grow min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white group-hover:text-white transition-colors">
                  {option.title}
                </h3>
                <ArrowRight className="h-5 w-5 text-white/50 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 hidden md:block" />
              </div>
              
              {/* DESCRIPCIÓN: Ahora cabe perfectamente porque es corta y el contenedor es ancho */}
              <p className="text-sm text-white/70 mt-1 font-medium group-hover:text-white/90 transition-colors">
                {option.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}