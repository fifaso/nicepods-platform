// components/geo/radar-hud.tsx
// VERSIÓN: 1.1 (Full Telemetry HUD)

import { motion } from "framer-motion";
import { Loader2, MapPin, Moon, Navigation, Sun } from "lucide-react";

interface RadarProps {
  status: string;
  weather?: { temp_c: number; condition: string; is_day: boolean };
  place?: string;
}

export function RadarHUD({ status, weather, place }: RadarProps) {
  const isScanning = status === 'SCANNING';

  return (
    <div className="relative w-full h-[280px] flex items-center justify-center overflow-hidden rounded-[2.5rem] bg-zinc-950/50 border border-white/5 backdrop-blur-xl shadow-2xl">
      {/* GRID RADAR */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#ffffff05_1px,transparent_1px)] bg-[size:20px_20px]" />

      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.4], opacity: [0.3, 0] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
          className="absolute w-40 h-40 border border-primary/40 rounded-full"
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
          className="absolute w-60 h-60 border border-dashed border-white/5 rounded-full"
        />
      </div>

      <div className="z-10 bg-black/40 p-5 rounded-full border border-primary/20 shadow-[0_0_40px_rgba(var(--primary),0.2)]">
        {isScanning ? (
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
        ) : (
          <Navigation className="h-10 w-10 text-white fill-white animate-pulse" />
        )}
      </div>

      {/* TELEMETRÍA INFERIOR */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute bottom-6 left-8 right-8 flex justify-between items-end"
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase tracking-widest">
            {weather?.is_day ? <Sun className="h-3 w-3 text-amber-400" /> : <Moon className="h-3 w-3 text-indigo-400" />}
            Atmosfera
          </div>
          <span className="text-sm font-bold text-white">
            {weather ? `${Math.round(weather.temp_c)}°C / ${weather.condition}` : "Sincronizando..."}
          </span>
        </div>

        <div className="flex flex-col gap-1 items-end text-right">
          <div className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase tracking-widest">
            <MapPin className="h-3 w-3 text-primary" />
            Lugar
          </div>
          <span className="text-sm font-bold text-white max-w-[140px] truncate">
            {place || "Detectando..."}
          </span>
        </div>
      </motion.div>
    </div>
  );
}