/**
 * ARCHIVO: components/create-flow/steps/style-selection.tsx
 * VERSIÓN: 4.0 (NicePod Style Selection - Industrial Contract Sync Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Proyectar y capturar el estilo narrativo del activo acústico, 
 * garantizando la sintonía absoluta entre la intención del Voyager y el 
 * esquema de validación industrial.
 * [REFORMA V4.0]: Resolución definitiva de TS2769, TS2367 y TS2322. 
 * Sincronización nominal absoluta con 'styleSelection' del esquema V12.0. 
 * Aplicación integral de la Zero Abbreviations Policy (ZAP).
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { Mic, Link as LinkIcon, GraduationCap, Theater } from "lucide-react";

// --- INFRAESTRUCTURA DE SOBERANÍA Y COMPONENTES ---
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { SelectionCard } from "@/components/ui/selection-card"; 
import { classNamesUtility } from "@/lib/utils";

/**
 * STYLE_OPTIONS_COLLECTION: 
 * Catálogo de formatos de forja con semántica visual estricta.
 */
const STYLE_OPTIONS_COLLECTION = [
  { 
    valueIdentification: "solo", 
    displayLabelText: "Monólogo", 
    descriptionContentText: "Un tema, una motivación, una voz experta.", 
    iconComponent: Mic 
  },
  { 
    valueIdentification: "link", 
    displayLabelText: "Unir Ideas", 
    descriptionContentText: "Conecta dos conceptos con narrativas de IA.", 
    iconComponent: LinkIcon 
  },
  { 
    valueIdentification: "archetype", 
    displayLabelText: "Arquetipo", 
    descriptionContentText: "Usa estructuras narrativas clásicas.", 
    iconComponent: Theater 
  },
  { 
    valueIdentification: "legacy", 
    displayLabelText: "Plan de Aprendizaje", 
    descriptionContentText: "Serie de podcasts interconectados.", 
    iconComponent: GraduationCap, 
    badgeText: "Próximamente", 
    isOptionDisabledStatus: true 
  },
] as const;

/**
 * StyleSelectionStep: La terminal de selección de estilo para la forja de contenido.
 */
export function StyleSelectionStep() {
  const { watch, setValue } = useFormContext<PodcastCreationData>();
  
  /** [RESOLUCIÓN TS2769]: Alineación con 'styleSelection' del esquema V12.0. */
  const selectedStyleSelectionValue = watch('styleSelection');

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto py-10 px-4 isolate">
      <header className="text-center mb-12 isolate">
        <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic text-white font-serif">
          Elige tu <span className="text-primary not-italic">Estilo</span>
        </h2>
        <p className="text-[10px] md:text-xs text-zinc-500 font-bold uppercase tracking-[0.3em] mt-4">
          ¿Cómo quieres darle vida a tu idea?
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow isolate">
        {STYLE_OPTIONS_COLLECTION.map((optionItem) => (
          <SelectionCard
            key={optionItem.valueIdentification}
            icon={optionItem.iconComponent}
            title={optionItem.displayLabelText}
            description={optionItem.descriptionContentText}
            isSelected={selectedStyleSelectionValue === optionItem.valueIdentification}
            /** 
             * [RESOLUCIÓN TS2367]: Mapeo industrial de clic. 
             * Se purifica el tipo de entrada para asegurar compatibilidad con el esquema.
             */
            onClick={optionItem.isOptionDisabledStatus ? undefined : () => 
              setValue('styleSelection', optionItem.valueIdentification as "solo" | "link" | "archetype", { shouldValidate: true })
            }
            badgeText={optionItem.badgeText}
            disabled={optionItem.isOptionDisabledStatus}
          />
        ))}
      </div>
      
      {/* ESPACIADOR TÁCTICO */}
      <div className="h-10 shrink-0" />
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V4.0):
 * 1. Build Shield Absolute: Resolución definitiva de TS2769, TS2367 y TS2322 mediante la 
 *    sincronización con 'styleSelection' del esquema V12.0.
 * 2. Zero Abbreviations Policy: Purificación total. 'opt' -> 'optionItem', 'cn' -> 
 *    'classNamesUtility', 'val' -> 'valueIdentification'.
 * 3. Atomic Typing: Se ha sellado el contrato de selección evitando 'as any' y 
 *    garantizando que el valor seleccionado pertenezca al dominio definido en el esquema Zod.
 */