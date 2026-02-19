// components/script-viewer.tsx
// VERSIÓN: 5.0 (Standard Script Display - Structured Support Edition)
// Misión: Renderizar la trascripción del podcast gestionando múltiples formatos de datos.
// [RESOLUCIÓN]: Fix de error TS2322 para compatibilidad con el tipo PodcastScript.

"use client";

import { cn } from '@/lib/utils';
import { PodcastScript } from '@/types/podcast';
import { useMemo } from 'react';

/**
 * INTERFAZ: ScriptViewerProps
 * [FIX]: Ahora aceptamos explícitamente el objeto PodcastScript del nuevo estándar.
 */
interface ScriptViewerProps {
  scriptText: string | PodcastScript | null | any;
  className?: string;
}

/**
 * ScriptViewer: El teleprompter profesional de NicePod V2.5.
 */
export const ScriptViewer = ({ scriptText, className }: ScriptViewerProps) => {

  /**
   * content: Procesa la entrada para asegurar que siempre devolvemos un string legible.
   * Maneja: 
   * 1. Objeto PodcastScript { script_body, script_plain }
   * 2. String JSON stringificado (Legacy)
   * 3. Texto plano
   */
  const content = useMemo(() => {
    if (!scriptText) return "No hay trascripción disponible para este registro.";

    // Caso A: Objeto estructurado V2.5
    if (typeof scriptText === 'object' && scriptText !== null) {
      return scriptText.script_body || scriptText.script_plain || "";
    }

    // Caso B: String (Posible JSON legacy o texto plano)
    if (typeof scriptText === 'string') {
      if (scriptText.trim().startsWith('{') || scriptText.trim().startsWith('[')) {
        try {
          const parsed = JSON.parse(scriptText);
          if (typeof parsed === 'object') {
            return parsed.script_body || parsed.text || parsed.content || scriptText;
          }
          if (Array.isArray(parsed)) {
            return parsed.map((s: any) => s.line || s.text || "").join("\n\n");
          }
        } catch {
          return scriptText;
        }
      }
      return scriptText;
    }

    return String(scriptText);
  }, [scriptText]);

  return (
    <div className={cn("relative w-full", className)}>
      <div className="prose prose-sm prose-invert max-w-none">
        <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap font-medium tracking-tight">
          {content}
        </p>
      </div>

      {/* Indicador de integridad del visor */}
      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between opacity-30">
        <span className="text-[8px] font-black uppercase tracking-[0.3em]">Neural Transcription Shield</span>
      </div>
    </div>
  );
};