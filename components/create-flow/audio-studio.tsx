// components/create-flow/audio-studio.tsx
// VERSIÓN FINAL COMPLETA - REFACTORIZADA COMO PASO DEL FORMULARIO

"use client";

import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { FormField, FormControl, FormItem, FormMessage } from "@/components/ui/form";

export function AudioStudio() {
  const { control, watch } = useFormContext<PodcastCreationData>();
  const speakingRate = watch('speakingRate');

  return (
    <div className="flex flex-col h-full space-y-8 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Diseña la Voz de tu Podcast</h2>
        <p className="text-muted-foreground">Actúa como director. Describe la voz y el ritmo que imaginas.</p>
      </div>
      
      <div className="grid gap-6 py-4">
        <FormField
          control={control}
          name="voicePrompt"
          render={({ field }) => (
            <FormItem className="grid gap-3">
              <Label htmlFor="voice-prompt">1. Describe la Voz Deseada</Label>
              <FormControl>
                <Textarea
                  id="voice-prompt"
                  placeholder="Ej: Una voz femenina, suave y profesional, como para un documental."
                  className="min-h-[100px]"
                  maxLength={200}
                  {...field}
                />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                Sé descriptivo: menciona el género, el tono (ej. entusiasta, serio), y el ritmo (ej. rápido, pausado).
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="speakingRate"
          render={({ field }) => (
            <FormItem className="grid gap-3">
              <Label>2. Ajuste Fino de Velocidad ({speakingRate?.toFixed(2)}x)</Label>
              <FormControl>
                <Slider
                  min={0.75} max={1.25} step={0.05}
                  value={[field.value]} 
                  onValueChange={(value) => field.onChange(value[0])}
                />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                Usa este control para hacer pequeños ajustes al ritmo general.
              </p>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}