// components/create-flow/archetype-step.tsx
// VERSIÓN MAESTRA: Lienzo Infinito + Contexto de Arquetipo Integrado.

"use client";

import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { VoiceInput } from "@/components/ui/voice-input";
import { Input } from "@/components/ui/input";
import { Heart, BookOpen, Compass, Zap, Construction, Shield } from "lucide-react";

// Opciones exportadas (usadas también en InspireSubStep)
export const archetypeOptions = [
    { 
        value: 'archetype-hero', 
        icon: <Shield className="h-5 w-5" />, 
        title: 'El Héroe', 
        description: <span className="hidden md:inline">Narra un viaje de desafío y transformación.</span> 
    },
    { 
        value: 'archetype-sage', 
        icon: <BookOpen className="h-5 w-5" />, 
        title: 'El Sabio', 
        description: <span className="hidden md:inline">Explica un tema complejo con claridad y autoridad.</span> 
    },
    { 
        value: 'archetype-explorer', 
        icon: <Compass className="h-5 w-5" />, 
        title: 'El Explorador', 
        description: <span className="hidden md:inline">Descubre lo nuevo con curiosidad y asombro.</span> 
    },
    { 
        value: 'archetype-rebel', 
        icon: <Zap className="h-5 w-5" />, 
        title: 'El Rebelde', 
        description: <span className="hidden md:inline">Desafía el status quo y propone un cambio radical.</span> 
    },
    { 
        value: 'archetype-creator', 
        icon: <Construction className="h-5 w-5" />, 
        title: 'El Creador', 
        description: <span className="hidden md:inline">Construye una idea desde la visión y la imaginación.</span> 
    },
    { 
        value: 'archetype-caregiver', 
        icon: <Heart className="h-5 w-5" />, 
        title: 'El Cuidador', 
        description: <span className="hidden md:inline">Conecta con la audiencia a través de la empatía.</span> 
    },
];

export function ArchetypeStep() {
  const { control, setValue, watch, getValues } = useFormContext<PodcastCreationData>();
  const selectedArchetype = watch('selectedArchetype');
  const goalValue = watch('archetype_goal'); // Observamos el objetivo para autollenar el tema

  // 1. Lógica de Autocompletado (Simula el título oculto)
  useEffect(() => {
    if (goalValue) {
      const autoTopic = goalValue.length > 50 
        ? goalValue.substring(0, 50) + "..." 
        : goalValue;
      setValue('archetype_topic', autoTopic, { shouldValidate: true });
    }
  }, [goalValue, setValue]);

  // 2. Handler de Voz
  const handleVoiceGoal = (text: string) => {
    const currentText = getValues('archetype_goal') || '';
    const newText = currentText ? `${currentText} ${text}` : text;
    setValue('archetype_goal', newText, { shouldValidate: true, shouldDirty: true });
  };

  // Recuperamos la info del arquetipo seleccionado para mostrarlo en el banner
  const currentArchetype = archetypeOptions.find(opt => opt.value === selectedArchetype);

  return (
    <div className="flex flex-col h-full w-full animate-fade-in px-2 md:px-6 pb-2">
      
      {/* CABECERA DINÁMICA: Muestra el contexto del arquetipo */}
      <div className="flex-shrink-0 py-2 md:py-4 text-center">
        <h2 className="text-lg md:text-2xl font-bold tracking-tight text-white drop-shadow-md">
          Desarrolla tu Historia
        </h2>
        
        {/* BANNER DE CONTEXTO: "Estás escribiendo como..." */}
        {currentArchetype && (
            <div className="inline-flex items-center justify-center mt-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 backdrop-blur-md">
                <span className="text-primary mr-2">{currentArchetype.icon}</span>
                <span className="text-xs md:text-sm text-white/90 font-medium">
                    Modo: {currentArchetype.title}
                </span>
            </div>
        )}
      </div>

      {/* INPUT OCULTO (Para validación) */}
      <div className="hidden">
        <FormField control={control} name="archetype_topic" render={({ field }) => <FormItem><FormControl><Input {...field} /></FormControl></FormItem>} />
      </div>

      {/* LIENZO DE ESCRITURA (Patrón Estandarizado) */}
      <div className="flex-grow flex flex-col min-h-0 relative rounded-xl overflow-hidden bg-black/20 border border-white/10 backdrop-blur-sm shadow-inner">
        <FormField
          control={control}
          name="archetype_goal"
          render={({ field }) => (
            <FormItem className="flex-1 flex flex-col h-full space-y-0">
              
              <FormControl>
                <Textarea
                  placeholder={`Escribe aquí... La IA adaptará tu texto al estilo de "${currentArchetype?.title || 'tu arquetipo'}"...`}
                  className="flex-1 w-full h-full resize-none border-0 focus-visible:ring-0 text-base md:text-xl leading-relaxed p-4 md:p-6 bg-transparent text-white placeholder:text-white/40 scrollbar-hide"
                  {...field}
                />
              </FormControl>
              
              {/* BOTONERA DE VOZ */}
              <div className="flex-shrink-0 p-3 bg-black/40 backdrop-blur-md border-t border-white/5">
                 <VoiceInput onTextGenerated={handleVoiceGoal} className="w-full" />
                 <FormMessage className="mt-1 text-center text-[10px] text-red-300" />
              </div>

            </FormItem>
          )}
        />
      </div>
    </div>
  );
}