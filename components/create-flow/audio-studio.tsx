// app/components/audio-studio.tsx
// VERSIÓN DE PRODUCCIÓN FINAL

"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { FormLabel } from "@/components/ui/form";
import { Loader2 } from "lucide-react";

interface VoiceOption {
  name: string;
  description: string;
  gender: string;
}

interface AudioStudioProps {
  podcastId: string; // El ID del guion que vamos a procesar
  isOpen: boolean;
  onClose: () => void;
}

export function AudioStudio({ podcastId, isOpen, onClose }: AudioStudioProps) {
  const { supabase } = useAuth();
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Estado para los controles del usuario
  const [selectedVoice, setSelectedVoice] = useState<string | undefined>(undefined);
  const [speakingRate, setSpeakingRate] = useState(1.0);
  const [pitch, setPitch] = useState(0);

  useEffect(() => {
    if (isOpen && supabase) {
      const fetchVoices = async () => {
        setIsLoading(true);
        const { data, error } = await supabase.functions.invoke('get-audio-options');
        if (error) {
          console.error("Error al cargar las voces:", error);
        } else if (data.voices) {
          setVoices(data.voices);
          // Opcional: establecer una voz por defecto
          if (data.voices.length > 0) {
            setSelectedVoice(data.voices[0].name);
          }
        }
        setIsLoading(false);
      };
      fetchVoices();
    }
  }, [isOpen, supabase]);
  
  const handleGenerateAudio = useCallback(() => {
    // Criterio de éxito del Hito 1:
    // Por ahora, solo registramos los datos que enviaremos en el Hito 3.
    console.log("=== INICIANDO GENERACIÓN DE AUDIO (HITO 1) ===");
    console.log("Podcast ID:", podcastId);
    console.log("Voz Seleccionada:", selectedVoice);
    console.log("Velocidad:", speakingRate);
    console.log("Tono:", pitch);
    console.log("==============================================");
    
    // Aquí es donde, en el Hito 3, llamaremos a `generate-audio-from-script`.
    setIsGenerating(true);
    // Simulación de la llamada
    setTimeout(() => {
      setIsGenerating(false);
      onClose(); // Cierra el modal al "terminar"
    }, 2000);

  }, [podcastId, selectedVoice, speakingRate, pitch, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Estudio de Audio</DialogTitle>
          <DialogDescription>
            Personaliza la voz y el ritmo de tu micro-podcast antes de generar el audio final.
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <FormLabel>Voz del Narrador</FormLabel>
              <Select onValueChange={setSelectedVoice} value={selectedVoice}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una voz..." />
                </SelectTrigger>
                <SelectContent>
                  {voices.map(voice => (
                    <SelectItem key={voice.name} value={voice.name}>
                      {voice.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <FormLabel>Velocidad de Habla ({speakingRate.toFixed(2)}x)</FormLabel>
              <Slider
                min={0.75} max={1.25} step={0.05}
                value={[speakingRate]} onValueChange={(val) => setSpeakingRate(val[0])}
              />
            </div>
            <div className="grid gap-2">
              <FormLabel>Tono de Voz ({pitch > 0 ? '+' : ''}{pitch})</FormLabel>
               <Slider
                min={-4} max={4} step={0.5}
                value={[pitch]} onValueChange={(val) => setPitch(val[0])}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isGenerating}>Cancelar</Button>
          <Button onClick={handleGenerateAudio} disabled={isLoading || isGenerating || !selectedVoice}>
            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Generar Audio
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}