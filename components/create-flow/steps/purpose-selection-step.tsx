// components/create-flow/steps/purpose-selection-step.tsx
// VERSIÓN: 2.6 (Master Standard - Anti-Overlap & High Density UI)

"use client";

import { useFormContext } from "react-hook-form";
import { motion } from "framer-motion";
import { 
  Lightbulb, 
  Link2, 
  MessageCircleQuestion, 
  PenLine, 
  MapPin, 
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

import { useCreationContext } from "../shared/context";
import { Badge } from "@/components/ui/badge";

const CATEGORIES = [
  {
    name: "Creatividad",
    items: [
      { id: "learn", title: "Aprender", desc: "Desglosa conceptos complejos.", icon: Lightbulb, color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
      { id: "explore", title: "Explorar", desc: "Conecta dos ideas distintas.", icon: Link2, color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
      { id: "answer", title: "Preguntar", desc: "Respuestas directas de la IA.", icon: MessageCircleQuestion, color: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
    ]
  },
  {
    name: "Legado",
    items: [
      { id: "reflect", title: "Reflexionar", desc: "Lecciones y testimonios de vida.", icon: PenLine, color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" }
    ]
  },
  {
    name: "Entorno",
    items: [
      { id: "local_soul", title: "Vive lo local", desc: "Secretos de tu ubicación actual.", icon: MapPin, color: "bg-violet-500/10 text-violet-600 dark:text-violet-400", isNew: true }
    ]
  }
];

export function PurposeSelectionStep() {
  const { setValue, watch } = useFormContext();
  const { onNext } = useCreationContext();
  const currentPurpose = watch("purpose");

  const handleSelection = (id: string) => {
    // Sincronización de estado
    setValue("purpose", id, { shouldValidate: true, shouldDirty: true });
    // Navegación inmediata
    onNext();
  };

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto px-4 py-2 justify-center overflow-hidden">
      
      {/* HEADER: Ajustado para evitar solapamientos */}
      <header className="text-center mb-6 pt-2">
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-black tracking-tighter uppercase text-zinc-900 dark:text-white leading-tight"
        >
          ¿Cuál es tu <span className="text-primary italic font-black">intención?</span>
        </motion.h1>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400 mt-1">
          Inicia el escaneo cognitivo de IA
        </p>
      </header>

      {/* LISTADO DE OPCIONES: Alta densidad, sin scroll */}
      <div className="flex-1 flex flex-col gap-5 justify-center">
        {CATEGORIES.map((cat, catIdx) => (
          <section key={cat.name} className="space-y-2">
            <header className="flex items-center gap-2 px-1">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/80">
                {cat.name}
              </span>
              <div className="h-[1px] flex-1 bg-zinc-200 dark:bg-white/10" />
            </header>

            <div className="grid gap-2">
              {cat.items.map((item, idx) => {
                const Icon = item.icon;
                const isSelected = currentPurpose === item.id;

                return (
                  <motion.button
                    key={item.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelection(item.id)}
                    className={cn(
                      "relative w-full flex items-center p-3 rounded-xl border transition-all duration-200",
                      "bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md",
                      isSelected 
                        ? "border-primary ring-1 ring-primary/30 shadow-lg" 
                        : "border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/20"
                    )}
                  >
                    <div className="flex items-center w-full gap-4 relative z-10">
                      {/* Icono compacto */}
                      <div className={cn(
                        "p-2.5 rounded-lg transition-colors",
                        isSelected ? "bg-primary text-white" : item.color
                      )}>
                        <Icon size={18} strokeWidth={2.5} />
                      </div>

                      {/* Textos: Aumento de legibilidad */}
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm uppercase tracking-tight text-zinc-900 dark:text-white leading-none">
                            {item.title}
                          </h3>
                          {item.isNew && (
                            <Badge className="bg-primary text-[7px] font-black h-3.5 px-1 tracking-tighter">
                              NUEVO
                            </Badge>
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium leading-tight mt-0.5 truncate">
                          {item.desc}
                        </p>
                      </div>

                      <ChevronRight 
                        className={cn(
                          "transition-all duration-300",
                          isSelected ? "text-primary opacity-100 translate-x-0" : "text-zinc-300 dark:text-zinc-600 opacity-0 -translate-x-2"
                        )} 
                        size={16} 
                      />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </section>
        ))}
      </div>

    </div>
  );
}