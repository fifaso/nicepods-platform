// components/create-flow/solo-talk-step.tsx
"use client";

import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { VoiceInput } from "@/components/ui/voice-input";

export function SoloTalkStep() {
  const { control, setValue, getValues } = useFormContext<PodcastCreationData>();

  // Manejador Inteligente: Añade el nuevo texto al existente
  const handleVoiceInput = (text: string) => {
    const currentText = getValues('solo_motivation') || '';
    // Si hay texto, añade dos saltos de línea para separar párrafos
    const newText = currentText ? `${currentText}\n\n${text}` : text;
    
    setValue('solo_motivation', newText, { 
      shouldValidate: true, 
      shouldDirty: true 
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Describe tu Idea</h2>
        <p className="text-muted-foreground">Proporciona el núcleo de tu micro-podcast.</p>
      </div>
      <FormField
        control={control}
        name="solo_topic"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tema Principal *</FormLabel>
            <FormControl>
              <Input placeholder="Ej: La historia de la penicilina" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="solo_motivation"
        render={({ field }) => (
          <FormItem>
            <div className="flex justify-between items-center mb-2">
                <FormLabel>¿Desde qué perspectiva quieres explorar este tema? *</FormLabel>
                <VoiceInput onTextGenerated={handleVoiceInput} />
            </div>
            <FormControl>
              <Textarea
                placeholder="Ej: Quiero explorar el impacto accidental de la ciencia... (O usa el micrófono para hablar)"
                className="resize-none min-h-[150px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}