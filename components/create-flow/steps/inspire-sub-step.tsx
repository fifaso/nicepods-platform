// components/create-flow/steps/inspire-sub-step.tsx
// VERSIÓN: 6.0 (Madrid Resonance - Clean Flow Integration)

"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { Zap } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { useCreationContext } from "../shared/context";

const INSPIRE_OPTIONS = [
  {
    id: "solo_talk",
    title: "Voz en Solitario",
    description: "Una reflexión directa sobre un tema que te apasione.",
    icon: Mic,
    color: "text-blue-500",
    bg: "bg-blue-500/10"
  },
  {
    id: "conceptual_bridge",
    title: "Puente de Ideas",
    description: "Conecta dos conceptos aparentemente distantes.",
    icon: Zap,
    color: "text-purple-500",
    bg: "bg-purple-500/10"
  }
] as const;

import { Mic } from "lucide-react";

export function InspireSubStep() {
  const { setValue } = useFormContext<PodcastCreationData>();
  const { transitionTo } = useCreationContext();

  const handleSelection = (optionId: string) => {
    // [FIX]: Sincronización con el nuevo esquema de navegación
    // Eliminamos la referencia a 'ARCHETYPE_INPUT' que ya no existe
    setValue("style", "solo", { shouldValidate: true });

    // Navegamos directamente al input de creación de alto valor
    transitionTo('SOLO_TALK_INPUT');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-4xl mx-auto px-4">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black tracking-tighter uppercase italic text-white">
          ¿Cómo quieres <span className="text-primary">Inspirar?</span>
        </h2>
        <p className="text-sm text-zinc-500 font-medium">Selecciona el formato de tu chispa creativa.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {INSPIRE_OPTIONS.map((option) => (
          <Card
            key={option.id}
            onClick={() => handleSelection(option.id)}
            className="p-8 rounded-[2rem] bg-zinc-900/40 border-white/5 hover:border-primary/40 cursor-pointer transition-all duration-300 group shadow-xl"
          >
            <div className={cn("p-4 rounded-2xl w-fit mb-6 transition-transform group-hover:scale-110", option.bg)}>
              <option.icon className={cn("h-8 w-8", option.color)} />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">{option.title}</h3>
            <p className="text-sm text-zinc-400 leading-relaxed font-medium">
              {option.description}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}