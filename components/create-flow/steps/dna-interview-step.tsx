// components/create-flow/steps/dna-interview-step.tsx
// VERSIÓN: 1.4 (Ultimate Master Production - Full Matrix & Strategic Validation)

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VoiceInput } from "@/components/ui/voice-input";
import { usePulseEngine } from "@/hooks/use-pulse-engine";
import { cn } from "@/lib/utils";
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
import { useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useCreationContext } from "../shared/context";

// --- CONSTANTES: MATRIZ DE INTELIGENCIA ESTRATÉGICA (4 NIVELES COMPLETOS) ---
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
            children: [
              { id: "llms", label: "LLMs & Agentes" },
              { id: "prompt", label: "Prompt Engineering" },
              { id: "multimodal", label: "Modelos Multimodales" }
            ]
          },
          {
            id: "ethics",
            label: "Ética & Gobernanza",
            children: [
              { id: "reg", label: "Regulación (AI Act)" },
              { id: "privacy", label: "Privacidad de Datos" },
              { id: "safety", label: "AI Safety" }
            ]
          }
        ]
      },
      {
        id: "frontier",
        label: "Computación de Frontera",
        children: [
          {
            id: "quantum",
            label: "Computación Cuántica",
            children: [
              { id: "qubits", label: "Infraestructura" },
              { id: "q-algos", label: "Algoritmos Cuánticos" }
            ]
          },
          {
            id: "web3",
            label: "Web3 & Descentralización",
            children: [
              { id: "rwa", label: "Tokenización RWA" },
              { id: "dao", label: "Gobernanza On-chain" }
            ]
          }
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
          {
            id: "capital",
            label: "Mercados de Capital",
            children: [
              { id: "vc", label: "Venture Capital" },
              { id: "fintech", label: "Fintech" },
              { id: "defi", label: "DeFi" }
            ]
          },
          {
            id: "models",
            label: "Modelos de Negocio",
            children: [
              { id: "saas", label: "SaaS & B2B" },
              { id: "plg", label: "Product-Led Growth" }
            ]
          }
        ]
      },
      {
        id: "leadership",
        label: "Liderazgo Moderno",
        children: [
          {
            id: "talent",
            label: "Gestión de Talento",
            children: [
              { id: "async", label: "Cultura Asíncrona" },
              { id: "performance", label: "Alto Rendimiento" }
            ]
          },
          {
            id: "corp",
            label: "Estrategia Corp.",
            children: [
              { id: "m-a", label: "Fusiones & Adquisiciones" },
              { id: "innovation", label: "Corporate Venture" }
            ]
          }
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
          {
            id: "longevity",
            label: "Longevidad",
            children: [
              { id: "biohacking", label: "Biohacking" },
              { id: "genetics", label: "Edición Genética" }
            ]
          },
          {
            id: "neuro",
            label: "Neurociencia",
            children: [
              { id: "bci", label: "Neural Interfaces" },
              { id: "cognition", label: "Optimización Cognitiva" }
            ]
          }
        ]
      },
      {
        id: "energy",
        label: "Energía & Futuro",
        children: [
          {
            id: "clean",
            label: "Energía Limpia",
            children: [
              { id: "fusion", label: "Fusión Nuclear" },
              { id: "storage", label: "Almacenamiento (Baterías)" }
            ]
          },
          {
            id: "space",
            label: "Exploración Espacial",
            children: [
              { id: "sat", label: "Satélites (LEO)" },
              { id: "mining", label: "Minería Espacial" }
            ]
          }
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
          {
            id: "mental",
            label: "Modelos Mentales",
            children: [
              { id: "systems", label: "Pensamiento Sistémico" },
              { id: "stoic", label: "Estoicismo Práctico" }
            ]
          },
          {
            id: "future-work",
            label: "Futuro del Trabajo",
            children: [
              { id: "automation", label: "Automatización & Empleo" },
              { id: "ubi", label: "Renta Básica Universal" }
            ]
          }
        ]
      },
      {
        id: "geopolitics",
        label: "Geopolítica",
        children: [
          {
            id: "macro",
            label: "Macrotendencias",
            children: [
              { id: "supply", label: "Cadena de Suministro" },
              { id: "chips", label: "Guerra de Semiconductores" }
            ]
          }
        ]
      }
    ]
  }
];

