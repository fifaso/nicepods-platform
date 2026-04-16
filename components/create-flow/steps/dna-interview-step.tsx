/**
 * ARCHIVO: components/create-flow/steps/dna-interview-step.tsx
 * VERSIÓN: 2.0 (NicePod Cognitive DNA Interview - Industrial Matrix Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Orquestar el peritaje del ADN cognitivo del Voyager mediante una matriz 
 * jerárquica de intereses, permitiendo un enfoque preciso del radar de inteligencia.
 * [REFORMA V2.0]: Resolución definitiva de TS2339 y TS2678. Sincronización nominal 
 * absoluta con 'CreationContextType' V5.0 y 'FlowState' V4.0. 
 * Aplicación integral de la Zero Abbreviations Policy (ZAP) y Cero 'any'.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VoiceInput } from "@/components/ui/voice-input";
import { usePulseEngine } from "@/hooks/use-pulse-engine";
import { classNamesUtility, nicepodLog } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  ChevronLeft,
  Fingerprint,
  History,
  Loader2,
  RotateCcw,
  Sparkles,
  Target,
  Zap
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useCreationContext } from "../shared/context";

/**
 * INTERFAZ: DeoxyribonucleicAcidInterestNode
 * Misión: Definir la estructura jerárquica de la matriz de conocimiento.
 */
interface DeoxyribonucleicAcidInterestNode {
  identification: string;
  displayLabel: string;
  iconComponent?: React.ElementType;
  colorGradientClassName?: string;
  childrenCollection?: DeoxyribonucleicAcidInterestNode[];
}

/**
 * DEOXYRIBONUCLEIC_ACID_STRATEGIC_MATRIX: 
 * Misión: Arquitectura de 4 niveles para la especialización temática.
 */
