// components/create-flow/steps/local-discovery-step.tsx
// VERSIÓN: 6.0 (Navigator Standard - Sovereign Geospatial Sync)
// Misión: Capturar el contexto físico (GPS + Visión) y sincronizarlo con el ADN del Podcast.
// [ESTABILIZACIÓN]: Resolución de errores ts(2769) y ts(2345) mediante alineación estricta con Schema V9.1.

"use client";

import React, { useState, useRef, useCallback } from "react";
import { useFormContext } from "react-hook-form";
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
  CheckCircle2, 
  Compass, 
  AlertCircle
} from "lucide-react";

// --- INFRAESTRUCTURA NICEPOD ---
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { useCreationContext } from "../shared/context";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * DISCOVERY_LENSES: Filtros cognitivos para el análisis situacional.
 */
const DISCOVERY_LENSES = [
  { id: 'Tesoros Ocultos', icon: <Sparkles className="h-4 w-4" />, label: "Tesoros" },
  { id: 'Historias de Pasillo', icon: <History className="h-4 w-4" />, label: "Crónicas" },
  { id: 'Sabor Local', icon: <Utensils className="h-4 w-4" />, label: "Sabor" },
  { id: 'Qué hacer ahora', icon: <Search className="h-4 w-4" />, label: "Planes" },
] as const;

