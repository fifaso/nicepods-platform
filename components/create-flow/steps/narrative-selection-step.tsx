// components/create-flow/steps/narrative-selection-step.tsx
// VERSIÓN: 6.0 (Madrid Resonance - Full Contract Sync & Zero Errors)
// Misión: Selector de narrativa e identidad sonora 100% Type-Safe y compatible con Producción.

"use client";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { BarChart3, BookOpen, Lightbulb, Music, Sparkles } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { NarrativeOption } from "../shared/context"; // [FIX]: Importación desde el contexto estabilizado

interface NarrativeSelectionStepProps {
  narrativeOptions: NarrativeOption[];
}

/**
 * OPCIONES DE TONO
 * Sincronizadas con el motor de voz de NicePod.
 */
const toneOptions = [
  { value: "Educativo", label: "Educativo", description: "Enfoque claro y didáctico.", icon: BookOpen },
  { value: "Inspirador", label: "Inspirador", description: "Motivacional y edificante.", icon: Lightbulb },
  { value: "Analítico", label: "Analítico", description: "Estructurado y profundo.", icon: BarChart3 },
];

export function NarrativeSelectionStep({ narrativeOptions }: NarrativeSelectionStepProps) {
  const { control } = useFormContext<PodcastCreationData>();

  return (
    <div className="space-y-10 animate-in fade-in duration-700 max-w-4xl mx-auto px-4">

      {/* SECCIÓN 1: SELECCIÓN DE NARRATIVA GENERADA POR IA */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
            <Sparkles size={12} className="animate-pulse" /> IA Generation Complete
          </div>
          <h2 className="text-3xl font-black tracking-tighter uppercase italic text-white">
            Elige una <span className="text-primary">Narrativa</span>
          </h2>
          <p className="text-sm text-zinc-500 font-medium">La inteligencia ha trazado estas rutas. Selecciona la que mejor resuene.</p>
        </div>

        <FormField
          control={control}
          name="link_selectedNarrative"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <RadioGroup
                  onValueChange={(value) => {
                    const selected = narrativeOptions.find(opt => opt.title === value);
                    field.onChange(selected || null);
                  }}
                  // [FIX]: Bypass de error ts(2322) asegurando que nunca sea null
                  value={field.value?.title || undefined}
                  className="grid grid-cols-1 gap-4"
                >
                  {narrativeOptions.map((option) => (
                    <FormItem key={option.title}>
                      <FormControl>
                        <RadioGroupItem value={option.title} className="sr-only" />
                      </FormControl>
                      <FormLabel
                        className={cn(
                          "relative flex flex-col p-6 rounded-[2rem] border-2 cursor-pointer transition-all duration-300 hover:bg-white/5",
                          field.value?.title === option.title
                            ? "border-primary bg-primary/5 shadow-[0_0_20px_rgba(var(--primary),0.1)]"
                            : "border-white/5 bg-zinc-900/40"
                        )}
                      >
                        <p className="font-black text-white uppercase tracking-tight text-lg">{option.title}</p>
                        <p className="text-sm text-zinc-400 mt-2 leading-relaxed font-medium">{option.thesis}</p>
                        {field.value?.title === option.title && (
                          <div className="absolute top-4 right-6 w-2 h-2 rounded-full bg-primary animate-pulse" />
                        )}
                      </FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* SECCIÓN 2: SELECCIÓN DE TONO VOCAL */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 border border-white/5 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
            <Music size={12} /> Vocal Performance
          </div>
          <h2 className="text-3xl font-black tracking-tighter uppercase italic text-white">
            Define el <span className="text-primary">Tono</span>
          </h2>
          <p className="text-sm text-zinc-500 font-medium">¿Qué matiz emocional debe tener la crónica?</p>
        </div>

        <FormField
          control={control}
          // [FIX]: Sincronización con Naming Fix (link_selectedTone -> selectedTone)
          name="selectedTone"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  // [FIX]: Bypass de error ts(2322) asegurando que nunca sea null
                  value={field.value || undefined}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  {toneOptions.map((option) => (
                    <FormItem key={option.value}>
                      <FormControl>
                        <RadioGroupItem value={option.value} className="sr-only" />
                      </FormControl>
                      <FormLabel
                        className={cn(
                          "flex flex-col items-center justify-center p-8 rounded-[2rem] border-2 cursor-pointer transition-all duration-500",
                          field.value === option.value
                            ? "border-primary bg-primary/5"
                            : "border-white/5 bg-zinc-900/40 hover:border-white/20"
                        )}
                      >
                        <div className={cn(
                          "p-3 rounded-2xl mb-4 transition-colors",
                          field.value === option.value ? "bg-primary text-white" : "bg-white/5 text-zinc-500"
                        )}>
                          <option.icon size={28} />
                        </div>
                        <p className="font-black text-white uppercase tracking-widest text-xs">{option.label}</p>
                        <p className="text-[10px] text-zinc-500 text-center mt-2 font-bold opacity-60 leading-tight">
                          {option.description}
                        </p>
                      </FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}