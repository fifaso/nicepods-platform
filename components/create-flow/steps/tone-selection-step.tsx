// components/create-flow/tone-selection-step.tsx
// VERSIÓN FINAL: Selección de Tono Creativo. Diseño coherente con PurposeSelection.

"use client";

import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { cn } from "@/lib/utils";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Mic2, Search, Sparkles, Coffee, Zap, Feather } from "lucide-react";

// Los 6 Tonos Creativos (Arquetipos de Voz)
const toneOptions = [
  { 
    value: "narrador", 
    label: "El Narrador", 
    desc: "Cuenta una historia envolvente.", 
    icon: <Mic2 className="h-5 w-5 text-indigo-500 dark:text-indigo-400" /> 
  },
  { 
    value: "esceptico", 
    label: "El Curioso", 
    desc: "Analítico, cuestiona y descubre.", 
    icon: <Search className="h-5 w-5 text-emerald-500 dark:text-emerald-400" /> 
  },
  { 
    value: "mentor", 
    label: "El Sabio", 
    desc: "Calma, autoridad y consejo.", 
    icon: <Sparkles className="h-5 w-5 text-amber-500 dark:text-amber-400" /> 
  },
  { 
    value: "amigo", 
    label: "El Amigo", 
    desc: "Casual, cercano y con humor.", 
    icon: <Coffee className="h-5 w-5 text-rose-500 dark:text-rose-400" /> 
  },
  { 
    value: "rebelde", 
    label: "El Rebelde", 
    desc: "Provocador, directo y audaz.", 
    icon: <Zap className="h-5 w-5 text-yellow-500 dark:text-yellow-400" /> 
  },
  { 
    value: "minimalista", 
    label: "Esencial", 
    desc: "Pura información, sin rodeos.", 
    icon: <Feather className="h-5 w-5 text-slate-500 dark:text-slate-400" /> 
  },
];

export function ToneSelectionStep() {
  const { control, setValue, watch } = useFormContext<PodcastCreationData>();
  const selectedTone = watch('selectedTone');

  const handleSelect = (value: string) => {
    setValue('selectedTone', value, { shouldValidate: true });
  };

  return (
    <div className="flex flex-col h-full w-full justify-center items-center animate-fade-in px-2 md:px-6 overflow-y-auto scrollbar-hide pb-2">
      
      <div className="text-center mb-4 md:mb-8 flex-shrink-0 w-full">
        <h2 className="text-xl md:text-3xl font-bold tracking-tight text-foreground drop-shadow-sm">
          Dale Personalidad
        </h2>
        <p className="text-xs md:text-sm text-muted-foreground mt-1 font-medium">
          ¿Cómo debería sonar la voz de la IA?
        </p>
      </div>

      <div className="w-full max-w-4xl">
        <FormField
            control={control}
            name="selectedTone"
            render={() => (
                <FormItem>
                    <FormControl>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {toneOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => handleSelect(option.value)}
                                    className={cn(
                                        "group relative flex items-center text-left transition-all duration-300 p-3 md:p-4",
                                        "border rounded-xl overflow-hidden backdrop-blur-sm shadow-sm",
                                        selectedTone === option.value
                                            ? "bg-primary/10 border-primary/50 ring-1 ring-primary/50"
                                            : "bg-white/60 dark:bg-white/5 border-black/5 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10"
                                    )}
                                >
                                    {/* Icono */}
                                    <div className="flex-shrink-0 mr-4">
                                        <div className={cn(
                                            "flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-lg transition-transform duration-300 shadow-sm border",
                                            "bg-white dark:bg-black/20 border-black/5 dark:border-white/5",
                                            selectedTone === option.value ? "scale-110" : "group-hover:scale-105"
                                        )}>
                                            {option.icon}
                                        </div>
                                    </div>

                                    {/* Texto */}
                                    <div className="flex-grow min-w-0">
                                        <h3 className={cn(
                                            "text-sm md:text-base font-bold transition-colors",
                                            selectedTone === option.value ? "text-primary" : "text-foreground group-hover:text-primary"
                                        )}>
                                            {option.label}
                                        </h3>
                                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 font-medium">
                                            {option.desc}
                                        </p>
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