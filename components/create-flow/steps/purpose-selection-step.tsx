// components/create-flow/steps/purpose-selection-step.tsx
// VERSIÓN: 2.5 (Aurora Adaptive - High Contrast & Full Flow Integration)

"use client";

import { useFormContext } from "react-hook-form";
import { motion } from "framer-motion";
import { 
  Lightbulb, 
  Link2, 
  MessageCircleQuestion, 
  PenLine, 
  MapPin, 
  ChevronRight,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

import { useCreationContext } from "../shared/context";
import { Badge } from "@/components/ui/badge";

/**
 * CATEGORÍAS Y RUTAS OFICIALES
 * Los IDs deben coincidir exactamente con shared/config.ts
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
      { id: "local_soul", title: "Vive lo local", desc: "Secretos de tu ubicación actual.", icon: MapPin, color: "from-violet-600/30", isSituational: true }
    ]
  }
];

export function PurposeSelectionStep() {
  const { setValue, watch } = useFormContext();
  const { onNext } = useCreationContext();
  const currentPurpose = watch("purpose");

  const handleSelection = (id: string) => {
    // 1. Persistencia inmediata en el estado del formulario global
    setValue("purpose", id, { 
      shouldValidate: true, 
      shouldDirty: true,
      shouldTouch: true 
    });
    
    // 2. Disparo de navegación hacia el siguiente paso definido en el config.ts
    onNext();
  };

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto py-4 px-4 justify-center overflow-hidden">
      
      {/* HEADER: Aumento de tamaño y contraste */}
      <header className="text-center mb-8">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-6xl font-black tracking-tighter uppercase text-foreground leading-[0.85] mb-2"
        >
          ¿Cuál es tu <span className="text-primary italic">intención?</span>
        </motion.h1>
        <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/60 flex items-center justify-center gap-2">
          <Sparkles size={12} />
          Inicia el escaneo cognitivo
        </p>
      </header>

      {/* STACK VERTICAL: Adaptativo y Elegante */}
      <div className="flex-1 flex flex-col justify-center gap-6 max-h-[60vh]">
        {CATEGORIES.map((cat, catIdx) => (
          <div key={cat.name} className="space-y-3">
            {/* Divisor de Categoría con contraste mejorado */}
            <div className="flex items-center gap-4 px-1 opacity-70">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">
                {cat.name}
              </span>
              <div className="h-[1px] flex-1 bg-foreground/10" />
            </div>

            <div className="flex flex-col gap-2.5">
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
                      "relative group w-full flex items-center p-4 rounded-2xl border transition-all duration-300",
                      "bg-card/40 backdrop-blur-3xl overflow-hidden",
                      isSelected 
                        ? "border-primary ring-2 ring-primary/20 shadow-xl shadow-primary/10" 
                        : "border-foreground/10 hover:border-primary/40 hover:bg-card/60"
                    )}
                  >
                    {/* Overlay de color dinámico */}
                    <div className={cn(
                      "absolute inset-0 bg-gradient-to-r to-transparent opacity-0 transition-opacity duration-500",
                      item.color,
                      isSelected ? "opacity-100" : "group-hover:opacity-40"
                    )} />

                    <div className="relative z-10 flex items-center w-full gap-5">
                      {/* Icono más grande y visible */}
                      <div className={cn(
                        "p-3.5 rounded-xl transition-all duration-500",
                        isSelected ? "bg-primary text-white scale-110 shadow-lg" : "bg-foreground/5 text-foreground/50 group-hover:text-primary"
                      )}>
                        <Icon size={24} strokeWidth={isSelected ? 2.5 : 2} />
                      </div>

                      {/* Textos con mayor legibilidad */}
                      <div className="flex-1 text-left space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h3 className={cn(
                            "font-black text-base md:text-lg uppercase tracking-tight transition-colors",
                            isSelected ? "text-foreground" : "text-foreground/80"
                          )}>
                            {item.title}
                          </h3>
                          {item.isSituational && (
                            <Badge className="bg-primary/10 text-primary border-primary/20 text-[8px] font-black tracking-tighter h-4 px-1.5 animate-pulse">
                              NUEVO
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs md:text-sm text-muted-foreground font-medium leading-tight">
                          {item.desc}
                        </p>
                      </div>

                      <ChevronRight className={cn(
                        "transition-all duration-500",
                        isSelected ? "opacity-100 text-primary translate-x-0" : "opacity-0 -translate-x-2 group-hover:opacity-100 text-muted-foreground"
                      )} size={20} />
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