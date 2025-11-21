// components/create-flow/purpose-selection-step.tsx
// VERSIÓN CORREGIDA: Sin cambios lógicos, solo se beneficia del arreglo en SelectionCard.

"use client";

import { useCreationContext } from "../podcast-creation-form";
import { SelectionCard } from "@/components/ui/selection-card";
import { Lightbulb, Sparkles, Link as LinkIcon, PenSquare, HelpCircle, Bot } from "lucide-react";

const purposeOptions = [
  {
    purpose: "learn", style: "solo", agent: "solo-talk-analyst", nextState: "LEARN_SUB_SELECTION",
    icon: <Lightbulb className="h-8 w-8" />, title: "Aprender / Enseñar", description: "Transforma un tema complejo en un audio claro y memorable."
  },
  {
    purpose: "inspire", style: "archetype", nextState: "INSPIRE_SUB_SELECTION",
    icon: <Sparkles className="h-8 w-8" />, title: "Inspirar / Motivar", description: "Comparte una historia potente usando estructuras narrativas clásicas."
  },
  {
    purpose: "explore", style: "link", nextState: "LINK_POINTS_INPUT",
    icon: <LinkIcon className="h-8 w-8" />, title: "Explorar / Cuestionar", description: "Conecta dos ideas distintas para revelar una nueva perspectiva."
  },
  {
    purpose: "reflect", style: "legacy", agent: "legacy-agent", nextState: "LEGACY_INPUT",
    icon: <PenSquare className="h-8 w-8" />, title: "Reflexionar / Documentar", description: "Captura una experiencia o lección de vida para dejar un legado."
  },
  {
    purpose: "answer", style: "qa", agent: "qa-agent", nextState: "QUESTION_INPUT",
    icon: <HelpCircle className="h-8 w-8" />, title: "Responder una Pregunta", description: "Ofrece una respuesta concisa y bien estructurada a una duda específica."
  },
  {
    purpose: "freestyle", style: undefined, nextState: "FREESTYLE_SELECTION",
    icon: <Bot className="h-8 w-8" />, title: "Estilo Libre", description: "Para creadores avanzados que ya tienen una visión clara.", isSecondary: true
  }
];

export function PurposeSelectionStep() {
  const { updateFormData, transitionTo } = useCreationContext();

  const handleSelectPurpose = (option: typeof purposeOptions[0]) => {
    updateFormData({
      purpose: option.purpose as any,
      style: option.style as any,
      selectedAgent: option.agent,
    });
    transitionTo(option.nextState as any);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold">¿Cuál es tu intención hoy?</h2>
        <p className="text-muted-foreground mt-2">Elige un propósito y deja que nuestra IA te ayude a darle forma.</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 flex-grow">
        {purposeOptions.map((option) => (
          <SelectionCard
            key={option.purpose}
            icon={option.icon}
            title={option.title}
            description={option.description}
            isSelected={false}
            onClick={() => handleSelectPurpose(option)}
            disabled={false}
            className={option.isSecondary ? "opacity-70 hover:opacity-100" : ""}
          />
        ))}
      </div>
    </div>
  );
}