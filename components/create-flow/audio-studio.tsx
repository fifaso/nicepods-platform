"use client";

import { useState, useCallback, useMemo } from "react";
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

// ================== INTERVENCIÓN QUIRÚRGICA #1: LA FUENTE DE LA VERDAD ==================
// La "base de datos" de voces. Es la única fuente de información.
const voiceOptions = [
  { name: "es-ES-Wavenet-A", gender: "MALE", description: "Voz Clara" },
  { name: "es-ES-Wavenet-B", gender: "MALE", description: "Voz Formal" },
  { name: "es-ES-Wavenet-C", gender: "FEMALE", description: "Voz Clara)" },
  { name: "es-ES-Wavenet-C", gender: "FEMALE", description: "Voz Formal)" },
] as const; // `as const` para máxima seguridad de tipos en TypeScript.
// ======================================================================================

interface AudioStudioProps {
  podcastId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AudioStudio({ podcastId, isOpen, onClose }: AudioStudioProps) {
  const { supabase } = useAuth();
  const { toast } = useToast();
  
  const [isGenerating, setIsGenerating] = useState(false);
  
  // ================== INTERVENCIÓN QUIRÚRGICA #2: ARQUITECTURA DE ESTADO SIMPLIFICADA ==================
  // Solo tenemos UN estado para la selección de voz, que es la fuente única de verdad.
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>(voiceOptions[0].name);
  const [speakingRate, setSpeakingRate] = useState(1.0);
  
  // DATOS DERIVADOS: En lugar de estados separados, derivamos la información necesaria
  // de la fuente única de verdad en cada renderizado. Esto es más eficiente y 100% seguro.
  const selectedVoiceObject = useMemo(() => 
    voiceOptions.find(v => v.name === selectedVoiceName)!, 
    [selectedVoiceName]
  );
  const selectedGender = selectedVoiceObject.gender;
  // ================================================================================================
  
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
          voiceName: selectedVoiceName, // Se usa directamente la fuente de verdad.
          speakingRate: speakingRate,
        }
      });
      if (error) { throw new Error(error.message); }
      toast({
        title: "¡Petición Enviada!",
        description: "Tu audio está siendo generado. Podrás escucharlo en tu biblioteca en unos momentos.",
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
  }, [podcastId, selectedVoiceName, speakingRate, supabase, toast, onClose]);
  
  // Filtramos las voces que se mostrarán en la UI basándonos en el género.
  const voicesForMale = voiceOptions.filter(v => v.gender === 'MALE');
  const voicesForFemale = voiceOptions.filter(v => v.gender === 'FEMALE');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Estudio de Audio</DialogTitle>
          <DialogDescription>
            Actúa como director. Elige el narrador, el estilo y el ritmo para tu micro-podcast.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-8 py-4">
          
          {/* --- 1. TIPO DE NARRADOR --- */}
          <div className="grid gap-3">
            <Label>1. Tipo de Narrador</Label>
            <ToggleGroup
              type="single"
              value={selectedGender}
              // Al cambiar el género, se establece la primera voz disponible para ese nuevo género.
              onValueChange={(gender: 'MALE' | 'FEMALE') => { 
                if (gender) {
                  const firstVoice = gender === 'MALE' ? voicesForMale[0] : voicesForFemale[0];
                  setSelectedVoiceName(firstVoice.name);
                }
              }}
              className="grid grid-cols-2"
            >
              <ToggleGroupItem value="MALE" aria-label="Voz Masculina" className="h-12"><User className="h-5 w-5 mr-2" />Masculino</ToggleGroupItem>
              <ToggleGroupItem value="FEMALE" aria-label="Voz Femenina" className="h-12"><UserSquare2 className="h-5 w-5 mr-2" />Femenino</ToggleGroupItem>
            </ToggleGroup>
          </div>
          
          {/* --- 2. ESTILO DE VOZ --- */}
          <div className="grid gap-3">
            <Label>2. Estilo de Voz</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(selectedGender === 'MALE' ? voicesForMale : voicesForFemale).map((voice) => (
                <Button
                  key={voice.name}
                  variant={selectedVoiceName === voice.name ? 'default' : 'outline'}
                  // La acción es simple: establecer la fuente única de verdad.
                  onClick={() => setSelectedVoiceName(voice.name)}
                  className="h-12"
                >
                  {voice.description}
                </Button>
              ))}
            </div>
          </div>

          {/* --- 3. VELOCIDAD DEL HABLA --- */}
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