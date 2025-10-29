// components/create-flow/audio-studio.tsx
// VERSIÓN FINAL COMPLETA CON SELECCIONES ESTRUCTURADAS

"use client";

import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { FormField, FormControl, FormItem, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const genderOptions = [{ value: "Masculino" }, { value: "Femenino" }];
const styleOptions = [{ value: "Calmado" }, { value: "Energético" }, { value: "Profesional" }, { value: "Inspirador" }];
const paceOptions = [{ value: "Lento" }, { value: "Moderado" }, { value: "Rápido" }];

export function AudioStudio() {
  const { control, watch } = useFormContext<PodcastCreationData>();
  const speakingRate = watch('speakingRate');

  return (
    <div className="flex flex-col h-full space-y-8 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Diseña la Voz de tu Podcast</h2>
        <p className="text-muted-foreground">Actúa como director. Selecciona las características de la voz.</p>
      </div>
      
      <div className="space-y-6">
        <FormField
          control={control}
          name="voiceGender"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <Label className="font-semibold">1. Género de la Voz</Label>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 gap-4">
                  {genderOptions.map(option => (
                    <FormItem key={option.value}>
                      <FormControl><RadioGroupItem value={option.value} id={option.value} className="sr-only" /></FormControl>
                      <Label htmlFor={option.value} className={cn("flex items-center justify-center p-4 rounded-lg cursor-pointer transition-all duration-200 border-2", field.value === option.value ? "border-primary" : "bg-muted/30 hover:bg-muted/60")}>
                        {option.value}
                      </Label>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="voiceStyle"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <Label className="font-semibold">2. Tono y Estilo</Label>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {styleOptions.map(option => (
                    <FormItem key={option.value}>
                      <FormControl><RadioGroupItem value={option.value} id={option.value} className="sr-only" /></FormControl>
                      <Label htmlFor={option.value} className={cn("flex items-center justify-center p-4 rounded-lg cursor-pointer transition-all duration-200 border-2", field.value === option.value ? "border-primary" : "bg-muted/30 hover:bg-muted/60")}>
                        {option.value}
                      </Label>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="speakingRate"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <Label className="font-semibold">3. Ajuste Fino de Velocidad ({speakingRate?.toFixed(2)}x)</Label>
              <FormControl>
                <Slider min={0.75} max={1.25} step={0.05} value={[field.value]} onValueChange={(value) => field.onChange(value[0])} />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}