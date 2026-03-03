// components/geo/scanner-ui.tsx
// VERSIÓN: 10.2

"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Camera,
  Loader2,
  Navigation2,
  Power,
  RefreshCw,
  ShieldCheck,
  Target,
  Zap
} from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { ChangeEvent, useCallback, useRef, useState } from "react";

// --- INFRAESTRUCTURA DE COMPONENTES DE INTERFAZ ---
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// --- COMPONENTES SATELLITES Y LOGICA SOBERANA ---
import { useForge } from "./forge-context";
import { GeoRecorder } from "./geo-recorder";
import { RadarHUD } from "./radar-hud";
import { useGeoEngine } from "./use-geo-engine";

// --- UTILIDADES DE SISTEMA ---
import { nicepodLog } from "@/lib/utils";

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
   * CONSUMO DEL MOTOR GEOESPACIAL:
   * [SINCRO]: Aplicamos casting estructural para asegurar que el compilador 
   * reconozca el inicializador de sensores y la telemetría GPS.
   */
  const geoEngine = useGeoEngine() as any;
  const {
    status,
    data,
    userLocation,
    initSensors,
    scanEnvironment,
    submitIntent,
    reset
  } = geoEngine;

  // Consumo del contexto de persistencia de forja
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

        // Invocamos el escaneo pasando la imagen y los metadatos de la sesión.
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

  // --- LÓGICA DE SEGMENTACIÓN DE ESTADOS (STATE MACHINE) ---
  const isIdleState = status === 'IDLE';
  const isReadyToCapture = status === 'SENSORS_READY' || (status === 'SCANNING' && !data?.draftId);
  const isInputState = status === 'ANALYZING' || status === 'REJECTED' || (status === 'SCANNING' && !!data?.draftId);
  const isSuccessState = status === 'ACCEPTED';

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto relative px-4 pb-12 overflow-hidden selection:bg-primary/30">

      {/* 
          1. HUD DE TELEMETRÍA (CAPA SUPERIOR) 
          [FIX TS2322]: Proyectamos la precisión real capturada por el hardware.
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

          {/* ESTADO 0: ACTIVACIÓN DE TERMINAL (PROTOCOL HANDSHAKE) */}
          {isIdleState && (
            <motion.div
              key="idle_activation"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-20 gap-12"
            >
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic">
                  Terminal <span className="text-primary not-italic">Geo-Locked</span>
                </h2>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.4em] max-w-xs mx-auto leading-relaxed">
                  Active los sensores para sincronizar la frecuencia con la ciudad.
                </p>
              </div>

              <button
                onClick={initSensors}
                className="h-28 w-28 rounded-full bg-primary/5 border-2 border-primary/20 text-primary hover:bg-primary hover:text-black transition-all duration-700 group shadow-[0_0_50px_rgba(var(--primary),0.1)] relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-primary/10 animate-pulse" />
                <Power size={40} className="relative z-10 group-hover:scale-110 transition-transform" />
              </button>

              <div className="flex items-center gap-3 opacity-20">
                <ShieldCheck size={14} className="text-zinc-500" />
                <span className="text-[8px] font-black uppercase tracking-[0.6em] text-white">Security Protocol Ready</span>
              </div>
            </motion.div>
          )}

          {/* ESTADO A: VISOR SATELITAL Y CAPTURA (NOMINAL STATE) */}
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
                  Alineando Frecuencia Satelital
                </p>
              </div>

              {/* EPICENTRO: LENTE SATELITAL EN VIVO */}
              <div className="relative group">
                <div className="absolute -inset-6 rounded-full border border-primary/10 animate-pulse" />

                <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full bg-zinc-900 border-2 border-white/5 shadow-[0_0_80px_rgba(0,0,0,1)] overflow-hidden">

                  {userLocation ? (
                    <LiveLocationMap
                      latitude={userLocation.latitude}
                      longitude={userLocation.longitude}
                      accuracy={userLocation.accuracy}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-[#050505]">
                      <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
                      <span className="text-[9px] font-black text-zinc-800 uppercase tracking-widest">Calculando Posición</span>
                    </div>
                  )}

                  {/* GATILLO DE CÁMARA */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={status === 'SCANNING'}
                    className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/40 hover:bg-black/10 transition-all group"
                  >
                    <div className="p-6 rounded-full bg-black/80 backdrop-blur-xl border border-white/10 group-hover:scale-110 group-hover:border-primary/60 transition-all shadow-2xl">
                      <Camera size={40} className="text-white/40 group-hover:text-primary transition-colors" />
                    </div>
                    <span className="mt-6 text-[10px] font-black text-white/40 uppercase tracking-[0.4em] opacity-0 group-hover:opacity-100 transition-opacity">
                      Capturar Entorno
                    </span>
                  </button>
                </div>

                {/* HUD DE COORDENADAS (Industrial Telemetry) */}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#020202] border border-white/10 px-6 py-3 rounded-full shadow-[0_15px_40px_rgba(0,0,0,0.9)] flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <Target size={12} className="text-primary animate-pulse" />
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

          {/* ESTADO B: TERMINAL DE INTENCIÓN NARRATIVA */}
          {isInputState && (
            <motion.div
              key="intent_input_form"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {previewUrl && (
                <div className="relative w-full h-56 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl bg-zinc-900 group">
                  <Image
                    src={previewUrl}
                    alt="Evidencia Urbana"
                    fill
                    unoptimized
                    className="object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-6 left-8 flex items-center gap-4">
                    <div className="h-2.5 w-2.5 rounded-full bg-primary animate-ping shadow-[0_0_10px_rgba(var(--primary),0.8)]" />
                    <span className="text-[11px] font-black uppercase text-primary tracking-[0.4em]">
                      Contexto Visual Sincronizado
                    </span>
                  </div>
                </div>
              )}

              {/* Veredicto de Integridad */}
              {status === 'REJECTED' && (
                <div className="bg-red-500/5 border border-red-500/20 p-8 rounded-[2.5rem] flex gap-6 items-center animate-in zoom-in-95 duration-500">
                  <div className="h-14 w-14 rounded-2xl bg-red-500/10 flex items-center justify-center shrink-0 border border-red-500/20 shadow-inner">
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                  </div>
                  <div className="space-y-1">
                    <span className="font-black uppercase block text-[10px] tracking-[0.4em] text-red-500/60 italic">Fallo de Integridad</span>
                    <p className="text-zinc-300 text-sm leading-relaxed font-medium italic">"{data?.rejectionReason}"</p>
                  </div>
                </div>
              )}

              <div className="relative group">
                <div className="absolute -top-3.5 left-10 px-6 bg-[#020202] text-[10px] font-black text-primary tracking-[0.5em] uppercase z-10 border border-white/10 rounded-full shadow-2xl">
                  Semilla Narrativa
                </div>
                <Textarea
                  placeholder="Describe la historia que oculta este lugar especial..."
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
              key="success_terminal"
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
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Cumplimiento de Gesto: La introducción del estado 'IDLE' con el botón Power 
 *    garantiza que el GPS no se inicie sin la voluntad del usuario, silenciando 
 *    las violaciones de política del navegador.
 * 2. Telemetría de Precisión: RadarHUD ahora consume 'accuracy' directamente de 
 *    los sensores del hardware, informando al Admin sobre la calidad del enlace.
 * 3. Diseño Aeroespacial: Se han unificado los radios de borde masivos y la 
 *    tipografía itálica para que la terminal se perciba como una herramienta 
 *    profesional de hardware, coherente con el sistema NicePod V2.5.
 */