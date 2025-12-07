// components/dynamic-script-viewer.tsx
// VERSIÓN: 2.1 (Fix: Soporte total para JSON Object con HTML)

"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';
import DOMPurify from 'isomorphic-dompurify';

interface DynamicScriptViewerProps {
  scriptText: string | null;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
}

interface PositionalScriptLine {
  id: number;
  content: string;
  startChar: number;
  endChar: number;
  isHtml: boolean;
}

export function DynamicScriptViewer({ scriptText, currentTime, duration, isPlaying }: DynamicScriptViewerProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeLineIndex, setActiveLineIndex] = useState(-1);

  // 1. Lógica de Parseo Inteligente (Polyglot Parser)
  const { linesWithMetadata, totalCharacters } = useMemo(() => {
    if (!scriptText) return { linesWithMetadata: [], totalCharacters: 0 };

    let lines: string[] = [];
    let isHtmlMode = false;

    try {
      // Intentamos parsear el JSON almacenado
      const parsed = JSON.parse(scriptText);

      // CASO A: Formato Nuevo Estandarizado { script_body: "<html>..." }
      if (parsed.script_body) {
        isHtmlMode = true;
        lines = splitHtmlContent(parsed.script_body);
      } 
      // CASO B: Formato Legacy Array [{ speaker: "...", line: "..." }]
      else if (Array.isArray(parsed)) {
        lines = parsed.map((item: any) => item.line || "");
      }
      // CASO C: JSON extraño o texto plano encapsulado
      else {
        isHtmlMode = true;
        lines = splitHtmlContent(String(parsed));
      }
    } catch (e) {
      // CASO D: Texto Plano / HTML Crudo (Fallo de JSON.parse)
      isHtmlMode = true;
      lines = splitHtmlContent(scriptText);
    }

    // Calcular metadatos de tiempo para el teleprompter
    let cumulativeChars = 0;
    const processedLines: PositionalScriptLine[] = lines.map((content, index) => {
      // Limpiamos etiquetas para contar caracteres "reales" para el timing
      const cleanLength = content.replace(/<[^>]+>/g, '').length;
      const startChar = cumulativeChars;
      cumulativeChars += cleanLength + 1; 
      
      return { 
        id: index, 
        content, 
        startChar, 
        endChar: cumulativeChars,
        isHtml: isHtmlMode
      };
    });

    return { linesWithMetadata: processedLines, totalCharacters: cumulativeChars };
  }, [scriptText]);

  // Helper para dividir el contenido en bloques visuales
  function splitHtmlContent(html: string): string[] {
    if (!html) return [];
    
    // Si detectamos párrafos HTML, dividimos por ellos
    if (html.includes('<p>')) {
        return html
            .split('</p>')
            .map(s => s.replace('<p>', '').trim()) // Limpiamos tags para re-envolver luego si queremos, o dejar limpio
            .filter(s => s.length > 0)
            .map(s => `<p>${s}</p>`); // Re-envolvemos para mantener estructura
    }
    
    // Si es Markdown o texto plano, dividimos por saltos de línea dobles
    return html.split(/\n\s*\n/).filter(s => s.trim().length > 0);
  }

  // 2. Sincronización (Teleprompter)
  useEffect(() => {
    if (!isPlaying || duration === 0 || totalCharacters === 0) return;
    
    const charsPerSecond = totalCharacters / duration;
    const currentCharPosition = currentTime * charsPerSecond;

    const currentIndex = linesWithMetadata.findIndex(line => 
      currentCharPosition >= line.startChar && currentCharPosition < line.endChar
    );
    
    if (currentIndex !== -1 && currentIndex !== activeLineIndex) {
      setActiveLineIndex(currentIndex);
    }
  }, [currentTime, duration, isPlaying, linesWithMetadata, totalCharacters, activeLineIndex]);

  // 3. Scroll Automático
  useEffect(() => {
    if (activeLineIndex === -1 || !scrollContainerRef.current) return;
    const activeElement = scrollContainerRef.current.querySelector(`[data-line-index="${activeLineIndex}"]`) as HTMLElement;
    if (activeElement) {
      activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeLineIndex]);

  if (linesWithMetadata.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center opacity-70">
            <p className="text-muted-foreground text-sm">Esperando transcripción...</p>
        </div>
    );
  }

  return (
    <div ref={scrollContainerRef} className="h-full overflow-y-auto p-4 md:p-8 space-y-6 text-center scroll-smooth pb-32">
      {linesWithMetadata.map((line, index) => (
        <div
          key={line.id}
          data-line-index={index}
          className={cn(
            "font-serif text-lg md:text-xl leading-relaxed transition-all duration-500 max-w-2xl mx-auto cursor-default",
            activeLineIndex === index
              ? "text-foreground scale-105 opacity-100 font-medium" 
              : "text-muted-foreground opacity-50 blur-[0.5px] hover:opacity-80 hover:blur-none transition-opacity"
          )}
        >
          {/* Renderizado Seguro de HTML */}
          {line.isHtml ? (
             <div 
               className="prose dark:prose-invert max-w-none [&>p]:mb-0" 
               dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(line.content) }} 
             />
          ) : (
             <p>{line.content}</p>
          )}
        </div>
      ))}
    </div>
  );
}