// components/create-flow/InspireSubStep.tsx
// VERSIÓN FINAL: Muestra los 6 arquetipos como el nuevo Paso 2 del flujo "Inspirar".

"use client";

import { useCreationContext } from "../podcast-creation-form";
import { SelectionCard } from "@/components/ui/selection-card";
// [CAMBIO QUIRÚRGICO #1]: Importamos la lista completa de arquetipos.
import { archetypeOptions } from "./archetype-step";

export function InspireSubStep() {
  const { updateFormData, transitionTo } = useCreationContext();

  const handleSelectArchetype = (archetypeValue: string) => {
    updateFormData({
      style: "archetype",
      selectedArchetype: archetypeValue,
    });
    // [CAMBIO QUIRÚRGICO #2]: Transiciona al nuevo estado de escritura.
    transitionTo('ARCHETYPE_INPUT');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold">Elige tu Estructura Narrativa</h2>
        <p className="text-muted-foreground mt-2">Selecciona un arquetipo para dar un impacto emocional a tu historia.</p>
      </div>
      {/* [CAMBIO QUIRÚRGICO #3]: El grid ahora renderiza los 6 arquetipos. */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 flex-grow">
        {archetypeOptions.map((option) => (
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