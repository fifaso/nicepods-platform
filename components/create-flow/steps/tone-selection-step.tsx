// components/create-flow/steps/tone-selection-step.tsx
// VERSIÓN: 2.0 (Aurora Standard - High Density & Zero Scroll Architecture)

"use client";

import { useFormContext } from "react-hook-form";
import { motion } from "framer-motion";
import { 
  Mic2, 
  Search, 
  Sparkles, 
  Coffee, 
  Zap, 
  Feather,
  ChevronRight,
  Brain
} from "lucide-react";
import { cn } from "@/lib/utils";

import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useCreationContext } from "../shared/context";

/**
 * DEFINICIÓN DE PERSONALIDADES (TONOS)
 * Los valores están sincronizados con la lógica de Prompts del Backend.
 */
const TONE_OPTIONS = [
  { value: "narrador", label: "El Narrador", desc: "Historias envolventes", icon: Mic2, color: "bg-indigo-500/10 text-indigo-400" },
  { value: "esceptico", label: "El Curioso", desc: "Analítico y agudo", icon: Search, color: "bg-emerald-500/10 text-emerald-400" },
  { value: "mentor", label: "El Sabio", desc: "Autoridad y consejo", icon: Sparkles, color: "bg-amber-500/10 text-amber-400" },
  { value: "amigo", label: "El Amigo", desc: "Cercano y casual", icon: Coffee, color: "bg-rose-500/10 text-rose-400" },
  { value: "rebelde", label: "El Rebelde", desc: "Disruptivo y audaz", icon: Zap, color: "bg-yellow-500/10 text-yellow-400" },
  { value: "minimalista", label: "Esencial", desc: "Sin rodeos", icon: Feather, color: "bg-slate-500/10 text-slate-400" },
];

export function ToneSelectionStep() {
  const { control, setValue, watch } = useFormContext<PodcastCreationData>();
  const { onNext } = useCreationContext();
  const selectedTone = watch('selectedTone');

  /**
   * handleSelect
   * Sincroniza tanto el valor visual como el técnico para el Agente IA.
   */
  const handleSelect = (val: string) => {
    setValue('selectedTone', val, { shouldValidate: true, shouldDirty: true });
    // Sincronización oficial con agentName para el orquestador de backend
    setValue('agentName', val, { shouldValidate: true, shouldDirty: true });
    
    // Disparo de navegación inmediato tras selección
    setTimeout(() => onNext(), 200);
  };

  return (
    <div className="flex flex-col h-full w-full max-w-lg mx-auto py-4 px-2 justify-center overflow-hidden">
      
      {/* HEADER ESTRATÉGICO */}
      <header className="text-center mb-6 pt-2 shrink-0">
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-zinc-900 dark:text-white leading-none"
        >
          Personalidad
        </motion.h1>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400 mt-2 flex items-center justify-center gap-2">
          <Brain size={14} className="text-primary" />
          ¿Cómo debería sonar la voz de la IA?
        </p>
      </header>

      {/* STACK DE SELECCIÓN (ALTA DENSIDAD) */}
      <div className="flex-1 flex flex-col gap-2 justify-center">
        <FormField
          control={control}
          name="selectedTone"
          render={() => (
            <FormItem className="space-y-0">
              <FormControl>
                <div className="flex flex-col gap-2">
                  {TONE_OPTIONS.map((opt, index) => {
                    const Icon = opt.icon;
                    const isSelected = selectedTone === opt.value;

                    return (
                      <motion.button
                        key={opt.value}
                        type="button"
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelect(opt.value)}
                        className={cn(
                          "relative w-full flex items-center p-3 rounded-xl border transition-all duration-300",
                          "bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md overflow-hidden",
                          isSelected 
                            ? "border-primary ring-1 ring-primary/30 shadow-lg" 
                            : "border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/20"
                        )}
                      >
                        <div className="flex items-center w-full gap-4 relative z-10">
                          {/* Icono Compacto */}
                          <div className={cn(
                            "p-2.5 rounded-lg transition-all duration-500 shadow-inner",
                            isSelected ? "bg-primary text-white scale-110" : opt.color
                          )}>
                            <Icon size={18} strokeWidth={2.5} />
                          </div>

                          {/* Textos a la Derecha */}
                          <div className="flex-1 text-left min-w-0">
                            <h3 className={cn(
                              "font-bold text-sm uppercase tracking-tight transition-colors leading-none",
                              isSelected ? "text-zinc-900 dark:text-white" : "text-zinc-600 dark:text-zinc-300"
                            )}>
                              {opt.label}
                            </h3>
                            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium leading-tight mt-1 truncate">
                              {opt.desc}
                            </p>
                          </div>

                          {/* Indicador visual de selección */}
                          <ChevronRight 
                            className={cn(
                              "transition-all duration-300",
                              isSelected ? "text-primary opacity-100 translate-x-0" : "text-zinc-300 dark:text-zinc-600 opacity-0 -translate-x-2"
                            )} 
                            size={16} 
                          />
                        </div>

                        {/* Efecto Glow de Selección */}
                        {isSelected && (
                          <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </FormControl>
              <FormMessage className="text-center mt-4 text-[10px] font-bold uppercase tracking-widest text-destructive" />
            </FormItem>
          )}
        />
      </div>

      {/* ESPACIADOR PARA EQUILIBRIO VISUAL */}
      <div className="h-6 md:h-12 shrink-0" />
    </div>
  );
}