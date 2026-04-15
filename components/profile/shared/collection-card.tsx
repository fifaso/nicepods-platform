/**
 * ARCHIVO: components/profile/shared/collection-card.tsx
 * VERSIÓN: 4.0 (NicePod Collection Card - Sovereign Protocol V4.0)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * MISIÓN: Proveer la unidad fundamental de catalogación intelectual con integridad nominal.
 * NIVEL DE INTEGRIDAD: 100% (Soberano / ZAP Compliant / Build Shield Green)
 */

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
 * INTERFAZ: CollectionCardComponentProperties
 */
interface CollectionCardComponentProperties {
  collection: Collection;
  isOwnerSovereignty?: boolean;
}

/**
 * CollectionCard: La unidad fundamental de catalogación intelectual en NicePod.
 */
export function CollectionCard({
  collection,
  isOwnerSovereignty = false
}: CollectionCardComponentProperties) {

  const coverImageUniformResourceLocator = getSafeAsset(collection.coverImageUniformResourceLocator, 'cover');

  /**
   * EXTRACCIÓN DE MÉTRICAS:
   * 1. audioCountInventory: Cantidad de crónicas vinculadas al hilo.
   * 2. totalResonanceMetrics: Impacto total de escucha acumulado en la colección.
   */
  const audioCountInventory = collection.collectionItems?.[0]?.count || 0;
  const totalResonanceMetrics = collection.totalListenedCount || 0;

  return (
    <Link
      href={`/collection/${collection.identification}`}
      className="group block w-full outline-none"
      aria-label={`Explorar colección: ${collection.title}`}
    >
      <article className="flex flex-col gap-5">

        {/* I. ESCENARIO VISUAL (MARCO DE CARÁTULA) */}
        <div className="relative aspect-video w-full rounded-[2.5rem] overflow-hidden border border-white/5 bg-[#050505] shadow-2xl transition-all duration-700 group-hover:border-primary/30 group-hover:shadow-[0_0_40px_-15px_rgba(var(--primary),0.2)]">

          {/* Capa de Imagen: Optimizada para el Edge de Vercel */}
          <div className="absolute inset-0 z-0">
            {collection.coverImageUniformResourceLocator ? (
              <Image
                src={coverImageUniformResourceLocator}
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
          {isOwnerSovereignty && (
            <div className="absolute top-5 right-6 z-30">
              <div className={cn(
                "px-4 py-2 rounded-full backdrop-blur-2xl border flex items-center gap-2.5 shadow-2xl transition-colors duration-500",
                collection.isPublicSovereignty
                  ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
                  : "bg-amber-500/5 border-amber-500/20 text-amber-400"
              )}>
                {collection.isPublicSovereignty ? (
                  <Globe size={11} className="animate-pulse" />
                ) : (
                  <Lock size={11} />
                )}
                <span className="text-[9px] font-black uppercase tracking-[0.25em]">
                  {collection.isPublicSovereignty ? "Pública" : "Privada"}
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
                {totalResonanceMetrics}
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

            {collection.descriptionTextContent && (
              <p className="text-[11px] text-zinc-500 font-medium line-clamp-1 italic opacity-80 group-hover:opacity-100 transition-opacity">
                {collection.descriptionTextContent}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/[0.03] border border-white/5 px-3 py-1 rounded-md">
              <Layers size={10} className="text-zinc-600" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">
                {audioCountInventory} {audioCountInventory === 1 ? 'Activo' : 'Activos'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar size={10} className="text-zinc-700" />
              <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-600">
                Sinc: {new Date(collection.updateTimestamp).getFullYear()}
              </span>
            </div>
          </div>
        </div>

      </article>
    </Link>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V4.0):
 * 1. ZAP Enforcement: Purificación total de la nomenclatura técnica.
 * 2. Axial Synchronization: Consumo de la interfaz Collection purificada V4.0.
 * 3. Integridad Visual: Marco cinemático y telemetría de impacto.
 */
