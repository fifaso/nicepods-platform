// components/create-flow/steps/purpose-selection-step.tsx
// VERSIÓN: 2.1 (Aurora UX - Refined Readability & Spatial Balance)

"use client";

import { useFormContext } from "react-hook-form";
import { motion } from "framer-motion";
import { 
  Lightbulb, 
  Link2, 
  MessageCircleQuestion, 
  PenLine, 
  MapPin, 
  Sparkles,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

import { useCreationContext } from "../shared/context";
import { Badge } from "@/components/ui/badge";

const PURPOSES = [
  {
    id: "learn",
    category: "Creatividad",
    title: "Aprender",
    desc: "Desglosa conceptos complejos y profundiza.",
    icon: Lightbulb,
    color: "from-amber-400/30 to-orange-500/10",
  },
  {
    id: "explore",
    category: "Creatividad",
    title: "Explorar",
    desc: "Conecta dos ideas distintas en un audio.",
    icon: Link2,
    color: "from-blue-400/30 to-indigo-500/10",
  },
  {
    id: "ask",
    category: "Creatividad",
    title: "Preguntar",
    desc: "Respuestas directas a dudas específicas.",
    icon: MessageCircleQuestion,
    color: "from-rose-400/30 to-red-500/10",
  },
  {
    id: "reflect",
    category: "Legado",
    title: "Reflexionar",
    desc: "Lecciones y testimonios personales.",
    icon: PenLine,
    color: "from-emerald-400/30 to-teal-500/10",
  },
  {
    id: "local",
    category: "Entorno",
    title: "Vive lo local",
    desc: "Secretos y datos del sitio donde estás hoy.",
    icon: MapPin,
    color: "from-violet-500/40 to-fuchsia-600/20",
    isNew: true,
  }
];

export default function PurposeSelectionStep() {
  const { setValue, watch } = useFormContext();
  const { onNext } = useCreationContext();
  const currentPurpose = watch("purpose");

  const handleSelection = (id: string) => {
    setValue("purpose", id);
    setTimeout(() => onNext(), 250);
  };

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto justify-between py-2 md:py-6">
      {/* HEADER: Reducción de márgenes y aumento de contraste */}
      <header className="space-y-2 text-center mb-4 px-4">
        <motion.h1 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-white leading-[0.9]"
        >
          ¿Cuál es tu <span className="text-primary italic">intención?</span>
        </motion.h1>
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/40">
          Inicia el escaneo cognitivo de IA
        </p>
      </header>

      {/* GRID: Optimización de gaps y jerarquía */}
      <div className="flex-1 grid grid-cols-2 gap-3 content-start px-2">
        {PURPOSES.map((item, index) => {
          const Icon = item.icon;
          const isSelected = currentPurpose === item.id;
          const isFullWidth = item.id === "local";

          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              onClick={() => handleSelection(item.id)}
              className={cn(
                "relative group flex flex-col p-5 rounded-[2rem] border transition-all duration-500 overflow-hidden",
                "bg-zinc-900/40 backdrop-blur-xl",
                isSelected 
                  ? "border-primary/60 bg-primary/5 shadow-[0_20px_40px_rgba(0,0,0,0.3)]" 
                  : "border-white/10 hover:border-white/25",
                isFullWidth ? "col-span-2 mt-2 py-6" : "col-span-1"
              )}
            >
              {/* Refinamiento de Gradiente Interno */}
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500",
                item.color,
                isSelected ? "opacity-100" : "group-hover:opacity-40"
              )} />

              <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                <div className="flex justify-between items-center">
                  <div className={cn(
                    "p-2.5 rounded-2xl transition-colors duration-500",
                    isSelected ? "bg-primary text-white" : "bg-white/5 text-white/70"
                  )}>
                    <Icon size={22} strokeWidth={isSelected ? 2.5 : 2} />
                  </div>
                  {item.isNew && (
                    <Badge className="bg-primary hover:bg-primary text-white text-[9px] font-black tracking-tighter px-2 py-0.5 rounded-full animate-pulse">
                      SITUACIONAL
                    </Badge>
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="font-black text-base uppercase tracking-tight text-white leading-none">
                    {item.title}
                  </h3>
                  <p className="text-xs leading-snug text-white/50 font-medium tracking-tight">
                    {item.desc}
                  </p>
                </div>
              </div>

              {/* Borde de Alta Definición para selección */}
              {isSelected && (
                <motion.div 
                  layoutId="active-border"
                  className="absolute inset-0 border-2 border-primary rounded-[2rem] z-20 pointer-events-none"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* FOOTER: Limpieza visual */}
      <footer className="mt-4 flex justify-center px-6">
        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-md">
          <Zap size={12} className="text-primary fill-primary/20" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
            Engine v2.5 Active
          </span>
        </div>
      </footer>
    </div>
  );
}