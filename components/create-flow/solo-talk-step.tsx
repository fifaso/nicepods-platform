"use client";

import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function SoloTalkStep() {
  const { control } = useFormContext<PodcastCreationData>();

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
            <FormLabel>¿Qué quieres explorar o enseñar? *</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Ej: Quiero explorar el impacto accidental de la ciencia y cómo un error puede cambiar el mundo."
                className="resize-none"
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