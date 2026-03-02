// components/geo/scanner-ui.tsx
// VERSIÓN: 8.2

"use client";

import React, { ChangeEvent, useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
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

// --- INFRAESTRUCTURA DE COMPONENTES DE INTERFAZ ---
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

// --- COMPONENTES SATELLITES Y LOGICA ---
import { GeoRecorder } from "./geo-recorder";
import { RadarHUD } from "./radar-hud";
import { useGeoEngine } from "./use-geo-engine";

// --- UTILIDADES DE SISTEMA ---
// [FIX TS2304]: Inyección de la utilidad de registro técnico.
import { cn, nicepodLog } from "@/lib/utils";

/**
 * [SHIELD]: CARGA DINÁMICA DEL VISOR SATELITAL
 * Aislamos el motor WebGL del mapa para asegurar un renderizado inicial fluido (LCP).
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
 * El puente sensorial entre la ciudad física y la Bóveda digital.
 */
export function GeoScannerUI() {
  /**
   * CONSUMO DEL MOTOR GEOESPACIAL:
   * [FIX TS2339]: userLocation ahora es reconocido gracias al contrato GeoEngineReturn v2.1.
   */
  const { 
    status, 
    data, 
    userLocation, 
    scanEnvironment, 
    submitIntent, 
    reset 
  } = useGeoEngine();

  // --- ESTADOS LOCALES DE INTERACCIÓN ---
  const [intentText, setIntentText] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * handleImageCapture:
   * Procesa la entrada visual del sensor de cámara y activa la ingesta de contexto.
   */
  const handleImageCapture = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Content = reader.result as string;
        setPreviewUrl(base64Content);
        
        nicepodLog("📸 [Scanner] Captura visual procesada. Iniciando análisis ambiental.");
        // Disparamos la vectorización del entorno geolocalizado.
        scanEnvironment(base64Content);
      };
      reader.readAsDataURL(file);
    }
  }, [scanEnvironment]);

  // --- SEGMENTACIÓN DE ESTADOS (LÓGICA DE ESCENA) ---
  const isInitialState = status === 'IDLE' || (status === 'SCANNING' && !data?.draftId);
  const isInputState = status === 'ANALYZING' || status === 'REJECTED' || (status === 'SCANNING' && !!data?.draftId);
  const isSuccessState = status === 'ACCEPTED';

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto relative px-4 pb-12 overflow-hidden selection:bg-primary/30">

      {/* 1. HUD DE TELEMETRÍA (Capa de Conciencia Situacional) */}
      <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-1000">
        <RadarHUD
          status={status}
          weather={data?.weather}
          place={data?.place}
        />
      </div>

      <div className="flex-1 flex flex-col justify-start min-h-0">
        <AnimatePresence mode="wait">

          {/* ESTADO A: VISOR SATELITAL Y GATILLO DE CAPTURA */}
          {isInitialState && (
            <motion.div
              key="initial_satellite_vision"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex flex-col items-center gap-10 py-6"
            >
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">
                  Siembra de <span className="text-primary not-italic">Sabiduría</span>
                </h2>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.3em]">
                  Localizando Nodo de Resonancia Activa
                </p>
              </div>

              {/* EL EPICENTRO: VENTANA AL TERRENO (LIVE MAP) */}
              <div className="relative group">
                {/* Anillo de Frecuencia Cinematográfico */}
                <div className="absolute -inset-6 rounded-full border border-primary/10 animate-pulse" />
                
                <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full bg-zinc-900 border-2 border-white/5 shadow-[0_0_60px_rgba(0,0,0,1)] overflow-hidden">
                  
                  {/* Visor Satelital de Campo */}
                  {userLocation ? (
                    <LiveLocationMap 
                      latitude={userLocation.latitude}
                      longitude={userLocation.longitude}
                      accuracy={userLocation.accuracy}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-[#050505]">
                       <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
                       <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">Alineando Satélites</span>
                    </div>
                  )}

                  {/* Gatillo de Cámara Superpuesto */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={status === 'SCANNING'}
                    className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/30 hover:bg-black/10 transition-all group"
                  >
                    <div className="p-5 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 group-hover:scale-110 group-hover:border-primary/50 transition-all shadow-2xl">
                        <Camera size={36} className="text-white/40 group-hover:text-primary transition-colors" />
                    </div>
                    <span className="mt-5 text-[10px] font-black text-white/20 uppercase tracking-[0.3em] bg-black/60 px-5 py-2 rounded-full border border-white/5 opacity-0 group-hover:opacity-100 transition-all">
                      CAPTURAR ENTORNO
                    </span>
                  </button>
                </div>

                {/* HUD DE COORDENADAS (Industrial Telemetry) */}
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 z-40 bg-[#020202] border border-white/10 px-6 py-2.5 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex items-center gap-5">
                    <div className="flex items-center gap-2.5">
                        <Target size={11} className="text-primary animate-pulse" />
                        <span className="text-[10px] font-mono font-bold text-zinc-400">
                            {userLocation?.latitude.toFixed(6) || "0.000000"}
                        </span>
                    </div>
                    <div className="w-px h-4 bg-white/10" />
                    <div className="flex items-center gap-2.5">
                        <Navigation2 size={11} className="text-zinc-600" />
                        <span className="text-[10px] font-mono font-bold text-zinc-400">
                            {userLocation?.longitude.toFixed(6) || "0.000000"}
                        </span>
                    </div>
                </div>
              </div>

              {/* Entrada de archivo oculta */}
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

          {/* ESTADO B: FORMULARIO DE INTENCIÓN NARRATIVA */}
          {isInputState && (
            <motion.div
              key="intent_input_form"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Vínculo Visual Capturado */}
              {previewUrl && (
                <div className="relative w-full h-48 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl bg-zinc-900 group">
                  <Image
                    src={previewUrl}
                    alt="Evidencia Urbana"
                    fill
                    unoptimized
                    className="object-cover opacity-40 grayscale hover:grayscale-0 transition-all duration-1000 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-6 left-8 flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
                    <span className="text-[11px] font-black uppercase text-primary tracking-[0.4em]">
                      Contexto Visual Sincronizado
                    </span>
                  </div>
                </div>
              )}

              {/* Veredicto de Integridad (Error handling) */}
              {status === 'REJECTED' && (
                <div className="bg-red-500/5 border border-red-500/20 p-8 rounded-[2.5rem] flex gap-6 items-center animate-in zoom-in-95 duration-700">
                  <div className="h-14 w-14 rounded-2xl bg-red-500/10 flex items-center justify-center shrink-0 border border-red-500/20">
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                  </div>
                  <div className="space-y-1">
                    <span className="font-black uppercase block text-[10px] tracking-[0.4em] text-red-500/60">Fallo de Validación</span>
                    <p className="text-zinc-300 text-sm leading-relaxed font-medium italic">"{data?.rejectionReason}"</p>
                  </div>
                </div>
              )}

              {/* Terminal de Escritura Narrativa */}
              <div className="relative group">
                <div className="absolute -top-3.5 left-10 px-5 bg-[#020202] text-[10px] font-black text-primary tracking-[0.5em] uppercase z-10 border border-white/10 rounded-full shadow-lg">
                  Semilla Narrativa
                </div>
                <Textarea
                  placeholder="Describe la historia o el detalle que hace este lugar especial..."
                  className="bg-white/[0.02] border-white/5 min-h-[220px] rounded-[3rem] p-10 text-lg text-white focus:border-primary/30 transition-all resize-none shadow-inner placeholder:text-zinc-800 custom-scrollbar-hide"
                  value={intentText}
                  disabled={status === 'SCANNING'}
                  onChange={(event) => setIntentText(event.target.value)}
                />
              </div>

              <div className="space-y-6">
                <Button
                  disabled={intentText.trim().length < 10 || status === 'SCANNING'}
                  onClick={() => submitIntent(intentText)}
                  className="w-full h-20 rounded-[2rem] bg-primary text-white font-black text-xl tracking-[0.4em] shadow-2xl shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all group overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                  <span className="relative z-10 flex items-center gap-5">
                    {status === 'SCANNING' ? (
                      <>
                        <RefreshCw className="w-6 h-6 animate-spin text-black" />
                        <span className="text-black italic">SINTETIZANDO...</span>
                      </>
                    ) : (
                      <>
                        <Zap size={24} className="fill-current" />
                        <span>FORJAR CRÓNICA URBANA</span>
                      </>
                    )}
                  </span>
                </Button>

                <div className="flex items-center justify-center gap-4 opacity-20 group cursor-help transition-opacity hover:opacity-40">
                  <Info className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.7em]">Dogma: Witness, Not Diarist</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* ESTADO C: TERMINAL DE GRABACIÓN FINAL */}
          {isSuccessState && (
            <motion.div
              key="success_terminal"
              initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              className="flex-1 flex flex-col pt-4"
            >
              <GeoRecorder
                draftId={data?.draftId}
                script={data?.script}
                onUploadComplete={() => {
                  nicepodLog("🏁 [Scanner] Misión geoespacial completada. Navegando al mapa.");
                  reset();
                  setPreviewUrl(null);
                  setIntentText("");
                  // Salto de dimensión directo al mapa global para ver la nueva resonancia.
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
 * 1. Integridad de Tipos: Al consumir 'userLocation' directamente del hook 
 *    tipado, eliminamos la inseguridad del compilador sobre la existencia 
 *    de propiedades físicas de GPS.
 * 2. Trazabilidad: El uso de 'nicepodLog' asegura que el Administrador 
 *    tenga un registro visual de cada fase de la forja urbana en la consola.
 * 3. UX de Grado Industrial: El HUD de coordenadas con formato de 6 decimales 
 *    proporciona una precisión de ~11cm, ideal para identificar hitos 
 *    específicos en parques o plazas históricas.
 */