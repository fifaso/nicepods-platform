// components/geo/scanner-ui.tsx
// VERSIÓN: 8.0

"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Camera,
  Info,
  Loader2,
  RefreshCw,
  Send,
  Navigation2,
  Zap,
  Target
} from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import React, { ChangeEvent, useCallback, useRef, useState } from "react";

// --- COMPONENTES SATELLITES ---
import { GeoRecorder } from "./geo-recorder";
import { RadarHUD } from "./radar-hud";
import { useGeoEngine } from "./use-geo-engine";
import { cn } from "@/lib/utils";

/**
 * [SHIELD]: CARGA DINÁMICA DEL MAPA DE CAMPO
 * Evitamos el costo de renderizado WebGL en el servidor y priorizamos el LCP.
 */
const LiveLocationMap = dynamic(
  () => import("./live-location-map").then((mod) => mod.LiveLocationMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full rounded-full bg-zinc-900/80 flex items-center justify-center animate-pulse border border-white/5">
        <Loader2 className="h-6 w-6 animate-spin text-primary/20" />
      </div>
    )
  }
);

/**
 * COMPONENTE: GeoScannerUI
 * El terminal sensorial y de forja situacional para el Administrador.
 */
export function GeoScannerUI() {
  // Consumo del motor geoespacial (V2.0)
  // [SINCRO]: Recuperamos userLocation para alimentar el visor satelital.
  const { 
    status, 
    data, 
    userLocation, 
    scanEnvironment, 
    submitIntent, 
    reset 
  } = useGeoEngine();

  // Estados locales de interacción
  const [intentText, setIntentText] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * handleImageCapture
   * Procesa la entrada física y dispara el pipeline de inteligencia.
   */
  const handleImageCapture = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Content = reader.result as string;
        setPreviewUrl(base64Content);
        // Iniciamos el escaneo ambiental inyectando el contexto visual
        scanEnvironment(base64Content);
      };
      reader.readAsDataURL(file);
    }
  }, [scanEnvironment]);

  // --- LÓGICA DE SEGMENTACIÓN DE ESTADOS ---
  const isInitialState = status === 'IDLE' || (status === 'SCANNING' && !data?.draftId);
  const isInputState = status === 'ANALYZING' || status === 'REJECTED' || (status === 'SCANNING' && !!data?.draftId);
  const isSuccessState = status === 'ACCEPTED';

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto relative px-4 pb-10 overflow-hidden selection:bg-primary/30">

      {/* 1. HUD DE TELEMETRÍA (Capa Superior) */}
      <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-700">
        <RadarHUD
          status={status}
          weather={data?.weather}
          place={data?.place}
        />
      </div>

      <div className="flex-1 flex flex-col justify-start min-h-0">
        <AnimatePresence mode="wait">

          {/* ESTADO A: VISOR DE CAMPO Y CAPTURA (SATELLITE VISION) */}
          {isInitialState && (
            <motion.div
              key="satellite_initial_vision"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex flex-col items-center gap-10 py-4"
            >
              {/* Títulos de Inmersión */}
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">
                  Siembra de <span className="text-primary not-italic">Sabiduría</span>
                </h2>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.3em]">
                  Localizando Nodo de Resonancia...
                </p>
              </div>

              {/* 
                  EL EPICENTRO: VISOR SATELITAL EN VIVO
                  Sustituimos el botón estático por una ventana al terreno.
              */}
              <div className="relative group">
                {/* Anillo de Frecuencia Exterior */}
                <div className="absolute -inset-4 rounded-full border border-primary/10 animate-pulse" />
                
                <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full bg-zinc-900 border-2 border-white/5 shadow-[0_0_60px_rgba(0,0,0,1)] overflow-hidden">
                  
                  {/* Mapa Satelital Activo */}
                  {userLocation ? (
                    <LiveLocationMap 
                      latitude={userLocation.latitude}
                      longitude={userLocation.longitude}
                      accuracy={userLocation.accuracy}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                       <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
                       <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Sintonizando Satélite</span>
                    </div>
                  )}

                  {/* Gatillo de Cámara (Superpuesto al mapa) */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={status === 'SCANNING'}
                    className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/20 hover:bg-black/0 transition-all group"
                  >
                    <div className="p-4 rounded-full bg-black/60 backdrop-blur-md border border-white/10 group-hover:scale-110 group-hover:border-primary/50 transition-all shadow-2xl">
                        <Camera size={32} className="text-white/60 group-hover:text-primary transition-colors" />
                    </div>
                    <span className="mt-4 text-[9px] font-black text-white/40 uppercase tracking-[0.2em] bg-black/60 px-4 py-1.5 rounded-full border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                      Capturar Entorno
                    </span>
                  </button>
                </div>

                {/* HUD DE COORDENADAS (Metal Look) */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-40 bg-[#050505] border border-white/10 px-5 py-2 rounded-full shadow-2xl flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Target size={10} className="text-primary animate-pulse" />
                        <span className="text-[9px] font-mono text-zinc-400">
                            {userLocation?.latitude.toFixed(5) || "0.00000"}
                        </span>
                    </div>
                    <div className="w-px h-3 bg-white/10" />
                    <div className="flex items-center gap-2">
                        <Navigation2 size={10} className="text-zinc-600" />
                        <span className="text-[9px] font-mono text-zinc-400">
                            {userLocation?.longitude.toFixed(5) || "0.00000"}
                        </span>
                    </div>
                </div>
              </div>

              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageCapture}
              />
            </motion.div>
          )}

          {/* ESTADO B: FORMULARIO DE INTENCIÓN (Procesamiento) */}
          {isInputState && (
            <motion.div
              key="intent_input"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Previsualización del Contexto Visual */}
              {previewUrl && (
                <div className="relative w-full h-44 rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl bg-zinc-900 group">
                  <Image
                    src={previewUrl}
                    alt="Evidencia Visual"
                    fill
                    unoptimized
                    className="object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                  <div className="absolute bottom-5 left-6 flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
                    <span className="text-[10px] font-black uppercase text-primary tracking-[0.3em]">
                      Vínculo Visual Establecido
                    </span>
                  </div>
                </div>
              )}

              {/* Manejo de Rechazo Semántico */}
              {status === 'REJECTED' && (
                <div className="bg-red-500/5 border border-red-500/20 p-6 rounded-[2rem] flex gap-5 items-center animate-in zoom-in-95 duration-500">
                  <div className="h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center shrink-0 border border-red-500/20">
                    <AlertTriangle className="h-6 w-6 text-red-500" />
                  </div>
                  <div className="space-y-1">
                    <span className="font-black uppercase block text-[9px] tracking-[0.4em] text-red-500/60">Fallo de Integridad</span>
                    <p className="text-zinc-300 text-xs leading-relaxed font-medium italic">"{data?.rejectionReason}"</p>
                  </div>
                </div>
              )}

              {/* Área Narrativa */}
              <div className="relative group">
                <div className="absolute -top-3 left-8 px-4 bg-zinc-950 text-[9px] font-black text-primary tracking-[0.4em] uppercase z-10 border border-white/5 rounded-full shadow-lg">
                  Semilla Narrativa
                </div>
                <Textarea
                  placeholder="Describe la historia o el detalle que hace este lugar especial..."
                  className="bg-white/[0.02] border-white/5 min-h-[200px] rounded-[2.5rem] p-10 text-lg text-white focus:border-primary/20 transition-all resize-none shadow-inner placeholder:text-zinc-800"
                  value={intentText}
                  disabled={status === 'SCANNING'}
                  onChange={(event) => setIntentText(event.target.value)}
                />
              </div>

              <div className="space-y-6">
                <Button
                  disabled={intentText.trim().length < 10 || status === 'SCANNING'}
                  onClick={() => submitIntent(intentText)}
                  className="w-full h-20 rounded-[2rem] bg-primary text-white font-black text-lg tracking-[0.3em] shadow-2xl shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all group overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                  <span className="relative z-10 flex items-center gap-4">
                    {status === 'SCANNING' ? (
                      <>
                        <RefreshCw className="w-6 h-6 animate-spin" />
                        <span>SINTETIZANDO...</span>
                      </>
                    ) : (
                      <>
                        <Zap size={22} className="fill-current" />
                        <span>FORJAR CRÓNICA URBANA</span>
                      </>
                    )}
                  </span>
                </Button>

                <div className="flex items-center justify-center gap-3 opacity-20 group cursor-help">
                  <Info className="w-3 h-3 text-zinc-500" />
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.6em]">Dogma: Witness, Not Diarist</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* ESTADO C: TERMINAL DE GRABACIÓN */}
          {isSuccessState && (
            <motion.div
              key="success_recorder"
              initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              className="flex-1 flex flex-col"
            >
              <GeoRecorder
                draftId={data?.draftId}
                script={data?.script}
                onUploadComplete={() => {
                  nicepodLog("🏁 Misión de siembra completada con éxito.");
                  reset();
                  setPreviewUrl(null);
                  setIntentText("");
                  window.location.href = '/map';
                }}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Aislamiento de Renderizado: El uso de 'dynamic' para LiveLocationMap previene 
 *    que el hilo de UI se congele durante la inicialización del contexto WebGL.
 * 2. UX de Misión Crítica: Al integrar el mapa directamente en la fase de captura, 
 *    el Administrador tiene una validación visual del terreno antes de inyectar la 
 *    semilla narrativa, reduciendo el error humano de geolocalización.
 * 3. Estética Aeroespacial: Los radios de borde masivos [2.5rem] y el HUD de 
 *    coordenadas en formato mono-espaciado alinean esta herramienta con el 
 *    estándar de 'Hardware Industrial' de NicePod V2.5.
 */