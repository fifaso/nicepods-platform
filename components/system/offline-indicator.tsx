// components/offline-indicator.tsx
// VERSIÓN: 3.0 (Active Connection Manager & Transition UI)

"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { WifiOff, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAudio } from "@/contexts/audio-context";

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { currentPodcast } = useAudio();

  useEffect(() => {
    // 1. Detección inicial
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
    }

    // 2. Listeners de eventos
    const handleOnline = () => {
      setIsOnline(true);
      setIsDismissed(false); // Reseteamos si vuelve la red
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Si estamos online o ya estamos en la página offline, no mostrar nada
  if (isOnline || pathname === '/offline') return null;

  // Si el usuario lo cerró manualmente, mostramos solo un mini-badge discreto
  if (isDismissed) {
    return (
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-2">
        <div className="bg-red-500/90 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg backdrop-blur-md cursor-pointer" onClick={() => setIsDismissed(false)}>
           <WifiOff className="h-3 w-3" /> Offline
        </div>
      </div>
    );
  }

  // Calculamos posición para no tapar el Player ni el FAB
  const bottomClass = currentPodcast ? "bottom-32" : "bottom-24";

  // UI PRINCIPAL: BANNER DE TRANSICIÓN
  return (
    <div className={cn(
        "fixed left-4 right-4 z-[90] flex flex-col gap-3 p-4 rounded-xl shadow-2xl border border-white/10 backdrop-blur-xl transition-all duration-500",
        "bg-slate-900/95 supports-[backdrop-filter]:bg-slate-900/80",
        bottomClass, // Posición dinámica
        "animate-in slide-in-from-bottom-5 fade-in"
    )}>
      
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-full text-red-400">
                <WifiOff className="h-5 w-5" />
            </div>
            <div>
                <h4 className="font-bold text-white text-sm">Sin conexión a internet</h4>
                <p className="text-xs text-slate-400">La navegación está limitada.</p>
            </div>
        </div>
        <button onClick={() => setIsDismissed(true)} className="text-slate-500 hover:text-white">
            <X className="h-5 w-5" />
        </button>
      </div>

      <Button 
        onClick={() => router.push('/offline')} 
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-900/20"
      >
        Ir a mis Descargas <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}