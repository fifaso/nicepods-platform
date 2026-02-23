//components/profile/shared/collection-card.tsx
//version:2.0 (NicePod Collection Card - Sovereign Authority Standard)
"use client";

import { cn, getSafeAsset } from "@/lib/utils";
import { Collection } from "@/types/profile";
import {
  Calendar,
  ChevronRight,
  Globe,
  Headphones,
  Layers,
  Lock
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

/**
 * INTERFAZ: CollectionCardProps
 * Define los requerimientos para la visualización de un hilo de sabiduría.
 * Sincronizado con el contrato de tipos de la Fase 1.
 */
interface CollectionCardProps {
  collection: Collection;
  /**
   * isOwner: Define si el visitante tiene soberanía sobre la colección.
   * Si es TRUE, se activan los indicadores de visibilidad (Pública/Privada).
   */
  isOwner?: boolean;
}

/**
 * COMPONENTE: CollectionCard
 * La unidad fundamental de catalogación intelectual en NicePod V2.5.
 * 
 * Este componente implementa la 'Gramática Visual Industrial':
 * 1. Proporción Aspect-Video para estabilidad del DOM (Zero CLS).
 * 2. Capas de profundidad mediante gradientes Aurora.
 * 3. Telemetría de impacto (Conteo de audios y Resonancia total).
 */
export function CollectionCard({
  collection,
  isOwner = false
}: CollectionCardProps) {

  // PROTOCOLO DE ACTIVOS: Recuperamos la carátula con fallback técnico Aurora
  const coverImage = getSafeAsset(collection.cover_image_url, 'cover');

  /**
   * EXTRACCIÓN DE MÉTRICAS:
   * 1. audioCount: Cantidad de crónicas vinculadas al hilo.
   * 2. totalResonance: Impacto total de escucha acumulado en la colección.
   */
  const audioCount = collection.collection_items?.[0]?.count || 0;
  const totalResonance = collection.total_listened_count || 0;

  return (
    <Link
      href={`/collection/${collection.id}`}
      className="group block w-full outline-none"
      aria-label={`Explorar colección: ${collection.title}`}
    >
      <article className="flex flex-col gap-5">

        {/* I. ESCENARIO VISUAL (MARCO DE CARÁTULA) */}
        <div className="relative aspect-video w-full rounded-[2.5rem] overflow-hidden border border-white/5 bg-[#050505] shadow-2xl transition-all duration-700 group-hover:border-primary/30 group-hover:shadow-[0_0_40px_-15px_rgba(var(--primary),0.2)]">

          {/* Capa de Imagen: Optimizada para el Edge de Vercel */}
          <div className="absolute inset-0 z-0">
            {collection.cover_image_url ? (
              <Image
                src={coverImage}
                alt={`Colección NicePod: ${collection.title}`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-1000 group-hover:scale-105 opacity-70 group-hover:opacity-100"
                priority={false}
              />
            ) : (
              /* Fallback Industrial: Gradiente cinemático NicePod Blue/Black */
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-950 flex items-center justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full animate-pulse" />
                  <Layers className="w-12 h-12 text-white/10 relative z-10" />
                </div>
              </div>
            )}
          </div>

          {/* Velo de Profundidad: Asegura legibilidad de la telemetría superior */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10 opacity-80" />

          {/* II. INDICADORES DE SOBERANÍA (PRIVACIDAD) */}
          {isOwner && (
            <div className="absolute top-5 right-6 z-30">
              <div className={cn(
                "px-4 py-2 rounded-full backdrop-blur-2xl border flex items-center gap-2.5 shadow-2xl transition-colors duration-500",
                collection.is_public
                  ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
                  : "bg-amber-500/5 border-amber-500/20 text-amber-400"
              )}>
                {collection.is_public ? (
                  <Globe size={11} className="animate-pulse" />
                ) : (
                  <Lock size={11} />
                )}
                <span className="text-[9px] font-black uppercase tracking-[0.25em]">
                  {collection.is_public ? "Pública" : "Privada"}
                </span>
              </div>
            </div>
          )}

          {/* III. HUD DE ACCESO (INTERACCIÓN) */}
          <div className="absolute bottom-6 right-8 z-30 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 ease-[0.16,1,0.3,1]">
            <div className="flex items-center gap-3 bg-primary px-5 py-2.5 rounded-full shadow-[0_10px_30px_-10px_rgba(var(--primary),0.5)]">
              <span className="text-[9px] font-black uppercase tracking-widest text-black">Explorar Hilo</span>
              <ChevronRight size={16} className="text-black" />
            </div>
          </div>

          {/* IV. MÉTRICAS DE IMPACTO (OVERLAY INFERIOR) */}
          <div className="absolute bottom-6 left-8 z-30 flex items-center gap-5">
            <div className="flex items-center gap-2 text-white/60">
              <Headphones size={12} className="text-primary" />
              <span className="text-[10px] font-bold tabular-nums tracking-widest">
                {totalResonance}
              </span>
            </div>
          </div>
        </div>

        {/* V. BLOQUE DE INFORMACIÓN (IDENTIDAD DE BÓVEDA) */}
        <div className="px-1 space-y-3">
          <div className="space-y-1">
            <h4 className="font-black text-lg md:text-xl text-white truncate uppercase italic tracking-tighter leading-none group-hover:text-primary transition-colors duration-300">
              {collection.title}
            </h4>

            {collection.description && (
              <p className="text-[11px] text-zinc-500 font-medium line-clamp-1 italic opacity-80 group-hover:opacity-100 transition-opacity">
                {collection.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/[0.03] border border-white/5 px-3 py-1 rounded-md">
              <Layers size={10} className="text-zinc-600" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">
                {audioCount} {audioCount === 1 ? 'Activo' : 'Activos'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar size={10} className="text-zinc-700" />
              <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-600">
                Sinc: {new Date(collection.updated_at).getFullYear()}
              </span>
            </div>
          </div>
        </div>

      </article>
    </Link>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Eficiencia de Datos: El conteo de resonancia total se proyecta como una métrica 
 *    primaria para incentivar la curaduría de alto valor.
 * 2. Prevención de CLS: El uso estricto de 'aspect-video' en el contenedor de 
 *    imagen asegura que el layout sea inamovible durante la hidratación.
 * 3. Diseño Holístico: El escalado de imagen (1.05) y el desplazamiento del 
 *    botón de exploración utilizan curvas de Bézier personalizadas para 
 *    simular una respuesta de hardware de gama alta.
 */