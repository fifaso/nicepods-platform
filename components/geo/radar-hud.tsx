// components/geo/radar-hud.tsx
// VERSIÓN: 1.0 (Cyberpunk UI for Madrid Resonance)

import { motion } from "framer-motion";
import { Cloud, Loader2, MapPin, Navigation } from "lucide-react";

interface RadarProps {
  status: string;
  weather?: { temp_c: number; condition: string };
  place?: string;
}

export function RadarHUD({ status, weather, place }: RadarProps) {
  const isScanning = status === 'SCANNING';

  return (
    <div className="relative w-full h-[300px] flex items-center justify-center overflow-hidden rounded-3xl bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl">

      {/* GRID DE FONDO */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      {/* ANILLOS DEL RADAR */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
          className="absolute w-32 h-32 border border-primary/50 rounded-full"
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
          className="absolute w-64 h-64 border border-dashed border-white/10 rounded-full"
        />
      </div>

      {/* ICONO CENTRAL */}
      <div className="z-10 bg-black/60 p-4 rounded-full border border-primary/30 shadow-[0_0_30px_rgba(var(--primary),0.3)]">
        {isScanning ? (
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        ) : (
          <Navigation className="h-8 w-8 text-white fill-white" />
        )}
      </div>

      {/* DATOS DE TELEMETRÍA (Si están disponibles) */}
      {weather && place && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-4 right-4 flex justify-between text-xs font-mono text-white/80"
        >
          <div className="flex items-center gap-1">
            <Cloud className="h-3 w-3" />
            <span>{weather.temp_c}°C / {weather.condition}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span className="max-w-[150px] truncate">{place}</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}