// components/create-flow/archetype-step.tsx
// VERSIÓN FINAL QUE EXPORTA LAS OPCIONES

"use client";

import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { SelectionCard } from "@/components/ui/selection-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormField, FormControl, FormItem, FormMessage } from "@/components/ui/form";
import { Heart, BookOpen, Compass, Zap, Construction, Shield } from "lucide-react";

// [INTERVENCIÓN QUIRÚRGICA]: Se añade `export` para que el orquestador pueda acceder a esta lista.
export const archetypeOptions = [
    { value: 'archetype-hero', icon: <Shield className="h-7 w-7" />, title: 'El Héroe', description: 'Narra un viaje de desafío y transformación.' },
    { value: 'archetype-sage', icon: <BookOpen className="h-7 w-7" />, title: 'El Sabio', description: 'Explica un tema complejo con claridad y autoridad.' },
    { value: 'archetype-explorer', icon: <Compass className="h-7 w-7" />, title: 'El Explorador', description: 'Descubre lo nuevo con curiosidad y asombro.' },
    { value: 'archetype-rebel', icon: <Zap className="h-7 w-7" />, title: 'El Rebelde', description: 'Desafía el status quo y propone un cambio radical.' },
    { value: 'archetype-creator', icon: <Construction className="h-7 w-7" />, title: 'El Creador', description: 'Construye una idea desde la visión y la imaginación.' },
    { value: 'archetype-caregiver', icon: <Heart className="h-7 w-7" />, title: 'El Cuidador', description: 'Conecta con la audiencia a través de la empatía.' },
];

export function ArchetypeStep() {
  const { control, watch, setValue } = useFormContext<PodcastCreationData>();
  const selectedArchetype = watch('selectedArchetype');

  return (
    <div className="flex flex-col h-full">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Elige tu Arquetipo Narrativo</h2>
        <p className="text-muted-foreground">Selecciona una estructura para dar forma a tu guion.</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {archetypeOptions.map((option) => (
          <SelectionCard
            key={option.value}
            icon={option.icon}
            title={option.title}
            description={option.description}
            isSelected={selectedArchetype === option.value}
            onClick={() => setValue('selectedArchetype', option.value, { shouldValidate: true })}
          />
        ))}
      </div>
      <div className="space-y-4 mt-auto">
        <FormField
          control={control}
          name="archetype_topic"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor="archetype_topic">Tema Principal</Label>
              <FormControl>
                <Input id="archetype_topic" placeholder="Ej: La historia de la inteligencia artificial" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="archetype_goal"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor="archetype_goal">Mensaje u Objetivo Final</Label>
              <FormControl>
                <Input id="archetype_goal" placeholder="Ej: Demostrar cómo ha evolucionado para cambiar nuestro mundo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}