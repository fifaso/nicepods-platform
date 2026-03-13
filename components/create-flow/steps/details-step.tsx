// components/create-flow/steps/details-step.tsx
// VERSIÓN: 2.0 (NicePod Technical Config - Thermal Control Sync Edition)
// Misión: Capturar la extensión y profundidad narrativa bajo estrictos límites de seguridad.
// [ESTABILIZACIÓN]: Alineación absoluta con el Zod Schema V10.0 para prevención OOM.

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
 * OPCIONES DE DURACIÓN (Sincronizadas con Zod Schema V10.0)
 * [LÍMITE TÉRMICO]: La Workstation ha bloqueado la duración máxima a 5 minutos 
 * para garantizar la estabilidad del ensamblador de audio en la Edge Function (Deno 150MB).
 * El cálculo se basa en un promedio TTS de 130 palabras por minuto.
 */
const durationOptions = [
  { value: "Menos de 1 minuto", label: "Píldora Rápida", desc: "Máx 100 palabras" },
  { value: "Entre 2 y 3 minutos", label: "Crónica Estándar", desc: "~350 palabras" },
  { value: "Hasta 5 minutos", label: "Inmersión Total", desc: "Máx 650 palabras" },
];

/**
 * OPCIONES DE PROFUNDIDAD:
 * Los valores 'Superficial', 'Intermedia' y 'Profunda' son consumidos directamente
 * por el 'prompt' maestro del Agente 38 (IA Redactora).
 */
const depthOptions = [
  { value: "Superficial", label: "Básico", desc: "Resumen ejecutivo" },
  { value: "Intermedia", label: "Medio", desc: "Análisis con ejemplos" },
  { value: "Profunda", label: "Profundo", desc: "Visión exhaustiva" },
];

export function DetailsStep() {
  const { control } = useFormContext<PodcastCreationData>();

  return (
    <div className="flex flex-col h-full w-full justify-center animate-in fade-in duration-700 px-4 pb-6 overflow-y-auto custom-scrollbar-hide">

      {/* CABECERA DE CONFIGURACIÓN */}
      <div className="text-center mb-10 flex-shrink-0">
        <h2 className="text-2xl md:text-4xl font-black tracking-tighter uppercase italic text-white">
          Configuración <span className="text-primary">Técnica</span>
        </h2>
        <p className="text-sm text-zinc-400 mt-2 font-medium max-w-md mx-auto">
          Define los parámetros estructurales. Estos límites garantizan una síntesis de audio impecable.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full">

        {/* CAMPO: DURACIÓN ESTIMADA */}
        <FormField
          control={control}
          name="duration"
          render={({ field }) => (
            <FormItem className="space-y-4">
              <FormLabel className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-primary/60 text-center block">
                Extensión del Activo
              </FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  // [FIX]: Forzamos a que el valor nulo se pase como indefinido para no romper Radix UI
                  value={field.value || undefined}
                  className="grid gap-3"
                >
                  {durationOptions.map((opt) => (
                    <label
                      key={opt.value}
                      className={cn(
                        "flex items-center justify-between px-5 md:px-6 py-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer ease-[cubic-bezier(0.16,1,0.3,1)]",
                        field.value === opt.value
                          ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(139,92,246,0.15)] scale-[1.02]"
                          : "border-white/5 bg-zinc-900/40 hover:bg-white/5 hover:border-white/10"
                      )}
                    >
                      <RadioGroupItem value={opt.value} className="sr-only" />
                      <div className="flex flex-col">
                        <span className="text-sm md:text-base font-black tracking-tight text-white uppercase">{opt.label}</span>
                      </div>
                      <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-zinc-500">
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
            <FormItem className="space-y-4">
              <FormLabel className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-primary/60 text-center block">
                Profundidad Cognitiva
              </FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  // [FIX]: Control de hidratación para Radix
                  value={field.value || undefined}
                  className="grid gap-3"
                >
                  {depthOptions.map((opt) => (
                    <label
                      key={opt.value}
                      className={cn(
                        "flex items-center justify-between px-5 md:px-6 py-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer ease-[cubic-bezier(0.16,1,0.3,1)]",
                        field.value === opt.value
                          ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(139,92,246,0.15)] scale-[1.02]"
                          : "border-white/5 bg-zinc-900/40 hover:bg-white/5 hover:border-white/10"
                      )}
                    >
                      <RadioGroupItem value={opt.value} className="sr-only" />
                      <div className="flex flex-col">
                        <span className="text-sm md:text-base font-black tracking-tight text-white uppercase">{opt.label}</span>
                      </div>
                      <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-zinc-500">
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

/**
 * NOTA TÉCNICA DEL ARCHITECT (V2.0):
 * 1. Sincronía Estricta de Contrato: Los valores (value) del array 'durationOptions'
 *    son ahora un espejo matemático del esquema de Zod, garantizando que el usuario 
 *    jamás se quede atascado en este paso por fallos de validación silenciosa.
 * 2. Gestión de Errores de Hidratación: Se cambió 'defaultValue' por un 'value' 
 *    controlado con fallback a 'undefined' para asegurar compatibilidad total con 
 *    el componente RadioGroup de Radix UI durante transiciones de React.
 * 3. Densidad Industrial: Se aumentaron los 'paddings' (px-5 py-4) y el radio 
 *    de borde a '2xl' para mejorar el 'Tap Target' en móviles.
 */