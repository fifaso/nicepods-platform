// components/create-flow/steps/dna-interview-step.tsx
// VERSIÓN: 1.2 (Hybrid DNA Tuning - Full Matrix & High Performance Logic)

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
  Trash2,
  Zap
} from "lucide-react";
import { useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useCreationContext } from "../shared/context";

// --- CONSTANTES: MATRIZ DE INTELIGENCIA DE 4 NIVELES (COMPLETA) ---
// Esta estructura define el ADN semántico que NicePod usa para filtrar el mundo.
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
          { id: "quantum", label: "Computación Cuántica", children: [{ id: "qubits", label: "Infraestructura Cuántica" }, { id: "algorithms", label: "Algoritmos" }] },
          { id: "web3", label: "Web3", children: [{ id: "rwa", label: "Tokenización RWA" }, { id: "dao", label: "Gobernanza On-chain" }] }
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
          { id: "capital", label: "Mercados de Capital", children: [{ id: "vc", label: "Venture Capital" }, { id: "fintech", label: "Fintech" }, { id: "defi", label: "DeFi" }] },
          { id: "models", label: "Modelos de Negocio", children: [{ id: "saas", label: "SaaS & B2B" }, { id: "plg", label: "Product-Led Growth" }] }
        ]
      },
      {
        id: "leadership",
        label: "Liderazgo Moderno",
        children: [
          { id: "talent", label: "Gestión de Talento", children: [{ id: "async", label: "Cultura Asíncrona" }, { id: "performance", label: "Alto Rendimiento" }] },
          { id: "corp", label: "Estrategia Corp.", children: [{ id: "m-a", label: "Fusiones & Adquisiciones" }, { id: "innovation", label: "Corporate Venture" }] }
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
          { id: "longevity", label: "Longevidad", children: [{ id: "biohacking", label: "Biohacking" }, { id: "genetics", label: "Edición Genética" }] },
          { id: "neuro", label: "Neurociencia", children: [{ id: "bci", label: "Neural Interfaces" }, { id: "cognition", label: "Optimización Cognitiva" }] }
        ]
      },
      {
        id: "energy",
        label: "Futuro Sostenible",
        children: [
          { id: "fusion", label: "Energía Limpia", children: [{ id: "fission", label: "Fisión de Próx. Gen" }, { id: "storage", label: "Almacenamiento (Baterías)" }] }
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
          { id: "mental", label: "Modelos Mentales", children: [{ id: "systems", label: "Pensamiento Sistémico" }, { id: "stoic", label: "Estoicismo Práctico" }] },
          { id: "future-work", label: "Futuro del Trabajo", children: [{ id: "automation", label: "Automatización & Empleo" }, { id: "ubi", label: "Renta Básica Universal" }] }
        ]
      },
      {
        id: "geopolitics",
        label: "Geopolítica",
        children: [
          { id: "macro", label: "Macrotendencias", children: [{ id: "supply", label: "Cadenas de Suministro" }, { id: "chips", label: "Guerra de Semiconductores" }] }
        ]
      }
    ]
  }
];

