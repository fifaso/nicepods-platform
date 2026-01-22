// components/create-flow/steps/dna-interview-step.tsx
// VERSIÓN: 1.0 (Hybrid DNA Tuning - Semantic Bloom & Voice Intent)

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VoiceInput } from "@/components/ui/voice-input";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  ChevronLeft,
  RotateCcw,
  Sparkles,
  Target,
  Zap
} from "lucide-react";
import { useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useCreationContext } from "../shared/context";

// --- CONSTANTES: MATRIZ DE INTELIGENCIA (4 NIVELES) ---
const DNA_MATRIX = [
  {
    id: "tech",
    label: "Tecnologías Exponenciales",
    icon: Zap,
    color: "from-blue-500 to-indigo-600",
    children: [
      {
        id: "ia",
        label: "Inteligencia Artificial",
        children: [
          {
            id: "generative",
            label: "IA Generativa",
            children: [{ id: "llms", label: "LLMs & Agentes" }, { id: "prompt", label: "Prompt Engineering" }]
          },
          {
            id: "ethics",
            label: "Ética & Gobernanza",
            children: [{ id: "reg", label: "Regulación (AI Act)" }, { id: "privacy", label: "Privacidad" }]
          }
        ]
      },
      {
        id: "frontier",
        label: "Computación de Frontera",
        children: [
          { id: "quantum", label: "Computación Cuántica", children: [{ id: "qubits", label: "Infraestructura" }] },
          { id: "web3", label: "Web3", children: [{ id: "rwa", label: "Tokenización RWA" }] }
        ]
      }
    ]
  },
  {
    id: "biz",
    label: "Estrategia & Negocios",
    icon: Target,
    color: "from-amber-500 to-orange-600",
    children: [
      {
        id: "economy",
        label: "Economía Digital",
        children: [
          { id: "capital", label: "Mercados de Capital", children: [{ id: "vc", label: "Venture Capital" }, { id: "fintech", label: "Fintech" }] },
          { id: "models", label: "Modelos de Negocio", children: [{ id: "saas", label: "SaaS & PLG" }] }
        ]
      },
      {
        id: "leadership",
        label: "Liderazgo Moderno",
        children: [
          { id: "talent", label: "Gestión de Talento", children: [{ id: "async", label: "Cultura Asíncrona" }] },
          { id: "corp", label: "Estrategia Corp.", children: [{ id: "m-a", label: "M&A Digital" }] }
        ]
      }
    ]
  },
  {
    id: "science",
    label: "Ciencia & Frontera",
    icon: BrainCircuit,
    color: "from-emerald-500 to-teal-600",
    children: [
      {
        id: "health",
        label: "Biotecnología",
        children: [
          { id: "longevity", label: "Longevidad", children: [{ id: "biohacking", label: "Biohacking" }] },
          { id: "neuro", label: "Neurociencia", children: [{ id: "bci", label: "Neural Interfaces" }] }
        ]
      }
    ]
  },
  {
    id: "humanity",
    label: "Humanidad & Mundo",
    icon: Sparkles,
    color: "from-purple-500 to-pink-600",
    children: [
      {
        id: "phil",
        label: "Filosofía Aplicada",
        children: [
          { id: "mental", label: "Modelos Mentales", children: [{ id: "systems", label: "Pensamiento Sistémico" }] },
          { id: "future-work", label: "Futuro del Trabajo", children: [{ id: "automation", label: "Impacto Social" }] }
        ]
      }
    ]
  }
];

