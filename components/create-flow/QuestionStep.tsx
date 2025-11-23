// components/create-flow/QuestionStep.tsx
"use client";

import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { HelpCircle } from "lucide-react";
import { VoiceInput } from "@/components/ui/voice-input";

export function QuestionStep() {
  const { control, setValue, getValues } = useFormContext<PodcastCreationData>();

  // Para preguntas, solemos querer reemplazar o añadir con un espacio si es continuación
  const handleVoiceInput = (text: string) => {
    const currentText = getValues('question_to_answer') || '';
    // Si es muy corto lo que había, probablemente queremos reemplazar. Si es largo, añadir.
    // Estrategia segura: Añadir siempre con espacio.
    const newText = currentText ? `${currentText} ${text}` : text;
    setValue('question_to_answer', newText, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-3">
          <HelpCircle className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Responde una Pregunta</h2>
        <p className="text-muted-foreground">Proporciona una respuesta clara y concisa a una duda específica.</p>
      </div>
      <div className="flex-grow">
        <FormField
          control={control}
          name="question_to_answer"
          render={({ field }) => (
            <FormItem>
               <div className="flex justify-between items-center mb-2">
                  <FormLabel>¿Qué pregunta quieres responder?</FormLabel>
                  <VoiceInput onTextGenerated={handleVoiceInput} placeholder="Dictar pregunta" />
              </div>
              <FormControl>
                <Input
                  placeholder="Ej: ¿Cómo funciona la edición genética con CRISPR?"
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