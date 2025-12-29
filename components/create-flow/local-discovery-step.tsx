// components/create-flow/local-discovery-step.tsx
// VERSIÓN: 3.0 (Self-Sufficient Engine - Encapsulated Logic)

"use client";

import { useState, useCallback, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { useCreationContext } from "../podcast-creation-form";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  MapPin, 
  Camera, 
  Sparkles, 
  History, 
  Utensils, 
  Search, 
  Loader2, 
  X,
  Navigation,
  Compass
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const DISCOVERY_LENSES = [
  { id: 'Tesoros Ocultos', icon: <Sparkles className="h-4 w-4" />, label: "Tesoros", desc: "No turísticos" },
  { id: 'Historias de Pasillo', icon: <History className="h-4 w-4" />, label: "Crónicas", desc: "Leyendas" },
  { id: 'Sabor Local', icon: <Utensils className="h-4 w-4" />, label: "Sabor", desc: "Gastronomía" },
  { id: 'Qué hacer ahora', icon: <Search className="h-4 w-4" />, label: "Planes", desc: "Eventos hoy" },
] as const;

export function LocalDiscoveryStep() {
  const { supabase } = useAuth();
  const { toast } = useToast();
  const { setValue, watch } = useFormContext<PodcastCreationData>();
  const { transitionTo } = useCreationContext();
  
  // Estados Locales internos (no afectan al padre hasta el éxito)
  const [isLocating, setIsLocating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const location = watch("location");
  const selectedLens = watch("selectedTone");

  // 1. Lógica interna de GPS
  const handleGetLocation = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      toast({ title: "Error", description: "GPS no soportado", variant: "destructive" });
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue("location", {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          placeName: "Ubicación fijada"
        });
        toast({ title: "Radar Activo", description: "Ubicación capturada correctamente." });
        setIsLocating(false);
      },
      () => {
        toast({ title: "Error GPS", description: "No se pudo obtener la señal.", variant: "destructive" });
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPreviewImage(base64);
        setValue("imageContext", base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // 2. Lógica interna de Análisis (Llamada a Supabase)
  const handleAnalyze = async () => {
    if (!location && !previewImage) {
      toast({ title: "Sensores inactivos", description: "Necesito GPS o una foto." });
      return;
    }
    if (!selectedLens) {
        toast({ title: "Lente requerida", description: "Elige qué guía necesitas hoy." });
        return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-local-discovery', {
        body: {
          latitude: location?.latitude || 0,
          longitude: location?.longitude || 0,
          lens: selectedLens,
          image_base64: previewImage
        }
      });

      if (error || !data.success) throw new Error("Fallo en el motor situacional.");

      // ESCRIBIMOS EN EL FORMULARIO PADRE SOLO AL FINAL
      setValue('discovery_context', data.dossier);
      setValue('sources', data.sources || []);
      setValue('solo_topic', data.poi || "Descubrimiento Local");
      setValue('agentName', 'local-concierge-v1');

      toast({ title: "¡Entorno Sincronizado!", description: `Lugar detectado: ${data.poi}` });
      
      // LE DECIMOS AL PADRE QUE AVANCE
      transitionTo('DETAILS_STEP');

    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-full animate-in fade-in duration-500 pb-10">
      
      <div className="text-center py-6">
        <h2 className="text-2xl font-black tracking-tight text-foreground">Vivir lo Local</h2>
        <p className="text-xs text-muted-foreground font-medium mt-1 uppercase tracking-widest opacity-60">
           Acompañante Situacional
        </p>
      </div>

      <div className="flex-1 space-y-6 px-4 overflow-y-auto custom-scrollbar pb-32">
        
        {/* SENSORES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            type="button"
            onClick={handleGetLocation}
            className={cn(
              "flex flex-col items-center justify-center p-8 rounded-3xl border-2 transition-all duration-300",
              location ? "border-green-500/40 bg-green-500/5 shadow-inner" : "border-border/40 bg-background/40"
            )}
          >
            <div className={cn("p-4 rounded-2xl mb-3 shadow-xl", location ? "bg-green-500 text-white" : "bg-primary/10 text-primary")}>
              {isLocating ? <Loader2 className="h-8 w-8 animate-spin" /> : location ? <Navigation className="h-8 w-8" /> : <MapPin className="h-8 w-8" />}
            </div>
            <span className="text-sm font-black uppercase tracking-tighter">GPS</span>
            <span className="text-[10px] opacity-60 mt-1">{location ? "Señal Fijada" : "Activar Radar"}</span>
          </button>

          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "relative flex flex-col items-center justify-center p-8 rounded-3xl border-2 transition-all duration-300 overflow-hidden",
              previewImage ? "border-blue-500/40" : "border-border/40 bg-background/40"
            )}
          >
            {previewImage ? (
                <>
                    <img src={previewImage} className="absolute inset-0 w-full h-full object-cover opacity-50" />
                    <div className="z-10 bg-blue-600 text-white text-[9px] font-black px-3 py-1 rounded-full">VISIÓN ACTIVA</div>
                </>
            ) : (
                <>
                    <div className="p-4 rounded-2xl mb-3 bg-blue-500/10 text-blue-500 shadow-xl">
                        <Camera className="h-8 w-8" />
                    </div>
                    <span className="text-sm font-black uppercase tracking-tighter">Cámara</span>
                    <span className="text-[10px] opacity-60 mt-1">Analizar Imagen</span>
                </>
            )}
            <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handleImageCapture} />
          </button>
        </div>

        {/* LENTES */}
        <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 ml-1">Lente de Interés</p>
            <div className="grid grid-cols-2 gap-2">
                {DISCOVERY_LENSES.map((lens) => (
                    <button
                        key={lens.id}
                        type="button"
                        onClick={() => setValue("selectedTone", lens.id as any)}
                        className={cn(
                            "flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300",
                            selectedLens === lens.id 
                                ? "bg-primary/20 border-primary shadow-[0_0_20px_rgba(168,85,247,0.2)]" 
                                : "bg-background/40 border-border/20 hover:bg-background/60"
                        )}
                    >
                        <div className={cn("p-2 rounded-lg", selectedLens === lens.id ? "bg-primary text-white" : "bg-secondary text-muted-foreground")}>
                            {lens.icon}
                        </div>
                        <div className="text-left">
                            <p className="text-xs font-black leading-tight tracking-tighter">{lens.label}</p>
                            <p className="text-[9px] opacity-50 leading-tight">{lens.desc}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>

        {/* BOTÓN DE ACCIÓN ENCAPSULADO */}
        {/* Lo ubicamos aquí para que se mueva con el contenido y no flote sobre el diseño del padre */}
        <div className="pt-6">
            <Button 
                onClick={handleAnalyze}
                disabled={isAnalyzing || (!location && !previewImage)}
                className={cn(
                    "w-full h-16 rounded-2xl text-base font-black shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3",
                    isAnalyzing 
                        ? "bg-secondary text-muted-foreground" 
                        : "bg-gradient-to-r from-primary to-indigo-600 text-white"
                )}
            >
                {isAnalyzing ? (
                    <><Loader2 className="h-5 w-5 animate-spin" /> INTERPRETANDO MUNDO...</>
                ) : (
                    <><Compass className="h-5 w-5 animate-pulse" /> COMENZAR DESCUBRIMIENTO</>
                )}
            </Button>
        </div>
      </div>
    </div>
  );
}