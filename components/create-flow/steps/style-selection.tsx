// components/create-flow/style-selection.tsx
// VERSIÓN FINAL CORREGIDA CON `onClick` CONDICIONAL

"use client";

import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { SelectionCard } from "@/components/ui/selection-card"; 
import { Mic, Link as LinkIcon, GraduationCap, Theater } from "lucide-react";

const styleOptions = [
  { value: "solo" as const, icon: <Mic className="h-8 w-8" />, title: "Monólogo", description: "Un tema, una motivación, una voz experta." },
  { value: "link" as const, icon: <LinkIcon className="h-8 w-8" />, title: "Unir Ideas", description: "Conecta dos conceptos con narrativas de IA." },
  { value: "archetype" as const, icon: <Theater className="h-8 w-8" />, title: "Arquetipo", description: "Usa estructuras narrativas clásicas para tu historia." },
  { value: "learning_plan" as const, icon: <GraduationCap className="h-8 w-8" />, title: "Plan de Aprendizaje", description: "Crea una serie de podcasts interconectados.", badge: "Próximamente", disabled: true },
];

export function StyleSelectionStep() {
  const { watch, setValue } = useFormContext<PodcastCreationData>();
  const selectedStyle = watch('style');

  return (
    <div className="flex flex-col h-full">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Elige tu Estilo Creativo</h2>
        <p className="text-muted-foreground">¿Cómo quieres darle vida a tu idea?</p>
      </div>
      <div className="grid grid-cols-2 gap-4 flex-grow">
        {styleOptions.map((option) => (
          <SelectionCard
            key={option.value}
            icon={option.icon}
            title={option.title}
            description={option.description}
            isSelected={selectedStyle === option.value}
            // [INTERVENCIÓN QUIRÚRGICA]: Se pasa `undefined` a onClick si está deshabilitado
            onClick={option.disabled ? () => {} : () => setValue('style', option.value as 'solo' | 'link' | 'archetype', { shouldValidate: true })}
            badgeText={option.badge}
            disabled={option.disabled}
          />
        ))}
      </div>
    </div>
  );
}