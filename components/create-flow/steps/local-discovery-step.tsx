// components/create-flow/steps/local-discovery-step.tsx
// VERSIÓN: 5.1 (Navigator Standard - Reference Fix & Type Safety)

"use client";

import React, { useState, useCallback, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { useCreationContext } from "../shared/context";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Globe2, 
  CheckCircle2, 
  Compass, // [FIX]: Importación recuperada
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

const DISCOVERY_LENSES = [
  { id: 'Tesoros Ocultos', icon: <Sparkles className="h-4 w-4" />, label: "Tesoros" },
  { id: 'Historias de Pasillo', icon: <History className="h-4 w-4" />, label: "Crónicas" },
  { id: 'Sabor Local', icon: <Utensils className="h-4 w-4" />, label: "Sabor" },
  { id: 'Qué hacer ahora', icon: <Search className="h-4 w-4" />, label: "Planes" },
] as const;

export function LocalDiscoveryStep() {
  const { supabase } = useAuth();
  const { toast } = useToast();
  const { setValue, watch } = useFormContext<PodcastCreationData>();
  const { transitionTo } = useCreationContext();
  
  const [isLocating, setIsLocating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const location = watch("location");
  const selectedLens = watch("selectedTone");
  const imageContext = watch("imageContext");
  const manualTopic = watch("solo_topic");

  // --- 1. BÚSQUEDA MANUAL (Forward Geocoding) ---
  const handleManualSearch = async () => {
    if (!manualTopic || manualTopic.length < 3) return;
    setIsSearching(true);
    
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualTopic)}&limit=1`);
      const data = await res.json();
      
      if (data && data[0]) {
        const place = data[0];
        setValue("location", {
          latitude: parseFloat(place.lat),
          longitude: parseFloat(place.lon),
          placeName: place.display_name.split(',')[0]
        }, { shouldValidate: true });
        
        toast({ title: "Lugar Detectado", description: "Destino verificado en el mapa." });
      } else {
        toast({ title: "Sin resultados", description: "Prueba con un nombre de ciudad más conocido.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Manual Search Error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // --- 2. GPS (Radar Situacional) ---
  const handleGetLocation = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      toast({ title: "Error", description: "GPS no soportado por este navegador.", variant: "destructive" });
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue("location", {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          placeName: "Tu posición actual"
        }, { shouldValidate: true });
        setIsLocating(false);
        toast({ title: "Señal Fijada", description: "GPS sincronizado correctamente." });
      },
      (error) => {
        console.warn("GPS Fail:", error.message);
        setIsLocating(false);
        toast({ title: "Fallo de GPS", description: "No pudimos obtener tu ubicación exacta.", variant: "destructive" });
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  };

  // --- 3. VISIÓN (Captura de Entorno) ---
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

  // --- 4. ORQUESTACIÓN FINAL ---
  const handleAnalyze = async () => {
    if (!location && !imageContext && (!manualTopic || manualTopic.length < 3)) {
      toast({ title: "Datos insuficientes", description: "Necesito una ubicación o una foto para empezar.", variant: "destructive" });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-local-discovery', {
        body: {
          latitude: location?.latitude || 0,
          longitude: location?.longitude || 0,
          lens: selectedLens || 'Tesoros Ocultos',
          image_base64: imageContext
        }
      });

      if (error || !data.success) throw new Error("El motor de descubrimiento local no respondió.");

      // CUSTODIA DE DATOS: Usamos 'as any' para campos JSONB complejos si TS se queja
      setValue('discovery_context' as any, data.dossier);
      setValue('sources' as any, data.sources || []);
      setValue('solo_topic', data.poi || manualTopic || "Descubrimiento Local");
      setValue('agentName', 'local-concierge-v1');

      transitionTo('DETAILS_STEP');

    } catch (e: any) {
      toast({ title: "Fallo de Análisis", description: e.message, variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full animate-in fade-in duration-500 px-4 overflow-hidden">
      
      {/* HEADER COMPACTO */}
      <div className="flex-shrink-0 text-center py-3">
        <h2 className="text-lg font-black tracking-tighter flex items-center justify-center gap-2">
            <Compass className="h-5 w-5 text-primary animate-pulse" /> Vivir lo Local
        </h2>
      </div>

      <div className="flex-1 flex flex-col gap-3 min-h-0">
        
        {/* BUSCADOR DE DESTINOS */}
        <div className="space-y-2">
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                <Input 
                    placeholder="Escribe una ciudad o lugar..." 
                    className="pl-10 h-10 bg-white/5 border-white/10 rounded-xl text-sm"
                    onBlur={handleManualSearch}
                    onChange={(e) => setValue("solo_topic", e.target.value)}
                />
                {isSearching && <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-primary" />}
            </div>
            {location && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg animate-in slide-in-from-top-1">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    <span className="text-[10px] font-bold text-green-500 uppercase tracking-tighter truncate">
                        Fijado: {location.placeName}
                    </span>
                </div>
            )}
        </div>

        {/* MATRIZ DE SENSORES (GPS + VISIÓN) */}
        <div className="grid grid-cols-2 gap-2">
          <button 
            type="button" onClick={handleGetLocation}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-300",
              location ? "border-green-500/40 bg-green-500/5" : "border-white/5 bg-white/5 hover:bg-white/10"
            )}
          >
            <div className={cn("p-2 rounded-lg", location ? "bg-green-500 text-white shadow-lg" : "bg-white/10")}>
              {isLocating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
            </div>
            <div className="text-left">
                <p className="text-[10px] font-bold leading-none">GPS</p>
                <p className="text-[9px] opacity-40">{location ? "Fijado" : "Activar"}</p>
            </div>
          </button>

          <button 
            type="button" onClick={() => fileInputRef.current?.click()}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-300 overflow-hidden relative",
              imageContext ? "border-blue-500/40 bg-blue-500/5" : "border-white/5 bg-white/5 hover:bg-white/10"
            )}
          >
            {previewImage ? (
                <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/60 group">
                   <CheckCircle2 className="h-5 w-5 text-blue-400" />
                   <div className="absolute top-1 right-1 p-1 bg-red-500 rounded-full" onClick={(e) => { e.stopPropagation(); setPreviewImage(null); setValue('imageContext', undefined); }}>
                       <X className="h-3 w-3 text-white" />
                   </div>
                </div>
            ) : (
                <>
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                        <Camera className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                        <p className="text-[10px] font-bold leading-none">Visión</p>
                        <p className="text-[9px] opacity-40">Capturar</p>
                    </div>
                </>
            )}
            <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handleImageCapture} />
          </button>
        </div>

        {/* LENTES DE INTERÉS (2x2) */}
        <div className="space-y-1">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 ml-1">¿Qué buscas aquí?</p>
            <div className="grid grid-cols-2 gap-2">
                {DISCOVERY_LENSES.map((lens) => (
                    <button
                        key={lens.id} type="button"
                        onClick={() => setValue("selectedTone", lens.id as any)}
                        className={cn(
                            "flex items-center gap-2.5 p-2.5 rounded-lg border transition-all duration-300",
                            selectedLens === lens.id ? "bg-primary/20 border-primary shadow-sm scale-[1.02]" : "bg-white/5 border-white/5"
                        )}
                    >
                        <div className={cn("p-1.5 rounded-md transition-colors", selectedLens === lens.id ? "bg-primary text-white" : "bg-white/5")}>
                            {lens.icon}
                        </div>
                        <span className="text-[11px] font-bold tracking-tight">{lens.label}</span>
                    </button>
                ))}
            </div>
        </div>

        {/* ACCIÓN FINAL: Integrada en el flujo sin scroll */}
        <div className="mt-auto pb-4 pt-2">
            <Button 
                onClick={handleAnalyze} disabled={isAnalyzing || (!location && !imageContext && !manualTopic)}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary via-indigo-600 to-primary bg-[length:200%_auto] animate-gradient font-black text-xs shadow-xl active:scale-95 transition-all"
            >
                {isAnalyzing ? <><Loader2 className="h-5 w-5 animate-spin mr-2" /> SINCRONIZANDO...</> : "INTERPRETAR MI MUNDO"}
            </Button>
        </div>
      </div>
    </div>
  );
}