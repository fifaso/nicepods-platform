// components/create-flow/steps/purpose-selection-step.tsx
// VERSIÓN: 2.3 (Master Standard - Categorized Architecture & Path Sync)

"use client";

import { useFormContext } from "react-hook-form";
import { motion } from "framer-motion";
import { 
  Lightbulb, 
  Link2, 
  MessageCircleQuestion, 
  PenLine, 
  MapPin, 
  Zap,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

import { useCreationContext } from "../shared/context";
import { Badge } from "@/components/ui/badge";

/**
 * DEFINICIÓN DE PROPÓSITOS CATEGORIZADOS
 * Los IDs coinciden estrictamente con shared/config.ts (MASTER_FLOW_PATHS)
 */
const CATEGORIES = [
  {
    name: "Creatividad",
    items: [
      {
        id: "learn",
        title: "Aprender",
        desc: "Desglosa conceptos.",
        icon: Lightbulb,
        color: "from-amber-400/20 to-orange-500/10",
      },
      {
        id: "explore",
        title: "Explorar",
        desc: "Conecta ideas.",
        icon: Link2,
        color: "from-blue-400/20 to-indigo-500/10",
      },
      {
        id: "answer", // Sincronizado con config.ts
        title: "Preguntar",
        desc: "Respuestas IA.",
        icon: MessageCircleQuestion,
        color: "from-rose-400/20 to-red-500/10",
      },
    ]
  },
  {
    name: "Legado",
    items: [
      {
        id: "reflect",
        title: "Reflexionar",
        desc: "Lecciones y vida.",
        icon: PenLine,
        color: "from-emerald-400/20 to-teal-500/10",
      }
    ]
  },
  {
    name: "Entorno",
    items: [
      {
        id: "local_soul", // Sincronizado con config.ts
        title: "Vive lo local",
        desc: "Secretos de tu ubicación actual.",
        icon: MapPin,
        color: "from-violet-500/30 to-fuchsia-600/10",
        isSituational: true,
      }
    ]
  }
];

export function PurposeSelectionStep() {
  const { setValue, watch } = useFormContext();
  const { onNext } = useCreationContext();
  const currentPurpose = watch("purpose");

  const handleSelection = (id: string) => {
    // 1. Inyectamos el valor oficial en el Formulario (RHF)
    setValue("purpose", id, { shouldValidate: true });
    
    // 2. Pequeña vibración visual/delay para feedback antes de avanzar
    setTimeout(() => onNext(), 300);
  };

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto py-4 px-2 justify-between">
      
      {/* HEADER DINÁMICO */}
      <header className="space-y-1 text-center mb-6">
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-black tracking-tighter uppercase text-white leading-none"
        >
          ¿Cuál es tu <span className="text-primary italic">intención?</span>
        </motion.h1>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
          Selecciona una rama para el escaneo de IA
        </p>
      </header>

      {/* RENDERIZADO POR CATEGORÍAS */}
      <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar-hide">
        {CATEGORIES.map((cat, catIdx) => (
          <div key={cat.name} className="space-y-3">
            <div className="flex items-center gap-3 px-1">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">
                {cat.name}
              </span>
              <div className="h-[1px] flex-1 bg-white/5" />
            </div>

            <div className={cn(
              "grid gap-3",
              cat.items.length > 1 ? "grid-cols-2" : "grid-cols-1"
            )}>
              {cat.items.map((item, idx) => {
                const Icon = item.icon;
                const isSelected = currentPurpose === item.id;

                return (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (catIdx * 0.1) + (idx * 0.05) }}
                    onClick={() => handleSelection(item.id)}
                    className={cn(
                      "relative group flex flex-col p-4 rounded-[1.5rem] border transition-all duration-300 text-left",
                      "bg-zinc-900/40 backdrop-blur-xl",
                      isSelected 
                        ? "border-primary bg-primary/5 shadow-[0_10px_30px_rgba(var(--primary),0.15)]" 
                        : "border-white/10 hover:border-white/20"
                    )}
                  >
                    {/* Glow Interno */}
                    <div className={cn(
                      "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500 rounded-[1.5rem]",
                      item.color,
                      isSelected ? "opacity-100" : "group-hover:opacity-40"
                    )} />

                    <div className="relative z-10 flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div className={cn(
                          "p-2 rounded-xl transition-colors",
                          isSelected ? "bg-primary text-white" : "bg-white/5 text-white/60"
                        )}>
                          <Icon size={18} />
                        </div>
                        {item.isSituational && (
                          <Badge className="bg-primary/20 text-primary border-primary/20 text-[8px] font-black tracking-tighter py-0">
                            SITUACIONAL
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-0.5">
                        <h3 className="font-bold text-sm uppercase tracking-tight text-white leading-none">
                          {item.title}
                        </h3>
                        <p className="text-[10px] leading-tight text-white/40 font-medium truncate">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER TÉCNICO */}
      <footer className="mt-6 flex justify-center">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/5">
          <Sparkles size={10} className="text-primary animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-widest text-white/20">
            Engine v2.5 Active
          </span>
        </div>
      </footer>
    </div>
  );
}