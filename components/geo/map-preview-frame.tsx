// components/geo/map-preview-frame.tsx
// VERSIÓN: 4.0 (Madrid Resonance - Professional Clean Integration)
// Misión: Gateway interactivo 3D para la Home con tipado estricto y sin supresores.

"use client";

import { motion } from "framer-motion";
import { Compass, Loader2, Maximize2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

/**
 * 🛡️ DEFINICIÓN DEL CONTRATO DE TIPOS (The Clean Solution)
 * Definimos exactamente qué propiedades debe aceptar nuestro motor de mapas.
 * Esto elimina el error de 'IntrinsicAttributes' de forma profesional.
 */
interface MadridMapProps {
  initialViewState: {
    latitude: number;
    longitude: number;
    zoom: number;
    pitch: number;
    bearing: number;
  };
  mapboxAccessToken: string;
  style: React.CSSProperties;
  mapStyle: string;
  reuseMaps?: boolean;
}

/**
 * CARGA DINÁMICA CON TIPADO GENÉRICO
 * Pasamos <MadridMapProps> al genérico de dynamic para que TypeScript 
 * reconozca las propiedades del componente importado.
 */
const MapEngine = dynamic<MadridMapProps>(
  () => import("react-map-gl").then((mod) => mod.Map),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 gap-2">
        <Loader2 className="h-5 w-5 text-primary animate-spin" />
        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-600">
          Cargando Motor...
        </span>
      </div>
    ),
  }
);

export function MapPreviewFrame() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Coordenadas fijas para la previsualización (Madrid)
  const [coords] = useState({
    latitude: 40.4167,
    longitude: -3.7037
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePortalClick = () => {
    router.push("/geo");
  };

  // Evitamos el renderizado en servidor para mantener la consistencia del cliente
  if (!mounted) {
    return (
      <div className="w-full h-[180px] lg:h-[220px] rounded-[2.5rem] bg-zinc-900 border border-white/5 animate-pulse" />
    );
  }

  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={handlePortalClick}
      className="group relative w-full h-[180px] lg:h-[220px] rounded-[2.5rem] overflow-hidden border border-white/10 bg-zinc-950 cursor-pointer shadow-2xl transition-all duration-500 hover:border-primary/40"
    >
      {/* CAPA DE MAPA SATELITAL REALISTA */}
      <div className="absolute inset-0 pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity duration-700">
        {MAPBOX_TOKEN ? (
          <MapEngine
            initialViewState={{
              latitude: coords.latitude,
              longitude: coords.longitude,
              zoom: 14.5,
              pitch: 55,
              bearing: -15
            }}
            mapboxAccessToken={MAPBOX_TOKEN}
            style={{ width: "100%", height: "100%" }}
            mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
            reuseMaps={true}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-[9px] font-mono text-zinc-600">
            [SISTEMA]: TOKEN DE MAPA NO DETECTADO
          </div>
        )}
      </div>

      {/* GRADIENTE DE PROFUNDIDAD Y CRISTALISMO */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent" />

      {/* CAPA DE INTERFAZ (UI) */}
      <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
        <div className="flex justify-between items-start">
          <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
            <span className="text-[9px] font-black uppercase tracking-widest text-white/90">
              Madrid Live
            </span>
          </div>
          <div className="bg-primary p-2 rounded-full shadow-lg scale-0 group-hover:scale-100 transition-transform duration-500 ease-in-out">
            <Maximize2 size={14} className="text-white" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-primary/20 p-3 rounded-2xl backdrop-blur-md border border-primary/20 shadow-[0_0_20px_rgba(var(--primary),0.15)]">
            <Compass className="h-6 w-6 text-primary animate-pulse" />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-sm font-black text-white uppercase tracking-widest leading-none">
              Vivir lo Local
            </h3>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-tighter">
              Explorar Madrid en 3D
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}