"use client";

import { useState, useCallback } from "react";

// ================== INTERVENCIÓN QUIRÚRGICA #1: LA IMPORTACIÓN CORRECTA ==================
// Se reemplaza `FormLabel` por el componente `Label` estándar y sin contexto.
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
import { Label } from "@/components/ui/label"; // <-- ¡ESTA ES LA CORRECCIÓN!
import { Loader2 } from "lucide-react";
// =======================================================================================

const voiceOptions = [
  { name: "es-US-Wavenet-A", description: "Voz Masculina (EE.UU., Clara)" },
  { name: "es-US-Wavenet-C", description: "Voz Femenina (EE.UU., Cálida)" },
  { name: "es-ES-Wavenet-B", description: "Voz Masculina (España, Formal)" },
  { name: "es-ES-Wavenet-C", description: "Voz Femenina (España, Suave)" },
  { name: "en-US-Wavenet-D", description: "Voz Masculina (Inglés, Profesional)" },
  { name: "en-US-Wavenet-F", description: "Voz Femenina (Inglés, Profesional)" },
];

interface AudioStudioProps {
  podcastId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AudioStudio({ podcastId, isOpen, onClose }: AudioStudioProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<string>(voiceOptions[0].name);
  const [speakingRate, setSpeakingRate] = useState(1.0);
  const [pitch, setPitch] = useState(0);
  
  const handleGenerateAudio = useCallback(() => {
    console.log("=== INICIANDO GENERACIÓN DE AUDIO (HITO 1) ===");
    console.log("Podcast ID:", podcastId);
    console.log("Voz Seleccionada:", selectedVoice);
    console.log("Velocidad:", speakingRate);
    console.log("Tono:", pitch);
    console.log("==============================================");
    
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
        
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            {/* ================== INTERVENCIÓN QUIRÚRGICA #2: EL COMPONENTE CORRECTO ================== */}
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
          {/* ======================================================================================= */}
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