export function DnaInterviewStep() {
  const { setValue, watch } = useFormContext();
  const { transitionTo } = useCreationContext();
  const { updateDNA, isUpdating } = usePulseEngine();

  // --- ESTADOS DE FLUJO ---
  const [phase, setPhase] = useState<'initial' | 'bloom' | 'voice'>('initial');
  const [navigationPath, setNavigationPath] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isFinishing, setIsFinishing] = useState(false);

  // Observamos los datos para validación visual
  const currentDnaInterview = watch("dna_interview");

  /**
   * currentOptions: Lógica de navegación jerárquica
   * Filtra la matriz según el camino que el usuario ha recorrido.
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
   * handleBloomClick: Motor del "Semantic Bloom"
   * Navega a través de las 4 capas o selecciona el tag final (Nivel 4).
   */
  const handleBloomClick = (item: any) => {
    if (item.children) {
      setNavigationPath([...navigationPath, item.id]);
    } else {
      // Es un nivel 4 (Fruto): Toggle de selección
      if (selectedTags.includes(item.label)) {
        setSelectedTags(selectedTags.filter(t => t !== item.label));
      } else {
        if (selectedTags.length < 10) { // Límite profesional para no dispersar el vector
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

  /**
   * finalizeDna: Cierre de sintonización
   * Envía los datos al backend para generar el vector máster.
   */
  const finalizeDna = async (voiceText: string) => {
    setIsFinishing(true);

    // Inyectamos en el formulario para persistencia
    setValue("dna_interview", voiceText);
    setValue("tags", selectedTags);

    // Llamada a la Edge Function de perfilado semántico
    const result = await updateDNA({
      profile_text: `Intereses: ${selectedTags.join(", ")}. Desafío actual: ${voiceText}`,
      expertise_level: 5 // Por ahora estático, escalable a selector
    });

    if (result.success) {
      transitionTo('PULSE_RADAR');
    }
    setIsFinishing(false);
  };

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto p-4 md:p-10 justify-center overflow-hidden">
      <AnimatePresence mode="wait">

        {/* FASE 0: RECONOCIMIENTO DE PERFIL PREVIO */}
        {phase === 'initial' && (
          <motion.div
            key="initial"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center space-y-12"
          >
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-primary/20 blur-[80px] animate-pulse rounded-full" />
              <div className="relative z-10 p-8 bg-zinc-900/50 rounded-[3rem] border border-white/10 backdrop-blur-3xl shadow-2xl">
                <Fingerprint size={64} className="text-primary mx-auto" />
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl md:text-6xl font-black uppercase tracking-tighter text-white">
                Sintonía de <span className="text-primary italic">ADN</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-lg mx-auto font-medium">
                NicePod reconoce tu frecuencia anterior. ¿Deseas mantener tu radar actual o sintonizar una nueva misión?
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
              <Button
                variant="outline"
                onClick={() => transitionTo('PULSE_RADAR')}
                className="h-16 px-10 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-widest w-full md:w-auto"
              >
                <History className="mr-2 h-5 w-5 opacity-50" /> Mantener Radar
              </Button>
              <Button
                onClick={() => setPhase('bloom')}
                className="h-16 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest w-full md:w-auto shadow-2xl shadow-primary/20"
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
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="h-full flex flex-col space-y-8"
          >
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={handleBack} className="rounded-full h-12 w-12 p-0 bg-white/5 hover:bg-white/10">
                  <ChevronLeft className="h-6 w-6 text-white" />
                </Button>
                <div>
                  <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter leading-none">
                    Define tu <span className="text-primary italic">Frecuencia</span>
                  </h2>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mt-1">Capa de Navegación {navigationPath.length + 1} de 4</p>
                </div>
              </div>
              <Button
                disabled={selectedTags.length === 0}
                onClick={() => setPhase('voice')}
                className={cn(
                  "h-12 px-8 rounded-xl font-black uppercase tracking-widest transition-all",
                  selectedTags.length > 0 ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl" : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                )}
              >
                Continuar <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </header>

            {/* BARRA DE SELECCIÓN ACTIVA */}
            <div className="flex flex-wrap gap-2 py-4 border-y border-white/5 min-h-[60px] items-center">
              <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mr-2">Selección:</span>
              <AnimatePresence>
                {selectedTags.length === 0 && <span className="text-xs text-zinc-700 italic">No hay etiquetas seleccionadas...</span>}
                {selectedTags.map(tag => (
                  <motion.div key={tag} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1.5 uppercase text-[9px] font-black flex gap-2 items-center">
                      {tag}
                      <Trash2 size={10} className="cursor-pointer hover:text-white" onClick={() => setSelectedTags(selectedTags.filter(t => t !== tag))} />
                    </Badge>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* GRID DE BLOOM DINÁMICO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pr-2 no-scrollbar pb-10">
              {currentOptions.map((item: any) => (
                <motion.button
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  key={item.id}
                  onClick={() => handleBloomClick(item)}
                  className={cn(
                    "p-6 rounded-[2.5rem] border transition-all text-left group relative overflow-hidden h-32 md:h-40 flex flex-col justify-between",
                    item.color ? `bg-gradient-to-br ${item.color} border-none shadow-xl` : "bg-zinc-900/40 border-white/5 hover:border-primary/40"
                  )}
                >
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="p-3 bg-white/10 rounded-2xl">
                      {item.icon ? <item.icon size={24} /> : <Sparkles size={20} className="text-primary" />}
                    </div>
                    {item.children && <ArrowRight className="text-white/20 group-hover:translate-x-2 transition-transform duration-500" />}
                    {!item.children && selectedTags.includes(item.label) && <CheckCircle2 size={24} className="text-white" />}
                  </div>
                  <div className="relative z-10">
                    <span className="font-black text-xl md:text-2xl text-white uppercase tracking-tighter leading-none">{item.label}</span>
                    {item.children && <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-1">Explorar categorías</p>}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* FASE 2: EL ALINEADOR DE VOZ (CONTEXTO SEMANAL) */}
        {phase === 'voice' && (
          <motion.div
            key="voice"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-12"
          >
            <div className="space-y-4">
              <Badge className="bg-primary text-white px-4 py-1.5 uppercase text-[10px] font-black tracking-[0.2em]">Paso Final: Calibración</Badge>
              <h2 className="text-3xl md:text-6xl font-black text-white uppercase tracking-tighter leading-tight">
                ¿Cuál es tu <span className="text-primary italic">Misión Hoy?</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto font-medium">
                Cuéntale a la IA en qué estás trabajando esta semana para sintonizar el radar con precisión militar.
              </p>
            </div>

            {isFinishing || isUpdating ? (
              <div className="py-20 flex flex-col items-center gap-6">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <p className="text-sm font-black uppercase tracking-[0.4em] text-primary animate-pulse">Escribiendo ADN en la Matriz...</p>
              </div>
            ) : (
              <div className="max-w-md mx-auto space-y-8">
                <VoiceInput
                  onTextGenerated={finalizeDna}
                  className="w-full"
                />
                <div className="pt-4 flex items-center justify-center gap-6">
                  <Button variant="ghost" onClick={() => setPhase('bloom')} className="text-zinc-600 hover:text-white uppercase text-[10px] font-black tracking-widest">
                    <RotateCcw className="mr-2 h-3 w-3" /> Re-ajustar etiquetas
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}