"use client";

import { useState, useCallback, useEffect } from "react";

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
import { Loader2, User, UserSquare2 } from "lucide-react"; // Usamos iconos para el género

// ================== INTERVENCIÓN QUIRÚRGICA #1: ESTRUCTURA DE DATOS DE VOZ ENRIQUECIDA ==================
// La lista de voces ahora es una "base de datos" de actores, con género y una descripción de estilo.
// Se han eliminado las voces en inglés como solicitaste.
const voiceOptions = [
  { name: "es-US-Wavenet-A", gender: "MALE", description: "Voz Clara (EE.UU.)" },
  { name: "es-ES-Wavenet-B", gender: "MALE", description: "Voz Formal (España)" },
  { name: "es-US-Wavenet-C", gender: "FEMALE", description: "Voz Cálida (EE.UU.)" },
  { name: "es-ES-Wavenet-C", gender: "FEMALE", description: "Voz Suave (España)" },
];
// =====================================================================================================

interface AudioStudioProps {
  podcastId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AudioStudio({ podcastId, isOpen, onClose }: AudioStudioProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  
  // ================== INTERVENCIÓN QUIRÚRGICA #2: GESTIÓN DE ESTADO JERÁRQUICA ==================
  // Separamos el estado para el género y para la voz final.
  const [selectedGender, setSelectedGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>(voiceOptions.find(v => v.gender === 'MALE')!.name);

  // Efecto para actualizar la voz seleccionada cuando cambia el género,
  // asegurando que siempre haya una opción válida seleccionada.
  useEffect(() => {
    const firstVoiceOfGender = voiceOptions.find(v => v.gender === selectedGender);
    if (firstVoiceOfGender) {
      setSelectedVoiceName(firstVoiceOfGender.name);
    }
  }, [selectedGender]);
  // ==============================================================================================
  
  const handleGenerateAudio = useCallback(() => {
    // La función de "éxito" ahora recoge solo la voz final. Los otros parámetros
    // se añadirán en el backend con valores por defecto.
    console.log("=== INICIANDO GENERACIÓN DE AUDIO (HITO 1 COMPLETADO) ===");
    console.log("Podcast ID:", podcastId);
    console.log("Voz Seleccionada (Nombre Técnico):", selectedVoiceName);
    console.log("========================================================");
    
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      onClose();
    }, 2000);
  }, [podcastId, selectedVoiceName, onClose]);

  // Filtramos las voces disponibles basándonos en el género seleccionado.
  const availableVoices = voiceOptions.filter(v => v.gender === selectedGender);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Estudio de Audio</DialogTitle>
          <DialogDescription>
            Actúa como director. Elige la voz y el estilo para tu micro-podcast.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-8 py-4">
          {/* ================== INTERVENCIÓN QUIRÚRGICA #3: SELECCIÓN DE GÉNERO ================== */}
          <div className="grid gap-3">
            <Label>1. Tipo de Narrador</Label>
            <ToggleGroup
              type="single"
              value={selectedGender}
              onValueChange={(value: 'MALE' | 'FEMALE') => {
                if (value) setSelectedGender(value);
              }}
              className="grid grid-cols-2"
            >
              <ToggleGroupItem value="MALE" aria-label="Voz Masculina" className="h-12">
                <User className="h-5 w-5 mr-2" />
                Masculino
              </ToggleGroupItem>
              <ToggleGroupItem value="FEMALE" aria-label="Voz Femenina" className="h-12">
                <UserSquare2 className="h-5 w-5 mr-2" />
                Femenino
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          {/* ======================================================================================= */}
          
          {/* ================== INTERVENCIÓN QUIRÚRGICA #4: SELECCIÓN DE ESTILO (RITMO) ================== */}
          <div className="grid gap-3">
            <Label>2. Estilo de Voz</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availableVoices.map((voice) => (
                <Button
                  key={voice.name}
                  variant={selectedVoiceName === voice.name ? 'default' : 'outline'}
                  onClick={() => setSelectedVoiceName(voice.name)}
                  className="h-12"
                >
                  {voice.description}
                </Button>
              ))}
            </div>
          </div>
          {/* ======================================================================================= */}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isGenerating}>Cancelar</Button>
          <Button onClick={handleGenerateAudio} disabled={isGenerating || !selectedVoiceName}>
            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Generar Audio
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}