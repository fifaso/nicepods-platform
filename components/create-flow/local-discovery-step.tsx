// components/create-flow/local-discovery-step.tsx
// VERSIÓN: 2.0 (Master Situational Engine - Vision, GPS & Intelligence Lenses)

"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { useCreationContext } from "../podcast-creation-form";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  MapPin, 
  Camera, 
  Sparkles, 
  History, 
  Utensils, 
  Search, 
  Loader2, 
  CheckCircle2, 
  X,
  Compass,
  Zap,
  Navigation
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * CONFIGURACIÓN DE LENTES DE INTERÉS
 * Define la intención del descubrimiento local.
 */
const DISCOVERY_LENSES = [
  { id: 'Tesoros Ocultos', icon: <Sparkles className="h-4 w-4" />, label: "Tesoros", desc: "Sitios no turísticos" },
  { id: 'Historias de Pasillo', icon: <History className="h-4 w-4" />, label: "Crónicas", desc: "Leyendas y secretos" },
  { id: 'Sabor Local', icon: <Utensils className="h-4 w-4" />, label: "Sabor", desc: "Gastronomía real" },
  { id: 'Qué hacer ahora', icon: <Search className="h-4 w-4" />, label: "Planes", desc: "Eventos del momento" },
] as const;

export function LocalDiscoveryStep() {
  const { supabase } = useAuth();
  const { toast } = useToast();
  const { setValue, watch, trigger } = useFormContext<PodcastCreationData>();
  const { transitionTo } = useCreationContext();
  
  // --- ESTADOS DE CONTROL ---
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Observamos los datos necesarios para la activación
  const location = watch("location");
  const imageContext = watch("imageContext");
  const selectedLens = watch("selectedTone"); // Usamos el tono como lente situacional

  // --- 1. GESTIÓN DE GEOLOCALIZACIÓN ---
  const handleGetLocation = useCallback(() => {
    setIsLocating(true);
    
    if (!navigator.geolocation) {
      toast({
        title: "Error de Sensores",
        description: "Tu dispositivo no permite el acceso al GPS.",
        variant: "destructive"
      });
      setIsLocating(false);
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue("location", {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          placeName: "Ubicación detectada"
        }, { shouldValidate: true });
        
        toast({ title: "Radar Activo", description: "Posición anclada con éxito." });
        setIsLocating(false);
      },
      (err) => {
        console.error("GPS Error:", err);
        toast({
          title: "Fallo de Señal",
          description: "No pudimos obtener tu ubicación precisa.",
          variant: "destructive"
        });
        setIsLocating(false);
      },
      options
    );
  }, [setValue, toast]);

  // --- 2. GESTIÓN DE VISIÓN ARTIFICIAL ---
  const handleImageCapture = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "Archivo pesado", description: "La foto debe ser menor a 5MB.", variant: "destructive" });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPreviewImage(base64);
        setValue("imageContext", base64, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  }, [setValue, toast]);

  const clearImage = useCallback(() => {
    setPreviewImage(null);
    setValue("imageContext", undefined);
  }, [setValue]);

  // --- 3. ORQUESTACIÓN DEL DESCUBRIMIENTO ---
  const handleAnalyzeSurroundings = async () => {
    // Validamos que al menos un sentido esté activo
    if (!location && !imageContext) {
      toast({
        title: "Faltan Datos",
        description: "Necesito tu GPS o una foto para interpretar el entorno.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedLens) {
        toast({ title: "Selecciona una Lente", description: "Dime en qué aspecto del lugar quieres profundizar." });
        return;
    }

    setIsAnalyzing(true);
    try {
      console.log(`[Discovery] Iniciando análisis situacional para lens: ${selectedLens}`);
      
      const { data, error } = await supabase.functions.invoke('get-local-discovery', {
        body: {
          latitude: location?.latitude,
          longitude: location?.longitude,
          lens: selectedLens,
          image_base64: imageContext
        }
      });

      if (error || !data.success) throw new Error(data?.error || "Fallo en el motor de descubrimiento.");

      /**
       * CUSTODIA DE DATOS 360
       * Guardamos el dossier (POI, recomendaciones, intro) y las fuentes de Tavily.
       */
      setValue('discovery_context', data.dossier);
      setValue('sources', data.sources || []);
      
      // El tema principal se ajusta al Punto de Interés detectado
      setValue('solo_topic', data.poi || data.location?.placeName || "Lugar Misterioso");
      // Forzamos el agente local
      setValue('agentName', 'local-concierge-v1'); 

      toast({
        title: "¡Conectado!",
        description: `He identificado: ${data.poi || "tu entorno"}.`,
        action: <CheckCircle2 className="h-5 w-5 text-green-500" />
      });

      // Transicionamos al paso de detalles técnicos para configurar duración
      transitionTo('DETAILS_STEP'); 

    } catch (e: any) {
      toast({
        title: "Error de Inteligencia",
        description: e.message || "No pudimos procesar el entorno en este momento.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full animate-in fade-in slide-in-from-bottom-4 duration-700 px-4 md:px-10 pb-8">
      
      {/* 1. SECCIÓN DE CABECERA (Branding) */}
      <div className="flex-shrink-0 text-center py-6 md:py-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Zap className="h-3 w-3 text-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Modo Situacional Activo</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-foreground leading-none">
          Vivir lo Local
        </h2>
        <p className="text-sm md:text-base text-muted-foreground mt-3 font-medium max-w-lg mx-auto leading-relaxed">
          Usa tus sentidos. Captura el alma de tu ubicación actual y NicePod te guiará.
        </p>
      </div>

      {/* 2. GRID DE SENSORES (GPS & VISION) */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0 overflow-y-auto custom-scrollbar-hide pb-28">
        
        {/* SENSOR GPS: Radar de Proximidad */}
        <Card className={cn(
          "relative overflow-hidden group border-2 transition-all duration-700 flex flex-col items-center justify-center p-8",
          location ? "border-green-500/40 bg-green-500/5 shadow-inner" : "border-primary/10 bg-black/20"
        )}>
          <AnimatePresence>
            {isLocating && (
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
                className="absolute inset-0 bg-primary/20 rounded-full"
              />
            )}
          </AnimatePresence>
          
          <div className={cn(
            "p-5 rounded-2xl mb-4 z-10 transition-all duration-500 shadow-xl",
            location ? "bg-green-500 text-white rotate-[360deg]" : "bg-primary/20 text-primary"
          )}>
            {location ? <Navigation className="h-8 w-8" /> : <MapPin className={cn("h-8 w-8", isLocating && "animate-bounce")} />}
          </div>
          
          <h3 className="text-xl font-black z-10 tracking-tight">Geolocalización</h3>
          <p className="text-xs text-muted-foreground text-center mt-2 z-10 max-w-[180px]">
            {location 
                ? `Coordenadas fijadas: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` 
                : "Escanea señales de satélite para ubicarte en el mapa."
            }
          </p>
          
          <Button 
            onClick={handleGetLocation} 
            disabled={isLocating}
            variant={location ? "secondary" : "default"}
            className="mt-6 rounded-full px-8 z-10 font-bold shadow-lg"
          >
            {isLocating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {location ? "Recalibrar GPS" : "Activar Radar"}
          </Button>
        </Card>

        {/* SENSOR VISIÓN: Gemini Vision AI */}
        <Card className={cn(
          "relative overflow-hidden group border-2 transition-all duration-700 flex flex-col items-center justify-center p-4 min-h-[260px]",
          previewImage ? "border-blue-500/40 bg-black/40" : "border-primary/10 bg-black/20"
        )}>
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleImageCapture}
          />
          
          {previewImage ? (
            <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500">
              <img src={previewImage} className="w-full h-full object-cover" alt="Captura de entorno" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col items-center justify-end pb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Button variant="destructive" size="sm" onClick={clearImage} className="rounded-full px-4 font-bold">
                  <X className="h-3 w-3 mr-2" /> Cambiar Foto
                </Button>
              </div>
              {/* Overlay de procesamiento visual */}
              <div className="absolute top-4 right-4 bg-blue-600 text-white text-[10px] font-black px-2 py-1 rounded shadow-lg uppercase tracking-tighter">
                Visión AI Lista
              </div>
            </div>
          ) : (
            <>
              <div className="p-5 rounded-2xl bg-blue-500/20 text-blue-500 mb-4 shadow-lg border border-blue-500/20">
                <Camera className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-black tracking-tight">Análisis de Visión</h3>
              <p className="text-xs text-muted-foreground text-center mt-2 max-w-[180px]">
                Saca una foto a lo que estás viendo. Gemini identificará el lugar.
              </p>
              <Button 
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="mt-6 rounded-full px-8 border-blue-500/50 text-blue-400 font-bold hover:bg-blue-500/10 transition-all"
              >
                Abrir Cámara
              </Button>
            </>
          )}
        </Card>

        {/* 3. SECCIÓN DE LENTES (INTENCIONALIDAD) */}
        <div className="md:col-span-2 mt-6">
           <div className="flex items-center gap-2 mb-4 ml-2">
                <Compass className="h-4 w-4 text-primary" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">¿Qué tipo de guía necesitas hoy?</p>
           </div>
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {DISCOVERY_LENSES.map((lens) => (
                <button
                  key={lens.id}
                  onClick={() => setValue("selectedTone", lens.id as any)}
                  className={cn(
                    "flex flex-col items-start p-5 rounded-2xl border-2 transition-all duration-500 text-left relative overflow-hidden",
                    selectedLens === lens.id
                      ? "bg-primary/20 border-primary shadow-[0_0_30px_rgba(168,85,247,0.25)] scale-[1.02]"
                      : "bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10"
                  )}
                >
                  <div className={cn(
                    "p-2.5 rounded-xl mb-3 transition-colors duration-500 shadow-md", 
                    selectedLens === lens.id ? "bg-primary text-white" : "bg-white/10 text-muted-foreground"
                  )}>
                    {lens.icon}
                  </div>
                  <span className="text-sm font-black tracking-tight">{lens.label}</span>
                  <span className="text-[10px] opacity-50 font-medium leading-tight mt-1 line-clamp-2">{lens.desc}</span>
                  
                  {selectedLens === lens.id && (
                    <motion.div layoutId="lens-active" className="absolute top-2 right-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                    </motion.div>
                  )}
                </button>
              ))}
           </div>
        </div>

      </div>

      {/* 4. BOTÓN DE ESCANEO (Master Action) */}
      <div className="fixed bottom-24 left-0 right-0 px-6 z-50 flex justify-center">
        <Button 
          onClick={handleAnalyzeSurroundings}
          disabled={isAnalyzing || (!location && !previewImage)}
          className={cn(
            "w-full max-w-4xl h-18 md:h-20 rounded-3xl text-xl font-black shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4",
            isAnalyzing 
                ? "bg-secondary text-muted-foreground cursor-wait" 
                : "bg-gradient-to-r from-primary via-indigo-600 to-primary bg-[length:200%_auto] animate-gradient shadow-primary/40 text-white"
          )}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-7 w-7 animate-spin" />
              SINCRONIZANDO CON LA REALIDAD...
            </>
          ) : (
            <>
              <Sparkles className="h-7 w-7" />
              INTERPRETAR MI MUNDO
            </>
          )}
        </Button>
      </div>

    </div>
  );
}