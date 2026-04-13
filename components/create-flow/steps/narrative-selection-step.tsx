// components/create-flow/steps/narrative-selection-step.tsx
// VERSIÓN: 7.0 (NicePod Narrative Engine - Strict Type & UX Sync)
// Misión: Selector de narrativa e identidad sonora 100% Type-Safe y ergonómico.
// [ESTABILIZACIÓN]: Resolución de error ts(2322) mediante mapeo de objetos y estandarización de easing.

"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { BarChart3, BookOpen, Lightbulb, Music, Sparkles } from "lucide-react";

// --- INFRAESTRUCTURA DE COMPONENTES UI ---
import { 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { NarrativeOption } from "../shared/context";

interface NarrativeSelectionStepProps {
  narrativeOptions: NarrativeOption[];
}

/**
 * OPCIONES DE TONO VOCAL
 * Definiciones estáticas que alimentan el motor de síntesis Gemini TTS.
 */
const toneOptions = [
  { 
    value: "Educativo", 
    label: "Educativo", 
    description: "Enfoque claro y didáctico.", 
    icon: BookOpen 
  },
  { 
    value: "Inspirador", 
    label: "Inspirador", 
    description: "Motivacional y edificante.", 
    icon: Lightbulb 
  },
  { 
    value: "Analítico", 
    label: "Analítico", 
    description: "Estructurado y profundo.", 
    icon: BarChart3 
  },
];

export function NarrativeSelectionStep({ narrativeOptions }: NarrativeSelectionStepProps) {
  const { control } = useFormContext<PodcastCreationData>();

  return (
    <div className="space-y-10 md:space-y-14 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl mx-auto px-4 pb-20">

      {/* --- SECCIÓN I: SELECCIÓN DE NARRATIVA IA --- */}
      <div className="space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
            <Sparkles size={12} className="animate-pulse" /> IA Synthesis Ready
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic text-white leading-none">
            Rutas de <span className="text-primary">Conocimiento</span>
          </h2>
          <p className="text-sm text-zinc-500 font-medium max-w-md mx-auto">
            La inteligencia ha destilado estas tesis narrativas. Elige el eje de tu crónica.
          </p>
        </div>

        <FormField
          control={control}
          name="linkSelectedNarrative"
          render={({ field }) => (
            <FormItem className="space-y-0">
              <FormControl>
                <RadioGroup
                  onValueChange={(titleValue) => {
                    // [SOLUCIÓN TS2322]: Buscamos el objeto completo basado en el título (string)
                    const selectedObject = narrativeOptions.find(opt => opt.title === titleValue);
                    // Inyectamos el objeto completo en el estado de Zod
                    field.onChange(selectedObject || null);
                  }}
                  // El valor visual del RadioGroup debe ser un string
                  value={field.value?.title || ""}
                  className="grid grid-cols-1 gap-4"
                >
                  {narrativeOptions.map((option) => (
                    <FormItem key={option.title} className="space-y-0">
                      <FormControl>
                        <RadioGroupItem value={option.title} className="sr-only" />
                      </FormControl>
                      <FormLabel
                        className={cn(
                          "relative flex flex-col p-6 md:p-8 rounded-[2rem] border-2 cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                          field.value?.title === option.title
                            ? "border-primary bg-primary/5 shadow-[0_0_30px_rgba(139,92,246,0.15)]"
                            : "border-white/5 bg-zinc-900/40 hover:border-white/10 hover:bg-white/5"
                        )}
                      >
                        <span className="font-black text-white uppercase tracking-tight text-xl md:text-2xl leading-none">
                          {option.title}
                        </span>
                        <p className="text-sm text-zinc-400 mt-3 leading-relaxed font-medium">
                          {option.thesis}
                        </p>
                        
                        {field.value?.title === option.title && (
                          <div className="absolute top-6 right-8 w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(139,92,246,1)]" />
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

      {/* --- SECCIÓN II: IDENTIDAD SONORA (TONO) --- */}
      <div className="space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/50 border border-white/5 text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">
            <Music size={12} /> Vocal Performance
          </div>
          <h2 className="text-2xl md:text-4xl font-black tracking-tighter uppercase italic text-white leading-none">
            Matiz de <span className="text-primary">Voz</span>
          </h2>
        </div>

        <FormField
          control={control}
          name="selectedTone"
          render={({ field }) => (
            <FormItem className="space-y-0">
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value || ""}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  {toneOptions.map((option) => (
                    <FormItem key={option.value} className="space-y-0">
                      <FormControl>
                        <RadioGroupItem value={option.value} className="sr-only" />
                      </FormControl>
                      <FormLabel
                        className={cn(
                          "flex flex-col items-center justify-center p-6 md:p-10 rounded-[2.5rem] border-2 cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                          field.value === option.value
                            ? "border-primary bg-primary/5 shadow-2xl"
                            : "border-white/5 bg-zinc-900/40 hover:border-white/10"
                        )}
                      >
                        <div className={cn(
                          "p-4 rounded-2xl mb-4 transition-all duration-500",
                          field.value === option.value 
                            ? "bg-primary text-white scale-110 shadow-lg shadow-primary/20" 
                            : "bg-white/5 text-zinc-600"
                        )}>
                          <option.icon size={32} />
                        </div>
                        <span className="font-black text-white uppercase tracking-widest text-[10px]">
                          {option.label}
                        </span>
                        <p className="text-[9px] text-zinc-500 text-center mt-3 font-bold opacity-60 leading-tight tracking-wider">
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

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Resolución de Tipado (Mapping): Se implementó la lógica de búsqueda de objeto 
 *    dentro de 'onValueChange'. El RadioGroup ahora emite un string (title) para 
 *    satisfacer la UI, pero guarda el objeto completo en el formulario para 
 *    satisfacer el esquema de la base de datos V3.0.
 * 2. Estabilidad de Animación: Se integró la curva de easing estándar 
 *    'cubic-bezier(0.16,1,0.3,1)' directamente en las clases para silenciar 
 *    las advertencias de compilación de Tailwind.
 * 3. Diseño de Alta Densidad: Se aumentaron los radios de borde a [2.5rem] 
 *    y se ajustaron los paddings para asegurar que la interfaz respire 
 *    correctamente en pantallas de alta resolución (QHD/4K).
 */