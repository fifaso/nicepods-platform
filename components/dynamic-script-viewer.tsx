// components/dynamic-script-viewer.tsx
// VERSIÓN: 2.0 (Políglota: Soporta JSON Legacy y HTML Rich Text)

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
  content: string; // Puede ser HTML
  startChar: number;
  endChar: number;
  isHtml: boolean;
}

export function DynamicScriptViewer({ scriptText, currentTime, duration, isPlaying }: DynamicScriptViewerProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeLineIndex, setActiveLineIndex] = useState(-1);

  // 1. PARSER HÍBRIDO (El Cerebro)
  const { linesWithMetadata, totalCharacters } = useMemo(() => {
    if (!scriptText) return { linesWithMetadata: [], totalCharacters: 0 };

    let lines: string[] = [];
    let isHtmlMode = false;

    try {
      // INTENTO A: Formato Legacy (JSON Array)
      const parsed = JSON.parse(scriptText);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].line) {
        // Es formato antiguo [{speaker, line}]
        lines = parsed.map((item: any) => item.line);
      } else if (parsed.script_body) {
        // Es formato intermedio JSON { script_body: "..." }
        // Lo tratamos como texto rico, dividiendo por párrafos
        isHtmlMode = true;
        lines = splitHtmlContent(parsed.script_body);
      } else {
        // Es un JSON stringificado de texto plano
        isHtmlMode = true;
        lines = splitHtmlContent(String(parsed));
      }
    } catch (e) {
      // INTENTO B: Texto Plano / HTML directo (Formato Nuevo)
      // Si falla JSON.parse, es texto crudo.
      isHtmlMode = true;
      lines = splitHtmlContent(scriptText);
    }

    // Calcular metadatos de tiempo para el teleprompter
    let cumulativeChars = 0;
    const processedLines: PositionalScriptLine[] = lines.map((content, index) => {
      // Limpiamos etiquetas para contar caracteres "reales" (aproximación para el timing)
      const cleanLength = content.replace(/<[^>]+>/g, '').length;
      const startChar = cumulativeChars;
      cumulativeChars += cleanLength + 1; // +1 por pausa imaginaria
      
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

  // Helper para dividir HTML o Texto en bloques lógicos para el teleprompter
  function splitHtmlContent(html: string): string[] {
    if (!html) return [];
    // Si tiene etiquetas <p>, dividimos por ellas
    if (html.includes('<p>')) {
        return html
            .split('</p>')
            .map(s => s.replace('<p>', '').trim())
            .filter(s => s.length > 0)
            .map(s => `<p>${s}</p>`); // Re-envolvemos para mantener estilo si es necesario
    }
    // Si es Markdown/Texto plano, dividimos por doble salto de línea
    return html.split(/\n\s*\n/).filter(s => s.trim().length > 0);
  }

  // 2. Lógica de Teleprompter (Sincronización)
  useEffect(() => {
    if (!isPlaying || duration === 0 || totalCharacters === 0) return;
    
    // Estimación lineal: Asumimos velocidad constante (mejorable con timestamps reales en futuro)
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
            <p className="text-red-400 font-medium">No se pudo cargar el formato del guion.</p>
            <p className="text-xs mt-2">Intenta regenerar el episodio.</p>
        </div>
    );
  }

  return (
    <div ref={scrollContainerRef} className="h-full overflow-y-auto p-4 md:p-8 space-y-6 text-center scroll-smooth">
      {linesWithMetadata.map((line, index) => (
        <div
          key={line.id}
          data-line-index={index}
          className={cn(
            "font-serif text-lg md:text-xl leading-relaxed transition-all duration-500 max-w-2xl mx-auto",
            activeLineIndex === index
              ? "text-foreground scale-105 opacity-100" 
              : "text-muted-foreground opacity-40 blur-[0.5px]"
          )}
        >
          {line.isHtml ? (
             <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(line.content) }} />
          ) : (
             <p>{line.content}</p>
          )}
        </div>
      ))}
      
      {/* Espaciador final para permitir scroll hasta el último elemento */}
      <div className="h-32" />
    </div>
  );
}