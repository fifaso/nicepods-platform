// components/create-flow/local-discovery-step.tsx
// VERSIÓN: 2.1 (Master Situational - UX Refined & Sensor Feedback)

"use client";

import { useState, useCallback, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Navigation,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const DISCOVERY_LENSES = [
  { id: 'Tesoros Ocultos', icon: <Sparkles className="h-4 w-4" />, label: "Tesoros", desc: "No turísticos" },
  { id: 'Historias de Pasillo', icon: <History className="h-4 w-4" />, label: "Crónicas", desc: "Leyendas" },
  { id: 'Sabor Local', icon: <Utensils className="h-4 w-4" />, label: "Sabor", desc: "Gastronomía" },
  { id: 'Qué hacer ahora', icon: <Search className="h-4 w-4" />, label: "Planes", desc: "Eventos hoy" },
] as const;

export function LocalDiscoveryStep() {
  const { setValue, watch } = useFormContext<PodcastCreationData>();
  
  const [isLocating, setIsLocating] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const location = watch("location");
  const selectedLens = watch("selectedTone");

  // 1. CAPTURA DE GPS CON FEEDBACK ROBUSTO
  const handleGetLocation = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      alert("Tu dispositivo no soporta GPS.");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue("location", {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          placeName: "Ubicación confirmada"
        }, { shouldValidate: true });
        setIsLocating(false);
      },
      (err) => {
        console.error("GPS Error:", err);
        setIsLocating(false);
        alert("No se pudo obtener la ubicación. Intenta subir una foto para que la IA la analice.");
      },
      { enableHighAccuracy: true, timeout: 8000 }
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

  return (
    <div className="flex flex-col w-full h-full animate-in fade-in duration-500 pb-4">
      
      {/* HEADER COMPACTO */}
      <div className="text-center py-4 flex-shrink-0">
        <h2 className="text-2xl font-black tracking-tight text-foreground">Vivir lo Local</h2>
        <p className="text-xs text-muted-foreground font-medium mt-1 uppercase tracking-widest opacity-60">Sincroniza tus sentidos</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 space-y-4">
        
        {/* GRID DE SENSORES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          
          {/* SENSOR GPS */}
          <button 
            type="button"
            onClick={handleGetLocation}
            className={cn(
              "relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-300",
              location ? "border-green-500/40 bg-green-500/5 shadow-lg" : "border-border/40 bg-background/40 hover:bg-background/60"
            )}
          >
            <div className={cn("p-3 rounded-full mb-3", location ? "bg-green-500 text-white" : "bg-primary/10 text-primary")}>
              {isLocating ? <Loader2 className="h-6 w-6 animate-spin" /> : location ? <Navigation className="h-6 w-6" /> : <MapPin className="h-6 w-6" />}
            </div>
            <span className="text-sm font-bold">Geolocalización</span>
            <span className="text-[10px] text-muted-foreground mt-1">
                {location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : "Click para activar radar"}
            </span>
          </button>

          {/* SENSOR VISIÓN */}
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-300 overflow-hidden",
              previewImage ? "border-blue-500/40 bg-black/20" : "border-border/40 bg-background/40 hover:bg-background/60"
            )}
          >
            {previewImage ? (
                <>
                    <img src={previewImage} className="absolute inset-0 w-full h-full object-cover opacity-60" />
                    <div className="z-10 bg-blue-600 text-white text-[9px] font-black px-2 py-1 rounded-full uppercase">Visión Activa</div>
                </>
            ) : (
                <>
                    <div className="p-3 rounded-full mb-3 bg-blue-500/10 text-blue-500">
                        <Camera className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-bold">Análisis de Visión</span>
                    <span className="text-[10px] text-muted-foreground mt-1">Saca una foto al lugar</span>
                </>
            )}
            <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handleImageCapture} />
          </button>
        </div>

        {/* SECCIÓN DE LENTES */}
        <div className="pt-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mb-3 ml-1">¿Qué guía necesitas hoy?</p>
            <div className="grid grid-cols-2 gap-2">
                {DISCOVERY_LENSES.map((lens) => (
                    <button
                        key={lens.id}
                        type="button"
                        onClick={() => setValue("selectedTone", lens.id as any)}
                        className={cn(
                            "flex items-center gap-3 p-3 rounded-xl border transition-all duration-300",
                            selectedLens === lens.id 
                                ? "bg-primary/20 border-primary shadow-sm" 
                                : "bg-background/40 border-border/40 hover:bg-background/60"
                        )}
                    >
                        <div className={cn("p-2 rounded-lg", selectedLens === lens.id ? "bg-primary text-white" : "bg-secondary text-muted-foreground")}>
                            {lens.icon}
                        </div>
                        <div className="text-left">
                            <p className="text-xs font-bold leading-tight">{lens.label}</p>
                            <p className="text-[9px] opacity-60 leading-tight">{lens.desc}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}