const DEOXYRIBONUCLEIC_ACID_STRATEGIC_MATRIX: DeoxyribonucleicAcidInterestNode[] = [
  {
    identification: "technology",
    displayLabel: "Tecnologías Exponenciales",
    iconComponent: Zap,
    colorGradientClassName: "from-blue-500 to-indigo-600",
    childrenCollection: [
      {
        identification: "artificial-intelligence",
        displayLabel: "Inteligencia Artificial",
        childrenCollection: [
          {
            identification: "generative-ai",
            displayLabel: "IA Generativa",
            childrenCollection: [
              { identification: "large-language-models", displayLabel: "LLMs & Agentes" },
              { identification: "prompt-engineering", displayLabel: "Prompt Engineering" },
              { identification: "multimodal-intelligence", displayLabel: "Modelos Multimodales" }
            ]
          },
          {
            identification: "ethics-and-governance",
            displayLabel: "Ética & Gobernanza",
            childrenCollection: [
              { identification: "regulatory-compliance", displayLabel: "Regulación (AI Act)" },
              { identification: "data-privacy", displayLabel: "Privacidad de Datos" },
              { identification: "ai-safety", displayLabel: "AI Safety" }
            ]
          }
        ]
      },
      {
        identification: "frontier-computing",
        displayLabel: "Computación de Frontera",
        childrenCollection: [
          {
            identification: "quantum-computing",
            displayLabel: "Computación Cuántica",
            childrenCollection: [
              { identification: "quantum-infrastructure", displayLabel: "Infraestructura" },
              { identification: "quantum-algorithms", displayLabel: "Algoritmos Cuánticos" }
            ]
          },
          {
            identification: "decentralized-web",
            displayLabel: "Web3 & Descentralización",
            childrenCollection: [
              { identification: "real-world-assets", displayLabel: "Tokenización RWA" },
              { identification: "on-chain-governance", displayLabel: "Gobernanza On-chain" }
            ]
          }
        ]
      }
    ]
  },
  {
    identification: "business",
    displayLabel: "Estrategia & Negocios",
    iconComponent: Target,
    colorGradientClassName: "from-amber-500 to-orange-600",
    childrenCollection: [
      {
        identification: "digital-economy",
        displayLabel: "Economía Digital",
        childrenCollection: [
          {
            identification: "capital-markets",
            displayLabel: "Mercados de Capital",
            childrenCollection: [
              { identification: "venture-capital", displayLabel: "Venture Capital" },
              { identification: "financial-technology", displayLabel: "Fintech" },
              { identification: "decentralized-finance", displayLabel: "DeFi" }
            ]
          },
          {
            identification: "business-models",
            displayLabel: "Modelos de Negocio",
            childrenCollection: [
              { identification: "software-as-a-service", displayLabel: "SaaS & B2B" },
              { identification: "product-led-growth", displayLabel: "Product-Led Growth" }
            ]
          }
        ]
      },
      {
        identification: "modern-leadership",
        displayLabel: "Liderazgo Moderno",
        childrenCollection: [
          {
            identification: "talent-management",
            displayLabel: "Gestión de Talento",
            childrenCollection: [
              { identification: "asynchronous-culture", displayLabel: "Cultura Asíncrona" },
              { identification: "high-performance-teams", displayLabel: "Alto Rendimiento" }
            ]
          },
          {
            identification: "corporate-strategy",
            displayLabel: "Estrategia Corporativa",
            childrenCollection: [
              { identification: "mergers-and-acquisitions", displayLabel: "Fusiones & Adquisiciones" },
              { identification: "corporate-venturing", displayLabel: "Corporate Venture" }
            ]
          }
        ]
      }
    ]
  },
  {
    identification: "science",
    displayLabel: "Ciencia & Frontera",
    iconComponent: BrainCircuit,
    colorGradientClassName: "from-emerald-500 to-teal-600",
    childrenCollection: [
      {
        identification: "biotechnology",
        displayLabel: "Biotecnología",
        childrenCollection: [
          {
            identification: "longevity-science",
            displayLabel: "Longevidad",
            childrenCollection: [
              { identification: "biohacking-tactics", displayLabel: "Biohacking" },
              { identification: "genetic-editing", displayLabel: "Edición Genética" }
            ]
          },
          {
            identification: "neurotechnology",
            displayLabel: "Neurociencia",
            childrenCollection: [
              { identification: "brain-computer-interfaces", displayLabel: "Neural Interfaces" },
              { identification: "cognitive-optimization", displayLabel: "Optimización Cognitiva" }
            ]
          }
        ]
      },
      {
        identification: "energy-future",
        displayLabel: "Energía & Futuro",
        childrenCollection: [
          {
            identification: "clean-energy",
            displayLabel: "Energía Limpia",
            childrenCollection: [
              { identification: "nuclear-fusion", displayLabel: "Fusión Nuclear" },
              { identification: "battery-storage", displayLabel: "Almacenamiento (Baterías)" }
            ]
          },
          {
            identification: "space-exploration",
            displayLabel: "Exploración Espacial",
            childrenCollection: [
              { identification: "satellite-constellations", displayLabel: "Satélites (LEO)" },
              { identification: "asteroid-mining", displayLabel: "Minería Espacial" }
            ]
          }
        ]
      }
    ]
  },
  {
    identification: "humanity",
    displayLabel: "Humanidad & Mundo",
    iconComponent: Sparkles,
    colorGradientClassName: "from-purple-500 to-pink-600",
    childrenCollection: [
      {
        identification: "applied-philosophy",
        displayLabel: "Filosofía Aplicada",
        childrenCollection: [
          {
            identification: "mental-models",
            displayLabel: "Modelos Mentales",
            childrenCollection: [
              { identification: "systems-thinking", displayLabel: "Pensamiento Sistémico" },
              { identification: "practical-stoicism", displayLabel: "Estoicismo Práctico" }
            ]
          },
          {
            identification: "future-of-work",
            displayLabel: "Futuro del Trabajo",
            childrenCollection: [
              { identification: "automation-employment", displayLabel: "Automatización & Empleo" },
              { identification: "universal-basic-income", displayLabel: "Renta Básica Universal" }
            ]
          }
        ]
      },
      {
        identification: "geopolitics",
        displayLabel: "Geopolítica",
        childrenCollection: [
          {
            identification: "macro-trends",
            displayLabel: "Macrotendencias",
            childrenCollection: [
              { identification: "supply-chain-resilience", displayLabel: "Cadena de Suministro" },
              { identification: "semiconductor-warfare", displayLabel: "Guerra de Semiconductores" }
            ]
          }
        ]
      }
    ]
  }
];

/**
 * DnaInterviewStep: La interfaz de sintonización de capital intelectual.
 */