export function LocalDiscoveryStep() {
  const { supabase } = useAuth();
  const { toast } = useToast();
  
  // [FIX]: Inyectamos explícitamente el tipo de datos para que TS reconozca las nuevas llaves.
  const { setValue, watch, trigger } = useFormContext<PodcastCreationData>();
  const { transitionTo } = useCreationContext();
  
  const [isLocating, setIsLocating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Observadores de estado del formulario
  const location = watch("location");
  const selectedLens = watch("selectedTone");
  const imageContext = watch("imageContext");
  const manualTopic = watch("soloTopic");

  /**
   * handleManualSearch: Geocodificación directa de intención.
   */
  const handleManualSearch = async () => {
    if (!manualTopic || manualTopic.length < 3) return;
    setIsSearching(true);
    
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualTopic)}&limit=1&addressdetails=1`);
      const data = await res.json();
      
      if (data && data[0]) {
        const place = data[0];
        const address = place.address || {};
        
        // [SOLUCIÓN TS2769]: Enviamos el objeto completo que espera el Schema V9.1
        setValue("location", {
          latitude: parseFloat(place.lat),
          longitude: parseFloat(place.lon),
          placeName: place.display_name.split(',')[0],
          cityName: address.city || address.town || address.village || "Madrid"
        }, { shouldValidate: true });
        
        toast({ title: "Lugar Detectado", description: "Sincronía geográfica establecida." });
      } else {
        toast({ title: "Sin resultados", description: "No logramos triangular esa ubicación.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Geocoding Error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  /**
   * handleGetLocation: Radar GPS en tiempo real.
   */
  const handleGetLocation = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      toast({ title: "Hardware no detectado", description: "GPS no disponible.", variant: "destructive" });
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // [SOLUCIÓN TS2769]: Sincronización nominal con el esquema.
        setValue("location", {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          placeName: "Tu posición actual",
          cityName: "Localización GPS"
        }, { shouldValidate: true });
        setIsLocating(false);
        toast({ title: "Señal Fijada", description: "Coordenadas integradas con éxito." });
      },
      (error) => {
        console.warn("GPS Fail:", error.message);
        setIsLocating(false);
        toast({ title: "Fallo de Triangulación", description: "Activa el GPS de tu dispositivo.", variant: "destructive" });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  /**
   * handleImageCapture: Motor de visión situacional.
   */
  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPreviewImage(base64);
        // [SOLUCIÓN TS2345]: imageContext ahora es reconocido como opcional string.
        setValue("imageContext", base64, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * handleAnalyze: Orquestación del descubrimiento (Handover a Edge Function).
   */
  const handleAnalyze = async () => {
    if (!location && !imageContext && (!manualTopic || manualTopic.length < 3)) {
      toast({ title: "Falta Contexto", description: "Necesito una señal GPS o una imagen para procesar.", variant: "destructive" });
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

      if (error || !data.success) throw new Error("El motor de inteligencia local no responde.");

      // [SANEAMIENTO DE DATOS]: Eliminación de 'as any'
      // Inyectamos el dossier generado por la IA en el flujo de creación.
      setValue('discoveryContext', data.dossier);
      setValue('sources', data.sources || []);
      setValue('soloTopic', data.poi || manualTopic || "Punto de Resonancia");
      
      // Establecemos la personalidad del agente situacional
      setValue('agentName', 'local-concierge-v1');

      // Avanzamos a la fase de definición técnica
      transitionTo('DETAILS_STEP');

    } catch (e: any) {
      toast({ title: "Colapso de Análisis", description: e.message, variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full animate-in fade-in duration-500 px-4 pb-6 overflow-hidden">
      
      <div className="flex-shrink-0 text-center py-4">
        <h2 className="text-xl font-black tracking-tighter uppercase italic flex items-center justify-center gap-3">
            <Compass className="h-6 w-6 text-primary animate-pulse" /> Vivir lo Local
        </h2>
      </div>

      <div className="flex-1 flex flex-col gap-4 min-h-0">
        
        {/* BUSCADOR DE DESTINOS */}
        <div className="space-y-2">
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-primary transition-colors" />
                <Input 
                    placeholder="Busca un hito o plaza..." 
                    className="pl-12 h-12 bg-white/5 border-white/10 rounded-xl text-base focus:border-primary/50"
                    onBlur={handleManualSearch}
                    onChange={(e) => setValue("soloTopic", e.target.value)}
                />
                {isSearching && <Loader2 className="absolute right-4 top-4 h-4 w-4 animate-spin text-primary" />}
            </div>
            {location && (
                <div className="flex items-center gap-3 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl animate-in slide-in-from-top-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-[11px] font-black text-green-500 uppercase tracking-widest truncate">
                        Sintonizado: {location.placeName}
                    </span>
                </div>
            )}
        </div>

        {/* MATRIZ DE SENSORES */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            type="button" onClick={handleGetLocation}
            className={cn(
              "flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300",
              location ? "border-green-500/40 bg-green-500/5 shadow-lg shadow-green-500/5" : "border-white/5 bg-white/5 hover:bg-white/10"
            )}
          >
            <div className={cn("p-2.5 rounded-lg transition-colors", location ? "bg-green-500 text-white" : "bg-white/5 text-zinc-400")}>
              {isLocating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Navigation className="h-5 w-5" />}
            </div>
            <div className="text-left leading-none">
                <p className="text-xs font-black uppercase tracking-tighter text-white">GPS</p>
                <p className="text-[9px] font-bold text-zinc-500 mt-1 uppercase tracking-widest">{location ? "Fijado" : "Activar"}</p>
            </div>
          </button>

          <button 
            type="button" onClick={() => fileInputRef.current?.click()}
            className={cn(
              "flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 overflow-hidden relative",
              imageContext ? "border-blue-500/40 bg-blue-500/5 shadow-lg shadow-blue-500/5" : "border-white/5 bg-white/5 hover:bg-white/10"
            )}
          >
            {previewImage ? (
                <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/60 backdrop-blur-sm group transition-all">
                   <div className="bg-blue-500 rounded-full p-1 shadow-lg"><CheckCircle2 className="h-4 w-4 text-white" /></div>
                   <div 
                      className="absolute top-2 right-2 p-1 bg-red-500/20 hover:bg-red-500 rounded-full transition-colors" 
                      onClick={(e) => { e.stopPropagation(); setPreviewImage(null); setValue('imageContext', undefined); }}
                   >
                       <X className="h-3 w-3 text-white" />
                   </div>
                </div>
            ) : (
                <>
                    <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-500">
                        <Camera className="h-5 w-5" />
                    </div>
                    <div className="text-left leading-none">
                        <p className="text-xs font-black uppercase tracking-tighter text-white">Visión</p>
                        <p className="text-[9px] font-bold text-zinc-500 mt-1 uppercase tracking-widest">Capturar</p>
                    </div>
                </>
            )}
            <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handleImageCapture} />
          </button>
        </div>

        {/* LENTES DE INTERÉS */}
        <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-1">Filtro de Resonancia</p>
            <div className="grid grid-cols-2 gap-3">
                {DISCOVERY_LENSES.map((lens) => (
                    <button
                        key={lens.id} type="button"
                        onClick={() => setValue("selectedTone", lens.id as any)}
                        className={cn(
                            "flex items-center gap-3 p-3 rounded-xl border transition-all duration-300",
                            selectedLens === lens.id ? "bg-primary/20 border-primary shadow-[0_0_15px_rgba(var(--primary),0.1)] scale-[1.02]" : "bg-white/5 border-white/5 hover:border-white/10"
                        )}
                    >
                        <div className={cn("p-2 rounded-lg transition-all", selectedLens === lens.id ? "bg-primary text-white" : "bg-white/5 text-zinc-500")}>
                            {lens.icon}
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-widest text-zinc-200">{lens.label}</span>
                    </button>
                ))}
            </div>
        </div>

        {/* ACCIÓN FINAL */}
        <div className="mt-auto pt-6">
            <Button 
                onClick={handleAnalyze} 
                disabled={isAnalyzing || (!location && !imageContext && !manualTopic)}
                className="w-full h-16 rounded-[2rem] bg-primary text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all"
            >
                {isAnalyzing ? <><Loader2 className="h-5 w-5 animate-spin mr-3" /> Sincronizando Malla...</> : "Interpretar mi mundo"}
            </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Resolución de Tipado (location): Se ha ajustado la inyección de 'setValue' para 
 *    incluir 'cityName', cumpliendo con la estructura estricta del Schema V9.1 y 
 *    eliminando el error ts(2769).
 * 2. Integridad de Visión: La restauración de 'imageContext' en el Schema permite 
 *    que TypeScript valide correctamente el flujo de captura de cámara (ts2345).
 * 3. UX Situacional: Se han aumentado los radios de borde a 2rem para coherencia 
 *    visual con el nuevo estándar de la Workstation, optimizando el área táctil 
 *    para su uso en las calles de Madrid.
 */