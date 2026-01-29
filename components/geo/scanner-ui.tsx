// components/geo/scanner-ui.tsx
// VERSIÓN: 6.0 (Madrid Resonance - Logic Shield & Visual First)
// Misión: Interfaz de captura urbana multimodal con blindaje total de tipos.

"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Camera, Info, Loader2, RefreshCw, Send } from "lucide-react";
import { useRef, useState } from "react";
import { GeoRecorder } from "./geo-recorder";
import { RadarHUD } from "./radar-hud";
import { useGeoEngine } from "./use-geo-engine";

export function GeoScannerUI() {
  const { status, data, scanEnvironment, submitIntent, reset } = useGeoEngine();
  const [intentText, setIntentText] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- MANEJO DE CAPTURA VISUAL ---
  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPreviewUrl(base64);
        // Iniciamos el escaneo con el contexto de la imagen
        scanEnvironment(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * 🛡️ LÓGICA DE VISIBILIDAD (Bypass de Narrowing)
   * Definimos condiciones claras para evitar los errores ts(2367)
   */
  const isInitialState = status === 'IDLE' || (status === 'SCANNING' && !data.draftId);
  const isInputState = status === 'ANALYZING' || status === 'REJECTED' || (status === 'SCANNING' && !!data.draftId);
  const isSuccessState = status === 'ACCEPTED';

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto relative px-4 pb-10 overflow-hidden">

      {/* 1. HUD DE TELEMETRÍA (Siempre visible si hay datos) */}
      <div className="mb-6">
        <RadarHUD
          status={status}
          weather={data?.weather}
          place={data?.place}
        />
      </div>

      <div className="flex-1 flex flex-col justify-start min-h-0">
        <AnimatePresence mode="wait">

          {/* ESTADO A: CAPTURA INICIAL (Cámara) */}
          {isInitialState && (
            <motion.div
              key="initial"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-8 py-10"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">
                  Captura la Ciudad
                </h2>
                <p className="text-sm text-white/30 font-medium">
                  Sincroniza una memoria visual y sonora con Madrid.
                </p>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={status === 'SCANNING'}
                className="w-48 h-48 rounded-full bg-white/5 border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-white/10 hover:border-primary/40 transition-all group disabled:opacity-50"
              >
                {status === 'SCANNING' ? (
                  <Loader2 size={40} className="text-primary animate-spin" />
                ) : (
                  <>
                    <Camera size={40} className="text-white/40 group-hover:text-primary transition-colors" />
                    <span className="text-[10px] font-black text-white/20 group-hover:text-white/40 uppercase tracking-widest text-center px-6">
                      Anclar imagen del entorno
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

          {/* ESTADO B: FORMULARIO DE INTENCIÓN (IA PROCESSING) */}
          {isInputState && (
            <motion.div
              key="intent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Mini-Preview de la Imagen Fijada */}
              {previewUrl && (
                <div className="relative w-full h-32 rounded-2xl overflow-hidden border border-white/10 shadow-inner bg-zinc-900">
                  <img src={previewUrl} className="w-full h-full object-cover opacity-40" alt="Contexto visual" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-primary/30 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      <span className="text-[9px] font-black uppercase text-primary tracking-widest">Contexto Visual Fijado</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Mensaje de Error (Rechazo del Editor) */}
              {status === 'REJECTED' && (
                <div className="bg-red-500/10 border border-red-500/30 p-5 rounded-2xl text-red-200 text-xs flex gap-4 items-center shadow-lg">
                  <AlertTriangle className="h-5 w-5 shrink-0 text-red-500" />
                  <div>
                    <span className="font-black uppercase block text-[10px] mb-1">Veredicto del Editor</span>
                    {data?.rejectionReason}
                  </div>
                </div>
              )}

              <div className="relative group">
                <div className="absolute -top-3 left-6 px-3 bg-black text-[9px] font-black text-primary tracking-widest uppercase z-10 border border-white/5 rounded-full">
                  Intención Creativa
                </div>
                <Textarea
                  placeholder="¿Qué historia o sensación te inspira este lugar?"
                  className="bg-white/[0.03] border-white/10 min-h-[160px] rounded-[2rem] p-6 text-lg text-white focus:border-primary/40 transition-all resize-none shadow-inner"
                  value={intentText}
                  disabled={status === 'SCANNING'}
                  onChange={(e) => setIntentText(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <Button
                  disabled={intentText.trim().length < 10 || status === 'SCANNING'}
                  onClick={() => submitIntent(intentText)}
                  className="w-full h-16 rounded-2xl bg-primary text-white font-black tracking-widest shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
                >
                  {status === 'SCANNING' ? (
                    <div className="flex items-center gap-3">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>ANALIZANDO ENTORNO...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send size={18} />
                      <span>ENVIAR AL EDITOR URBANO</span>
                    </div>
                  )}
                </Button>
                <div className="flex items-center justify-center gap-2 text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">
                  <Info className="w-3 h-3 text-primary/50" /> Solo contenido de valor histórico y urbano
                </div>
              </div>
            </motion.div>
          )}

          {/* ESTADO C: GRABACIÓN DE AUDIO (ACCEPTED) */}
          {isSuccessState && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col"
            >
              <GeoRecorder
                draftId={data?.draftId}
                script={data?.script}
                onUploadComplete={() => {
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