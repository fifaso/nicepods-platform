// components/create-flow/archetype-step.tsx
// VERSIÓN FINAL ADAPTATIVA: Contraste perfecto Light/Dark y Lienzo Infinito.

"use client";

import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { VoiceInput } from "@/components/ui/voice-input";
import { Input } from "@/components/ui/input";
import { Heart, BookOpen, Compass, Zap, Construction, Shield } from "lucide-react";

// Opciones exportadas
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
  const goalValue = watch('archetype_goal'); 

  useEffect(() => {
    if (goalValue) {
      const autoTopic = goalValue.length > 50 
        ? goalValue.substring(0, 50) + "..." 
        : goalValue;
      setValue('archetype_topic', autoTopic, { shouldValidate: true });
    }
  }, [goalValue, setValue]);

  const handleVoiceGoal = (text: string) => {
    const currentText = getValues('archetype_goal') || '';
    const newText = currentText ? `${currentText} ${text}` : text;
    setValue('archetype_goal', newText, { shouldValidate: true, shouldDirty: true });
  };

  const currentArchetype = archetypeOptions.find(opt => opt.value === selectedArchetype);

  return (
    <div className="flex flex-col h-full w-full animate-fade-in px-2 md:px-6 pb-2">
      
      {/* CABECERA ADAPTATIVA: 'text-foreground' */}
      <div className="flex-shrink-0 py-1 md:py-4 text-center">
        <h2 className="text-lg md:text-2xl font-bold tracking-tight text-foreground drop-shadow-sm md:drop-shadow-none">
          Desarrolla tu Historia
        </h2>
        
        {/* BANNER DE CONTEXTO ADAPTATIVO
            - Light: bg-white/50 (resalta sutilmente)
            - Dark: dark:bg-white/10
        */}
        {currentArchetype && (
            <div className="inline-flex items-center justify-center mt-2 px-3 py-1 bg-white/50 dark:bg-white/10 rounded-full border border-black/5 dark:border-white/10 backdrop-blur-md shadow-sm">
                <span className="text-primary mr-2">{currentArchetype.icon}</span>
                <span className="text-xs md:text-sm text-muted-foreground font-medium">
                    Modo: {currentArchetype.title}
                </span>
            </div>
        )}
      </div>

      <div className="hidden">
        <FormField control={control} name="archetype_topic" render={({ field }) => <FormItem><FormControl><Input {...field} /></FormControl></FormItem>} />
      </div>

      {/* LIENZO DE ESCRITURA ADAPTATIVO:
          - Light: bg-white/50
          - Dark: dark:bg-black/20
          - Texto: text-foreground
      */}
      <div className="flex-grow flex flex-col min-h-0 relative rounded-xl overflow-hidden bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/10 backdrop-blur-md shadow-sm">
        <FormField
          control={control}
          name="archetype_goal"
          render={({ field }) => (
            <FormItem className="flex-1 flex flex-col h-full space-y-0">
              
              <FormControl>
                <Textarea
                  placeholder={`Escribe aquí... La IA adaptará tu texto al estilo de "${currentArchetype?.title || 'tu arquetipo'}"...`}
                  // text-foreground asegura legibilidad en ambos modos
                  className="flex-1 w-full h-full resize-none border-0 focus-visible:ring-0 text-base md:text-xl leading-relaxed p-4 md:p-6 bg-transparent text-foreground placeholder:text-muted-foreground/50 scrollbar-hide"
                  {...field}
                />
              </FormControl>
              
              {/* BOTONERA ADAPTATIVA:
                  - Light: Gradiente blanco
                  - Dark: Gradiente negro
              */}
              <div className="flex-shrink-0 p-3 md:p-4 bg-gradient-to-t from-white/80 via-white/40 dark:from-black/40 dark:via-black/20 to-transparent border-t border-black/5 dark:border-white/5 backdrop-blur-sm">
                 <VoiceInput onTextGenerated={handleVoiceGoal} className="w-full" />
                 <FormMessage className="mt-1 text-center text-[10px] text-red-500 dark:text-red-400" />
              </div>

            </FormItem>
          )}
        />
      </div>
    </div>
  );
}