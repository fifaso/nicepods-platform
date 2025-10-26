"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

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
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Slider } from "@/components/ui/slider";
import { Loader2, User, UserSquare2 } from "lucide-react";

// ================== INTERVENCIÓN QUIRÚRGICA: LA "MATRIZ DE DECISIÓN" CHIRP ==================
// Se actualiza la matriz para usar los identificadores de Chirp.
// NOTA: Estos son mapeos sugeridos. Debes reemplazarlos con los resultados de tu "casting" (Hito 0).
const voiceMatrix = {
  MALE: {
    Formal: "chirp-es-001", // Suposición: La primera voz masculina es la 'Formal'.
    Cálida: "chirp-es-002", // Suposición: La segunda voz masculina es la 'Cálida'.
  },
  FEMALE: {
    // Asumiendo que el casting encontró al menos dos voces femeninas.
    Formal: "chirp-es-003", 
    Cálida: "chirp-es-004", 
  }
} as const;
// ==============================================================================================

interface AudioStudioProps {
  podcastId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AudioStudio({ podcastId, isOpen, onClose }: AudioStudioProps) {
  const { supabase } = useAuth();
  const { toast } = useToast();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedGender, setSelectedGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [selectedStyle, setSelectedStyle] = useState<'Formal' | 'Cálida'>('Formal');
  const [speakingRate, setSpeakingRate] = useState(1.0);

  const finalVoiceName = useMemo(() => {
    return voiceMatrix[selectedGender][selectedStyle];
  }, [selectedGender, selectedStyle]);
  
  const handleGenerateAudio = useCallback(async () => {
    if (!supabase) {
      toast({ title: "Error", description: "La conexión con Supabase no está disponible.", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-audio-from-script', {
        body: {
          podcastId: podcastId,
          voiceName: finalVoiceName,
          speakingRate: speakingRate,
        }
      });
      if (error) { throw new Error(error.message); }
      toast({
        title: "¡Petición Enviada!",
        description: "Tu audio con voz Chirp está siendo generado. Podrás escucharlo en tu biblioteca en unos momentos.",
      });
      onClose();
    } catch (e) {
      console.error("Error al generar el audio:", e);
      toast({
        title: "Error al Generar el Audio",
        description: e instanceof Error ? e.message : "Hubo un problema inesperado.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [podcastId, finalVoiceName, speakingRate, supabase, toast, onClose]);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Estudio de Audio (Calidad Chirp)</DialogTitle>
          <DialogDescription>
            Actúa como director. Elige el narrador, el estilo y el ritmo para tu micro-podcast.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-8 py-4">
          <div className="grid gap-3">
            <Label>1. Tipo de Narrador</Label>
            <ToggleGroup
              type="single"
              value={selectedGender}
              onValueChange={(value: 'MALE' | 'FEMALE') => { if (value) setSelectedGender(value); }}
              className="grid grid-cols-2"
            >
              <ToggleGroupItem value="MALE" aria-label="Voz Masculina" className="h-12"><User className="h-5 w-5 mr-2" />Masculino</ToggleGroupItem>
              <ToggleGroupItem value="FEMALE" aria-label="Voz Femenina" className="h-12"><UserSquare2 className="h-5 w-5 mr-2" />Femenino</ToggleGroupItem>
            </ToggleGroup>
          </div>
          
          <div className="grid gap-3">
            <Label>2. Estilo de Voz</Label>
            <ToggleGroup
              type="single"
              value={selectedStyle}
              onValueChange={(value: 'Formal' | 'Cálida') => { if (value) setSelectedStyle(value); }}
              className="grid grid-cols-2 gap-3"
            >
              <ToggleGroupItem value="Formal" aria-label="Estilo Formal" className="h-12">Formal</ToggleGroupItem>
              <ToggleGroupItem value="Cálida" aria-label="Estilo Cálido" className="h-12">Cálida</ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="grid gap-3">
            <Label>3. Velocidad del Habla ({speakingRate.toFixed(2)}x)</Label>
            <Slider
              min={0.75} max={1.25} step={0.05}
              value={[speakingRate]} onValueChange={(val) => setSpeakingRate(val[0])}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isGenerating}>Cancelar</Button>
          <Button onClick={handleGenerateAudio} disabled={isGenerating}>
            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Generar Audio
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}