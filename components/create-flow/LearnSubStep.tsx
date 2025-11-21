// components/create-flow/LearnSubStep.tsx
// Paso intermedio para el propósito "Aprender", permitiendo elegir entre una lección rápida o un curso.

"use client";

import { useCreationContext } from "../podcast-creation-form";
import { SelectionCard } from "@/components/ui/selection-card";
import { Zap, Layers } from "lucide-react";

const learnOptions = [
  {
    type: "quick_lesson",
    nextState: "SOLO_TALK_INPUT",
    agent: "solo-talk-analyst",
    style: "solo",
    icon: <Zap className="h-8 w-8" />,
    title: "Lección Rápida",
    description: "Explica un concepto de forma clara y concisa en un solo episodio."
  },
  {
    type: "deep_course",
    nextState: "DETAILS_STEP", // Placeholder, este flujo cambiará
    icon: <Layers className="h-8 w-8" />,
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
    <div className="flex flex-col h-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold">Elige la Profundidad</h2>
        <p className="text-muted-foreground mt-2">¿Quieres una explicación rápida o un curso estructurado?</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
        {learnOptions.map((option) => (
          <SelectionCard
            key={option.type}
            icon={option.icon}
            title={option.title}
            description={option.description}
            isSelected={false}
            onClick={() => handleSelectOption(option)}
            disabled={option.disabled}
            badgeText={option.badge}
          />
        ))}
      </div>
    </div>
  );
}