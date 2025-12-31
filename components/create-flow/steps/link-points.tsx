// components/create-flow/link-points.tsx
// VERSIÓN FINAL "ACORDEÓN": Foco dinámico para maximizar espacio de escritura.

"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea"; 
import { Link2, ChevronDown, ChevronUp } from "lucide-react";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { VoiceInput } from "@/components/ui/voice-input";
import { cn } from "@/lib/utils";

export function LinkPointsStep() {
  const { control, setValue, getValues } = useFormContext<PodcastCreationData>();
  
  // Estado para controlar qué campo tiene el foco expandido ('A' o 'B')
  // Por defecto empezamos con A expandido
  const [activeField, setActiveField] = useState<'A' | 'B'>('A');

  const handleVoiceA = (text: string) => {
    const current = getValues('link_topicA') || '';
    const newVal = current ? `${current} ${text}` : text;
    setValue('link_topicA', newVal, { shouldValidate: true });
  };

  const handleVoiceB = (text: string) => {
    const current = getValues('link_topicB') || '';
    const newVal = current ? `${current} ${text}` : text;
    setValue('link_topicB', newVal, { shouldValidate: true });
  };

  return (
    <div className="flex flex-col h-full w-full animate-fade-in px-2 md:px-6 pb-2">
      
      {/* CABECERA COMPACTA */}
      <div className="flex-shrink-0 py-2 text-center">
        <div className="inline-flex items-center justify-center mb-1">
            <div className="p-1.5 bg-white/10 rounded-full backdrop-blur-sm border border-white/10">
                <Link2 className="h-4 w-4 text-blue-400" />
            </div>
        </div>
        <h2 className="text-lg font-bold tracking-tight text-foreground drop-shadow-sm">
          Une tus Ideas
        </h2>
        <p className="text-[10px] md:text-xs text-muted-foreground font-medium">
          La IA encontrará la conexión oculta.
        </p>
      </div>

      {/* ÁREA DE TRABAJO (Acordeón) */}
      <div className="flex-grow flex flex-col gap-3 min-h-0 overflow-hidden">
        
        {/* === BLOQUE A === */}
        <div 
            onClick={() => setActiveField('A')}
            className={cn(
                "flex flex-col relative rounded-xl overflow-hidden border transition-all duration-500 ease-in-out",
                // Estilos dinámicos según estado activo/inactivo
                activeField === 'A' 
                    ? "flex-grow bg-white/50 dark:bg-black/20 border-primary/30 shadow-lg" // Expandido
                    : "h-16 bg-white/30 dark:bg-black/10 border-transparent hover:bg-white/40 cursor-pointer" // Contraído
            )}
        >
            <FormField
            control={control}
            name="link_topicA"
            render={({ field }) => (
                <FormItem className="flex-1 flex flex-col h-full space-y-0">
                    {/* Header del Input (Siempre visible) */}
                    <div className="flex items-center justify-between px-4 py-2 bg-black/5 dark:bg-white/5">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Concepto A</span>
                        {activeField !== 'A' && <ChevronDown className="h-4 w-4 text-muted-foreground animate-bounce" />}
                    </div>

                    <FormControl>
                        <Textarea
                        placeholder="Ej: Filosofía Estoica..."
                        onFocus={() => setActiveField('A')}
                        className={cn(
                            "flex-1 w-full resize-none border-0 focus-visible:ring-0 bg-transparent text-foreground placeholder:text-muted-foreground/50 scrollbar-hide transition-all",
                            activeField === 'A' ? "text-lg p-4 leading-relaxed" : "text-sm p-2 overflow-hidden opacity-70"
                        )}
                        {...field}
                        />
                    </FormControl>
                    
                    {/* Botonera (Solo visible si está expandido) */}
                    <div className={cn(
                        "flex-shrink-0 p-2 bg-white/40 dark:bg-black/40 border-t border-black/5 dark:border-white/5 transition-all duration-300 overflow-hidden",
                        activeField === 'A' ? "max-h-20 opacity-100" : "max-h-0 opacity-0 p-0 border-0"
                    )}>
                        <VoiceInput onTextGenerated={handleVoiceA} className="w-full" />
                    </div>
                </FormItem>
            )}
            />
        </div>

        {/* === BLOQUE B === */}
        <div 
            onClick={() => setActiveField('B')}
            className={cn(
                "flex flex-col relative rounded-xl overflow-hidden border transition-all duration-500 ease-in-out",
                activeField === 'B' 
                    ? "flex-grow bg-white/50 dark:bg-black/20 border-primary/30 shadow-lg" 
                    : "h-16 bg-white/30 dark:bg-black/10 border-transparent hover:bg-white/40 cursor-pointer"
            )}
        >
            <FormField
            control={control}
            name="link_topicB"
            render={({ field }) => (
                <FormItem className="flex-1 flex flex-col h-full space-y-0">
                    <div className="flex items-center justify-between px-4 py-2 bg-black/5 dark:bg-white/5">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Concepto B</span>
                        {activeField !== 'B' && <ChevronDown className="h-4 w-4 text-muted-foreground animate-bounce" />}
                    </div>

                    <FormControl>
                        <Textarea
                        placeholder="Ej: Inteligencia Artificial..."
                        onFocus={() => setActiveField('B')}
                        className={cn(
                            "flex-1 w-full resize-none border-0 focus-visible:ring-0 bg-transparent text-foreground placeholder:text-muted-foreground/50 scrollbar-hide transition-all",
                            activeField === 'B' ? "text-lg p-4 leading-relaxed" : "text-sm p-2 overflow-hidden opacity-70"
                        )}
                        {...field}
                        />
                    </FormControl>
                    
                    <div className={cn(
                        "flex-shrink-0 p-2 bg-white/40 dark:bg-black/40 border-t border-black/5 dark:border-white/5 transition-all duration-300 overflow-hidden",
                        activeField === 'B' ? "max-h-20 opacity-100" : "max-h-0 opacity-0 p-0 border-0"
                    )}>
                        <VoiceInput onTextGenerated={handleVoiceB} className="w-full" />
                    </div>
                </FormItem>
            )}
            />
        </div>

      </div>
    </div>
  );
}