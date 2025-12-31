// components/create-flow/InspireSubStep.tsx
// VERSIÓN FINAL ADAPTATIVA: Contraste perfecto en Light/Dark Mode.

"use client";

import { useCreationContext } from "../shared/context";
import { cn } from "@/lib/utils";
import { ArrowRight, Shield, BookOpen, Compass, Zap, Construction, Heart } from "lucide-react";

// COPYWRITING Y COLORES OPTIMIZADOS: 
// Colores ajustados: Tono 600 para Light Mode (más oscuro), Tono 400 para Dark Mode (más brillante).
const archetypeOptions = [
    { 
        value: 'archetype-hero', 
        icon: <Shield className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />, 
        title: 'El Héroe', 
        description: "Superar desafíos y transformarse." 
    },
    { 
        value: 'archetype-sage', 
        icon: <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />, 
        title: 'El Sabio', 
        description: "Buscar la verdad y la sabiduría." 
    },
    { 
        value: 'archetype-explorer', 
        icon: <Compass className="h-5 w-5 text-amber-600 dark:text-amber-400" />, 
        title: 'El Explorador', 
        description: "Descubrir lo desconocido con libertad." 
    },
    { 
        value: 'archetype-rebel', 
        icon: <Zap className="h-5 w-5 text-rose-600 dark:text-rose-400" />, 
        title: 'El Rebelde', 
        description: "Romper reglas y cambiar el sistema." 
    },
    { 
        value: 'archetype-creator', 
        icon: <Construction className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />, 
        title: 'El Creador', 
        description: "Materializar una visión única." 
    },
    { 
        value: 'archetype-caregiver', 
        icon: <Heart className="h-5 w-5 text-pink-600 dark:text-pink-400" />, 
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
      
      {/* CABECERA: Texto adaptativo */}
      <div className="text-center mb-4 flex-shrink-0 w-full max-w-lg">
        {/* text-foreground: Negro en Claro / Blanco en Oscuro */}
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground drop-shadow-sm md:drop-shadow-none">
          Selecciona un Arquetipo
        </h2>
        <p className="text-sm text-muted-foreground mt-1 font-medium">
          Elige el tono emocional para tu historia
        </p>
      </div>
      
      {/* GRID OPTIMIZADO */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-3">
        {archetypeOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => handleSelectArchetype(option.value)}
            className={cn(
              "group relative flex items-center text-left transition-all duration-300",
              "p-3",
              // ESTILOS ADAPTATIVOS (GLASS):
              // Light: Fondo blanco semitransparente (60%) + Borde gris suave.
              // Dark: Fondo blanco muy sutil (5%) + Borde blanco sutil.
              "bg-white/60 dark:bg-white/10",
              "hover:bg-white/80 dark:hover:bg-white/20",
              "border border-black/5 dark:border-white/10",
              "hover:border-black/10 dark:hover:border-white/20",
              "rounded-xl overflow-hidden shadow-sm hover:shadow-md active:scale-[0.99]"
            )}
          >
            {/* ICONO: Fondo blanco sólido en Light para resaltar el color del icono */}
            <div className="flex-shrink-0 mr-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white dark:bg-black/20 border border-black/5 dark:border-white/5 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                {option.icon}
              </div>
            </div>

            {/* TEXTOS */}
            <div className="flex-grow min-w-0">
              <div className="flex items-center justify-between">
                {/* Título semántico */}
                <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                  {option.title}
                </h3>
                {/* Flecha adaptativa */}
                <ArrowRight className="h-4 w-4 text-muted-foreground/50 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 hidden md:block" />
              </div>
              
              {/* Descripción semántica */}
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 font-medium">
                {option.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}