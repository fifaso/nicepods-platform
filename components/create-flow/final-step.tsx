// components/create-flow/final-step.tsx
"use client";

import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function FinalStep() {
  // Obtenemos acceso a todos los datos del formulario con getValues.
  const { getValues } = useFormContext<PodcastCreationData>();
  const formData = getValues();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Confirma tu Creación</h2>
        <p className="text-muted-foreground">Revisa los detalles antes de enviar tu idea a la IA.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Resumen del Podcast</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {formData.style === 'solo' && (
            <>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estilo</span>
                <Badge variant="outline">Solo Talk</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tema</span>
                <span className="font-medium text-right">{formData.solo_topic}</span>
              </div>
            </>
          )}
          {formData.style === 'link' && formData.link_selectedNarrative && (
             <>
               <div className="flex justify-between">
                <span className="text-muted-foreground">Estilo</span>
                <Badge variant="outline">Unir Puntos</Badge>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-muted-foreground">Narrativa Seleccionada</span>
                <div className="p-3 bg-muted rounded-md">
                  <p className="font-medium">{formData.link_selectedNarrative.title}</p>
                  <p className="text-xs text-muted-foreground">{formData.link_selectedNarrative.thesis}</p>
                </div>
              </div>
             </>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Duración</span>
            <span className="font-medium">{formData.duration}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}