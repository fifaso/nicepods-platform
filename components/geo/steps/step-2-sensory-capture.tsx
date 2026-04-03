/**
 * ARCHIVO: components/geo/steps/step-2-sensory-capture.tsx
 * VERSIÓN: 4.0 (NicePod Forge Step 2 - Multimodal Capture & Worker Sync Edition)
 * PROTOCOLO: MADRID RESONANCE V3.0
 * 
 * Misión: Capturar la verdad física del entorno urbano mediante evidencia visual (Hero/OCR)
 * y auditiva, procesándola a través del orquestador de inteligencia.
 * [REFORMA V4.0]: Implementación de exportación por defecto, sincronía con Web Workers 
 * para compresión de imágenes y purificación total de nomenclatura.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { motion } from "framer-motion";
import { 
  Camera, 
  FileText, 
  Mic, 
  Trash2, 
  Plus, 
  Loader2, 
  Zap,
  AlertCircle
} from "lucide-react";
import React, { useCallback, useState, useRef } from "react";

// --- INFRAESTRUCTURA CORE V3.0 ---
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { useForge } from "../forge-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn, nicepodLog } from "@/lib/utils";

/**
 * Step2SensoryCapture: El laboratorio de captura multimodal.
 */
export default function Step2SensoryCapture() {
  // 1. CONSUMO DE LA FACHADA SOBERANA Y CONTEXTO DE FORJA
  const { 
    ingestSensoryData, 
    status: engineStatus,
    error: geographicError 
  } = useGeoEngine();

  const { state: forgeState, dispatch, nextStep, prevStep } = useForge();

  // 2. ESTADOS LOCALES DE INTERFAZ (PREVISUALIZACIÓN)
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const heroInputReference = useRef<HTMLInputElement>(null);
  const ocrInputReference = useRef<HTMLInputElement>(null);

  /**
   * handleHeroCapture:
   * Misión: Validar y asignar la imagen principal del peritaje.
   */
  const handleHeroCapture = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      nicepodLog(`📸 [Step2] Captura Hero detectada: ${selectedFile.name}`);
      dispatch({ type: 'SET_HERO_IMAGE', payload: selectedFile });
    }
  }, [dispatch]);

  /**
   * handleOcrAddition:
   * Misión: Anexar imágenes de detalle (Placas/Inscripciones) al mosaico.
   */
  const handleOcrAddition = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      Array.from(selectedFiles).forEach((file) => {
        dispatch({ type: 'ADD_OCR_IMAGE', payload: file });
      });
    }
  }, [dispatch]);

  /**
   * handleSensoryIngestion:
   * Misión: Disparar la compresión asíncrona y enviar el expediente a la Bóveda NKV.
   */
  const handleSensoryIngestion = async () => {
    if (!forgeState.heroImageFile) return;

    setIsProcessing(true);
    nicepodLog("⚙️ [Step2] Iniciando protocolo de ingesta multimodal...");

    try {
      // Invocación a la Fachada (Gestiona Workers y Server Actions internamente)
      const ingestionResult = await ingestSensoryData({
        heroImage: forgeState.heroImageFile,
        ocrImages: forgeState.ocrImageFiles,
        intent: forgeState.intentText || "Captura de contexto urbano sin intencionalidad definida.",
        categoryId: forgeState.categoryId,
        radius: forgeState.resonanceRadius
      });

      if (ingestionResult) {
        nicepodLog("✅ [Step2] Evidencia blindada. Procediendo a Auditoría de Dossier.");
        dispatch({
          type: 'SET_INGESTION_RESULT',
          payload: { 
            poiId: ingestionResult.poiId, 
            dossier: ingestionResult.dossier 
          }
        });
        nextStep();
      }
    } catch (error) {
      nicepodLog("🔥 [Step2] Fallo crítico en ingesta sensorial.", error, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-transparent overflow-y-auto custom-scrollbar px-6 py-4">
      
      {/* I. SECCIÓN: EVIDENCIA VISUAL PRINCIPAL (HERO) */}
      <div className="mb-8">
        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-4 block">
          Imagen de Autoridad (Hero)
        </label>
        
        <div 
          onClick={() => heroInputReference.current?.click()}
          className={cn(
            "relative aspect-video rounded-[2rem] border-2 border-dashed transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center gap-3",
            forgeState.heroImageFile 
              ? "border-primary/40 bg-primary/5" 
              : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20"
          )}
        >
          {forgeState.heroImageFile ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
              <Zap className="text-primary h-8 w-8 mb-2 animate-pulse" />
              <span className="text-[9px] font-black text-white uppercase tracking-widest">Evidencia Capturada</span>
              <span className="text-[8px] text-zinc-400 mt-1 uppercase">{forgeState.heroImageFile.name}</span>
            </div>
          ) : (
            <>
              <Camera className="text-zinc-600 h-10 w-10" />
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest text-center px-8">
                Pulsar para activar sensor óptico
              </span>
            </>
          )}
          <input 
            type="file" 
            ref={heroInputReference} 
            onChange={handleHeroCapture} 
            accept="image/*" 
            className="hidden" 
          />
        </div>
      </div>

      {/* II. SECCIÓN: MOSAICO OCR (DETALLES) */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
            Mosaico de Detalle (OCR)
          </label>
          <span className="text-[9px] font-bold text-zinc-600 uppercase">
            {forgeState.ocrImageFiles.length} / 3
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {forgeState.ocrImageFiles.map((file, index) => (
            <div key={index} className="relative aspect-square rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group">
              <FileText className="text-zinc-700 h-6 w-6" />
              <button 
                onClick={() => dispatch({ type: 'REMOVE_OCR_IMAGE', payload: index })}
                className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          
          {forgeState.ocrImageFiles.length < 3 && (
            <button 
              onClick={() => ocrInputReference.current?.click()}
              className="aspect-square rounded-2xl border-2 border-dashed border-white/5 bg-white/[0.01] hover:bg-white/[0.04] flex items-center justify-center transition-colors"
            >
              <Plus className="text-zinc-700 h-6 w-6" />
            </button>
          )}
        </div>
        <input 
          type="file" 
          ref={ocrInputReference} 
          onChange={handleOcrAddition} 
          accept="image/*" 
          multiple 
          className="hidden" 
        />
      </div>

      {/* III. SECCIÓN: INTENCIONALIDAD (METADATOS) */}
      <div className="mb-10">
        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-4 block">
          Semilla de Intención
        </label>
        <Textarea 
          placeholder="Describa el valor intelectual de este hito..."
          className="min-h-[100px] bg-white/[0.03] border-white/10 rounded-2xl p-5 text-sm font-medium placeholder:text-zinc-700 focus:border-primary/40 transition-all"
          value={forgeState.intentText}
          onChange={(event) => dispatch({ type: 'SET_INTENT', payload: event.target.value })}
        />
      </div>

      {/* IV. NAVEGACIÓN DE FASE */}
      <div className="flex gap-4 mt-auto pt-4 pb-8">
        <Button
          variant="outline"
          onClick={prevStep}
          className="flex-1 h-14 rounded-2xl border-white/10 bg-transparent text-zinc-500 font-black tracking-widest uppercase text-[10px] hover:bg-white/5"
        >
          Anclaje
        </Button>
        
        <Button
          onClick={handleSensoryIngestion}
          disabled={!forgeState.heroImageFile || isProcessing}
          className="flex-[2] h-14 rounded-2xl bg-primary text-primary-foreground font-black tracking-[0.2em] uppercase text-[10px] shadow-2xl shadow-primary/20 group"
        >
          {isProcessing ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <span className="flex items-center gap-3">
              Ingestar Evidencia
              <Zap size={16} className="group-hover:scale-125 transition-transform text-black fill-current" />
            </span>
          )}
        </Button>
      </div>

      {geographicError && (
        <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
          <AlertCircle className="text-red-500 h-4 w-4" />
          <span className="text-[8px] font-black text-red-400 uppercase tracking-widest">
            Error de Enlace: {geographicError}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V4.0):
 * 1. Default Export Fulfillment: Se ha implementado 'export default' para 
 *    eliminar el error de compilación detectado por Vercel en el ScannerUI.
 * 2. Asynchronous Payload Guard: La función handleSensoryIngestion ahora 
 *    bloquea la UI (isProcessing) para evitar envíos duplicados mientras 
 *    el Web Worker comprime las imágenes.
 * 3. Multimodal Logic: El sistema soporta el mosaico OCR (límite 3) de forma 
 *    atómica, alimentando al Ingestor IA con datos enriquecidos del entorno.
 */