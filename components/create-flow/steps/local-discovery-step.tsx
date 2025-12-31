// components/create-flow/local-discovery-step.tsx
// VERSIÓN: 5.0 (Global Intelligence - Forward Geocoding & Ultra-Compact UI)

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { useCreationContext } from "../shared/context";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  MapPin, Camera, Sparkles, History, Utensils, Search, 
  Loader2, X, Navigation, Globe2, CheckCircle2, Map
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
  
  const [isLocating, setIsLocating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const location = watch("location");
  const selectedLens = watch("selectedTone");
  const imageContext = watch("imageContext");
  const manualTopic = watch("solo_topic");

  // --- 1. BÚSQUEDA MANUAL CON FEEDBACK (Forward Geocoding) ---
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
        });
        toast({ 
          title: "Lugar Verificado", 
          description: `Ubicado en: ${place.display_name.split(',').slice(1,3).join(',')}`,
        });
      } else {
        toast({ title: "No encontrado", description: "Intenta con un nombre más general.", variant: "destructive" });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  // --- 2. GPS CON REINTENTO SEGURO ---
  const handleGetLocation = () => {
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue("location", {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          placeName: "Tu ubicación actual"
        });
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
        toast({ title: "GPS no disponible", description: "Usa el buscador de arriba.", variant: "destructive" });
      },
      { enableHighAccuracy: false, timeout: 5000 }
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

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-local-discovery', {
        body: {
          latitude: location?.latitude || 0,
          longitude: location?.longitude || 0,
          lens: selectedLens || 'Tesoros Ocultos',
          image_base64: imageContext,
          manual_topic: manualTopic
        }
      });
      if (error || !data.success) throw new Error("Fallo en el motor.");
      setValue('discovery_context', data.dossier);
      setValue('sources', data.sources || []);
      setValue('agentName', 'local-concierge-v1');
      transitionTo('DETAILS_STEP');
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full animate-in fade-in duration-500 px-4 overflow-hidden">
      
      {/* HEADER COMPACTO */}
      <div className="flex-shrink-0 text-center py-3">
        <h2 className="text-lg font-black tracking-tighter flex items-center justify-center gap-2">
            <Compass className="h-4 w-4 text-primary animate-pulse" /> Vivir lo Local
        </h2>
      </div>

      <div className="flex-1 flex flex-col gap-3 min-h-0">
        
        {/* BUSCADOR CON FEEDBACK (NUEVO) */}
        <div className="space-y-2">
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                <Input 
                    placeholder="Busca un lugar o ciudad..." 
                    className="pl-10 h-10 bg-white/5 border-white/10 rounded-xl text-sm"
                    onBlur={handleManualSearch}
                    onChange={(e) => setValue("solo_topic", e.target.value)}
                />
                {isSearching && <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-primary" />}
            </div>
            {location && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg animate-in slide-in-from-top-1">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    <span className="text-[10px] font-bold text-green-500 uppercase tracking-tighter">
                        Destino Verificado: {location.placeName}
                    </span>
                </div>
            )}
        </div>

        {/* MATRIZ DE SENSORES COMPACTA */}
        <div className="grid grid-cols-2 gap-2">
          <button 
            type="button" onClick={handleGetLocation}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl border transition-all",
              location ? "bg-green-500/10 border-green-500/30" : "bg-white/5 border-white/10"
            )}
          >
            <div className={cn("p-2 rounded-lg", location ? "bg-green-500 text-white" : "bg-white/10")}>
              {isLocating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
            </div>
            <div className="text-left">
                <p className="text-[10px] font-bold leading-none">GPS</p>
                <p className="text-[9px] opacity-40">{location ? "Fijado" : "Detectar"}</p>
            </div>
          </button>

          <button 
            type="button" onClick={() => fileInputRef.current?.click()}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl border transition-all",
              imageContext ? "bg-blue-500/10 border-blue-500/30" : "bg-white/5 border-white/10"
            )}
          >
            <div className={cn("p-2 rounded-lg", imageContext ? "bg-blue-500 text-white" : "bg-white/10")}>
              <Camera className="h-4 w-4" />
            </div>
            <div className="text-left">
                <p className="text-[10px] font-bold leading-none">Visión</p>
                <p className="text-[9px] opacity-40">{imageContext ? "Foto OK" : "Capturar"}</p>
            </div>
            <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handleImageCapture} />
          </button>
        </div>

        {/* LENTES (Compactos) */}
        <div className="grid grid-cols-2 gap-2">
            {DISCOVERY_LENSES.map((lens) => (
                <button
                    key={lens.id} type="button"
                    onClick={() => setValue("selectedTone", lens.id as any)}
                    className={cn(
                        "flex items-center gap-2 p-2.5 rounded-lg border transition-all",
                        selectedLens === lens.id ? "bg-primary/20 border-primary" : "bg-white/5 border-white/5"
                    )}
                >
                    <div className={cn("p-1.5 rounded-md", selectedLens === lens.id ? "bg-primary" : "bg-white/5")}>
                        {lens.icon}
                    </div>
                    <span className="text-[11px] font-bold">{lens.label}</span>
                </button>
            ))}
        </div>

        {/* BOTÓN FINAL */}
        <div className="mt-auto pb-4">
            <Button 
                onClick={handleAnalyze} disabled={isAnalyzing || (!location && !imageContext && !manualTopic)}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-indigo-600 font-black text-xs"
            >
                {isAnalyzing ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> SINCRONIZANDO...</> : "INTERPRETAR MI MUNDO"}
            </Button>
        </div>
      </div>
    </div>
  );
}