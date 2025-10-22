"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils'; // Utilidad para clases condicionales

type ScriptLine = { speaker: string; line: string; };

interface DynamicScriptViewerProps {
  scriptText: string | null;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
}

// Interfaz para el guion enriquecido con metadatos de posición de caracteres.
interface PositionalScriptLine extends ScriptLine {
  id: number;
  startChar: number;
  endChar: number;
}

export function DynamicScriptViewer({ scriptText, currentTime, duration, isPlaying }: DynamicScriptViewerProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeLineIndex, setActiveLineIndex] = useState(-1);

  // 1. Parseamos el guion y calculamos las posiciones de los caracteres una sola vez para máxima eficiencia.
  const { linesWithMetadata, totalCharacters } = useMemo(() => {
    if (!scriptText) return { linesWithMetadata: [], totalCharacters: 0 };
    try {
      const scriptData = JSON.parse(scriptText) as ScriptLine[];
      let cumulativeChars = 0;
      const lines: PositionalScriptLine[] = scriptData.map((item, index) => {
        const startChar = cumulativeChars;
        // Se añade un espacio para simular la pausa entre líneas en el cálculo de longitud.
        cumulativeChars += item.line.length + 1; 
        return { ...item, id: index, startChar, endChar: cumulativeChars };
      });
      return { linesWithMetadata: lines, totalCharacters: cumulativeChars };
    } catch (error) {
      console.error("Error al parsear el guion para el teleprompter:", error);
      return { linesWithMetadata: [], totalCharacters: 0 };
    }
  }, [scriptText]);

  // 2. Efecto para calcular la línea activa cada vez que el tiempo del audio cambia.
  useEffect(() => {
    if (!isPlaying || duration === 0 || totalCharacters === 0) {
      return;
    }
    
    const charsPerSecond = totalCharacters / duration;
    const currentCharPosition = currentTime * charsPerSecond;

    const currentIndex = linesWithMetadata.findIndex(line => 
      currentCharPosition >= line.startChar && currentCharPosition < line.endChar
    );
    
    if (currentIndex !== -1 && currentIndex !== activeLineIndex) {
      setActiveLineIndex(currentIndex);
    }
  }, [currentTime, duration, isPlaying, linesWithMetadata, totalCharacters, activeLineIndex]);

  // 3. Efecto para hacer scroll automático cuando la línea activa cambia.
  useEffect(() => {
    if (activeLineIndex === -1 || !scrollContainerRef.current) return;

    const activeElement = scrollContainerRef.current.querySelector(`[data-line-index="${activeLineIndex}"]`) as HTMLElement;
    if (activeElement) {
      activeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeLineIndex]);

  if (linesWithMetadata.length === 0) {
    return <p className="text-center text-muted-foreground p-8">El guion no está disponible para el teleprompter.</p>;
  }

  // 4. Renderizamos cada línea, aplicando estilos condicionales a la línea activa.
  return (
    <div ref={scrollContainerRef} className="h-full overflow-y-auto p-4 md:p-8 space-y-8 text-center scroll-smooth">
      {linesWithMetadata.map((line, index) => (
        <p
          key={line.id}
          data-line-index={index}
          className={cn(
            "font-serif text-xl md:text-2xl leading-relaxed transition-all duration-500",
            activeLineIndex === index
              ? "text-white scale-105" // Estilo de la línea activa
              : "text-white/50"       // Estilo de las líneas inactivas
          )}
        >
          {line.line}
        </p>
      ))}
    </div>
  );
}