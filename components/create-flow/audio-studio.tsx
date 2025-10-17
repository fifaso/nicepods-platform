"use client";

import { useState, useCallback } from "react";

// --- Importaciones de Componentes de UI ---
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

// ================== ARQUITECTURA DE CONFIGURACIÓN ESTÁTICA ==================
// La lista de voces es una constante estática. Esto elimina la dependencia de red,
// haciendo la UI más rápida, más robusta y más fácil de mantener.
const voiceOptions = [
  { name: "es-US-Wavenet-A", description: "Voz Masculina (EE.UU., Clara)" },
  { name: "es-US-Wavenet-C", description: "Voz Femenina (EE.UU., Cálida)" },
  { name: "es-ES-Wavenet-B", description: "Voz Masculina (España, Formal)" },
  { name: "es-ES-Wavenet-C", description: "Voz Femenina (España, Suave)" },
];
// =========================================================================

interface AudioStudioProps {
  podcastId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AudioStudio({ podcastId, isOpen, onClose }: AudioStudioProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  
  // El estado ahora puede tener un valor por defecto directamente de la constante.
  const [selectedVoice, setSelectedVoice] = useState<string>(voiceOptions[0].name);
  const [speakingRate, setSpeakingRate] = useState(1.0);
  const [pitch, setPitch] = useState(0);
  
  const handleGenerateAudio = useCallback(() => {
    // Criterio de éxito del Hito 1:
    console.log("=== INICIANDO GENERACIÓN DE AUDIO (HITO 1 COMPLETADO) ===");
    console.log("Podcast ID:", podcastId);
    console.log("Voz Seleccionada:", selectedVoice);
    console.log("Velocidad:", speakingRate);
    console.log("Tono:", pitch);
    console.log("========================================================");
    
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      onClose();
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
        
        {/* Se elimina el estado de carga, ya que los datos son instantáneos. */}
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label>Voz del Narrador</Label>
            <Select onValueChange={setSelectedVoice} value={selectedVoice}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una voz..." />
              </SelectTrigger>
              <SelectContent>
                {voiceOptions.map(voice => (
                  <SelectItem key={voice.name} value={voice.name}>
                    {voice.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Velocidad de Habla ({speakingRate.toFixed(2)}x)</Label>
            <Slider
              min={0.75} max={1.25} step={0.05}
              value={[speakingRate]} onValueChange={(val) => setSpeakingRate(val[0])}
            />
          </div>
          <div className="grid gap-2">
            <Label>Tono de Voz ({pitch > 0 ? '+' : ''}{pitch})</Label>
             <Slider
              min={-4} max={4} step={0.5}
              value={[pitch]} onValueChange={(val) => setPitch(val[0])}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isGenerating}>Cancelar</Button>
          <Button onClick={handleGenerateAudio} disabled={isGenerating || !selectedVoice}>
            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Generar Audio
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}