// components/create-flow/InspireSubStep.tsx
// Paso intermedio para el propósito "Inspirar", ofreciendo una selección curada de arquetipos.

"use client";

import { useCreationContext } from "../podcast-creation-form";
import { SelectionCard } from "@/components/ui/selection-card";
import { Shield, BookOpen, Zap } from "lucide-react";

// Extraemos los arquetipos clave que queremos ofrecer en este flujo.
const inspireOptions = [
    { value: 'archetype-hero', icon: <Shield className="h-8 w-8" />, title: 'El Héroe', description: 'Narra un viaje de transformación y superación.' },
    { value: 'archetype-sage', icon: <BookOpen className="h-8 w-8" />, title: 'El Sabio', description: 'Comparte sabiduría y guía con autoridad y claridad.' },
    { value: 'archetype-rebel', icon: <Zap className="h-8 w-8" />, title: 'El Rebelde', description: 'Desafía el status quo y propone un cambio radical.' },
];

export function InspireSubStep() {
  const { updateFormData, transitionTo } = useCreationContext();

  const handleSelectArchetype = (archetypeValue: string) => {
    updateFormData({
      style: "archetype",
      selectedArchetype: archetypeValue,
    });
    transitionTo('ARCHETYPE_SELECTION');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold">Elige tu Estructura Narrativa</h2>
        <p className="text-muted-foreground mt-2">Selecciona un arquetipo para dar un impacto emocional a tu historia.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-grow">
        {inspireOptions.map((option) => (
          <SelectionCard
            key={option.value}
            icon={option.icon}
            title={option.title}
            description={option.description}
            isSelected={false}
            onClick={() => handleSelectArchetype(option.value)}
          />
        ))}
      </div>
    </div>
  );
}