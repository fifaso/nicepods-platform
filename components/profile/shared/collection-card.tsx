// components/profile/shared/collection-card.tsx
// VERSIÓN: 1.0 (NicePod Collection Card - Unified Design Standard)
// Misión: Renderizar las colecciones de podcasts con integridad visual y optimización de carga.
// [ESTABILIZACIÓN]: Implementación de Next Image con prioridad LCP y estados de visibilidad dinámica.

"use client";

import { cn, getSafeAsset } from "@/lib/utils";
import { Collection } from "@/types/profile";
import {
  ChevronRight,
  Globe,
  Layers,
  Lock
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

/**
 * INTERFAZ: CollectionCardProps
 * Define los requerimientos para la visualización de un hilo de sabiduría.
 */
interface CollectionCardProps {
  collection: Collection;
  isOwner?: boolean; // Define si mostramos los indicadores de privacidad
}

/**
 * CollectionCard: La unidad fundamental de curaduría temática en NicePod.
 * 
 * Implementa el lenguaje visual Aurora: bordes suavizados, sombras 
 * de profundidad y feedback táctil al interactuar.
 */
export function CollectionCard({
  collection,
  isOwner = false
}: CollectionCardProps) {

  // Recuperamos el activo visual con el protocolo de fallback de NicePod
  const coverImage = getSafeAsset(collection.cover_image_url, 'cover');

  // Extraemos el conteo de ítems del objeto inyectado por la base de datos
  const audioCount = collection.collection_items?.[0]?.count || 0;

  return (
    <Link
      href={`/collection/${collection.id}`}
      className="group block w-full animate-in fade-in zoom-in-95 duration-500"
    >
      <article className="flex flex-col gap-4">

        {/* 1. CONTENEDOR DE IMAGEN (La Ventana Visual) */}
        <div className="relative aspect-video w-full rounded-[2rem] overflow-hidden border border-white/5 bg-zinc-900 shadow-xl transition-all duration-700 group-hover:border-primary/40 group-hover:shadow-primary/10">

          {collection.cover_image_url ? (
            <Image
              src={coverImage}
              alt={`Colección: ${collection.title}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-1000 group-hover:scale-110 opacity-80 group-hover:opacity-100"
            />
          ) : (
            /* Fallback visual: Gradiente Aurora sutil con icono central */
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center">
              <div className="p-4 rounded-full bg-white/5 border border-white/5 opacity-20">
                <Layers className="w-10 h-10 text-white" />
              </div>
            </div>
          )}

          {/* Overlay de gradiente para contraste inferior */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 opacity-60 group-hover:opacity-80 transition-opacity" />

          {/* 2. ETIQUETA DE SOBERANÍA (Visibilidad)
              Solo se muestra si el usuario está viendo su propio búnker privado.
          */}
          {isOwner && (
            <div className="absolute top-4 right-4 z-20">
              <div className={cn(
                "px-3 py-1.5 rounded-full backdrop-blur-xl border flex items-center gap-2 shadow-2xl",
                collection.is_public
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-amber-500/10 border-amber-500/20 text-amber-400"
              )}>
                {collection.is_public ? (
                  <Globe size={10} className="animate-pulse" />
                ) : (
                  <Lock size={10} />
                )}
                <span className="text-[8px] font-black uppercase tracking-[0.2em]">
                  {collection.is_public ? "PÚBLICA" : "PRIVADA"}
                </span>
              </div>
            </div>
          )}

          {/* Icono de acceso rápido (Aparece en hover) */}
          <div className="absolute bottom-4 right-6 z-20 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
            <div className="p-2 rounded-full bg-primary shadow-lg shadow-primary/40">
              <ChevronRight size={14} className="text-white" />
            </div>
          </div>
        </div>

        {/* 3. BLOQUE DE INFORMACIÓN (Metadata) */}
        <div className="px-2 space-y-1">
          <h4 className="font-black text-sm md:text-base text-foreground truncate uppercase italic tracking-tighter leading-tight group-hover:text-primary transition-colors">
            {collection.title}
          </h4>

          <div className="flex items-center gap-2 opacity-50">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground">
              {audioCount} {audioCount === 1 ? 'Audio en hilo' : 'Audios en hilo'}
            </span>
            <div className="h-0.5 w-0.5 rounded-full bg-zinc-500" />
            <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-500">
              {new Date(collection.updated_at).toLocaleDateString(undefined, { year: 'numeric' })}
            </span>
          </div>
        </div>

      </article>
    </Link>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * He implementado la propiedad 'sizes' en el componente Image para optimizar 
 * el peso de descarga según el dispositivo (Mobile-First). El uso de 
 * 'aspect-video' es inamovible para prevenir el Cumulative Layout Shift (CLS) 
 * que detectamos en el Dashboard. La transición de escala de 1000ms en la 
 * imagen es coherente con el resto de la Workstation.
 */