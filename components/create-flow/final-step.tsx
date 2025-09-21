"use client";

import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link2, Mic, Clock, Palette, BrainCircuit } from "lucide-react";

export function FinalStep() {
  const { watch } = useFormContext<PodcastCreationData>();
  const formData = watch();

  return (
    <div className="flex flex-col space-y-6 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Confirma tu Creación</h2>
        <p className="text-muted-foreground">Revisa los detalles finales antes de enviar tu idea a la IA.</p>
      </div>

      <Card className="bg-background/50 w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Resumen de tu Micro-Podcast</CardTitle>
          <CardDescription>Esta será la base para la generación del guion.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Separator />
          
          {formData.style === 'solo' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center text-muted-foreground font-medium">
                  <Mic className="h-4 w-4 mr-2" />
                  <span>Estilo</span>
                </div>
                <Badge variant="secondary">Monólogo</Badge>
              </div>
              <Separator />
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-muted-foreground">Tema Principal</span>
                <p className="font-semibold text-primary">{formData.solo_topic || "No especificado"}</p>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-muted-foreground">Concepto a Explorar</span>
                <p className="text-sm italic leading-relaxed">"{formData.solo_motivation || "No especificado"}"</p>
              </div>
            </div>
          )}

          {formData.style === 'link' && (
             <div className="space-y-4">
               <div className="flex justify-between items-center">
                <div className="flex items-center text-muted-foreground font-medium">
                  <Link2 className="h-4 w-4 mr-2" />
                  <span>Estilo</span>
                </div>
                <Badge variant="secondary">Unir Ideas</Badge>
              </div>
              <Separator />
               <div className="flex flex-col space-y-1">
                <span className="text-sm text-muted-foreground">Narrativa Seleccionada</span>
                {formData.link_selectedNarrative ? (
                  <div className="mt-1 p-3 bg-muted rounded-md border">
                    <p className="font-semibold text-primary">{formData.link_selectedNarrative.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formData.link_selectedNarrative.thesis}</p>
                  </div>
                ) : (
                  <p className="text-sm text-destructive-foreground">No seleccionada</p>
                )}
              </div>
               <div className="flex justify-between items-center">
                <div className="flex items-center text-muted-foreground">
                  <Palette className="h-4 w-4 mr-2" />
                  <span>Tono</span>
                </div>
                <span className="font-medium">{formData.link_selectedTone || "No especificado"}</span>
              </div>
             </div>
          )}
          
          <Separator />

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center text-muted-foreground">
                <Clock className="h-4 w-4 mr-2" />
                <span>Duración Estimada</span>
              </div>
              <span className="font-medium">{formData.duration || "No especificada"}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center text-muted-foreground">
                <BrainCircuit className="h-4 w-4 mr-2" />
                <span>Profundidad Narrativa</span>
              </div>
              <span className="font-medium">{formData.narrativeDepth || "No especificada"}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}