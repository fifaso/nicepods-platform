// components/create-flow/local-discovery-step.tsx
// VERSIÓN: 4.0 (Master Discovery Engine - Multi-Input & Zero Scroll Design)

"use client";

import { useState, useCallback, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { useCreationContext } from "../podcast-creation-form";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  MapPin, Camera, Sparkles, History, Utensils, Search, 
  Loader2, X, Navigation, Compass, Globe2, Trash2 
} from "lucide-react";
import { cn } from "@/lib/utils";

const DISCOVERY_LENSES = [
  { id: 'Tesoros Ocultos', icon: <Sparkles className="h-4 w-4" />, label: "Tesoros" },
  { id: 'Historias de Pasillo', icon: <History className="h-4 w-4" />, label: "Historias" },
  { id: 'Sabor Local', icon: <Utensils className="h-4 w-4" />, label: "Sabor" },
  { id: 'Qué hacer ahora', icon: <Search className="h-4 w-4" />, label: "Planes" },
] as const;

export function LocalDiscoveryStep() {
  const { supabase } = useAuth();
  const { toast } = useToast();
  const { setValue, watch } = useFormContext<PodcastCreationData>();
  const { transitionTo } = useCreationContext();
  
  // --- ESTADOS DE SENSORES ---
  const [isLocating, setIsLocating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const location = watch("location");
  const selectedLens = watch("selectedTone");
  const imageContext = watch("imageContext");

  // --- 1. LOCALIZACIÓN INTELIGENTE ---
  const handleGetLocation = () => {
    setIsLocating(true);
    const options = { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue("location", {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          placeName: "Ubicación GPS"
        });
        toast({ title: "Radar Fijado", description: "Coordenadas capturadas." });
        setIsLocating(false);
      },
      () => {
        toast({ title: "Error GPS", description: "Escribe tu destino manualmente.", variant: "destructive" });
        setIsLocating(false);
      },
      options
    );
  };

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPreviewImage(base64);
        setValue("imageContext", base64, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  // --- 2. EJECUCIÓN DEL DESCUBRIMIENTO ---
  const handleAnalyze = async () => {
    const topicManual = watch("solo_topic");
    if (!location && !imageContext && (!topicManual || topicManual.length < 3)) {
      toast({ title: "Faltan datos", description: "Activa GPS, saca una foto o escribe un destino." });
      return;
    }
    if (!selectedLens) {
      toast({ title: "Elige una Lente", description: "¿Qué tipo de guía necesitas?" });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-local-discovery', {
        body: {
          latitude: location?.latitude || 0,
          longitude: location?.longitude || 0,
          lens: selectedLens,
          image_base64: imageContext,
          manual_topic: topicManual
        }
      });

      if (error || !data.success) throw new Error("Fallo en el motor situacional.");

      setValue('discovery_context', data.dossier);
      setValue('sources', data.sources || []);
      setValue('solo_topic', data.poi || topicManual || "Destino Local");
      setValue('agentName', 'local-concierge-v1');

      toast({ title: "¡Entorno Sincronizado!" });
      transitionTo('DETAILS_STEP');

    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full animate-in fade-in duration-700 px-4">
      
      {/* HEADER ULTRA-COMPACTO */}
      <div className="flex-shrink-0 text-center py-4">
        <h2 className="text-xl font-black tracking-tighter flex items-center justify-center gap-2">
            <Compass className="h-5 w-5 text-primary animate-pulse" /> 
            Vivir lo Local
        </h2>
        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest opacity-60">Sincronización Situacional</p>
      </div>

      <div className="flex-1 flex flex-col gap-4 min-h-0">
        
        {/* BLOQUE DE BÚSQUEDA MANUAL (Destino futuro) */}
        <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
            <Input 
                placeholder="Escribe tu próximo destino (Ej: Kioto)" 
                className="pl-10 h-12 bg-white/5 border-white/10 rounded-xl focus:ring-primary/30"
                onChange={(e) => setValue("solo_topic", e.target.value)}
            />
        </div>

        {/* MATRIZ DE SENSORES (GPS + CÁMARA) - Lado a Lado para ahorrar espacio */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            type="button"
            onClick={handleGetLocation}
            className={cn(
              "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300",
              location ? "border-green-500/40 bg-green-500/5" : "border-white/5 bg-white/5 hover:bg-white/10"
            )}
          >
            <div className={cn("p-2.5 rounded-xl mb-2", location ? "bg-green-500 text-white" : "bg-primary/10 text-primary")}>
              {isLocating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Navigation className="h-5 w-5" />}
            </div>
            <span className="text-xs font-bold">GPS Radar</span>
            <span className="text-[9px] opacity-60">{location ? "Localizado" : "Detectar ahora"}</span>
          </button>

          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 overflow-hidden",
              imageContext ? "border-blue-500/40 bg-blue-500/5" : "border-white/5 bg-white/5 hover:bg-white/10"
            )}
          >
            {previewImage ? (
                <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/40">
                   <CheckCircle2 className="h-6 w-6 text-blue-400" />
                   <div className="absolute top-1 right-1 p-1 bg-red-500 rounded-full" onClick={(e) => { e.stopPropagation(); clearImage(); }}>
                       <X className="h-3 w-3 text-white" />
                   </div>
                </div>
            ) : (
                <>
                    <div className="p-2.5 rounded-xl mb-2 bg-blue-500/10 text-blue-500">
                        <Camera className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-bold">Visión AI</span>
                    <span className="text-[9px] opacity-60">Analizar foto</span>
                </>
            )}
            <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handleImageCapture} />
          </button>
        </div>

        {/* LENTES DE INTERÉS (Matriz 2x2) */}
        <div className="space-y-2">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 ml-1">Lente de Interés</p>
            <div className="grid grid-cols-2 gap-2">
                {DISCOVERY_LENSES.map((lens) => (
                    <button
                        key={lens.id}
                        type="button"
                        onClick={() => setValue("selectedTone", lens.id as any)}
                        className={cn(
                            "flex items-center gap-2.5 p-3 rounded-xl border transition-all duration-300",
                            selectedLens === lens.id 
                                ? "bg-primary/20 border-primary shadow-sm" 
                                : "bg-white/5 border-white/5 hover:bg-white/10"
                        )}
                    >
                        <div className={cn("p-1.5 rounded-lg", selectedLens === lens.id ? "bg-primary text-white" : "bg-white/10 text-muted-foreground")}>
                            {lens.icon}
                        </div>
                        <span className="text-xs font-bold leading-tight">{lens.label}</span>
                    </button>
                ))}
            </div>
        </div>

        {/* BOTÓN DE ACCIÓN FINAL (Dentro del área sin scroll) */}
        <div className="pt-2 pb-4 mt-auto">
            <Button 
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className={cn(
                    "w-full h-14 rounded-2xl text-sm font-black shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2",
                    isAnalyzing 
                        ? "bg-secondary text-muted-foreground" 
                        : "bg-gradient-to-r from-primary to-indigo-600 text-white"
                )}
            >
                {isAnalyzing ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> SINCRONIZANDO...</>
                ) : (
                    <><Globe2 className="h-4 w-4" /> INTERPRETAR MI MUNDO</>
                )}
            </Button>
        </div>
      </div>
    </div>
  );

  function clearImage() {
    setPreviewImage(null);
    setValue("imageContext", undefined);
  }
}