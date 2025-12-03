// components/create-flow/audio-studio.tsx
// VERSIÓN FINAL: Diseño compacto tipo "Ecualizador", Cero Scroll y Estética Glass.

"use client";

import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { FormField, FormControl, FormItem, FormMessage, FormLabel } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const genderOptions = [{ value: "Masculino" }, { value: "Femenino" }];
const styleOptions = [{ value: "Calmado" }, { value: "Energético" }, { value: "Profesional" }, { value: "Inspirador" }];
const paceOptions = [{ value: "Lento" }, { value: "Moderado" }, { value: "Rápido" }];

export function AudioStudio() {
  const { control, watch } = useFormContext<PodcastCreationData>();
  const speakingRate = watch('speakingRate');

  return (
    <div className="flex flex-col h-full w-full justify-center animate-fade-in px-2 md:px-6 overflow-y-auto scrollbar-hide pb-2">
      
      {/* CABECERA COMPACTA */}
      <div className="text-center mb-4 md:mb-6 flex-shrink-0 w-full">
        <h2 className="text-xl md:text-3xl font-bold tracking-tight text-foreground drop-shadow-sm">
          Diseña la Voz
        </h2>
        <p className="text-xs md:text-sm text-muted-foreground mt-1 font-medium">
          Personaliza el tono y ritmo de tu narrador.
        </p>
      </div>
      
      {/* GRID DE CONTROLES: Optimizado para aprovechar el ancho */}
      <div className="w-full max-w-4xl mx-auto space-y-5">
        
        {/* FILA 1: GÉNERO Y RITMO (Agrupados para ahorrar altura) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* GÉNERO */}
            <FormField
              control={control}
              name="voiceGender"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Género</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-2">
                      {genderOptions.map(option => (
                        <div key={option.value} className="flex-1">
                          <RadioGroupItem value={option.value} id={`gender-${option.value}`} className="sr-only" />
                          <label htmlFor={`gender-${option.value}`} 
                            className={cn(
                              "flex items-center justify-center px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 border text-sm font-medium shadow-sm",
                              field.value === option.value
                                ? "bg-primary/10 border-primary/50 text-primary ring-1 ring-primary/20"
                                : "bg-white/60 dark:bg-white/5 border-black/5 dark:border-white/10 text-foreground hover:bg-white/80 dark:hover:bg-white/10"
                            )}
                          >
                            {option.value}
                          </label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />

            {/* RITMO MACRO */}
            <FormField
              control={control}
              name="voicePace"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Ritmo Base</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-2">
                      {paceOptions.map(option => (
                        <div key={option.value} className="flex-1">
                          <RadioGroupItem value={option.value} id={`pace-${option.value}`} className="sr-only" />
                          <label htmlFor={`pace-${option.value}`} 
                            className={cn(
                              "flex items-center justify-center px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 border text-sm font-medium shadow-sm",
                              field.value === option.value
                                ? "bg-primary/10 border-primary/50 text-primary ring-1 ring-primary/20"
                                : "bg-white/60 dark:bg-white/5 border-black/5 dark:border-white/10 text-foreground hover:bg-white/80 dark:hover:bg-white/10"
                            )}
                          >
                            {option.value}
                          </label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />
        </div>

        {/* FILA 2: ESTILO DE VOZ */}
        <FormField
          control={control}
          name="voiceStyle"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Tono Emocional</FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {styleOptions.map(option => (
                    <div key={option.value}>
                      <RadioGroupItem value={option.value} id={`style-${option.value}`} className="sr-only" />
                      <label htmlFor={`style-${option.value}`} 
                        className={cn(
                          "flex items-center justify-center px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 border text-sm font-medium shadow-sm",
                          field.value === option.value
                            ? "bg-primary/10 border-primary/50 text-primary ring-1 ring-primary/20"
                            : "bg-white/60 dark:bg-white/5 border-black/5 dark:border-white/10 text-foreground hover:bg-white/80 dark:hover:bg-white/10"
                        )}
                      >
                        {option.value}
                      </label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />

        {/* FILA 3: SLIDER DE VELOCIDAD (AJUSTE FINO) */}
        <FormField
          control={control}
          name="speakingRate"
          render={({ field }) => (
            <FormItem className="space-y-4 pt-2">
               <div className="flex justify-between items-center">
                  <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Velocidad Exacta</FormLabel>
                  <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                    {speakingRate?.toFixed(2)}x
                  </span>
               </div>
              <FormControl>
                 <div className="px-1">
                    <Slider 
                        min={0.75} 
                        max={1.25} 
                        step={0.05} 
                        value={[field.value]} 
                        onValueChange={(value) => field.onChange(value[0])} 
                        className="py-4"
                    />
                 </div>
              </FormControl>
              <div className="flex justify-between text-[10px] text-muted-foreground px-1">
                  <span>Lento (0.75x)</span>
                  <span>Normal (1.0x)</span>
                  <span>Rápido (1.25x)</span>
              </div>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}