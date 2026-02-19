// components/podcast/curator-aside.tsx
// VERSIÓN: 1.2 (NicePod Curator Aside - Production Identity Standard)
// Misión: Centralizar la autoría, telemetría temporal y transparencia técnica del podcast.
// [RESOLUCIÓN]: Fix de exportación nominal (TS2305) y optimización de densidad visual.

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatTime, getSafeAsset } from "@/lib/utils";
import { ResearchSource } from "@/types/podcast";
import {
  Calendar,
  Clock,
  Info,
  MapPin,
  ShieldCheck,
  User as UserIcon,
  Zap
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CreationMetadata } from "../creation-metadata";

/**
 * INTERFAZ: CuratorAsideProps
 * Define el contrato de datos para la columna lateral de la Workstation NicePod.
 */
interface CuratorAsideProps {
  profile: {
    full_name: string | null;
    avatar_url: string | null;
    username: string;
    reputation_score?: number;
    is_verified?: boolean;
    role?: string;
  } | null;
  createdAt: string;
  duration: number;
  placeName: string | null;
  creationData: any;
  sources: ResearchSource[];
  isConstructing: boolean;
}

/**
 * CuratorAside: El nodo de identidad soberana y metadatos técnicos.
 * 
 * Organiza la información en tres niveles: Identidad, Telemetría y Malla de IA.
 */
export function CuratorAside({
  profile,
  createdAt,
  duration,
  placeName,
  creationData,
  sources,
  isConstructing
}: CuratorAsideProps) {

  // Determinamos la ruta de acceso al perfil soberano
  const profileUrl = profile?.username ? `/profile/${profile.username}` : null;

  return (
    <aside className="space-y-4 w-full animate-in slide-in-from-right-4 duration-700">

      {/* 1. TARJETA DE IDENTIDAD Y MÉTRICAS */}
      <Card className="bg-card/20 backdrop-blur-xl border-border/40 shadow-xl rounded-[2rem] overflow-hidden w-full transition-all duration-500">
        <CardContent className="p-5 space-y-5">

          {/* SECCIÓN: CABECERA DE AUTORÍA */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <ShieldCheck size={12} className="text-primary/60" />
              <span className="text-[8px] font-black uppercase tracking-[0.4em] text-muted-foreground/60">
                Soberanía del Dato
              </span>
            </div>

            {profileUrl ? (
              <Link href={profileUrl} className="block group">
                <div className="flex items-center gap-4 p-4 bg-background/40 rounded-[1.5rem] border border-border/40 group-hover:border-primary/40 transition-all duration-500 shadow-sm">
                  <div className="relative h-12 w-12 flex-shrink-0">
                    <Image
                      src={getSafeAsset(profile?.avatar_url, 'avatar')}
                      alt={profile?.full_name || "Curador"}
                      fill
                      className="rounded-2xl object-cover border border-white/5 shadow-md"
                    />
                    {profile?.is_verified && (
                      <div className="absolute -top-1 -right-1 bg-primary rounded-full p-0.5 border-2 border-background">
                        <Zap size={8} className="text-white fill-current" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-xs truncate uppercase tracking-tight text-foreground leading-none">
                      {profile?.full_name || 'Curador Anónimo'}
                    </p>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-2">
                      Reputación: <span className="text-primary font-black">{profile?.reputation_score || 0} pts</span>
                    </p>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="flex items-center gap-4 p-4 bg-background/20 rounded-[1.5rem] border border-dashed border-white/10 opacity-50">
                <div className="h-12 w-12 rounded-2xl bg-zinc-800 flex items-center justify-center">
                  <UserIcon size={20} className="text-zinc-600" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  Identidad no vinculada
                </span>
              </div>
            )}
          </div>

          {/* 2. SECCIÓN: TELEMETRÍA DE CREACIÓN */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col p-4 bg-white/[0.03] rounded-2xl border border-white/5 group hover:bg-white/[0.05] transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={10} className="text-muted-foreground/40" />
                <span className="text-[8px] font-black uppercase text-muted-foreground/40 tracking-widest">
                  Registro
                </span>
              </div>
              <span className="text-[10px] font-bold text-foreground uppercase tracking-tight">
                {new Date(createdAt).toLocaleDateString(undefined, {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
            </div>

            <div className="flex flex-col p-4 bg-white/[0.03] rounded-2xl border border-white/5 group hover:bg-white/[0.05] transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={10} className="text-muted-foreground/40" />
                <span className="text-[8px] font-black uppercase text-muted-foreground/40 tracking-widest">
                  Longitud
                </span>
              </div>
              <span className="text-[10px] font-bold text-foreground font-mono leading-none">
                {isConstructing ? "--:--" : formatTime(duration)}
              </span>
            </div>
          </div>

          {/* 3. SECCIÓN: ANCLAJE GEOSPACIAL (Madrid Resonance) */}
          {placeName && (
            <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10 animate-in fade-in zoom-in-95 duration-1000">
              <div className="p-2 bg-primary/10 rounded-xl">
                <MapPin size={14} className="text-primary" />
              </div>
              <div className="min-w-0">
                <span className="text-[7px] font-black uppercase text-primary/60 tracking-widest block mb-1">
                  Resonancia Local
                </span>
                <p className="text-[10px] font-bold text-foreground truncate uppercase tracking-tight leading-none">
                  {placeName}
                </p>
              </div>
            </div>
          )}

          <Separator className="opacity-10" />

          {/* 4. SECCIÓN: METADATOS DE INTELIGENCIA */}
          <div className="pt-1">
            <div className="flex items-center gap-2 mb-4 px-1">
              <Info size={12} className="text-muted-foreground/40" />
              <span className="text-[8px] font-black uppercase tracking-[0.4em] text-muted-foreground/60">
                Especificaciones de IA
              </span>
            </div>
            {/* 
                CreationMetadata: Componente especializado que renderiza 
                las fuentes y la configuración de agentes.
            */}
            <CreationMetadata data={creationData} sources={sources} />
          </div>

        </CardContent>
      </Card>

      {/* FIRMA DE INTEGRIDAD (Cierre Estético) */}
      <div className="px-6 py-2 flex items-center justify-center gap-3 opacity-20 hover:opacity-40 transition-opacity duration-1000">
        <div className="h-px flex-grow bg-gradient-to-r from-transparent to-white/50" />
        <Zap size={10} className="text-primary" />
        <div className="h-px flex-grow bg-gradient-to-l from-transparent to-white/50" />
      </div>

    </aside>
  );
}