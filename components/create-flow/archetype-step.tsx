// components/create-flow/archetype-step.tsx
// VERSIÓN: 9.0 (Feature Parity: Keyboard Detection & Auto-Layout)

"use client";

import { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { VoiceInput } from "@/components/ui/voice-input";
import { Input } from "@/components/ui/input";
import { Heart, BookOpen, Compass, Zap, Construction, Shield } from "lucide-react";
import { useMobileViewport } from "@/hooks/use-mobile-viewport";
import { cn } from "@/lib/utils";

export const archetypeOptions = [
    { value: 'archetype-hero', icon: <Shield className="h-5 w-5" />, title: 'El Héroe', description: <span className="hidden md:inline">Narra un viaje de desafío y transformación.</span> },
    { value: 'archetype-sage', icon: <BookOpen className="h-5 w-5" />, title: 'El Sabio', description: <span className="hidden md:inline">Explica un tema complejo con claridad y autoridad.</span> },
    { value: 'archetype-explorer', icon: <Compass className="h-5 w-5" />, title: 'El Explorador', description: <span className="hidden md:inline">Descubre lo nuevo con curiosidad y asombro.</span> },
    { value: 'archetype-rebel', icon: <Zap className="h-5 w-5" />, title: 'El Rebelde', description: <span className="hidden md:inline">Desafía el status quo y propone un cambio radical.</span> },
    { value: 'archetype-creator', icon: <Construction className="h-5 w-5" />, title: 'El Creador', description: <span className="hidden md:inline">Construye una idea desde la visión y la imaginación.</span> },
    { value: 'archetype-caregiver', icon: <Heart className="h-5 w-5" />, title: 'El Cuidador', description: <span className="hidden md:inline">Conecta con la audiencia a través de la empatía.</span> },
];

export function ArchetypeStep() {
  const { control, setValue, watch, getValues } = useFormContext<PodcastCreationData>();
  const selectedArchetype = watch('selectedArchetype');
  const goalValue = watch('archetype_goal'); 
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  // 1. Infraestructura de Viewport
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

  // Detección de Teclado Manual (Para ocultar el header)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      if (window.visualViewport) {
        // Si la altura visible es < 75% de la pantalla, hay teclado.
        const isCompact = window.visualViewport.height < window.screen.height * 0.75;
        setIsKeyboardOpen(isCompact);
      }
    };
    window.visualViewport?.addEventListener('resize', handleResize);
    handleResize();
    return () => window.visualViewport?.removeEventListener('resize', handleResize);
  }, []);

  const handleVoiceGoal = (text: string) => {
    const currentText = getValues('archetype_goal') || '';
    const newText = currentText ? `${currentText} ${text}` : text;
    setValue('archetype_goal', newText, { shouldValidate: true, shouldDirty: true });
  };

  const currentArchetype = archetypeOptions.find(opt => opt.value === selectedArchetype);

  return (
    // 2. CONTENEDOR PRINCIPAL
    <div 
        ref={containerRef}
        className={cn(
            "flex flex-col w-full animate-fade-in px-2 md:px-6 overflow-hidden transition-all duration-300",
            // Si hay teclado, aplicamos margen negativo para "subir" el contenido
            isKeyboardOpen ? "-mt-4" : "mt-0"
        )}
        style={{ 
            height: viewportHeight ? `${viewportHeight}px` : '100%', 
            maxHeight: '100%' 
        }}
    >
      
      {/* 3. CABECERA COLAPSIBLE */}
      <div className={cn(
          "flex-shrink-0 text-center transition-all duration-300 ease-out overflow-hidden",
          // Si hay teclado, ocultamos TODO el header para dar espacio al editor
          isKeyboardOpen ? "h-0 opacity-0 m-0 p-0" : "py-2 md:py-4 h-auto opacity-100"
      )}>
        <h2 className="text-lg md:text-2xl font-bold tracking-tight text-foreground drop-shadow-sm md:drop-shadow-none">
          Desarrolla tu Historia
        </h2>
        
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

      {/* 4. ÁREA DE TRABAJO */}
      <div className="flex-1 flex flex-col min-h-0 relative rounded-xl overflow-hidden bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/10 backdrop-blur-md shadow-sm transition-all duration-300">
        <FormField
          control={control}
          name="archetype_goal"
          render={({ field }) => (
            
            <FormItem className="flex-1 flex flex-col w-full h-full min-h-0 space-y-0">
              
              <FormControl className="flex-1 flex flex-col min-h-0">
                <Textarea
                  placeholder={`Escribe aquí... La IA adaptará tu texto al estilo de "${currentArchetype?.title || 'tu arquetipo'}"...`}
                  className="flex-1 w-full h-full resize-none border-0 focus-visible:ring-0 text-base md:text-xl leading-relaxed p-4 md:p-6 bg-transparent text-foreground placeholder:text-muted-foreground/50 scrollbar-hide min-h-0"
                  {...field}
                />
              </FormControl>
              
              {/* 5. BOTONERA: mt-auto asegura que siempre se pegue al fondo */}
              <div className="mt-auto flex-shrink-0 p-3 md:p-4 bg-gradient-to-t from-white/95 via-white/90 dark:from-black/90 dark:via-black/80 to-transparent border-t border-black/5 dark:border-white/5 backdrop-blur-md z-10">
                 <VoiceInput onTextGenerated={handleVoiceGoal} className="w-full" />
                 <FormMessage className="mt-1 text-center text-[10px] text-red-500 dark:text-red-400" />
              </div>

            </FormItem>
          )}
        />
      </div>
      
      {/* 6. ESPACIADOR: Más pequeño si hay teclado */}
      <div className={cn("flex-shrink-0", isKeyboardOpen ? "h-1" : "h-2")} />
    </div>
  );
}