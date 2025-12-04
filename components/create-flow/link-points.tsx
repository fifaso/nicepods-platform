// components/create-flow/link-points.tsx
// VERSIÓN FINAL: Diseño Split, Voice-First por campo, sin Catalizador.

"use client";

import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea"; // Usamos Textarea para más espacio visual
import { Link2 } from "lucide-react";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { VoiceInput } from "@/components/ui/voice-input";

export function LinkPointsStep() {
  const { control, setValue, getValues } = useFormContext<PodcastCreationData>();

  // Handlers independientes para máxima precisión
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
      <div className="flex-shrink-0 py-2 md:py-4 text-center">
        <div className="inline-flex items-center justify-center mb-2">
            <div className="p-2 bg-white/10 rounded-full backdrop-blur-sm">
                <Link2 className="h-5 w-5 text-blue-400" />
            </div>
        </div>
        <h2 className="text-lg md:text-2xl font-bold tracking-tight text-foreground drop-shadow-sm">
          Une tus Ideas
        </h2>
        <p className="text-xs md:text-sm text-muted-foreground font-medium">
          Danos dos conceptos. La IA encontrará la conexión.
        </p>
      </div>

      {/* ÁREA DE TRABAJO DIVIDIDA (GRID VERTICAL) */}
      <div className="flex-grow flex flex-col gap-3 min-h-0">
        
        {/* CONCEPTO A */}
        <div className="flex-1 flex flex-col min-h-0 relative rounded-xl overflow-hidden bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/10 backdrop-blur-sm">
            <FormField
            control={control}
            name="link_topicA"
            render={({ field }) => (
                <FormItem className="flex-1 flex flex-col h-full space-y-0">
                <FormControl>
                    <Textarea
                    placeholder="Concepto A (Ej: Filosofía Estoica)..."
                    className="flex-1 w-full resize-none border-0 focus-visible:ring-0 text-base md:text-lg p-4 bg-transparent text-foreground placeholder:text-muted-foreground/50 scrollbar-hide"
                    {...field}
                    />
                </FormControl>
                {/* Botonera Integrada A */}
                <div className="flex-shrink-0 p-2 bg-white/40 dark:bg-black/40 border-t border-black/5 dark:border-white/5 flex justify-end">
                    <div className="w-full max-w-[200px]">
                        <VoiceInput onTextGenerated={handleVoiceA} className="h-8 text-xs" />
                    </div>
                </div>
                </FormItem>
            )}
            />
        </div>

        {/* CONCEPTO B */}
        <div className="flex-1 flex flex-col min-h-0 relative rounded-xl overflow-hidden bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/10 backdrop-blur-sm">
            <FormField
            control={control}
            name="link_topicB"
            render={({ field }) => (
                <FormItem className="flex-1 flex flex-col h-full space-y-0">
                <FormControl>
                    <Textarea
                    placeholder="Concepto B (Ej: Inteligencia Artificial)..."
                    className="flex-1 w-full resize-none border-0 focus-visible:ring-0 text-base md:text-lg p-4 bg-transparent text-foreground placeholder:text-muted-foreground/50 scrollbar-hide"
                    {...field}
                    />
                </FormControl>
                {/* Botonera Integrada B */}
                <div className="flex-shrink-0 p-2 bg-white/40 dark:bg-black/40 border-t border-black/5 dark:border-white/5 flex justify-end">
                     <div className="w-full max-w-[200px]">
                        <VoiceInput onTextGenerated={handleVoiceB} className="h-8 text-xs" />
                    </div>
                </div>
                </FormItem>
            )}
            />
        </div>

      </div>
    </div>
  );
}