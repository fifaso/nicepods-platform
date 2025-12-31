// components/create-flow/steps/tone-selection-step.tsx
// VERSIÓN: 1.0 (Modular Standard - Precise Agent Mapping)

"use client";

import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { cn } from "@/lib/utils";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Mic2, Search, Sparkles, Coffee, Zap, Feather } from "lucide-react";

const toneOptions = [
  { value: "narrador", label: "El Narrador", desc: "Historias envolventes", icon: <Mic2 className="h-5 w-5 text-indigo-400" /> },
  { value: "esceptico", label: "El Curioso", desc: "Analítico y agudo", icon: <Search className="h-5 w-5 text-emerald-400" /> },
  { value: "mentor", label: "El Sabio", desc: "Autoridad y consejo", icon: <Sparkles className="h-5 w-5 text-amber-400" /> },
  { value: "amigo", label: "El Amigo", desc: "Cercano y casual", icon: <Coffee className="h-5 w-5 text-rose-400" /> },
  { value: "rebelde", label: "El Rebelde", desc: "Disruptivo y audaz", icon: <Zap className="h-5 w-5 text-yellow-400" /> },
  { value: "minimalista", label: "Esencial", desc: "Sin rodeos", icon: <Feather className="h-5 w-5 text-slate-400" /> },
];

export function ToneSelectionStep() {
  const { control, setValue, watch } = useFormContext<PodcastCreationData>();
  const selectedTone = watch('selectedTone');

  const handleSelect = (val: string) => {
    setValue('selectedTone', val, { shouldValidate: true });
    // [FIX CRÍTICO]: Sincronizamos con agentName para que el backend lo reconozca
    setValue('agentName', val, { shouldValidate: true });
  };

  return (
    <div className="flex flex-col h-full w-full items-center justify-center animate-in fade-in duration-500 px-4">
      <div className="text-center mb-8 flex-shrink-0">
        <h2 className="text-2xl font-black tracking-tight">Personalidad</h2>
        <p className="text-xs text-muted-foreground mt-1">¿Cómo debería sonar la voz de la IA?</p>
      </div>

      <div className="w-full max-w-4xl overflow-y-auto custom-scrollbar-hide pb-10">
        <FormField
            control={control}
            name="selectedTone"
            render={() => (
                <FormItem>
                    <FormControl>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {toneOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => handleSelect(opt.value)}
                                    className={cn(
                                        "flex items-center text-left p-4 rounded-2xl border-2 transition-all duration-300 backdrop-blur-sm",
                                        selectedTone === opt.value
                                            ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(168,85,247,0.2)]"
                                            : "border-border/40 bg-white/5 hover:bg-white/10"
                                    )}
                                >
                                    <div className={cn("p-3 rounded-xl mr-4", selectedTone === opt.value ? "bg-primary text-white" : "bg-background/50")}>
                                        {opt.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold">{opt.label}</p>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">{opt.desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </FormControl>
                    <FormMessage className="text-center mt-4" />
                </FormItem>
            )}
        />
      </div>
    </div>
  );
}