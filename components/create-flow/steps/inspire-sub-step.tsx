/**
 * ARCHIVO: components/create-flow/steps/inspire-sub-step.tsx
 * VERSIÓN: 7.0 (NicePod Inspire Sub-Step - Industrial Style Synchronization)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Proveer una interfaz de selección táctica para formatos de inspiración, 
 * garantizando la sintonía entre la intención creativa y el flujo de captura.
 * [REFORMA V7.0]: Resolución definitiva de TS2339 y TS2345. Sincronización nominal 
 * absoluta con 'CreationContextType' V5.0 y 'styleSelection' del esquema V12.0.
 * Aplicación integral de la Zero Abbreviations Policy (ZAP).
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { Card } from "@/components/ui/card";
import { classNamesUtility, nicepodLog } from "@/lib/utils";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { Mic, Zap } from "lucide-react";
import React from "react";
import { useFormContext } from "react-hook-form";
import { useCreationContext } from "../shared/context";

/**
 * INTERFAZ: InspireNarrativeOptionDefinition
 * Misión: Definir el contrato visual y técnico para las opciones de inspiración.
 */
interface InspireNarrativeOptionDefinition {
  identification: string;
  displayTitleText: string;
  descriptionContentText: string;
  iconComponent: React.ElementType;
  tailwindColorClassName: string;
  backgroundHighlightClassName: string;
}

/**
 * INSPIRE_NARRATIVE_OPTIONS_COLLECTION:
 * Misión: Catálogo estandarizado de formatos creativos para el flujo Inspire.
 */
const INSPIRE_NARRATIVE_OPTIONS_COLLECTION: InspireNarrativeOptionDefinition[] = [
  {
    identification: "solo_talk",
    displayTitleText: "Voz en Solitario",
    descriptionContentText: "Una reflexión directa y auténtica sobre un eje que le apasione.",
    iconComponent: Mic,
    tailwindColorClassName: "text-blue-500",
    backgroundHighlightClassName: "bg-blue-500/10"
  },
  {
    identification: "conceptual_bridge",
    displayTitleText: "Puente de Ideas",
    descriptionContentText: "Conecte dos conceptos aparentemente distantes en un nuevo nodo.",
    iconComponent: Zap,
    tailwindColorClassName: "text-purple-500",
    backgroundHighlightClassName: "bg-purple-500/10"
  }
] as const;

/**
 * InspireSubStep: La terminal de decisión para la chispa creativa.
 */
export function InspireSubStep() {
  // Consumo del motor de formularios bajo tipado estricto BSS
  const { setValue } = useFormContext<PodcastCreationData>();
  
  /** [RESOLUCIÓN TS2339]: Consumo de la autoridad de navegación purificada V5.0. */
  const { transitionToNextStateAction } = useCreationContext();

  /**
   * handleInspirationSelectionAction:
   * Misión: Configurar el estilo narrativo y disparar la transición cinemática.
   * [RESOLUCIÓN TS2345]: Sincronía con 'styleSelection' del PodcastCreationSchema V12.0.
   */
  const handleInspirationSelectionAction = (optionIdentification: string) => {
    nicepodLog(`✨ [Inspire-Selection] Formato seleccionado: ${optionIdentification}`);

    /** 
     * Sincronizamos el estilo de creación. 
     * Nota: Mapeamos a 'solo' como modo base para este sub-flujo de inspiración.
     */
    setValue("styleSelection", "solo", { shouldValidate: true });

    // Navegación balística hacia el lienzo de captura cognitiva
    transitionToNextStateAction('SOLO_TALK_INPUT_FIELD');
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 max-w-4xl mx-auto px-6 py-4 isolate">
      
      {/* I. CABECERA: Identidad Visual de Inspiración */}
      <header className="text-center space-y-3 isolate">
        <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic text-white font-serif">
          ¿Cómo desea <span className="text-primary not-italic">Inspirar?</span>
        </h2>
        <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-[0.3em] max-w-md mx-auto">
            Seleccione el formato industrial para su chispa creativa.
        </p>
      </header>

      {/* II. GRID DE OPCIONES TÁCTICAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 isolate">
        {INSPIRE_NARRATIVE_OPTIONS_COLLECTION.map((optionItem) => {
          const OptionIconComponent = optionItem.iconComponent;

          return (
            <Card
              key={optionItem.identification}
              onClick={() => handleInspirationSelectionAction(optionItem.identification)}
              className="p-10 rounded-[2.5rem] bg-[#0a0a0a]/60 backdrop-blur-3xl border-white/5 hover:border-primary/40 cursor-pointer transition-all duration-500 group shadow-2xl isolate overflow-hidden"
            >
              {/* Contenedor de Iconografía con Magnetismo Visual */}
              <div className={classNamesUtility(
                "p-5 rounded-2xl w-fit mb-8 transition-transform duration-700 group-hover:scale-110 shadow-inner", 
                optionItem.backgroundHighlightClassName
              )}>
                <OptionIconComponent 
                  className={classNamesUtility("h-10 w-10", optionItem.tailwindColorClassName)} 
                />
              </div>

              <div className="space-y-3 relative z-10">
                <h3 className="text-2xl font-black text-white uppercase tracking-tight italic font-serif">
                    {optionItem.displayTitleText}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                  {optionItem.descriptionContentText}
                </p>
              </div>

              {/* Marca de agua decorativa interna */}
              <div className="absolute -bottom-6 -right-6 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-1000">
                <OptionIconComponent size={120} />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V7.0):
 * 1. Build Shield Sovereignty: Resolución definitiva de TS2339 y TS2345 mediante 
 *    la sincronización con el contexto V5.0 y el esquema purificado.
 * 2. Zero Abbreviations Policy (ZAP): Purificación total del componente. 
 *    'option' -> 'optionItem', 'bg' -> 'backgroundHighlightClassName', 'id' -> 'identification'.
 * 3. Kinematic Stability: El uso de 'classNamesUtility' y transiciones de 500ms 
 *    asegura que la interactividad sea coherente con la fluidez cinemática de la terminal.
 */