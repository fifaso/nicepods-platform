// components/geo/scanner-ui.tsx
// VERSIÓN: 2.0 (Ultimate Urban Interface - Madrid Resonance Standard)

"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Info,
  Map as MapIcon,
  RefreshCw,
  Send,
  Zap
} from "lucide-react";
import { useState } from "react";
import { GeoRecorder } from "./geo-recorder";
import { ImmersiveMap } from "./immersive-map";
import { RadarHUD } from "./radar-hud";
import { useGeoEngine } from "./use-geo-engine";

export function GeoScannerUI() {
  const { status, data, scanEnvironment, submitIntent, reset } = useGeoEngine();
  const [intentText, setIntentText] = useState("");
  const [viewMode, setViewMode] = useState<'scanner' | 'map'>('scanner');

  // Determinar progreso del flujo
  const step = status === 'IDLE' ? 1 : status === 'SCANNING' ? 2 : (status === 'ANALYZING' || status === 'REJECTED') ? 3 : 4;

  const handleSubmitIntent = () => {
    if (intentText.trim().length < 10) return;
    submitIntent(intentText);
  };

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto relative px-4 pb-6 overflow-hidden">

      {/* 1. SELECTOR DE VISTA (TABS TÁCTICOS) */}
      <div className="flex justify-center mb-4 z-20">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-1 rounded-full flex gap-1">
          <Button
            variant={viewMode === 'scanner' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('scanner')}
            className="rounded-full px-6 text-[10px] font-black uppercase tracking-widest"
          >
            <Zap className="w-3 h-3 mr-2" /> Scanner
          </Button>
          <Button
            variant={viewMode === 'map' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('map')}
            className="rounded-full px-6 text-[10px] font-black uppercase tracking-widest"
          >
            <MapIcon className="w-3 h-3 mr-2" /> Mapa 3D
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'map' ? (
          /* --- VISTA MAPA --- */
          <motion.div
            key="map-view"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="flex-1 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl relative"
          >
            <ImmersiveMap />
            <div className="absolute top-6 left-6 right-6 pointer-events-none">
              <div className="bg-black/60 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-[10px] font-bold text-white/70 uppercase tracking-tighter inline-flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Madrid: Resonancia en Tiempo Real
              </div>
            </div>
          </motion.div>
        ) : (
          /* --- VISTA SCANNER (MAQUINARIA) --- */
          <motion.div
            key="scanner-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col gap-6"
          >
            {/* HUD Central Visual */}
            <RadarHUD status={status} weather={data.weather} place={data.place} />

            {/* CONTENEDOR DE ESTADOS DINÁMICOS */}
            <div className="flex-1 flex flex-col justify-start min-h-0">

              {/* ESTADO 1: INICIO */}
              {status === 'IDLE' && (
                <div className="text-center space-y-6 pt-4 px-4 animate-in fade-in zoom-in duration-500">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black tracking-tighter text-white">Sincronizar Ciudad</h2>
                    <p className="text-sm text-white/40 leading-relaxed max-w-[280px] mx-auto">
                      Inicia el escaneo sensorial para anclar una nueva memoria en las calles de Madrid.
                    </p>
                  </div>
                  <Button
                    onClick={scanEnvironment}
                    className="w-full h-16 text-sm font-black tracking-[0.2em] rounded-2xl bg-white text-black hover:bg-white/90 shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all active:scale-95"
                  >
                    ACTIVAR SENSORES GEO
                  </Button>
                </div>
              )}

              {/* ESTADO 2: ANÁLISIS E INTENCIÓN */}
              {(status === 'ANALYZING' || status === 'REJECTED' || status === 'SCANNING') && (
                <div className="space-y-4 animate-in slide-in-from-bottom-6 duration-500">

                  {/* Feedback del Editor Urbano (Rechazo) */}
                  {status === 'REJECTED' && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl text-red-200 text-[11px] flex gap-3 items-center"
                    >
                      <AlertTriangle className="h-5 w-5 shrink-0 text-red-500" />
                      <p><span className="font-black uppercase mr-1">Veredicto:</span> {data.rejectionReason}</p>
                    </motion.div>
                  )}

                  {/* Campo de Texto de Intención */}
                  <div className="relative group">
                    <div className="absolute -top-3 left-4 px-2 bg-black text-[9px] font-black text-primary tracking-widest uppercase z-10">
                      Intención Creativa
                    </div>
                    <Textarea
                      placeholder="Ej: La luz sobre este edificio me recuerda al Madrid de los 80... ¿Qué historia esconde?"
                      className="bg-white/5 border-white/10 min-h-[160px] rounded-2xl p-5 text-base leading-relaxed focus:border-primary/50 transition-colors resize-none"
                      value={intentText}
                      disabled={status === 'SCANNING'}
                      onChange={(e) => setIntentText(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-3">
                    <Button
                      disabled={intentText.length < 10 || status === 'SCANNING'}
                      onClick={handleSubmitIntent}
                      className="h-14 rounded-2xl bg-primary text-white font-bold hover:brightness-110"
                    >
                      {status === 'SCANNING' ? <RefreshCw className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4 mr-2" /> ENVIAR AL EDITOR URBANO</>}
                    </Button>

                    <p className="text-[9px] text-center text-white/20 font-medium uppercase tracking-widest flex items-center justify-center gap-2">
                      <Info className="w-3 h-3" /> Solo se acepta contenido de valor urbano e histórico
                    </p>
                  </div>
                </div>
              )}

              {/* ESTADO 3: GRABACIÓN (ACCEPTED) */}
              {status === 'ACCEPTED' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="flex-1 flex flex-col"
                >
                  <GeoRecorder
                    draftId={data.draftId}
                    script={data.script}
                    onUploadComplete={() => {
                      reset();
                      setViewMode('map'); // Al terminar, llevarlo al mapa para que vea su punto
                    }}
                  />
                </motion.div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOOTER: INDICADOR DE PASOS */}
      {viewMode === 'scanner' && (
        <div className="flex justify-center gap-1.5 mt-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={cn(
                "h-1 rounded-full transition-all duration-500",
                step === i ? "w-8 bg-primary" : "w-2 bg-white/10"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}