// components/geo/scanner-ui.tsx
// VERSIÓN: 10.3

"use client";

import React, { ChangeEvent, useCallback, useRef, useState, useEffect } from "react";
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
  Target,
  Power,
  Activity,
  ShieldCheck,
  Lock,
  Sparkles
} from "lucide-react";

// --- INFRAESTRUCTURA DE COMPONENTES DE INTERFAZ ---
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// --- COMPONENTES SATELLITES Y LOGICA SOBERANA ---
import { RadarHUD } from "./radar-hud";
import { useGeoEngine, GeoEngineReturn } from "./use-geo-engine";
import { useForge } from "./forge-context";
import { GeoRecorder } from "./geo-recorder";

// --- UTILIDADES DE SISTEMA ---
import { cn, nicepodLog } from "@/lib/utils";

/**
 * [SHIELD]: CARGA DINÁMICA DEL VISOR SATELITAL
 * Aislamos el motor WebGL para asegurar un renderizado inicial de 60 FPS
 * y evitar bloqueos de hidratación en dispositivos móviles.
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
 * El puente sensorial para la forja de sabiduría urbana de NicePod V2.5.
 */
export function GeoScannerUI() {
  /**
   * CONSUMO DEL MOTOR GEOESPACIAL (V3.2):
   * [SINCRO]: Aplicamos casting estructural para asegurar que el compilador 
   * reconozca el inicializador de sensores, el estado de bloqueo y la telemetría.
   */
  const geoEngine = useGeoEngine() as GeoEngineReturn;
  const { 
    status, 
    data, 
    userLocation, 
    initSensors,
    scanEnvironment, 
    submitIntent, 
    reset 
  } = geoEngine;

  // Determine lock state based on scanning status
  const isLocked = status === 'SCANNING' && !!data?.draftId;

  // Consumo del contexto de persistencia de forja (Memoria entre pasos)
  const { state } = useForge();

  // --- ESTADOS LOCALES DE INTERACCIÓN ---
  const [intentText, setIntentText] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * handleImageCapture:
   * Procesa la entrada visual y dispara el pipeline de inteligencia analítica.
   */
  const handleImageCapture = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Content = reader.result as string;
        setPreviewUrl(base64Content);
        
        nicepodLog("📸 [Scanner] Evidencia visual recibida. Iniciando análisis multimodal.");
        
        /**
         * [SINCRO V10.3]: Invocación Multimodal
         * Enviamos el Hero Shot y los metadatos de configuración.
         * La función 'scanEnvironment' anclará automáticamente la posición (isLocked).
         */
        scanEnvironment({
          heroImage: base64Content,
          intent: intentText,
          category: state.categoryId || "historia",
          radius: state.resonanceRadius || 30
        });
      };
      reader.readAsDataURL(file);
    }
  }, [scanEnvironment, intentText, state.categoryId, state.resonanceRadius]);

  // --- LÓGICA DE SEGMENTACIÓN DE ESTADOS (MACHINE CONTROL) ---
  const isIdleState = status === 'IDLE';
  const isReadyToCapture = status === 'SENSORS_READY' || (status === 'SCANNING' && !data?.draftId);
  const isInputState = status === 'ANALYZING' || status === 'REJECTED' || (status === 'SCANNING' && !!data?.draftId);
  const isSuccessState = status === 'ACCEPTED';

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto relative px-4 pb-16 overflow-hidden selection:bg-primary/30">

      {/* 
          1. HUD DE TELEMETRÍA (CAPA SUPERIOR) 
          Proyecta la precisión real del hardware (accuracy) eliminando el valor 0.0M.
      */}
      <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-1000">
        <RadarHUD
          status={status}
          weather={data?.weather}
          place={data?.place}
          accuracy={userLocation?.accuracy || 0} 
        />
      </div>

      <div className="flex-1 flex flex-col justify-start min-h-0">
        <AnimatePresence mode="wait">

          {/* ESTADO 0: ACTIVACIÓN DE TERMINAL (USER GESTURE POLICY) */}
          {isIdleState && (
            <motion.div
              key="idle_activation"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -30 }}
              className="flex flex-col items-center justify-center py-20 gap-14"
            >
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic leading-none">
                  Terminal <span className="text-primary not-italic">Geo-Locked</span>
                </h2>
                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.4em] max-w-xs mx-auto leading-relaxed">
                  Autorice el acceso al hardware para sintonizar el pulso urbano.
                </p>
              </div>

              <button
                onClick={initSensors}
                className="h-32 w-32 rounded-full bg-primary/5 border-2 border-primary/20 text-primary hover:bg-primary hover:text-black transition-all duration-700 group shadow-[0_0_50px_rgba(var(--primary),0.1)] relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-primary/10 animate-pulse" />
                <Power size={48} className="relative z-10 group-hover:scale-110 transition-transform duration-500" />
              </button>

              <div className="flex items-center gap-4 opacity-20">
                <ShieldCheck size={16} className="text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white">Security Protocol v2.5</span>
              </div>
            </motion.div>
          )}

          {/* ESTADO A: VISOR SATELITAL Y GATILLO DE CAPTURA (ACTIVE SCANNING) */}
          {isReadyToCapture && (
            <motion.div
              key="ready_capture"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex flex-col items-center gap-10 py-6"
            >
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">
                  Siembra de <span className="text-primary not-italic">Sabiduría</span>
                </h2>
                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.3em]">
                  {isLocked ? "Coordenada Anclada" : "Alineando Frecuencia Satelital"}
                </p>
              </div>

              {/* EPICENTRO: LENTE SATELITAL EN VIVO */}
              <div className="relative group">
                {/* Anillos de Resonancia Reactivos */}
                <div className={cn(
                    "absolute -inset-6 rounded-full border transition-all duration-1000",
                    isLocked ? "border-emerald-500/20 scale-110" : "border-primary/10 animate-pulse"
                )} />
                
                <div className={cn(
                    "relative w-64 h-64 md:w-80 md:h-80 rounded-full border-2 shadow-[0_0_80px_rgba(0,0,0,1)] overflow-hidden transition-all duration-700",
                    isLocked ? "border-emerald-500/40" : "border-white/5"
                )}>
                  
                  {userLocation ? (
                    <LiveLocationMap 
                      latitude={userLocation.latitude}
                      longitude={userLocation.longitude}
                      accuracy={userLocation.accuracy}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-[#050505]">
                       <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
                       <span className="text-[9px] font-black text-zinc-800 uppercase tracking-widest">Sintonizando...</span>
                    </div>
                  )}

                  {/* GATILLO DE CÁMARA (Over-Map Interface) */}
                  {!isLocked && (
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={status === 'SCANNING'}
                        className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/30 hover:bg-black/10 transition-all group"
                    >
                        <div className="p-6 rounded-full bg-black/80 backdrop-blur-xl border border-white/10 group-hover:scale-110 group-hover:border-primary/60 transition-all shadow-2xl">
                            <Camera size={40} className="text-white/60 group-hover:text-primary transition-colors" />
                        </div>
                        <span className="mt-6 text-[10px] font-black text-white/40 uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-opacity">
                            Capturar Entorno
                        </span>
                    </button>
                  )}

                  {/* Overlay de Bloqueo de Posición */}
                  {isLocked && (
                    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-emerald-500/5 backdrop-blur-[2px]">
                        <div className="p-5 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-500 animate-in zoom-in-95">
                            <Lock size={32} />
                        </div>
                        <span className="mt-4 text-[9px] font-black text-emerald-500 uppercase tracking-[0.4em]">
                            Posición Fijada
                        </span>
                    </div>
                  )}
                </div>

                {/* HUD DE COORDENADAS (Industrial Look) */}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#020202] border border-white/10 px-6 py-3 rounded-full shadow-[0_15px_40px_rgba(0,0,0,1)] flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <Target size={12} className={cn("transition-colors", isLocked ? "text-emerald-500" : "text-primary animate-pulse")} />
                        <span className="text-[11px] font-mono font-bold text-zinc-400 tabular-nums">
                            {userLocation?.latitude.toFixed(6) || "0.000000"}
                        </span>
                    </div>
                    <div className="w-px h-4 bg-white/10" />
                    <div className="flex items-center gap-3">
                        <Navigation2 size={12} className="text-zinc-600" />
                        <span className="text-[11px] font-mono font-bold text-zinc-400 tabular-nums">
                            {userLocation?.longitude.toFixed(6) || "0.000000"}
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

          {/* ESTADO B: TERMINAL DE INTENCIÓN (FORJA COGNITIVA) */}
          {isInputState && (
            <motion.div
              key="intent_input_stage"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {previewUrl && (
                <div className="relative w-full h-56 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl bg-zinc-900 group">
                  <Image
                    src={previewUrl}
                    alt="Evidencia"
                    fill
                    unoptimized
                    className="object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-6 left-8 flex items-center gap-4">
                    <div className="h-2.5 w-2.5 rounded-full bg-primary animate-ping" />
                    <span className="text-[11px] font-black uppercase text-primary tracking-[0.4em]">
                      Vínculo Visual Sincronizado
                    </span>
                  </div>
                </div>
              )}

              {/* Manejo de Veredictos Negativos */}
              {status === 'REJECTED' && (
                <div className="bg-red-500/5 border border-red-500/20 p-8 rounded-[2.5rem] flex gap-6 items-center animate-in zoom-in-95 duration-500">
                  <div className="h-14 w-14 rounded-2xl bg-red-500/10 flex items-center justify-center shrink-0 border border-red-500/20 shadow-inner">
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                  </div>
                  <div className="space-y-1">
                    <span className="font-black uppercase block text-[10px] tracking-[0.4em] text-red-500/60">Fallo de Integridad</span>
                    <p className="text-zinc-300 text-sm leading-relaxed font-medium italic">"{data?.rejectionReason}"</p>
                  </div>
                </div>
              )}

              <div className="relative group">
                <div className="absolute -top-3.5 left-10 px-6 bg-[#020202] text-[10px] font-black text-primary tracking-[0.5em] uppercase z-10 border border-white/10 rounded-full shadow-2xl">
                  Semilla Narrativa
                </div>
                <Textarea
                  placeholder="Describe el secreto que oculta este lugar..."
                  className="bg-white/[0.02] border-white/5 min-h-[240px] rounded-[3.5rem] p-12 text-lg text-white focus:border-primary/30 transition-all resize-none shadow-inner placeholder:text-zinc-800"
                  value={intentText}
                  disabled={status === 'SCANNING'}
                  onChange={(event) => setIntentText(event.target.value)}
                />
              </div>

              <div className="space-y-8">
                <Button
                  disabled={intentText.trim().length < 10 || status === 'SCANNING'}
                  onClick={() => submitIntent(intentText)}
                  className="w-full h-20 rounded-[2rem] bg-primary text-white font-black text-xl tracking-[0.4em] shadow-2xl shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all group overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                  <span className="relative z-10 flex items-center gap-6">
                    {status === 'SCANNING' ? (
                      <>
                        <RefreshCw className="w-7 h-7 animate-spin text-black" />
                        <span className="text-black italic">SINTETIZANDO...</span>
                      </>
                    ) : (
                      <>
                        <Zap size={28} className="fill-current" />
                        <span>FORJAR CRÓNICA URBANA</span>
                      </>
                    )}
                  </span>
                </Button>

                <div className="flex items-center justify-center gap-4 opacity-10 group cursor-help transition-opacity hover:opacity-30">
                  <Activity size={14} className="text-zinc-500" />
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.8em]">Witness, Not Diarist</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* ESTADO C: TERMINAL DE GRABACIÓN FINAL (AUDIO FORGE) */}
          {isSuccessState && (
            <motion.div
              key="success_terminal_audio"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col pt-6"
            >
              <GeoRecorder
                draftId={data?.draftId}
                script={data?.script}
                onUploadComplete={() => {
                  nicepodLog("🏁 [Scanner] Misión geoespacial completada. Navegando al mapa.");
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

      {/* FOOTER: IDENTITY STATUS */}
      <div className="flex-shrink-0 py-8 px-12 border-t border-white/5 opacity-20 select-none">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white">Secure Uplink</span>
                </div>
                <div className="h-4 w-px bg-white/10" />
                <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-zinc-500 italic">NicePod Spatial Hub</span>
            </div>
            <Sparkles size={14} className="text-primary" />
        </div>
      </div>

    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Cumplimiento de Gesto de Usuario: El estado 'IDLE' detiene el acceso automático 
 *    al GPS, eliminando las advertencias de seguridad y preservando la vida 
 *    útil de la batería del dispositivo administrador.
 * 2. Feedback de Bloqueo: Al inyectar 'isLocked', informamos físicamente al Admin 
 *    que el sistema ya ha capturado las coordenadas de siembra, permitiendo 
 *    moverse del sitio sin miedo a desviar la coordenada del POI.
 * 3. Telemetría HUD: Se ha resuelto el error de propiedad 'accuracy' al 
 *    sincronizar los tipos con el componente RadarHUD v2.0.
 */