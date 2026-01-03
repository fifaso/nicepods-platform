// components/create-flow/steps/learn-sub-step.tsx
// VERSIÓN: 9.0 (Aurora Standard - High Contrast & Zero Scroll)

"use client";

import { motion } from "framer-motion";
import { Zap, Layers, ArrowRight, Lock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCreationContext } from "../shared/context";
import { Badge } from "@/components/ui/badge";

/**
 * OPCIONES DE APRENDIZAJE
 * Sincronizadas con la lógica de negocio y MASTER_FLOW_PATHS
 */
const LEARN_OPTIONS = [
  {
    id: "quick_lesson",
    nextState: "SOLO_TALK_INPUT",
    agent: "solo-talk-analyst",
    style: "solo",
    icon: Zap,
    title: "Lección Rápida",
    description: "Explica un concepto de forma clara y concisa en un solo audio.",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  {
    id: "deep_course",
    nextState: "DETAILS_STEP",
    icon: Layers,
    title: "Curso Profundo",
    description: "Estructura un tema en un plan de aprendizaje de varios episodios.",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    disabled: true,
    badge: "PRÓXIMAMENTE"
  }
];

export function LearnSubStep() {
  const { updateFormData, transitionTo } = useCreationContext();

  const handleSelectOption = (option: typeof LEARN_OPTIONS[0]) => {
    if (option.disabled) return;
    
    // 1. Inyectamos la metología elegida
    updateFormData({
      style: option.style as any,
      agentName: option.agent, // Actualizado a agentName según esquema Zod v5.0
    });

    // 2. Salto de estado inmediato
    transitionTo(option.nextState as any);
  };

  return (
    <div className="flex flex-col h-full w-full max-w-lg mx-auto py-6 px-4 justify-center overflow-hidden">
      
      {/* HEADER: Magnetismo Aurora */}
      <header className="text-center mb-10">
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-foreground leading-[0.9] mb-2"
        >
          Elige la <span className="text-primary italic">Profundidad</span>
        </motion.h1>
        <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/60 flex items-center justify-center gap-2">
          <Sparkles size={12} className="text-primary" />
          ¿Qué nivel de detalle necesitas?
        </p>
      </header>

      {/* STACK DE OPCIONES */}
      <div className="flex flex-col gap-4">
        {LEARN_OPTIONS.map((option, index) => {
          const Icon = option.icon;
          const isDisabled = option.disabled;

          return (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleSelectOption(option)}
              disabled={isDisabled}
              className={cn(
                "relative group w-full flex items-center p-5 rounded-[1.5rem] border transition-all duration-300",
                "bg-card/40 backdrop-blur-xl overflow-hidden",
                !isDisabled 
                  ? "border-foreground/10 hover:border-primary/40 hover:bg-card/60 active:scale-[0.98]" 
                  : "opacity-40 grayscale cursor-not-allowed border-dashed border-zinc-500/20"
              )}
            >
              {/* Contenido de la Tarjeta */}
              <div className="relative z-10 flex items-center w-full gap-5">
                {/* Contenedor de Icono */}
                <div className={cn(
                  "p-3.5 rounded-2xl transition-all duration-500 shadow-inner border border-white/5",
                  !isDisabled ? `${option.bgColor} ${option.color} group-hover:scale-110` : "bg-zinc-500/10 text-zinc-500"
                )}>
                  <Icon size={24} strokeWidth={isDisabled ? 1.5 : 2.5} />
                </div>

                {/* Textos Informativos */}
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-black text-base md:text-lg uppercase tracking-tight text-foreground">
                      {option.title}
                    </h3>
                    {option.badge && (
                      <Badge className="bg-zinc-500/20 text-zinc-500 border-none text-[8px] font-black tracking-tighter px-1.5 h-4">
                        {option.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground font-medium leading-snug">
                    {option.description}
                  </p>
                </div>

                {/* Indicador de Acción */}
                <div className="flex-shrink-0">
                  {!isDisabled ? (
                    <ArrowRight className="text-primary opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" size={20} />
                  ) : (
                    <Lock className="text-zinc-500/50" size={18} />
                  )}
                </div>
              </div>

              {/* Efecto Glow de Hover (Solo en habilitados) */}
              {!isDisabled && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* ESPACIADOR INFERIOR (Para centrado óptico) */}
      <div className="h-10 md:h-20" />
    </div>
  );
}