// components/create-flow/steps/purpose-selection-step.tsx
// VERSIÓN: 13.1 (Professional Architecture - Type Safety & Zero Scroll Optimized)

"use client";

import React from "react";
import { useCreationContext } from "../shared/context";
import { 
  Lightbulb, 
  Link as LinkIcon, 
  PenSquare, 
  HelpCircle, 
  MapPin, 
  ArrowRight,
  Compass,
  Palette,
  ScrollText,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FlowState } from "../shared/types";

/**
 * INTERFAZ DE OPCIÓN DE PROPÓSITO
 * Define el contrato estricto para evitar errores de compilación en Vercel.
 */
interface PurposeOption {
  purpose: 'learn' | 'explore' | 'answer' | 'reflect' | 'local_soul' | 'freestyle';
  style?: 'solo' | 'link' | 'legacy' | 'qa' | 'local_concierge';
  agentName: string;
  nextState: FlowState;
  icon: React.ReactNode;
  title: string;
  description: string;
  isNew?: boolean;
}

interface Section {
  label: string;
  icon: React.ReactNode;
  options: PurposeOption[];
}

const SECTIONS: Section[] = [
  {
    label: "Creatividad",
    icon: <Palette className="h-3 w-3" />,
    options: [
      { 
        purpose: "learn", 
        style: "solo", 
        agentName: "solo-talk-analyst", 
        nextState: "LEARN_SUB_SELECTION", 
        icon: <Lightbulb className="h-4 w-4 text-amber-500" />, 
        title: "Aprender", 
        description: "Desglosa conceptos complejos." 
      },
      { 
        purpose: "explore", 
        style: "link", 
        agentName: "link-points-synthesizer", 
        nextState: "LINK_POINTS_INPUT", 
        icon: <LinkIcon className="h-4 w-4 text-blue-500" />, 
        title: "Explorar", 
        description: "Conecta dos ideas distintas." 
      },
      { 
        purpose: "answer", 
        style: "qa", 
        agentName: "qa-agent", 
        nextState: "QUESTION_INPUT", 
        icon: <HelpCircle className="h-4 w-4 text-rose-500" />, 
        title: "Preguntar", 
        description: "Respuestas directas a dudas." 
      },
    ]
  },
  {
    label: "Legado",
    icon: <ScrollText className="h-3 w-3" />,
    options: [
      { 
        purpose: "reflect", 
        style: "legacy", 
        agentName: "legacy-agent", 
        nextState: "LEGACY_INPUT", 
        icon: <PenSquare className="h-4 w-4 text-emerald-500" />, 
        title: "Reflexionar", 
        description: "Lecciones y testimonios personales." 
      }
    ]
  },
  {
    label: "Entorno",
    icon: <Compass className="h-3 w-3" />,
    options: [
      { 
        purpose: "local_soul", 
        style: "local_concierge", 
        agentName: "local-concierge-v1", 
        nextState: "LOCAL_DISCOVERY_STEP", 
        icon: <MapPin className="h-4 w-4 text-indigo-500" />, 
        title: "Vive lo local", 
        description: "Secretos del sitio donde estás hoy.",
        isNew: true 
      }
    ]
  }
];

export function PurposeSelectionStep() {
  const { updateFormData, transitionTo } = useCreationContext();

  const handleSelect = (option: PurposeOption) => {
    // Sincronización con el Schema v4.0 (Garantía de Custodia de Datos)
    updateFormData({ 
        purpose: option.purpose, 
        style: option.style, 
        agentName: option.agentName,
        sources: [], // Inicialización limpia para transparencia
        creation_mode: 'standard'
    });
    transitionTo(option.nextState);
  };

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto items-center animate-in fade-in duration-700 px-3 md:px-0 overflow-hidden">
      
      {/* CABECERA COMPACTA: Optimizada para ahorrar espacio vertical */}
      <div className="text-center mb-5 pt-2 flex-shrink-0">
        <h2 className="text-xl md:text-2xl font-black tracking-tight text-foreground">
          ¿Cuál es tu intención?
        </h2>
        <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 font-medium uppercase tracking-widest opacity-60">
          Elige una rama para iniciar el escaneo de IA
        </p>
      </div>
      
      {/* SECCIONES: Contenedor elástico para evitar scroll */}
      <div className="w-full space-y-4 pb-6 flex-grow min-h-0 overflow-y-auto custom-scrollbar-hide">
        {SECTIONS.map((section) => (
          <div key={section.label} className="space-y-2 animate-in slide-in-from-bottom-1 duration-500">
            
            {/* ETIQUETA DE CATEGORÍA MINIMALISTA */}
            <div className="flex items-center gap-2 px-1">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/70">
                    {section.label}
                </span>
                <div className="flex-1 h-px bg-primary/10" />
            </div>

            {/* GRID DE BOTONES HORIZONTALES */}
            <div className="grid grid-cols-1 gap-2">
              {section.options.map((option) => (
                <button
                  key={option.purpose}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={cn(
                    "group relative flex items-center text-left transition-all duration-300",
                    "p-2.5 md:p-3 bg-white/5 hover:bg-white/10 backdrop-blur-md",
                    "border border-white/5 hover:border-primary/30",
                    "rounded-xl active:scale-[0.99] overflow-hidden"
                  )}
                >
                  {option.isNew && (
                    <div className="absolute top-0 right-0 px-1.5 py-0.5 bg-primary text-[7px] font-black text-white uppercase tracking-tighter rounded-bl-md shadow-sm">
                        <Zap className="h-2 w-2 inline mr-0.5 fill-current" /> Nuevo
                    </div>
                  )}

                  {/* ICONO IZQUIERDA */}
                  <div className="flex-shrink-0 mr-4">
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-background/40 border border-white/5 shadow-inner group-hover:bg-primary/20 group-hover:border-primary/30 transition-all duration-500">
                      {option.icon}
                    </div>
                  </div>

                  {/* TEXTO DERECHA */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                        {option.title}
                      </h3>
                      <ArrowRight className="h-3 w-3 text-primary/30 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-tight truncate opacity-80 group-hover:opacity-100">
                      {option.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}