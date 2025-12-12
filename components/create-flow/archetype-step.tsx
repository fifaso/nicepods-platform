"use client";

import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { Card } from "@/components/ui/card";
import { Heart, BookOpen, Compass, Zap, Construction, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCreationContext } from "../podcast-creation-form";

// Opciones exportadas (Las mantenemos aquí para importarlas en el otro archivo si hace falta)
export const archetypeOptions = [
    { value: 'archetype-hero', icon: Shield, title: 'El Héroe', description: 'Superación y triunfo ante la adversidad.' },
    { value: 'archetype-sage', icon: BookOpen, title: 'El Sabio', description: 'Búsqueda de la verdad y el conocimiento.' },
    { value: 'archetype-explorer', icon: Compass, title: 'El Explorador', description: 'Descubrimiento de nuevos horizontes.' },
    { value: 'archetype-rebel', icon: Zap, title: 'El Rebelde', description: 'Romper reglas para cambiar el mundo.' },
    { value: 'archetype-creator', icon: Construction, title: 'El Creador', description: 'Dar vida a una visión imaginativa.' },
    { value: 'archetype-caregiver', icon: Heart, title: 'El Cuidador', description: 'Servicio y empatía hacia los demás.' },
];

export function ArchetypeStep() {
  const { setValue, watch } = useFormContext<PodcastCreationData>();
  const { transitionTo } = useCreationContext();
  const selectedArchetype = watch('selectedArchetype');

  const handleSelect = (value: string) => {
    setValue('selectedArchetype', value, { shouldValidate: true });
    // [CRÍTICO] Navegamos al nuevo paso de escritura
    // Asegúrate de agregar 'ARCHETYPE_GOAL' en el switch del archivo padre
    transitionTo('ARCHETYPE_GOAL' as any); 
  };

  return (
    <div className="flex flex-col h-full w-full animate-fade-in px-2 md:px-6 overflow-hidden">
      
      <div className="flex-shrink-0 py-4 text-center">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
          Elige tu Arquetipo
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          ¿Qué voz narrativa guiará esta historia?
        </p>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide pb-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {archetypeOptions.map((option) => {
            const isSelected = selectedArchetype === option.value;
            const Icon = option.icon;
            
            return (
                <Card
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={cn(
                    "cursor-pointer transition-all duration-200 border-2 flex flex-col items-center text-center p-4 gap-3 hover:scale-[1.02]",
                    isSelected 
                    ? "border-primary bg-primary/5 shadow-md" 
                    : "border-transparent bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10"
                )}
                >
                <div className={cn(
                    "p-3 rounded-full transition-colors",
                    isSelected ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"
                )}>
                    <Icon className="h-6 w-6" />
                </div>
                <div>
                    <h3 className={cn("font-bold text-sm", isSelected ? "text-primary" : "text-foreground")}>
                    {option.title}
                    </h3>
                    <p className="text-[10px] md:text-xs text-muted-foreground mt-1 leading-snug">
                    {option.description}
                    </p>
                </div>
                </Card>
            );
            })}
        </div>
      </div>
    </div>
  );
}