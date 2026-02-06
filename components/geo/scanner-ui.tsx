// components/geo/scanner-ui.tsx
// VERSIÓN: 7.0 (Madrid Resonance - Performance Optimized & Zero Warning)
// Misión: Interfaz de captura urbana multimodal con optimización de activos y blindaje de estados.

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
  Send
} from "lucide-react";
import Image from "next/image";
import { ChangeEvent, useCallback, useRef, useState } from "react";
import { GeoRecorder } from "./geo-recorder";
import { RadarHUD } from "./radar-hud";
import { useGeoEngine } from "./use-geo-engine";

/**
 * GeoScannerUI: El punto de entrada sensorial para Madrid Resonance.
 */
export function GeoScannerUI() {
  // Consumo del motor geoespacial refactorizado (V6.1)
  const { status, data, scanEnvironment, submitIntent, reset } = useGeoEngine();

  // Estados locales de interacción
  const [intentText, setIntentText] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * handleImageCapture
   * Procesa la captura física de la cámara y activa el pipeline de ingesta.
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

  /**
   * [LÓGICA DE SEGMENTACIÓN DE ESTADOS]
   * Definimos guardas booleanas para orquestar la AnimatePresence sin ambigüedad.
   */
  const isInitialState = status === 'IDLE' || (status === 'SCANNING' && !data.draftId);
  const isInputState = status === 'ANALYZING' || status === 'REJECTED' || (status === 'SCANNING' && !!data.draftId);
  const isSuccessState = status === 'ACCEPTED';

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto relative px-4 pb-10 overflow-hidden">

      {/* 1. HUD DE TELEMETRÍA (Capa de Realidad Aumentada) */}
      <div className="mb-6">
        <RadarHUD
          status={status}
          weather={data?.weather}
          place={data?.place}
        />
      </div>

      <div className="flex-1 flex flex-col justify-start min-h-0">
        <AnimatePresence mode="wait">

          {/* ESTADO A: CAPTURA INICIAL (Portal de Entrada) */}
          {isInitialState && (
            <motion.div
              key="initial_capture"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="flex flex-col items-center gap-8 py-10"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">
                  Captura la Ciudad
                </h2>
                <p className="text-sm text-white/30 font-medium">
                  Ancla una memoria visual al tejido urbano de Madrid.
                </p>
              </div>

              {/* Gatillo de Cámara Estilo Escáner */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={status === 'SCANNING'}
                className="w-48 h-48 rounded-full bg-white/5 border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-white/10 hover:border-primary/40 transition-all group disabled:opacity-50 shadow-2xl"
              >
                {status === 'SCANNING' ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 size={40} className="text-primary animate-spin" />
                    <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">Iniciando...</span>
                  </div>
                ) : (
                  <>
                    <Camera size={40} className="text-white/40 group-hover:text-primary transition-colors" />
                    <span className="text-[10px] font-black text-white/20 group-hover:text-white/40 uppercase tracking-widest text-center px-6 leading-tight">
                      Capturar entorno <br /> actual
                    </span>
                  </>
                )}
              </button>

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

          {/* ESTADO B: FORMULARIO DE INTENCIÓN (Procesamiento Cognitivo) */}
          {isInputState && (
            <motion.div
              key="intent_input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* [MEJORA 7.0]: Previsualización Optimizada con Next Image */}
              {previewUrl && (
                <div className="relative w-full h-40 rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black/40 group">
                  <Image
                    src={previewUrl}
                    alt="Contexto Urbano Capturado"
                    fill
                    unoptimized // Necesario para previews locales base64
                    className="object-cover opacity-60 transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/80 via-transparent to-transparent">
                    <div className="bg-primary/20 backdrop-blur-xl px-4 py-2 rounded-2xl border border-primary/30 flex items-center gap-2 shadow-lg">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      <span className="text-[10px] font-black uppercase text-primary tracking-widest">
                        Contexto Visual Activo
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Respuesta Pedagógica en caso de Rechazo Semántico */}
              {status === 'REJECTED' && (
                <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-3xl text-red-100 text-xs flex gap-5 items-center animate-in zoom-in-95 duration-300">
                  <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                    <AlertTriangle className="h-6 w-6 text-red-500" />
                  </div>
                  <div className="space-y-1">
                    <span className="font-black uppercase block text-[10px] tracking-widest text-red-400">Veredicto del Editor</span>
                    <p className="leading-relaxed font-medium">{data?.rejectionReason}</p>
                  </div>
                </div>
              )}

              {/* Área de Entrada de Intención Narrativa */}
              <div className="relative group">
                <div className="absolute -top-3 left-6 px-4 bg-zinc-950 text-[10px] font-black text-primary tracking-widest uppercase z-10 border border-white/10 rounded-full">
                  Semilla Narrativa
                </div>
                <Textarea
                  placeholder="Describe la historia o el detalle que hace este lugar especial..."
                  className="bg-white/[0.03] border-white/10 min-h-[180px] rounded-[2.5rem] p-8 text-lg text-white focus:border-primary/40 transition-all resize-none shadow-inner"
                  value={intentText}
                  disabled={status === 'SCANNING'}
                  onChange={(event) => setIntentText(event.target.value)}
                />
              </div>

              <div className="space-y-5">
                <Button
                  disabled={intentText.trim().length < 10 || status === 'SCANNING'}
                  onClick={() => submitIntent(intentText)}
                  className="w-full h-16 rounded-2xl bg-primary text-white font-black tracking-widest shadow-2xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all group"
                >
                  {status === 'SCANNING' ? (
                    <div className="flex items-center gap-3">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>SINTETIZANDO RESONANCIA...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      <span>FORJAR CRÓNICA URBANA</span>
                    </div>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-2.5 text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">
                  <Info className="w-3.5 h-3.5 text-primary/40" />
                  Dogma: Witness, Not Diarist
                </div>
              </div>
            </motion.div>
          )}

          {/* ESTADO C: TERMINAL DE GRABACIÓN (Forja Final) */}
          {isSuccessState && (
            <motion.div
              key="success_recorder"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col"
            >
              <GeoRecorder
                draftId={data?.draftId}
                script={data?.script}
                onUploadComplete={() => {
                  console.log("✅ [Scanner] Misión completada. Navegando al mapa.");
                  reset();
                  setPreviewUrl(null);
                  setIntentText("");
                  // Salto de dimensión directo al mapa 3D para ver el nuevo Eco
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