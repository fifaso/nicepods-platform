// components/create-flow/purpose-selection-step.tsx
// VERSIÓN: 12.0 (Master Categorization - Local Soul Integration)

"use client";

import { useCreationContext } from "../podcast-creation-form";
import { 
  Lightbulb, 
  Link as LinkIcon, 
  PenSquare, 
  HelpCircle, 
  MapPin, 
  ArrowRight,
  Compass,
  Palette,
  ScrollText
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ESTRUCTURA DE CATEGORÍAS Y OPCIONES
 * Definición profesional de la taxonomía de creación de NicePod.
 */
const SECTIONS = [
  {
    label: "Creatividad",
    icon: <Palette className="h-3 w-3" />,
    options: [
      { 
        purpose: "learn", 
        style: "solo", 
        agentName: "solo-talk-analyst", 
        nextState: "LEARN_SUB_SELECTION", 
        icon: <Lightbulb className="h-5 w-5 text-amber-500" />, 
        title: "Aprender", 
        description: "Desglosa conceptos complejos con claridad." 
      },
      { 
        purpose: "explore", 
        style: "link", 
        agentName: "link-points-synthesizer", 
        nextState: "LINK_POINTS_INPUT", 
        icon: <LinkIcon className="h-5 w-5 text-blue-500" />, 
        title: "Explorar", 
        description: "Encuentra el hilo conductor entre dos ideas." 
      },
      { 
        purpose: "answer", 
        style: "qa", 
        agentName: "qa-agent", 
        nextState: "QUESTION_INPUT", 
        icon: <HelpCircle className="h-5 w-5 text-rose-500" />, 
        title: "Preguntar", 
        description: "Respuestas directas a dudas específicas." 
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
        icon: <PenSquare className="h-5 w-5 text-emerald-500" />, 
        title: "Reflexionar", 
        description: "Lecciones de vida y testimonios personales." 
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
        icon: <MapPin className="h-5 w-5 text-indigo-500" />, 
        title: "Vive lo local", 
        description: "Secretos y guías del sitio donde estás hoy.",
        isNew: true 
      }
    ]
  }
];

export function PurposeSelectionStep() {
  const { updateFormData, transitionTo } = useCreationContext();

  const handleSelect = (option: any) => {
    // ACTUALIZACIÓN QUIRÚRGICA: 
    // Sincronizamos con el Schema v4.0 e inicializamos metadatos de transparencia.
    updateFormData({ 
        purpose: option.purpose, 
        style: option.style, 
        agentName: option.agentName,
        sources: [], // Aseguramos que la investigación empiece desde cero
        creation_mode: 'standard'
    });
    transitionTo(option.nextState);
  };

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto items-center animate-in fade-in duration-700 px-4 md:px-0">
      
      {/* CABECERA MINIMALISTA */}
      <div className="text-center mb-8 mt-4 md:mt-2">
        <h2 className="text-2xl md:text-4xl font-black tracking-tighter text-foreground bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60">
          ¿Cuál es tu intención?
        </h2>
        <p className="text-sm text-muted-foreground mt-2 font-medium">
          Selecciona una rama de conocimiento para iniciar el escaneo de IA.
        </p>
      </div>
      
      {/* SECCIONES CATEGORIZADAS */}
      <div className="w-full space-y-10 pb-20 overflow-y-auto custom-scrollbar-hide">
        {SECTIONS.map((section) => (
          <div key={section.label} className="space-y-4 animate-in slide-in-from-bottom-2 duration-500">
            
            {/* ETIQUETA DE CATEGORÍA */}
            <div className="flex items-center gap-2 px-1">
                <div className="p-1 rounded-md bg-primary/10 text-primary">
                    {section.icon}
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
                    {section.label}
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-border/50 to-transparent ml-2" />
            </div>

            {/* GRID DE OPCIONES */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {section.options.map((option) => (
                <button
                  key={option.purpose}
                  onClick={() => handleSelect(option)}
                  className={cn(
                    "group relative flex flex-col items-start text-left transition-all duration-300",
                    "p-5 bg-card/20 hover:bg-card/60 backdrop-blur-md",
                    "border border-border/40 hover:border-primary/40",
                    "rounded-2xl shadow-sm hover:shadow-2xl active:scale-[0.98] overflow-hidden"
                  )}
                >
                  {option.isNew && (
                    <div className="absolute top-0 right-0 px-2 py-1 bg-primary text-[8px] font-black text-white uppercase tracking-tighter rounded-bl-lg">
                        Nuevo
                    </div>
                  )}

                  <div className="flex items-center justify-between w-full mb-3">
                    <div className="p-3 rounded-xl bg-background/50 border border-border/20 shadow-inner group-hover:scale-110 group-hover:border-primary/20 transition-all duration-500">
                      {option.icon}
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground/30 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                        {option.title}
                    </h3>
                    <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2 font-medium opacity-80 group-hover:opacity-100 transition-opacity">
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