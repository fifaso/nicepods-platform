// components/geo/scanner-ui.tsx
// VERSIÓN: 4.0 (Madrid Resonance - Pure Creation Workspace)

"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, RefreshCw, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { GeoRecorder } from "./geo-recorder";
import { RadarHUD } from "./radar-hud";
import { useGeoEngine } from "./use-geo-engine";

export function GeoScannerUI() {
  const { status, data, scanEnvironment, submitIntent, reset } = useGeoEngine();
  const [intentText, setIntentText] = useState("");

  const safeWeather = data?.weather || { temp_c: 0, condition: "Sincronizando...", is_day: true };
  const safePlace = data?.place || "Detectando ubicación...";

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto relative px-4 pb-10 overflow-hidden">

      {/* HEADER DE ESTADO DE TRABAJO */}
      <div className="flex flex-col items-center mb-8 pt-4">
        <div className="bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-black text-primary uppercase tracking-widest">Canal de Creación Activo</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-8 min-h-0">

        {/* HUD DE SENSORES (Siempre presente hasta el final) */}
        {status !== 'ACCEPTED' && (
          <RadarHUD status={status} weather={safeWeather} place={safePlace} />
        )}

        <div className="flex-1 flex flex-col justify-start">

          <AnimatePresence mode="wait">
            {/* 1. ESPERA INICIAL */}
            {status === 'IDLE' && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-8 pt-10">
                <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic leading-none">
                  Iniciar <br /> <span className="text-primary">Sincronización</span>
                </h2>
                <Button onClick={scanEnvironment} className="w-full h-20 text-sm font-black tracking-[0.3em] rounded-[2rem] bg-white text-black hover:bg-zinc-200 shadow-2xl transition-all active:scale-95">
                  ACTIVAR SENSORES GEO
                </Button>
              </motion.div>
            )}

            {/* 2. PROCESO DE ANÁLISIS */}
            {(status === 'ANALYZING' || status === 'REJECTED' || status === 'SCANNING') && (
              <motion.div key="process" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                {status === 'REJECTED' && (
                  <div className="bg-red-500/10 border border-red-500/30 p-5 rounded-[1.5rem] text-red-200 text-xs flex gap-4 items-center">
                    <AlertTriangle className="h-6 w-6 shrink-0 text-red-500" />
                    <p><span className="font-black uppercase block text-[10px] mb-1">Editor Urbano</span> {data?.rejectionReason}</p>
                  </div>
                )}

                <div className="relative">
                  <div className="absolute -top-3 left-6 px-3 bg-black text-[9px] font-black text-primary uppercase tracking-widest z-10 border border-primary/30 rounded-full">
                    Intención Creativa
                  </div>
                  <Textarea
                    placeholder="¿Qué historia ves o sientes en este lugar exacto?"
                    className="bg-white/[0.03] border-white/10 min-h-[220px] rounded-[2.5rem] p-8 text-lg font-medium text-white shadow-inner focus:border-primary/40 transition-all resize-none"
                    value={intentText}
                    disabled={status === 'SCANNING'}
                    onChange={(e) => setIntentText(e.target.value)}
                  />
                </div>

                <div className="space-y-4">
                  <Button
                    disabled={intentText.trim().length < 10 || status === 'SCANNING'}
                    onClick={() => submitIntent(intentText)}
                    className="w-full h-16 rounded-[1.5rem] bg-primary text-white font-black tracking-widest shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
                  >
                    {status === 'SCANNING' ? <RefreshCw className="w-6 h-6 animate-spin" /> : "PROCESAR CRÓNICA"}
                  </Button>
                  <div className="flex items-center justify-center gap-2 text-[9px] font-bold text-white/20 uppercase tracking-[0.3em]">
                    <ShieldCheck className="w-3 h-3" /> Contenido verificado por IA
                  </div>
                </div>
              </motion.div>
            )}

            {/* 3. GRABACIÓN FINAL */}
            {status === 'ACCEPTED' && (
              <motion.div key="accepted" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col">
                <GeoRecorder
                  draftId={data?.draftId}
                  script={data?.script}
                  onUploadComplete={() => { reset(); window.location.href = '/map'; }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}