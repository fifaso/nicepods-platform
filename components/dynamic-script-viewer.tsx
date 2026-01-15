"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { cn } from "@/lib/utils";

interface DynamicScriptViewerProps {
  scriptText: any;
  duration: number;
}

export function DynamicScriptViewer({ scriptText, duration }: DynamicScriptViewerProps) {
  const [localTime, setLocalTime] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>();

  // 1. SINCRONIZACIÓN DE ALTA VELOCIDAD (Sin Forced Reflow)
  useEffect(() => {
    const handleSync = (e: any) => {
      // Cancelamos el frame anterior si existe
      if (requestRef.current) cancelAnimationFrame(requestRef.current);

      // Programamos la actualización en el siguiente refresco de pantalla
      requestRef.current = requestAnimationFrame(() => {
        if (e.detail?.currentTime !== undefined) {
          setLocalTime(e.detail.currentTime);
        }
      });
    };

    window.addEventListener('nicepod-timeupdate', handleSync);
    return () => {
      window.removeEventListener('nicepod-timeupdate', handleSync);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // 2. PROCESAMIENTO NARRATIVO
  const paragraphs = useMemo(() => {
    let rawBody = "";
    try {
      const parsed = typeof scriptText === 'string' ? JSON.parse(scriptText) : scriptText;
      rawBody = parsed?.script_body || String(parsed || "");
    } catch {
      rawBody = String(scriptText || "");
    }
    return rawBody.split('\n').filter(p => p.trim() !== "");
  }, [scriptText]);

  // 3. AUTO-SCROLL ULTRA-FLUIDO
  useEffect(() => {
    if (!scrollRef.current || paragraphs.length === 0 || duration <= 0) return;

    const progress = localTime / duration;
    const scrollAmount = scrollRef.current.scrollHeight * progress;

    scrollRef.current.scrollTo({
      top: scrollAmount - 150, // Mantiene el foco cerca del centro visual
      behavior: "smooth"
    });
  }, [localTime, duration, paragraphs.length]);

  return (
    <div
      ref={scrollRef}
      className="h-full w-full overflow-y-auto px-6 py-20 scroll-smooth no-scrollbar"
    >
      <div className="max-w-prose mx-auto space-y-12 pb-60">
        {paragraphs.map((para, idx) => {
          const paraProgress = idx / paragraphs.length;
          const isActive = (localTime / duration) >= paraProgress && (localTime / duration) < (idx + 1) / paragraphs.length;

          return (
            <p
              key={idx}
              className={cn(
                "text-xl md:text-4xl font-medium transition-all duration-1000 leading-tight",
                isActive
                  ? "text-white scale-105 opacity-100"
                  : "text-white/10 scale-100 blur-[1px]"
              )}
            >
              {para}
            </p>
          );
        })}
      </div>
    </div>
  );
}