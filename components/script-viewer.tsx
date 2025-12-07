// components/script-viewer.tsx
// VERSIÓN: 3.1 (Robust Polyglot: Manejo de Doble Parseo y Estilos Refinados)

"use client";

import { useMemo } from 'react';
import DOMPurify from 'isomorphic-dompurify';

// Definición de props
interface ScriptViewerProps { 
  scriptText: string | null; 
}

export function ScriptViewer({ scriptText }: ScriptViewerProps) {
  
  const content = useMemo(() => {
    if (!scriptText) return null;

    try {
      let parsed;
      
      // 1. Intentamos parsear. Si es un string simple, podría fallar o devolver un string.
      try {
        parsed = JSON.parse(scriptText);
      } catch {
        // Si falla el parseo inicial, asumimos que es texto plano o HTML directo
        return { html: scriptText, isRichText: true };
      }

      // 2. Manejo de "Double Stringify" (Edge Case común en DBs)
      if (typeof parsed === 'string') {
        try {
          parsed = JSON.parse(parsed);
        } catch {
          // Si el segundo parseo falla, es que realmente era un string JSONificado
          // Lo tratamos como el contenido final.
          return { html: parsed, isRichText: true };
        }
      }

      // CASO A: Nuevo Estándar V5 (Objeto con script_body)
      if (parsed && typeof parsed === 'object' && 'script_body' in parsed) {
        return { 
          html: parsed.script_body || "", // Protección contra null
          isRichText: true 
        };
      }

      // CASO B: Legacy V4 (Array de objetos speaker/line)
      if (Array.isArray(parsed)) {
        const textBlock = parsed
          .map((item: any) => item.line || "")
          .filter(Boolean)
          .join('\n\n');
        return { 
          html: textBlock, 
          isRichText: false 
        };
      }

      // CASO C: Fallback final (Convertir objeto desconocido a string)
      return { 
        html: typeof parsed === 'object' ? JSON.stringify(parsed, null, 2) : String(parsed), 
        isRichText: false 
      };

    } catch (error) {
      console.warn("Error parseando guion:", error);
      // Último recurso: devolver lo que llegó
      return { html: scriptText, isRichText: true };
    }
  }, [scriptText]);

  // Estado de Error / Vacío
  if (!content || !content.html || content.html.trim().length === 0) {
    return (
      <div className="p-6 rounded-xl bg-secondary/20 border border-border/50 text-center flex flex-col items-center justify-center gap-2">
        <span className="text-2xl">📝</span>
        <p className="text-muted-foreground text-sm font-medium">
          No hay texto disponible para mostrar.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-card/40 p-5 md:p-8 border border-white/5 shadow-inner">
      {content.isRichText ? (
        // Renderizado de Texto Rico (HTML del Editor TipTap)
        <div 
          className="prose prose-stone dark:prose-invert max-w-none 
            prose-p:leading-relaxed prose-p:text-base md:prose-p:text-lg prose-p:text-foreground/90
            prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-primary
            prose-strong:text-primary/90 prose-strong:font-semibold
            prose-ul:list-disc prose-ul:pl-5
            font-sans"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content.html) }} 
        />
      ) : (
        // Renderizado de Texto Plano (Legacy)
        <div className="prose prose-stone dark:prose-invert max-w-none text-base md:text-lg leading-relaxed text-foreground/90 font-sans">
          <p className="whitespace-pre-wrap">{content.html}</p>
        </div>
      )}
    </div>
  );
}