export function DnaInterviewStep() {
  const { setValue } = useFormContext();
  const { transitionTo } = useCreationContext();
  const { updateDNA, isUpdating } = usePulseEngine();

  // --- ESTADOS DE FLUJO ---
  const [phase, setPhase] = useState<'initial' | 'bloom' | 'voice'>('initial');
  const [navigationPath, setNavigationPath] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  /**
   * currentOptions: Lógica de navegación jerárquica (O(N))
   */
  const currentOptions = useMemo(() => {
    if (navigationPath.length === 0) return DNA_MATRIX;
    let current: any = DNA_MATRIX;
    for (const stepId of navigationPath) {
      const found = current.find((item: any) => item.id === stepId);
      if (found?.children) current = found.children;
    }
    return current;
  }, [navigationPath]);

  /**
   * handleBloomClick: Motor del Semantic Bloom
   */
  const handleBloomClick = (item: any) => {
    if (item.children) {
      setNavigationPath([...navigationPath, item.id]);
    } else {
      if (selectedTags.includes(item.label)) {
        setSelectedTags(selectedTags.filter(t => t !== item.label));
      } else {
        if (selectedTags.length < 10) {
          setSelectedTags([...selectedTags, item.label]);
        }
      }
    }
  };

  const handleBack = () => {
    if (navigationPath.length > 0) {
      setNavigationPath(navigationPath.slice(0, -1));
    } else {
      setPhase('initial');
    }
  };

  const finalizeDna = async (voiceText: string) => {
    // Blindaje de seguridad: No enviamos nada si no hay selección mínima
    if (selectedTags.length === 0) return;

    const result = await updateDNA({
      profile_text: `Frecuencias: ${selectedTags.join(", ")}. Misión: ${voiceText}`,
      expertise_level: 5
    });

    if (result.success) {
      transitionTo('PULSE_RADAR');
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto p-4 md:p-10 justify-center items-center overflow-hidden">
      <AnimatePresence mode="wait">

        {/* FASE 0: RECONOCIMIENTO DE PERFIL PREVIO */}
        {phase === 'initial' && (
          <motion.div
            key="initial"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center space-y-12"
          >
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-primary/20 blur-[80px] animate-pulse rounded-full" />
              <div className="relative z-10 p-8 bg-zinc-900/50 rounded-[3rem] border border-white/10 backdrop-blur-3xl shadow-2xl">
                <Fingerprint size={64} className="text-primary mx-auto" />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white">
                Sintonía de <span className="text-primary italic">ADN</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-lg mx-auto font-medium">
                Detectamos tu frecuencia anterior en la matriz. ¿Deseas mantener tu radar actual o sintonizar una nueva misión?
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-center items-center w-full max-w-md mx-auto">
              <Button
                variant="outline"
                onClick={() => transitionTo('PULSE_RADAR')}
                className="h-16 px-10 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-widest w-full"
              >
                <History className="mr-2 h-5 w-5 opacity-50" /> Mantener Radar
              </Button>
              <Button
                onClick={() => setPhase('bloom')}
                className="h-16 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest w-full shadow-2xl shadow-primary/20"
              >
                <RotateCcw className="mr-2 h-5 w-5" /> Nueva Sintonía
              </Button>
            </div>
          </motion.div>
        )}

        {/* FASE 1: SEMANTIC BLOOM (MAPA DE TAGS) */}
        {phase === 'bloom' && (
          <motion.div
            key="bloom"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="w-full h-full flex flex-col space-y-8"
          >
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={handleBack} className="rounded-full h-12 w-12 p-0 bg-white/5 hover:bg-white/10 text-white">
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <div>
                  <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter leading-none">
                    Selecciona tu <span className="text-primary italic">Enfoque</span>
                  </h3>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mt-1">Capa {navigationPath.length + 1} de 4</p>
                </div>
              </div>
              <Button
                disabled={selectedTags.length === 0}
                onClick={() => setPhase('voice')}
                className={cn(
                  "h-12 px-8 rounded-xl font-black uppercase tracking-widest transition-all",
                  selectedTags.length > 0 ? "bg-emerald-600 text-white shadow-xl" : "bg-zinc-800 text-zinc-500"
                )}
              >
                Continuar <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </header>

            {/* SELECCIÓN ACTIVA */}
            <div className="flex flex-wrap gap-2 py-4 border-y border-white/5 min-h-[60px] items-center justify-center md:justify-start">
              {selectedTags.length === 0 ? (
                <span className="text-xs text-zinc-600 italic">Explora la matriz y marca tus intereses...</span>
              ) : (
                selectedTags.map(tag => (
                  <motion.div key={tag} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1.5 uppercase text-[9px] font-black flex gap-2 items-center">
                      {tag}
                      <X size={10} className="cursor-pointer hover:text-white" onClick={() => setSelectedTags(selectedTags.filter(t => t !== tag))} />
                    </Badge>
                  </motion.div>
                ))
              )}
            </div>

            {/* GRID DINÁMICO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto no-scrollbar pb-20">
              {currentOptions.map((item: any) => (
                <motion.button
                  key={item.id}
                  whileHover={{ y: -4 }}
                  onClick={() => handleBloomClick(item)}
                  className={cn(
                    "p-6 rounded-[2.5rem] border transition-all text-left relative overflow-hidden flex flex-col justify-between h-32 md:h-40",
                    item.color ? `bg-gradient-to-br ${item.color} border-none shadow-xl` : "bg-zinc-900/40 border-white/5 hover:border-primary/40",
                    selectedTags.includes(item.label) && "border-primary bg-primary/10 shadow-[0_0_20px_rgba(var(--primary),0.1)]"
                  )}
                >
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="p-3 bg-white/10 rounded-2xl">
                      {item.icon ? <item.icon size={24} className="text-white" /> : <Sparkles size={20} className="text-primary" />}
                    </div>
                    {item.children ? <ArrowRight size={18} className="text-white/20" /> : selectedTags.includes(item.label) && <CheckCircle2 size={24} className="text-white" />}
                  </div>
                  <div className="relative z-10">
                    <span className="font-black text-xl md:text-2xl text-white uppercase tracking-tighter leading-none">{item.label}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* FASE 2: ALINEADOR DE VOZ (DESAFÍO SEMANAL) */}
        {phase === 'voice' && (
          <motion.div
            key="voice"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-12 w-full max-w-2xl"
          >
            <div className="space-y-4">
              <Badge className="bg-primary text-white px-4 py-1 uppercase text-[10px] font-black tracking-widest">Sintonización Final</Badge>
              <h2 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter leading-tight">
                ¿Cuál es tu <span className="text-primary italic">Misión?</span>
              </h2>
              <p className="text-muted-foreground text-lg md:text-xl font-medium max-w-lg mx-auto leading-relaxed">
                Cuéntale a la IA tu objetivo profesional de esta semana para enfocar el radar con precisión quirúrgica.
              </p>
            </div>

            {isUpdating ? (
              <div className="py-20 flex flex-col items-center gap-6">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <p className="text-sm font-black uppercase tracking-[0.4em] text-primary animate-pulse">Codificando ADN en la Matriz...</p>
              </div>
            ) : (
              <div className="space-y-10">
                <VoiceInput onTextGenerated={finalizeDna} className="max-w-md mx-auto" />
                <Button variant="ghost" onClick={() => setPhase('bloom')} className="text-zinc-600 hover:text-white uppercase text-[10px] font-black tracking-widest">
                  <RotateCcw className="mr-2 h-3 w-3" /> Re-ajustar mi enfoque
                </Button>
              </div>
            )}
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

// Sub-componentes auxiliares (No abreviados)
function X(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
  );
}