// components/create-flow/steps/details-step.tsx
// VERSIÓN: 1.1 (NicePod World Standard - Depth-Aware Configuration)
// Misión: Capturar la intención de extensión y profundidad narrativa del usuario.
// [INTEGRACIÓN]: Valores sincronizados con el motor de investigación asíncrono Nivel 1.

"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { useFormContext } from "react-hook-form";

/**
 * OPCIONES DE DURACIÓN:
 * Define el target de palabras para la fase de redacción.
 */
const durationOptions = [
  { value: "Corta (3-5 min)", label: "Corta", desc: "~600 palabras" },
  { value: "Media (6-9 min)", label: "Media", desc: "~1200 palabras" },
  { value: "Larga (10-14 min)", label: "Larga", desc: "~2000 palabras" },
];

/**
 * OPCIONES DE PROFUNDIDAD:
 * [CRÍTICO]: Los valores 'Superficial', 'Intermedia' y 'Profunda' son las llaves
 * que activan los límites de fuentes en la Edge Function para el control de CPU.
 */
const depthOptions = [
  { value: "Superficial", label: "Básico", desc: "Resumen ejecutivo" },
  { value: "Intermedia", label: "Medio", desc: "Análisis con ejemplos" },
  { value: "Profunda", label: "Profundo", desc: "Visión exhaustiva" },
];

export function DetailsStep() {
  const { control } = useFormContext<PodcastCreationData>();

  return (
    <div className="flex flex-col h-full w-full justify-center animate-in fade-in duration-500 px-4 pb-6 overflow-y-auto custom-scrollbar-hide">

      {/* CABECERA DE CONFIGURACIÓN */}
      <div className="text-center mb-8 flex-shrink-0">
        <h2 className="text-xl md:text-2xl font-black tracking-tight uppercase italic">
          Configuración <span className="text-primary">Técnica</span>
        </h2>
        <p className="text-xs text-muted-foreground mt-1 font-medium">
          Define la extensión y profundidad de la investigación.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full">

        {/* CAMPO: DURACIÓN ESTIMADA */}
        <FormField
          control={control}
          name="duration"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 text-center block">
                Duración Estimada
              </FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="grid gap-2"
                >
                  {durationOptions.map((opt) => (
                    <label
                      key={opt.value}
                      className={cn(
                        "flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all duration-300 cursor-pointer",
                        field.value === opt.value
                          ? "border-primary bg-primary/5 shadow-[0_0_15px_rgba(139,92,246,0.1)]"
                          : "border-border/40 bg-white/[0.02] hover:bg-white/[0.05] hover:border-border"
                      )}
                    >
                      <RadioGroupItem value={opt.value} className="sr-only" />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold tracking-tight">{opt.label}</span>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest opacity-40">
                        {opt.desc}
                      </span>
                    </label>
                  ))}
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />

        {/* CAMPO: NIVEL DE ANÁLISIS (Profundidad) */}
        <FormField
          control={control}
          name="narrativeDepth"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 text-center block">
                Nivel de Análisis
              </FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="grid gap-2"
                >
                  {depthOptions.map((opt) => (
                    <label
                      key={opt.value}
                      className={cn(
                        "flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all duration-300 cursor-pointer",
                        field.value === opt.value
                          ? "border-primary bg-primary/5 shadow-[0_0_15px_rgba(139,92,246,0.1)]"
                          : "border-border/40 bg-white/[0.02] hover:bg-white/[0.05] hover:border-border"
                      )}
                    >
                      <RadioGroupItem value={opt.value} className="sr-only" />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold tracking-tight">{opt.label}</span>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest opacity-40">
                        {opt.desc}
                      </span>
                    </label>
                  ))}
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}