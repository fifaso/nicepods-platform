// components/create-flow/steps/purpose-selection-step.tsx
// VERSIÓN: 2.0 (Aurora UX - Zero Scroll Architecture)

"use client";

import { useFormContext } from "react-hook-form";
import { motion } from "framer-motion";
import { 
  Lightbulb, 
  Link2, 
  MessageCircleQuestion, 
  PenLine, 
  MapPin, 
  Sparkles 
} from "lucide-react";
import { cn } from "@/lib/utils";

// Componentes del Core Orchestrator
import { useCreationContext } from "../shared/context";
import { Badge } from "@/components/ui/badge";

const PURPOSES = [
  {
    id: "learn",
    category: "Creatividad",
    title: "Aprender",
    desc: "Desglosa conceptos complejos",
    icon: Lightbulb,
    color: "from-amber-400/20 to-orange-500/10",
  },
  {
    id: "explore",
    category: "Creatividad",
    title: "Explorar",
    desc: "Conecta dos ideas distintas",
    icon: Link2,
    color: "from-blue-400/20 to-indigo-500/10",
  },
  {
    id: "ask",
    category: "Creatividad",
    title: "Preguntar",
    desc: "Respuestas directas a dudas",
    icon: MessageCircleQuestion,
    color: "from-rose-400/20 to-red-500/10",
  },
  {
    id: "reflect",
    category: "Legado",
    title: "Reflexionar",
    desc: "Lecciones y testimonios",
    icon: PenLine,
    color: "from-emerald-400/20 to-teal-500/10",
  },
  {
    id: "local",
    category: "Entorno",
    title: "Vive lo local",
    desc: "Secretos de tu posición actual",
    icon: MapPin,
    color: "from-violet-400/20 to-fuchsia-500/10",
    isNew: true,
  }
];

export default function PurposeSelectionStep() {
  const { setValue, watch } = useFormContext();
  const { onNext } = useCreationContext();
  const currentPurpose = watch("purpose");

  const handleSelection = (id: string) => {
    setValue("purpose", id);
    // Pequeño delay para que el usuario vea la selección antes de avanzar
    setTimeout(() => onNext(), 200);
  };

  return (
    <div className="flex flex-col h-full max-w-md mx-auto justify-between py-4">
      {/* HEADER ESTRATÉGICO */}
      <header className="space-y-1 text-center mb-6">
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-black tracking-tighter uppercase text-white"
        >
          ¿Cuál es tu <span className="text-primary italic">intención?</span>
        </motion.h1>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground opacity-60">
          Elige una rama para iniciar el escaneo de IA
        </p>
      </header>

      {/* REJILLA DE OPCIONES (GRID 2x2 + 1 FULL) */}
      <div className="flex-1 grid grid-cols-2 gap-3 content-start">
        {PURPOSES.map((item, index) => {
          const Icon = item.icon;
          const isSelected = currentPurpose === item.id;
          const isFullWidth = item.id === "local";

          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleSelection(item.id)}
              className={cn(
                "relative group flex flex-col p-4 rounded-3xl border text-left transition-all duration-300",
                "bg-card/40 backdrop-blur-3xl",
                isSelected 
                  ? "border-primary shadow-[0_0_25px_rgba(var(--primary),0.2)]" 
                  : "border-white/5 hover:border-white/20 shadow-none",
                isFullWidth ? "col-span-2 mt-2" : "col-span-1"
              )}
            >
              {/* Fondo Degradado sutil */}
              <div className={cn(
                "absolute inset-0 rounded-3xl opacity-20 transition-opacity group-hover:opacity-40",
                item.color
              )} />

              <div className="relative z-10 flex flex-col h-full justify-between gap-3">
                <header className="flex justify-between items-start">
                  <div className={cn(
                    "p-2 rounded-2xl bg-black/40 border border-white/5",
                    isSelected && "text-primary border-primary/20"
                  )}>
                    <Icon size={20} strokeWidth={isSelected ? 2.5 : 1.5} />
                  </div>
                  {item.isNew && (
                    <Badge className="bg-primary text-[8px] font-black tracking-widest px-2 py-0">
                      NUEVO
                    </Badge>
                  )}
                </header>

                <div className="space-y-0.5">
                  <h3 className="font-black text-sm uppercase tracking-tight text-white">
                    {item.title}
                  </h3>
                  <p className="text-[10px] leading-tight text-muted-foreground font-medium opacity-80">
                    {item.desc}
                  </p>
                </div>
              </div>

              {/* Indicador de selección */}
              {isSelected && (
                <motion.div 
                  layoutId="selection-glow"
                  className="absolute -inset-[1px] rounded-3xl border border-primary z-0"
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* FOOTER: METADATOS TÉCNICOS */}
      <footer className="mt-6 flex justify-center">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
          <Sparkles size={10} className="text-primary animate-pulse" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">
            Escaneo de IA Multimodal Activo
          </span>
        </div>
      </footer>
    </div>
  );
}