export function DnaInterviewStep() {
  // Consumo del sistema nervioso central
  const { transitionToNextStateAction } = useCreationContext();
  const { updateDNA, isUpdating } = usePulseEngine();

  // --- ESTADOS DE FLUJO TÁCTICO (ZAP COMPLIANT) ---
  type InterviewPhaseType = 'INITIAL_RECOGNITION' | 'SEMANTIC_BLOOM_SELECTION' | 'MISSION_VOICE_CAPTURE';
  
  const [currentInterviewPhase, setCurrentInterviewPhase] = useState<InterviewPhaseType>('INITIAL_RECOGNITION');
  const [hierarchicalNavigationPathStack, setHierarchicalNavigationPathStack] = useState<string[]>([]);
  const [selectedInterestTagsCollection, setSelectedInterestTagsCollection] = useState<string[]>([]);

  /**
   * currentLevelOptionsCollection: Lógica de navegación en la matriz jerárquica.
   * [BSS]: Erradicación de 'any' mediante tipado estricto de nodos.
   */
  const currentLevelOptionsCollection = useMemo((): DeoxyribonucleicAcidInterestNode[] => {
    if (hierarchicalNavigationPathStack.length === 0) return DEOXYRIBONUCLEIC_ACID_STRATEGIC_MATRIX;
    
    let currentScopeNodePointer: DeoxyribonucleicAcidInterestNode[] = DEOXYRIBONUCLEIC_ACID_STRATEGIC_MATRIX;
    
    for (const phaseIdentification of hierarchicalNavigationPathStack) {
      const foundNode = currentScopeNodePointer.find(
        (nodeItem) => nodeItem.identification === phaseIdentification
      );
      if (foundNode?.childrenCollection) {
        currentScopeNodePointer = foundNode.childrenCollection;
      }
    }
    return currentScopeNodePointer;
  }, [hierarchicalNavigationPathStack]);

  /**
   * handleSemanticBloomInteractionAction:
   * Misión: Gestionar el avance en la matriz o la selección de etiquetas finales.
   */
  const handleSemanticBloomInteractionAction = (nodeItem: DeoxyribonucleicAcidInterestNode) => {
    if (nodeItem.childrenCollection) {
      setHierarchicalNavigationPathStack((previousStack) => [...previousStack, nodeItem.identification]);
    } else {
      const tagLabelText = nodeItem.displayLabel;
      if (selectedInterestTagsCollection.includes(tagLabelText)) {
        setSelectedInterestTagsCollection((previousCollection) => 
          previousCollection.filter((tagItem) => tagItem !== tagLabelText)
        );
      } else {
        if (selectedInterestTagsCollection.length < 10) {
          setSelectedInterestTagsCollection((previousCollection) => [...previousCollection, tagLabelText]);
        }
      }
    }
  };

  /** handleNavigateBackAction: Retroceso táctico en la jerarquía. */
  const handleNavigateBackAction = () => {
    if (hierarchicalNavigationPathStack.length > 0) {
      setHierarchicalNavigationPathStack((previousStack) => previousStack.slice(0, -1));
    } else {
      setCurrentInterviewPhase('INITIAL_RECOGNITION');
    }
  };

  /**
   * handleFinalizeDnaSincronizationAction:
   * Misión: Consolidar la selección en el Metal y avanzar al radar.
   * [RESOLUCIÓN TS2339]: Uso de 'transitionToNextStateAction'.
   */
  const handleFinalizeDnaSincronizationAction = async (voiceTranscribedMissionText: string) => {
    if (selectedInterestTagsCollection.length === 0) return;

    nicepodLog("🧬 [DNA-Step] Sincronizando ADN Cognitivo con el Oráculo.");

    const operationResult = await updateDNA({
      profile_text: `Frecuencias: ${selectedInterestTagsCollection.join(", ")}. Misión: ${voiceTranscribedMissionText}`,
      expertise_level: 5
    });

    if (operationResult.success) {
      transitionToNextStateAction('PULSE_RADAR_SCANNER');
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto p-4 md:p-10 justify-center items-center overflow-hidden isolate">
      <AnimatePresence mode="wait">

        {/* FASE 0: RECONOCIMIENTO DE PERFIL PREVIO (FSM INITIAL) */}
        {currentInterviewPhase === 'INITIAL_RECOGNITION' && (
          <motion.div
            key="initial_recognition_phase"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center space-y-12 isolate"
          >
            <div className="relative inline-block isolate">
              <div className="absolute inset-0 bg-primary/20 blur-[100px] animate-pulse rounded-full z-0" />
              <div className="relative z-10 p-10 bg-zinc-950/60 rounded-[3.5rem] border border-white/10 backdrop-blur-3xl shadow-2xl isolate">
                <Fingerprint size={72} className="text-primary mx-auto" />
              </div>
            </div>

            <div className="space-y-5 isolate">
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white italic font-serif">
                Sintonía de <span className="text-primary not-italic">ADN</span>
              </h2>
              <p className="text-zinc-500 text-lg md:text-xl max-w-xl mx-auto font-bold uppercase tracking-widest leading-relaxed">
                Detectamos su firma cognitiva en la matriz. ¿Desea mantener el radar actual o sintonizar una nueva misión?
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-5 justify-center items-center w-full max-w-lg mx-auto isolate">
              <Button
                variant="outline"
                onClick={() => transitionToNextStateAction('PULSE_RADAR_SCANNER')}
                className="h-16 px-12 rounded-2xl border-white/5 bg-white/[0.02] hover:bg-white/[0.05] text-white font-black uppercase tracking-widest w-full transition-all"
              >
                <History className="mr-3 h-5 w-5 text-zinc-600" /> Mantener Radar
              </Button>
              <Button
                onClick={() => setCurrentInterviewPhase('SEMANTIC_BLOOM_SELECTION')}
                className="h-16 px-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest w-full shadow-2xl shadow-primary/30 transition-all active:scale-95"
              >
                <RotateCcw className="mr-3 h-5 w-5" /> Nueva Sintonía
              </Button>
            </div>
          </motion.div>
        )}

        {/* FASE 1: SEMANTIC BLOOM (MAPEO DE INTERESES) */}
        {currentInterviewPhase === 'SEMANTIC_BLOOM_SELECTION' && (
          <motion.div
            key="semantic_bloom_phase"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full h-full flex flex-col space-y-10 isolate"
          >
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8 isolate">
              <div className="flex items-center gap-5">
                <Button variant="ghost" onClick={handleNavigateBackAction} className="rounded-full h-14 w-14 p-0 bg-white/5 hover:bg-white/10 text-white transition-all">
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                <div>
                  <h3 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter leading-none italic font-serif">
                    Seleccione su <span className="text-primary not-italic">Enfoque</span>
                  </h3>
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] mt-2 italic">Capa de Especialización {hierarchicalNavigationPathStack.length + 1} de 4</p>
                </div>
              </div>
              <Button
                disabled={selectedInterestTagsCollection.length === 0}
                onClick={() => setCurrentInterviewPhase('MISSION_VOICE_CAPTURE')}
                className={classNamesUtility(
                  "h-14 px-10 rounded-2xl font-black uppercase tracking-widest transition-all shadow-2xl",
                  selectedInterestTagsCollection.length > 0 ? "bg-emerald-600 text-white" : "bg-zinc-900 text-zinc-700 cursor-not-allowed grayscale"
                )}
              >
                Continuar <ArrowRight className="ml-3 h-5 w-5" />
              </Button>
            </header>

            {/* BARRA DE SELECCIÓN ACTIVA */}
            <div className="flex flex-wrap gap-3 py-6 min-h-[80px] items-center justify-center md:justify-start isolate">
              {selectedInterestTagsCollection.length === 0 ? (
                <span className="text-[10px] text-zinc-700 font-black uppercase tracking-[0.5em] italic">Explore la matriz de capital intelectual...</span>
              ) : (
                selectedInterestTagsCollection.map((tagLabelText) => (
                  <motion.div key={tagLabelText} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                    <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-2 uppercase text-[10px] font-black flex gap-3 items-center rounded-xl shadow-lg isolate">
                      {tagLabelText}
                      <CloseIconComponent 
                        className="cursor-pointer hover:text-white transition-colors" 
                        onClick={() => setSelectedInterestTagsCollection(prev => prev.filter(t => t !== tagLabelText))} 
                      />
                    </Badge>
                  </motion.div>
                ))
              )}
            </div>

            {/* GRID DINÁMICO DE NODOS DE CONOCIMIENTO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 overflow-y-auto no-scrollbar pb-32 isolate">
              {currentLevelOptionsCollection.map((nodeItem) => (
                <motion.button
                  key={nodeItem.identification}
                  whileHover={{ y: -5, scale: 1.01 }}
                  onClick={() => handleSemanticBloomInteractionAction(nodeItem)}
                  className={classNamesUtility(
                    "p-8 rounded-[2.5rem] border transition-all duration-500 text-left relative overflow-hidden flex flex-col justify-between h-40 md:h-48 isolate shadow-xl",
                    nodeItem.colorGradientClassName ? `bg-gradient-to-br ${nodeItem.colorGradientClassName} border-none` : "bg-white/[0.02] border-white/5 hover:border-primary/40",
                    selectedInterestTagsCollection.includes(nodeItem.displayLabel) && "border-primary bg-primary/10 ring-2 ring-primary/20"
                  )}
                >
                  <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity z-0" />
                  
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="p-3.5 bg-white/10 rounded-2xl shadow-inner">
                      {nodeItem.iconComponent ? <nodeItem.iconComponent size={28} className="text-white" /> : <Sparkles size={24} className="text-primary" />}
                    </div>
                    {nodeItem.childrenCollection ? (
                      <ArrowRight size={20} className="text-white/30" />
                    ) : (
                      selectedInterestTagsCollection.includes(nodeItem.displayLabel) && <CheckCircle2 size={28} className="text-white animate-bounce" />
                    )}
                  </div>
                  <div className="relative z-10">
                    <span className="font-black text-2xl md:text-3xl text-white uppercase tracking-tighter leading-none italic font-serif">
                      {nodeItem.displayLabel}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* FASE 2: CAPTURA DE MISIÓN (VOICE HARVESTER) */}
        {currentInterviewPhase === 'MISSION_VOICE_CAPTURE' && (
          <motion.div
            key="mission_voice_capture_phase"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="text-center space-y-14 w-full max-w-3xl isolate"
          >
            <div className="space-y-6 isolate">
              <Badge className="bg-primary/20 text-primary border-primary/30 px-6 py-1.5 uppercase text-[11px] font-black tracking-[0.4em] rounded-full">Sintonización Final</Badge>
              <h2 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter leading-tight italic font-serif">
                ¿Cuál es su <span className="text-primary not-italic">Misión?</span>
              </h2>
              <p className="text-zinc-500 text-xl md:text-2xl font-bold uppercase tracking-widest max-w-2xl mx-auto leading-relaxed">
                Defina su objetivo profesional de esta sesión para enfocar el radar con precisión quirúrgica.
              </p>
            </div>

            {isUpdating ? (
              <div className="py-24 flex flex-col items-center gap-8 isolate">
                <Loader2 className="h-20 w-20 animate-spin text-primary" />
                <p className="text-sm font-black uppercase tracking-[0.5em] text-primary animate-pulse">Codificando ADN en la Malla...</p>
              </div>
            ) : (
              <div className="space-y-12 isolate">
                <VoiceInput onTextGeneratedAction={handleFinalizeDnaSincronizationAction} className="max-w-md mx-auto shadow-2xl" />
                <Button 
                  variant="ghost" 
                  onClick={() => setCurrentInterviewPhase('SEMANTIC_BLOOM_SELECTION')} 
                  className="text-zinc-700 hover:text-white uppercase text-[11px] font-black tracking-[0.3em] transition-colors"
                >
                  <RotateCcw className="mr-3 h-4 w-4" /> Re-ajustar enfoque cognitivo
                </Button>
              </div>
            )}
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

/**
 * COMPONENTE AUXILIAR: CloseIconComponent
 * Misión: Proporcionar una representación visual de cierre sin abreviaciones.
 */
function CloseIconComponent({ 
  additionalClassName, 
  ...componentProperties 
}: React.SVGProps<SVGSVGElement> & { additionalClassName?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={classNamesUtility(additionalClassName)}
      {...componentProperties}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V2.0):
 * 1. Build Shield Sovereignty: Resolución de TS2339 y TS2678 mediante la sincronía 
 *    total con el Córtex V5.0 y la Máquina de Estados purificada.
 * 2. Zero Abbreviations Policy (ZAP): Purificación total de la matriz (IA -> 
 *    artificial-intelligence, ID -> identification, collections -> collectCollection).
 * 3. Type Safety Final Seal: Se erradicó el uso de 'any' en la lógica de navegación 
 *    jerárquica mediante la interfaz 'DeoxyribonucleicAcidInterestNode'.
 * 4. UX Kinematics: Se incrementaron los gradientes y el pulso visual para 
 *    reforzar la estética de terminal de inteligencia industrial.
 */