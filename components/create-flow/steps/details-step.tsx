/**
 * ARCHIVO: components/create-flow/steps/details-step.tsx
 * VERSIÓN: 4.0 (NicePod Technical Details - BSS Final Seal Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Capturar la extensión temporal y la profundidad analítica de la crónica, 
 * garantizando la integridad de los parámetros bajo límites térmicos de seguridad 
 * y sincronía absoluta con el motor de validación.
 * [REFORMA V4.0]: Resolución definitiva de TS2322 mediante la alineación nominal 
 * con 'durationSelection' y 'narrativeDepthLevel' del esquema V12.0. 
 * Aplicación integral de la Zero Abbreviations Policy (ZAP).
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { classNamesUtility } from "@/lib/utils";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { useFormContext } from "react-hook-form";

/**
 * DURATION_SELECTION_OPTIONS_COLLECTION:
 * Misión: Definir los límites de extensión sincronizados con el motor de audio.
 * [LÍMITE TÉRMICO]: Bloqueo a 5 minutos para preservar la estabilidad de memoria RAM 
 * en las Edge Functions del Metal (Deno/Supabase).
 */
const DURATION_SELECTION_OPTIONS_COLLECTION = [
  { 
    valueIdentification: "Menos de 1 minuto", 
    displayLabel: "Píldora Rápida", 
    descriptionContentText: "Máximo 100 palabras" 
  },
  { 
    valueIdentification: "Entre 2 y 3 minutos", 
    displayLabel: "Crónica Estándar", 
    descriptionContentText: "~350 palabras" 
  },
  { 
    valueIdentification: "Hasta 5 minutos", 
    displayLabel: "Inmersión Total", 
    descriptionContentText: "Máximo 650 palabras" 
  },
] as const;

/**
 * NARRATIVE_DEPTH_LEVEL_OPTIONS_COLLECTION:
 * Misión: Escalar el nivel de peritaje cognitivo solicitado al Oráculo de Inteligencia.
 */
const NARRATIVE_DEPTH_LEVEL_OPTIONS_COLLECTION = [
  { 
    valueIdentification: "Superficial", 
    displayLabel: "Básico", 
    descriptionContentText: "Resumen ejecutivo directo" 
  },
  { 
    valueIdentification: "Intermedia", 
    displayLabel: "Medio", 
    descriptionContentText: "Análisis con evidencias" 
  },
  { 
    valueIdentification: "Profunda", 
    displayLabel: "Profundo", 
    descriptionContentText: "Visión exhaustiva y densa" 
  },
] as const;

/**
 * DetailsStep: La terminal de configuración técnica de la forja NicePod.
 */
export function DetailsStep() {
  // Consumo del motor de formularios bajo el tipado estricto BSS
  const { control } = useFormContext<PodcastCreationData>();

  return (
    <div className="flex flex-col h-full w-full justify-center animate-in fade-in duration-700 px-4 pb-6 overflow-y-auto custom-scrollbar-hide isolate">

      {/* I. CABECERA DE CONFIGURACIÓN INDUSTRIAL */}
      <div className="text-center mb-10 flex-shrink-0 isolate">
        <h2 className="text-2xl md:text-5xl font-black tracking-tighter uppercase italic text-white font-serif">
          Ajuste <span className="text-primary not-italic">Técnico</span>
        </h2>
        <p className="text-[11px] text-zinc-500 mt-3 font-bold uppercase tracking-[0.2em] max-w-md mx-auto leading-relaxed">
          Define la arquitectura de síntesis. Estos límites garantizan una materialización acústica de alta fidelidad.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto w-full isolate">

        {/* II. CAMPO: MAGNITUD TEMPORAL [RESOLUCIÓN TS2322] */}
        <FormField
          control={control}
          name="durationSelection"
          render={({ field }) => (
            <FormItem className="space-y-6 isolate">
              <FormLabel className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-primary/60 text-center block">
                Extensión del Activo
              </FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  /** 
                   * Sincronía con Radix UI: Forzamos el valor o 'undefined' 
                   * para prevenir errores de hidratación.
                   */
                  value={field.value || undefined}
                  className="grid gap-3"
                >
                  {DURATION_SELECTION_OPTIONS_COLLECTION.map((optionItem) => (
                    <label
                      key={optionItem.valueIdentification}
                      className={classNamesUtility(
                        "flex items-center justify-between px-6 py-5 rounded-3xl border-2 transition-all duration-500 cursor-pointer ease-[cubic-bezier(0.16,1,0.3,1)] isolate",
                        field.value === optionItem.valueIdentification
                          ? "border-primary bg-primary/10 shadow-[0_0_30px_rgba(139,92,246,0.1)] scale-[1.03]"
                          : "border-white/5 bg-zinc-900/40 hover:bg-white/[0.05] hover:border-white/10"
                      )}
                    >
                      <RadioGroupItem value={optionItem.valueIdentification} className="sr-only" />
                      <div className="flex flex-col">
                        <span className="text-sm md:text-base font-black tracking-tight text-white uppercase italic">
                            {optionItem.displayLabel}
                        </span>
                      </div>
                      <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        {optionItem.descriptionContentText}
                      </span>
                    </label>
                  ))}
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />

        {/* III. CAMPO: PROFUNDIDAD COGNITIVA [RESOLUCIÓN TS2322] */}
        <FormField
          control={control}
          name="narrativeDepthLevel"
          render={({ field }) => (
            <FormItem className="space-y-6 isolate">
              <FormLabel className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-primary/60 text-center block">
                Nivel de Peritaje
              </FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value || undefined}
                  className="grid gap-3"
                >
                  {NARRATIVE_DEPTH_LEVEL_OPTIONS_COLLECTION.map((optionItem) => (
                    <label
                      key={optionItem.valueIdentification}
                      className={classNamesUtility(
                        "flex items-center justify-between px-6 py-5 rounded-3xl border-2 transition-all duration-500 cursor-pointer ease-[cubic-bezier(0.16,1,0.3,1)] isolate",
                        field.value === optionItem.valueIdentification
                          ? "border-primary bg-primary/10 shadow-[0_0_30px_rgba(139,92,246,0.1)] scale-[1.03]"
                          : "border-white/5 bg-zinc-900/40 hover:bg-white/[0.05] hover:border-white/10"
                      )}
                    >
                      <RadioGroupItem value={optionItem.valueIdentification} className="sr-only" />
                      <div className="flex flex-col">
                        <span className="text-sm md:text-base font-black tracking-tight text-white uppercase italic">
                            {optionItem.displayLabel}
                        </span>
                      </div>
                      <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        {optionItem.descriptionContentText}
                      </span>
                    </label>
                  ))}
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      {/* Margen de equilibrio táctico para el Shell */}
      <div className="h-10 shrink-0" />
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V4.0):
 * 1. Build Shield Sovereignty: Resolución de TS2322 mediante la sincronización 
 *    absoluta con 'durationSelection' y 'narrativeDepthLevel' del esquema purificado.
 * 2. Zero Abbreviations Policy (ZAP): Purga total de términos. 'opt' -> 'optionItem', 
 *    'desc' -> 'descriptionContentText', 'cn' -> 'classNamesUtility'.
 * 3. Thermal Awareness: Los valores mapeados garantizan que el motor de síntesis 
 *    reciba parámetros validados, evitando desbordamientos en la materialización acústica.
 */