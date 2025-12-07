// components/script-viewer.tsx
// VERSIÓN: 3.0 (Polyglot: Soporta JSON Legacy, Nuevo HTML Object y Texto Plano)

"use client";

import { useMemo } from 'react';
import DOMPurify from 'isomorphic-dompurify';

// Definición de props
interface ScriptViewerProps { 
  scriptText: string | null; 
}

// Estructura Legacy
type LegacyScriptLine = { speaker: string; line: string; };

export function ScriptViewer({ scriptText }: ScriptViewerProps) {
  
  const content = useMemo(() => {
    if (!scriptText) return null;

    try {
      // 1. Intentamos parsear el JSON
      const parsed = JSON.parse(scriptText);

      // CASO A: Nuevo Estándar (Objeto con script_body HTML/Markdown)
      if (parsed.script_body) {
        return { 
          html: parsed.script_body, 
          isRichText: true 
        };
      }

      // CASO B: Legacy (Array de objetos speaker/line)
      if (Array.isArray(parsed)) {
        const textBlock = parsed.map((item: LegacyScriptLine) => item.line).join('\n\n');
        return { 
          html: textBlock, 
          isRichText: false 
        };
      }

      // CASO C: JSON stringificado simple
      return { 
        html: String(parsed), 
        isRichText: true 
      };

    } catch (error) {
      // CASO D: Fallo de JSON (Texto plano o HTML crudo)
      // Asumimos que es contenido válido directo
      return { 
        html: scriptText, 
        isRichText: true 
      };
    }
  }, [scriptText]);

  // Estado de Error (Solo si es null o vacío)
  if (!content || !content.html) {
    return (
      <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-center">
        <p className="text-destructive text-sm font-medium">
          El guion no está disponible en este momento.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-card/30 p-4 md:p-6 border border-border/40">
      {content.isRichText ? (
        // Renderizado de Texto Rico (HTML del Editor)
        <div 
          className="prose prose-stone dark:prose-invert max-w-none font-serif leading-relaxed"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content.html) }} 
        />
      ) : (
        // Renderizado de Texto Plano (Legacy)
        <div className="prose prose-stone dark:prose-invert max-w-none font-serif leading-relaxed">
          <p className="whitespace-pre-wrap">{content.html}</p>
        </div>
      )}
    </div>
  );
}