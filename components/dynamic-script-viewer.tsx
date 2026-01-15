// components/dynamic-script-viewer.tsx
// VERSIÓN: 5.1 (Event-Driven High Performance Teleprompter)

"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { cn } from "@/lib/utils";

interface DynamicScriptViewerProps {
  scriptText: any;
  duration: number;
  isPlaying: boolean;
}

export function DynamicScriptViewer({ scriptText, duration, isPlaying }: DynamicScriptViewerProps) {
  const [localTime, setLocalTime] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. ESCUCHAR EL PULSO DEL AUDIO (Aislado del render global)
  useEffect(() => {
    const handleSync = (e: any) => {
      if (e.detail?.currentTime !== undefined) {
        setLocalTime(e.detail.currentTime);
      }
    };
    window.addEventListener('nicepod-timeupdate', handleSync);
    return () => window.removeEventListener('nicepod-timeupdate', handleSync);
  }, []);

  // 2. PARSEO DE CONTENIDO
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

  // 3. AUTO-SCROLL INTELIGENTE
  useEffect(() => {
    if (!scrollRef.current || paragraphs.length === 0 || duration <= 0) return;

    const progress = localTime / duration;
    const scrollAmount = scrollRef.current.scrollHeight * progress;

    scrollRef.current.scrollTo({
      top: scrollAmount - 150, // Mantenemos el texto activo cerca del centro
      behavior: "smooth"
    });
  }, [localTime, duration, paragraphs.length]);

  return (
    <div
      ref={scrollRef}
      className="h-full w-full overflow-y-auto px-6 py-20 scroll-smooth no-scrollbar"
    >
      <div className="max-w-prose mx-auto space-y-10 pb-40">
        {paragraphs.map((para, idx) => {
          const paraProgress = idx / paragraphs.length;
          const isActive = (localTime / duration) >= paraProgress && (localTime / duration) < (idx + 1) / paragraphs.length;

          return (
            <p
              key={idx}
              className={cn(
                "text-xl md:text-3xl font-medium transition-all duration-700 leading-relaxed",
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