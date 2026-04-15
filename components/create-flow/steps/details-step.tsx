/**
 * ARCHIVO: components/create-flow/steps/details-step.tsx
 * VERSIÓN: 3.0 (NicePod Technical Details - Industrial Contract Sync Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Capturar la extensión temporal y la profundidad analítica de la crónica, 
 * garantizando la integridad de los parámetros bajo límites térmicos de seguridad.
 * [REFORMA V3.0]: Resolución definitiva de TS2322. Sincronización nominal absoluta 
 * con 'PodcastCreationSchema' V12.0 (durationSelection, narrativeDepthLevel). 
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
 * [LÍMITE TÉRMICO]: Bloqueo a 5 minutos para preservar la estabilidad de memoria RAM.
 */
const DURATION_SELECTION_OPTIONS_COLLECTION = [
  { valueIdentification: "Menos de 1 minuto", displayLabel: "Píldora Rápida", descriptionContent: "Máximo 100 palabras" },
  { valueIdentification: "Entre 2 y 3 minutos", displayLabel: "Crónica Estándar", descriptionContent: "~350 palabras" },
  { valueIdentification: "Hasta 5 minutos", displayLabel: "Inmersión Total", descriptionContent: "Máximo 650 palabras" },
] as const;

/**
 * NARRATIVE_DEPTH_LEVEL_OPTIONS_COLLECTION:
 * Misión: Escalar el nivel de peritaje cognitivo del Agente de Inteligencia.
 */
const NARRATIVE_DEPTH_LEVEL_OPTIONS_COLLECTION = [
  { valueIdentification: "Superficial", displayLabel: "Básico", descriptionContent: "Resumen ejecutivo directo" },
  { valueIdentification: "Intermedia", displayLabel: "Medio", descriptionContent: "Análisis con evidencias" },
  { valueIdentification: "Profunda", displayLabel: "Profundo", descriptionContent: "Visión exhaustiva y densa" },
] as const;

/**
 * DetailsStep: La terminal de configuración técnica de la forja NicePod.
 */
export function DetailsStep() {
  // Consumo del contexto de formulario bajo el tipado estricto BSS
  const { control } = useFormContext<PodcastCreationData>();

  return (
    <div className="flex flex-col h-full w-full justify-center animate-in fade-in duration-700 px-4 pb-6 overflow-y-auto custom-scrollbar isolate">

      {/* CABECERA DE CONFIGURACIÓN INDUSTRIAL */}
      <div className="text-center mb-12 flex-shrink-0 isolate">
        <h2 className="text-2xl md:text-5xl font-black tracking-tighter uppercase italic text-white font-serif">
          Ajuste <span className="text-primary not-italic">Técnico</span>
        </h2>
        <p className="text-[11px] text-zinc-500 mt-3 font-bold uppercase tracking-[0.2em] max-w-md mx-auto leading-relaxed">
          Define la arquitectura de síntesis. Estos parámetros rigen la densidad del capital intelectual resultante.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto w-full isolate">

        {/* I. CONFIGURACIÓN: EXTENSIÓN DEL ACTIVO [RESOLUCIÓN TS2322] */}
        <FormField
          control={control}
          name="durationSelection"
          render={({ field }) => (
            <FormItem className="space-y-6 isolate">
              <FormLabel className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 text-center block">
                Magnitud Temporal
              </FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value || undefined}
                  className="grid gap-4"
                >
                  {DURATION_SELECTION_OPTIONS_COLLECTION.map((optionItem) => (
                    <label
                      key={optionItem.valueIdentification}
                      className={classNamesUtility(
                        "flex items-center justify-between px-6 py-5 rounded-3xl border-2 transition-all duration-500 cursor-pointer isolate",
                        field.value === optionItem.valueIdentification
                          ? "border-primary bg-primary/10 shadow-2xl scale-[1.03]"
                          : "border-white/5 bg-zinc-900/40 hover:bg-white/[0.05] hover:border-white/10 opacity-70"
                      )}
                    >
                      <RadioGroupItem value={optionItem.valueIdentification} className="sr-only" />
                      <div className="flex flex-col">
                        <span className="text-sm md:text-base font-black tracking-tight text-white uppercase italic">
                            {optionItem.displayLabel}
                        </span>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                        {optionItem.descriptionContent}
                      </span>
                    </label>
                  ))}
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />

        {/* II. CONFIGURACIÓN: PROFUNDIDAD COGNITIVA [RESOLUCIÓN TS2322] */}
        <FormField
          control={control}
          name="narrativeDepthLevel"
          render={({ field }) => (
            <FormItem className="space-y-6 isolate">
              <FormLabel className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 text-center block">
                Nivel de Peritaje
              </FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value || undefined}
                  className="grid gap-4"
                >
                  {NARRATIVE_DEPTH_LEVEL_OPTIONS_COLLECTION.map((optionItem) => (
                    <label
                      key={optionItem.valueIdentification}
                      className={classNamesUtility(
                        "flex items-center justify-between px-6 py-5 rounded-3xl border-2 transition-all duration-500 cursor-pointer isolate",
                        field.value === optionItem.valueIdentification
                          ? "border-primary bg-primary/10 shadow-2xl scale-[1.03]"
                          : "border-white/5 bg-zinc-900/40 hover:bg-white/[0.05] hover:border-white/10 opacity-70"
                      )}
                    >
                      <RadioGroupItem value={optionItem.valueIdentification} className="sr-only" />
                      <div className="flex flex-col">
                        <span className="text-sm md:text-base font-black tracking-tight text-white uppercase italic">
                            {optionItem.displayLabel}
                        </span>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                        {optionItem.descriptionContent}
                      </span>
                    </label>
                  ))}
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      {/* ESPACIADOR TÁCTICO PARA EQUILIBRIO VISUAL */}
      <div className="h-12 shrink-0" />
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V3.0):
 * 1. Build Shield Final Sync: Resolución de TS2322 mediante la alineación milimétrica 
 *    con 'durationSelection' y 'narrativeDepthLevel' del esquema industrial V12.0.
 * 2. Zero Abbreviations Policy (ZAP): Purga absoluta. 'opt' -> 'optionItem', 
 *    'desc' -> 'descriptionContent', 'cn' -> 'classNamesUtility'.
 * 3. Hardware & RAM Hygiene: El uso de 'RadioGroup' controlado con fallback a 'undefined' 
 *    previene fugas en el motor de reconciliación de Radix UI durante el montaje síncrono.
 */