export function DnaInterviewStep() {
  const { setValue, watch } = useFormContext();
  const { transitionTo } = useCreationContext();

  // --- ESTADOS DE FLUJO ---
  const [step, setStep] = useState<'initial' | 'bloom' | 'voice'>('initial');
  const [navigationPath, setNavigationPath] = useState<any[]>([]); // Tracking de la jerarquía
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Verificamos si existe ADN previo (Simulado o desde props/contexto)
  const hasExistingDna = true;

  const currentOptions = useMemo(() => {
    if (navigationPath.length === 0) return DNA_MATRIX;
    let current = DNA_MATRIX;
    for (const stepId of navigationPath) {
      const found = current.find(item => item.id === stepId);
      if (found?.children) current = found.children as any;
    }
    return current;
  }, [navigationPath]);

  // --- MANEJADORES ---

  const handleBloomClick = (item: any) => {
    if (item.children) {
      setNavigationPath([...navigationPath, item.id]);
    } else {
      // Es un nivel 4 (Fruto): Lo añadimos a la selección final
      if (!selectedTags.includes(item.label)) {
        setSelectedTags([...selectedTags, item.label]);
      }
    }
  };

  const handleBack = () => {
    if (navigationPath.length > 0) {
      setNavigationPath(navigationPath.slice(0, -1));
    } else {
      setStep('initial');
    }
  };

  const finalizeDna = async (voiceText: string) => {
    setIsProcessing(true);
    // Guardamos los datos en el esquema Zod
    setValue("dna_interview", voiceText);
    setValue("tags", selectedTags);

    // Aquí se llamaría a la función update-user-dna vía backend
    // Simulamos latencia de "Mapeo Semántico"
    setTimeout(() => {
      setIsProcessing(false);
      transitionTo('PULSE_RADAR');
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto p-6 md:p-12 justify-center overflow-hidden">

      <AnimatePresence mode="wait">

        {/* FASE 0: RECONOCIMIENTO DE IDENTIDAD */}
        {step === 'initial' && (
          <motion.div
            key="initial"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center space-y-10"
          >
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-primary/20 blur-[60px] animate-pulse rounded-full" />
              <BrainCircuit size={80} className="text-primary relative z-10 mx-auto" />
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white">
                Sintonización de <span className="text-primary italic">ADN</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-md mx-auto font-medium">
                Detectamos una frecuencia activa. ¿Deseas mantener tu radar actual o sintonizar una nueva misión?
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
              <Button
                variant="outline"
                onClick={() => transitionTo('PULSE_RADAR')}
                className="h-16 px-8 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-widest w-full md:w-auto"
              >
                <CheckCircle2 className="mr-2 h-5 w-5 text-emerald-400" /> Mantener Radar
              </Button>
              <Button
                onClick={() => setStep('bloom')}
                className="h-16 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest w-full md:w-auto shadow-2xl shadow-primary/20"
              >
                <RotateCcw className="mr-2 h-5 w-5" /> Nueva Sintonía
              </Button>
            </div>
          </motion.div>
        )}

        {/* FASE 1: SEMANTIC BLOOM (MAPA DE TAGS) */}
        {step === 'bloom' && (
          <motion.div
            key="bloom"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <header className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={handleBack} className="rounded-full h-10 w-10 p-0 hover:bg-white/5">
                  <ChevronLeft className="h-6 w-6 text-white" />
                </Button>
                <div>
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Capa {navigationPath.length + 1} de 4</p>
                  <h2 className="text-xl md:text-3xl font-black text-white uppercase tracking-tighter">Define tu Enfoque</h2>
                </div>
              </div>
              {selectedTags.length > 0 && (
                <Button onClick={() => setStep('voice')} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-6 animate-in fade-in">
                  Continuar <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </header>

            {/* Visualización de Selección Actual */}
            <div className="flex flex-wrap gap-2 min-h-[32px]">
              {selectedTags.map(tag => (
                <Badge key={tag} className="bg-primary/20 text-primary border-primary/30 px-3 py-1 uppercase text-[9px] font-black">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Grid dinámico de Bloom */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentOptions.map((item: any) => (
                <motion.button
                  layoutId={item.id}
                  key={item.id}
                  onClick={() => handleBloomClick(item)}
                  className={cn(
                    "p-6 rounded-[2rem] border transition-all text-left group relative overflow-hidden",
                    item.color ? `bg-gradient-to-br ${item.color} border-none` : "bg-white/5 border-white/10 hover:border-primary/40 hover:bg-white/10"
                  )}
                >
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {item.icon && <item.icon size={24} className="text-white" />}
                      <span className="font-bold text-lg md:text-xl text-white uppercase tracking-tight">{item.label}</span>
                    </div>
                    {item.children && <ArrowRight className="text-white/40 group-hover:translate-x-1 transition-transform" />}
                  </div>
                  {!item.color && selectedTags.includes(item.label) && (
                    <div className="absolute top-2 right-2"><CheckCircle2 className="text-emerald-400 h-5 w-5" /></div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* FASE 2: ALINEADOR DE VOZ (LA MISIÓN) */}
        {step === 'voice' && (
          <motion.div
            key="voice"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-10"
          >
            <div className="space-y-4">
              <Badge className="bg-primary text-white px-4 py-1 uppercase text-[10px] font-black">Paso Final</Badge>
              <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">
                ¿Cuál es tu <span className="text-primary italic">Desafío Actual?</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-md mx-auto font-medium">
                Cuéntale a la IA en qué estás trabajando esta semana para sintonizar el radar con precisión quirúrgica.
              </p>
            </div>

            {isProcessing ? (
              <div className="py-20 space-y-6">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                <p className="text-xs font-black uppercase tracking-[0.3em] text-primary animate-pulse">Sintonizando Gravedad Semántica...</p>
              </div>
            ) : (
              <div className="max-w-md mx-auto">
                <VoiceInput
                  onTextGenerated={finalizeDna}
                  className="w-full"
                />
                <Button variant="ghost" onClick={() => setStep('bloom')} className="mt-8 text-white/40 hover:text-white uppercase text-[10px] font-black tracking-widest">
                  <RotateCcw className="mr-2 h-3 w-3" /> Re-ajustar etiquetas
                </Button>
              </div>
            )}
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

// Icono genérico de carga para el botón de voz
function Loader2(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}