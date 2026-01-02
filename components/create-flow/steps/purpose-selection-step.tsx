// components/create-flow/steps/purpose-selection-step.tsx
// VERSIÓN: 2.4 (Aurora Sharp - High Density & Zero Scroll)

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

/**
 * CONFIGURACIÓN DE RUTAS OFICIALES (Sincronizadas con shared/config.ts)
 */
const CATEGORIES = [
  {
    name: "Creatividad",
    items: [
      { id: "learn", title: "Aprender", desc: "Desglosa conceptos complejos.", icon: Lightbulb, color: "from-amber-500/20" },
      { id: "explore", title: "Explorar", desc: "Conecta dos ideas distintas.", icon: Link2, color: "from-blue-500/20" },
      { id: "answer", title: "Preguntar", desc: "Respuestas directas de la IA.", icon: MessageCircleQuestion, color: "from-rose-500/20" },
    ]
  },
  {
    name: "Legado",
    items: [
      { id: "reflect", title: "Reflexionar", desc: "Lecciones y testimonios de vida.", icon: PenLine, color: "from-emerald-500/20" }
    ]
  },
  {
    name: "Entorno",
    items: [
      { id: "local_soul", title: "Vive lo local", desc: "Secretos de tu ubicación actual.", icon: MapPin, color: "from-violet-600/30", isNew: true }
    ]
  }
];

export function PurposeSelectionStep() {
  const { setValue, watch } = useFormContext();
  const { onNext } = useCreationContext();
  const currentPurpose = watch("purpose");

  const handleSelection = (id: string) => {
    // Sincronización inmediata con el estado del formulario
    setValue("purpose", id, { shouldValidate: true, shouldDirty: true });
    // Disparo de navegación
    onNext();
  };

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto py-2 px-4 overflow-hidden">
      
      {/* HEADER COMPACTO */}
      <header className="text-center mt-4 mb-8">
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-white leading-none mb-2"
        >
          ¿Cuál es tu <span className="text-primary italic">intención?</span>
        </motion.h1>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">
          Inicia el escaneo cognitivo de IA
        </p>
      </header>

      {/* STACK DE OPCIONES (Sin Scroll) */}
      <div className="flex-1 flex flex-col justify-center gap-6 mb-8">
        {CATEGORIES.map((cat, catIdx) => (
          <div key={cat.name} className="space-y-2">
            {/* Divisor de Categoría sutil */}
            <div className="flex items-center gap-3 mb-1 opactiy-50">
              <div className="h-[1px] w-4 bg-primary/40" />
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary/80">
                {cat.name}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {cat.items.map((item, idx) => {
                const Icon = item.icon;
                const isSelected = currentPurpose === item.id;

                return (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (catIdx * 0.1) + (idx * 0.05) }}
                    onClick={() => handleSelection(item.id)}
                    className={cn(
                      "relative group w-full flex items-center p-3 rounded-xl border transition-all duration-300",
                      "bg-zinc-900/60 backdrop-blur-xl overflow-hidden",
                      isSelected 
                        ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(var(--primary),0.2)]" 
                        : "border-white/5 hover:border-white/10"
                    )}
                  >
                    {/* Gradiente de fondo rectangular */}
                    <div className={cn(
                      "absolute inset-0 bg-gradient-to-r to-transparent opacity-0 transition-opacity duration-500",
                      item.color,
                      isSelected ? "opacity-100" : "group-hover:opacity-40"
                    )} />

                    <div className="relative z-10 flex items-center w-full gap-4">
                      {/* Icono Rectangular */}
                      <div className={cn(
                        "p-3 rounded-lg transition-all shadow-inner",
                        isSelected ? "bg-primary text-white scale-110" : "bg-white/5 text-white/40 group-hover:text-white"
                      )}>
                        <Icon size={20} strokeWidth={isSelected ? 2.5 : 2} />
                      </div>

                      {/* Textos a la derecha */}
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-sm uppercase tracking-tight text-white">
                            {item.title}
                          </h3>
                          {item.isNew && (
                            <Badge className="bg-primary/20 text-primary border-primary/20 text-[7px] font-black tracking-tighter h-3 px-1 animate-pulse">
                              NUEVO
                            </Badge>
                          )}
                        </div>
                        <p className="text-[10px] text-white/40 font-medium leading-none mt-0.5">
                          {item.desc}
                        </p>
                      </div>

                      <ChevronRight className={cn(
                        "text-white/10 transition-all",
                        isSelected ? "opacity-100 text-primary translate-x-0" : "opacity-0 -translate-x-2 group-hover:opacity-100"
                      )} size={16} />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}