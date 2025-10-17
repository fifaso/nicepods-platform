"use client";

import { useState, useCallback } from "react";

// --- Importaciones de Componentes de UI (sin cambios) ---
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
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

// ================== INTERVENCIÓN QUIRÚRGICA #1: LISTA DE VOCES ENFOCADA ==================
// Se refina la lista para ofrecer únicamente las opciones en español para el MVP.
const voiceOptions = [
  { name: "es-US-Wavenet-A", description: "Voz Masculina (EE.UU., Clara)" },
  { name: "es-US-Wavenet-C", description: "Voz Femenina (EE.UU., Cálida)" },
  { name: "es-ES-Wavenet-B", description: "Voz Masculina (España, Formal)" },
  { name: "es-ES-Wavenet-C", description: "Voz Femenina (España, Suave)" },
];
// =======================================================================================

interface AudioStudioProps {
  podcastId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AudioStudio({ podcastId, isOpen, onClose }: AudioStudioProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<string>(voiceOptions[0].name);

  // ================== INTERVENCIÓN QUIRÚRGICA #2: LIMPIEZA DEL ESTADO ==================
  // Se eliminan los estados `speakingRate` y `pitch` que no se usarán en este hito.
  // =======================================================================================
  
  const handleGenerateAudio = useCallback(() => {
    // ================== INTERVENCIÓN QUIRÚRGICA #3: LÓGICA SIMPLIFICADA ==================
    // La función ahora solo registra la información esencial para este hito.
    console.log("=== INICIANDO GENERACIÓN DE AUDIO (HITO 1 COMPLETADO) ===");
    console.log("Podcast ID:", podcastId);
    console.log("Voz Seleccionada:", selectedVoice);
    console.log("========================================================");
    // =======================================================================================
    
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      onClose();
    }, 2000);
  }, [podcastId, selectedVoice, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Estudio de Audio</DialogTitle>
          <DialogDescription>
            Selecciona la voz para tu micro-podcast. Pronto podrás personalizar el ritmo y el tono.
          </DialogDescription>
        </DialogHeader>
        
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
          
          {/* ================== INTERVENCIÓN QUIRÚRGICA #4: ELIMINACIÓN DE CONTROLES ================== */}
          {/* Se eliminan los `Slider` de velocidad y tono para enfocar el MVP. */}
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