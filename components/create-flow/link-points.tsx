// components/create-flow/link-points.tsx
"use client"

import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // Label de react-hook-form es mejor, pero mantenemos esta si se usa fuera de los campos
import { Lightbulb, Link2 } from "lucide-react";
// El tipo de datos ahora lo importamos desde nuestro schema centralizado.
import { PodcastCreationData } from "@/lib/validation/podcast-schema";

// Ya no necesitamos las props antiguas (formData, updateFormData).
// El componente ahora es autónomo y obtiene todo del contexto del formulario.
export function LinkPointsStep() {
  // Obtenemos el control del formulario del "padre" (FormProvider).
  const { control } = useFormContext<PodcastCreationData>();

  return (
    <div>
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-3">
          <Link2 className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Une Tus Puntos</h2>
        <p className="text-muted-foreground">Proporciona dos conceptos para que la IA los conecte.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Campo para Topic A, ahora controlado por react-hook-form */}
        <FormField
          control={control}
          name="link_topicA"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tema A *</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Filosofía Estoica" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Campo para Topic B, ahora controlado por react-hook-form */}
        <FormField
          control={control}
          name="link_topicB"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tema B *</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Productividad Moderna" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      {/* Campo para el Catalizador, ahora controlado por react-hook-form */}
      <FormField
        control={control}
        name="link_catalyst"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center">
              <Lightbulb className="h-4 w-4 mr-2 text-yellow-500"/>Catalizador Creativo
            </FormLabel>
            <FormControl>
              <Input placeholder="Ej: desde una perspectiva neurocientífica" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}