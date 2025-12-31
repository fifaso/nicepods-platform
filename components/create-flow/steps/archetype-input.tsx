// components/create-flow/archetype-input.tsx
// VERSIÓN: 2.1 (Fix: Textarea Visibility & Flex Layout)

"use client";

import { useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { VoiceInput } from "@/components/ui/voice-input";
import { Input } from "@/components/ui/input";
import { useMobileViewport } from "@/hooks/use-mobile-viewport";
import { archetypeOptions } from "./archetype-step"; 

export function ArchetypeInputStep() {
  const { control, setValue, watch, getValues } = useFormContext<PodcastCreationData>();
  const goalValue = watch('archetype_goal');
  const selectedArchetype = watch('selectedArchetype');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportHeight = useMobileViewport(containerRef);

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
    <div 
        ref={containerRef}
        className="flex flex-col w-full h-full animate-fade-in px-2 md:px-6 overflow-hidden"
        style={{ 
            // [FIX]: Si viewportHeight es null (escritorio), usamos 100% del padre
            height: viewportHeight ? `${viewportHeight}px` : '100%', 
            maxHeight: '100%' 
        }}
    >
      
      {/* HEADER */}
      <div className="flex-shrink-0 py-4 text-center space-y-2">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground drop-shadow-sm">
          Desarrolla tu Historia
        </h2>
        
        {currentArchetype && (
            <div className="inline-flex items-center justify-center px-3 py-1 bg-primary/10 border border-primary/20 rounded-full shadow-sm backdrop-blur-md">
                <span className="text-primary mr-2">
                    <currentArchetype.icon className="h-4 w-4" />
                </span>
                <span className="text-xs font-semibold text-primary">
                    Modo: {currentArchetype.title}
                </span>
            </div>
        )}
      </div>

      <div className="hidden">
        <FormField control={control} name="archetype_topic" render={({ field }) => <FormItem><FormControl><Input {...field} /></FormControl></FormItem>} />
      </div>

      {/* ÁREA DE TRABAJO (INPUT) */}
      <div className="flex-1 flex flex-col min-h-0 relative rounded-xl overflow-hidden bg-white/40 dark:bg-black/20 border border-black/5 dark:border-white/10 backdrop-blur-md shadow-inner">
        
        <FormField
          control={control}
          name="archetype_goal"
          render={({ field }) => (
            <FormItem className="flex-1 flex flex-col h-full w-full min-h-0 space-y-0 relative">
              
              <FormControl className="flex-1 flex flex-col min-h-0">
                <Textarea
                  placeholder={`Escribe aquí tu idea... La IA adaptará tu texto al estilo del "${currentArchetype?.title || 'Arquetipo'}"...`}
                  className="flex-1 w-full h-full resize-none border-0 focus-visible:ring-0 text-lg p-6 bg-transparent text-foreground placeholder:text-muted-foreground/60 scrollbar-hide min-h-[200px]"
                  {...field}
                />
              </FormControl>
              
              {/* BOTONERA FLOTANTE DENTRO DEL AREA */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background/80 to-transparent pt-8 pointer-events-none">
                 <div className="pointer-events-auto">
                    <VoiceInput onTextGenerated={handleVoiceGoal} className="w-full shadow-lg" />
                    <FormMessage className="mt-2 text-center text-xs font-medium text-red-500 animate-pulse" />
                 </div>
              </div>

            </FormItem>
          )}
        />
      </div>
      
      {/* Espaciador inferior para evitar que el teclado tape el último contenido en móviles */}
      <div className="h-4 flex-shrink-0" />
    </div>
  );
}