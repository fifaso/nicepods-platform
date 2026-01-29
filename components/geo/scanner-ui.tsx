// components/geo/scanner-ui.tsx
// VERSIÓN: 3.0 (Madrid Resonance - Zero Crash Interface)

"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Info, Map as MapIcon, RefreshCw, Zap } from "lucide-react";
import { useState } from "react";
import { GeoRecorder } from "./geo-recorder";
import { ImmersiveMap } from "./immersive-map";
import { RadarHUD } from "./radar-hud";
import { useGeoEngine } from "./use-geo-engine";

export function GeoScannerUI() {
  const { status, data, scanEnvironment, submitIntent, reset } = useGeoEngine();
  const [intentText, setIntentText] = useState("");
  const [viewMode, setViewMode] = useState<'scanner' | 'map'>('scanner');

  // Cálculo de progreso para la UI
  const stepNumber = status === 'IDLE' ? 1 : status === 'SCANNING' ? 2 : (status === 'ANALYZING' || status === 'REJECTED') ? 3 : 4;

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto relative px-4 pb-6 overflow-hidden">

      {/* SELECTOR DE MODO (SCANNER VS MAPA) */}
      <div className="flex justify-center mb-6 z-20">
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-1.5 rounded-full flex gap-1 shadow-2xl">
          <Button
            variant={viewMode === 'scanner' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('scanner')}
            className="rounded-full px-8 text-[10px] font-black uppercase tracking-widest transition-all"
          >
            <Zap className="w-3.5 h-3.5 mr-2" /> Scanner
          </Button>
          <Button
            variant={viewMode === 'map' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('map')}
            className="rounded-full px-8 text-[10px] font-black uppercase tracking-widest transition-all"
          >
            <MapIcon className="w-3.5 h-3.5 mr-2" /> Mapa 3D
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'map' ? (
          <motion.div
            key="map-view" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="flex-1 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl relative bg-zinc-900"
          >
            <ImmersiveMap />
          </motion.div>
        ) : (
          <motion.div
            key="scanner-view" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col gap-6"
          >
            {/* [GUARDIA DE SEGURIDAD]: Solo pasamos weather si realmente existe */}
            {status !== 'IDLE' && (
              <RadarHUD
                status={status}
                weather={data?.weather}
                place={data?.place}
              />
            )}

            <div className="flex-1 flex flex-col justify-start min-h-0">

              {/* ESTADO: ESPERA (IDLE) */}
              {status === 'IDLE' && (
                <div className="text-center space-y-8 pt-10 animate-in fade-in zoom-in duration-700">
                  <div className="space-y-3">
                    <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic">Sincronizar Ciudad</h2>
                    <p className="text-sm text-white/30 max-w-[260px] mx-auto leading-relaxed">
                      Activa los sensores para detectar resonancias y memorias en tu ubicación.
                    </p>
                  </div>
                  <Button
                    onClick={scanEnvironment}
                    className="w-full h-20 text-sm font-black tracking-[0.3em] rounded-[2rem] bg-white text-black hover:bg-zinc-200 shadow-2xl active:scale-95 transition-all"
                  >
                    ACTIVAR SENSORES GEO
                  </Button>
                </div>
              )}

              {/* ESTADO: ENTRADA DE INTENCIÓN */}
              {(status === 'ANALYZING' || status === 'REJECTED' || status === 'SCANNING') && (
                <div className="space-y-5 animate-in slide-in-from-bottom-8 duration-500">
                  {status === 'REJECTED' && (
                    <div className="bg-red-500/10 border border-red-500/30 p-5 rounded-[1.5rem] text-red-200 text-xs flex gap-4 items-center shadow-lg">
                      <AlertTriangle className="h-6 w-6 shrink-0 text-red-500" />
                      <p><span className="font-black uppercase block text-[10px] mb-1">Veredicto del Editor</span> {data?.rejectionReason}</p>
                    </div>
                  )}

                  <div className="relative">
                    <Textarea
                      placeholder="Ej: ¿Qué historia esconde este edificio neoclásico?"
                      className="bg-white/[0.03] border-white/10 min-h-[180px] rounded-[2rem] p-6 text-lg font-medium leading-relaxed focus:border-primary/40 transition-all resize-none shadow-inner"
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
                      {status === 'SCANNING' ? <RefreshCw className="w-6 h-6 animate-spin" /> : "ENVIAR AL EDITOR URBANO"}
                    </Button>
                    <div className="flex items-center justify-center gap-2 text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">
                      <Info className="w-3 h-3" /> Solo contenido de valor urbano e histórico
                    </div>
                  </div>
                </div>
              )}

              {/* ESTADO: GRABACIÓN (ACCEPTED) */}
              {status === 'ACCEPTED' && (
                <div className="flex-1 flex flex-col animate-in zoom-in-95 duration-500">
                  <GeoRecorder
                    draftId={data?.draftId}
                    script={data?.script}
                    onUploadComplete={() => {
                      reset();
                      setIntentText("");
                      setViewMode('map');
                    }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}