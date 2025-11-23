// components/create-flow/LegacyStep.tsx
"use client";

import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { PenSquare } from "lucide-react";
import { VoiceInput } from "@/components/ui/voice-input";

export function LegacyStep() {
  const { control, setValue, getValues } = useFormContext<PodcastCreationData>();

  const handleVoiceInput = (text: string) => {
    const currentText = getValues('legacy_lesson') || '';
    const newText = currentText ? `${currentText}\n\n${text}` : text;
    setValue('legacy_lesson', newText, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-3">
          <PenSquare className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Deja tu Legado</h2>
        <p className="text-muted-foreground">¿Qué sabiduría quieres preservar? Captura una experiencia o lección importante.</p>
      </div>
      <div className="flex-grow">
        <FormField
          control={control}
          name="legacy_lesson"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between items-center mb-2">
                  <FormLabel>Describe la lección de vida o experiencia:</FormLabel>
                  <VoiceInput onTextGenerated={handleVoiceInput} placeholder="Narrar historia" />
              </div>
              <FormControl>
                <Textarea
                  placeholder="Ej: Aprendí que la vulnerabilidad no es una debilidad... (Usa el micrófono para contar tu historia)"
                  className="resize-none min-h-[200px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}