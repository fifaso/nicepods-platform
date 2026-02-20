// components/profile/profile-curator-fiche.tsx
// VERSIÓN: 1.0 (NicePod Profile Curator Fiche - Professional Identity Standard)
// Misión: Centralizar la autoría, reputación y metadatos de creación del podcast.
// [ESTABILIZACIÓN]: Optimización de densidad visual y sincronía con el sistema de reputación v2.5.

"use client";

import {
  Calendar,
  Clock,
  Info,
  ShieldCheck,
  User as UserIcon,
  Zap
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// --- INFRAESTRUCTURA UI ---
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatTime, getSafeAsset } from "@/lib/utils";
import { ResearchSource } from "@/types/podcast";
import { CreationMetadata } from "../creation-metadata";

/**
 * INTERFAZ: ProfileCuratorFicheProps
 * Define el contrato de datos para la ficha de identidad del curador.
 */
interface ProfileCuratorFicheProps {
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
  creationData: any;
  sources: ResearchSource[];
}

/**
 * ProfileCuratorFiche: El nodo de autoridad y transparencia técnica.
 * 
 * Este componente organiza la información en tres capas de profundidad:
 * 1. Identidad Soberana (Autor y Reputación).
 * 2. Telemetría de Registro (Fecha y Duración).
 * 3. Malla de Inteligencia (Especificaciones de Agentes).
 */
export function ProfileCuratorFiche({
  profile,
  createdAt,
  duration,
  creationData,
  sources
}: ProfileCuratorFicheProps) {

  // Determinamos la ruta de acceso al perfil soberano del autor
  const profileUrl = profile?.username ? `/profile/${profile.username}` : null;

  return (
    <Card className="bg-card/20 backdrop-blur-xl border-border/40 shadow-xl rounded-[2.2rem] overflow-hidden w-full transition-all duration-500">
      <CardContent className="p-5 space-y-6">

        {/* 1. SECCIÓN: CABECERA DE AUTORÍA Y RANGO */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <ShieldCheck size={12} className="text-primary/60" />
            <span className="text-[8px] font-black uppercase tracking-[0.4em] text-muted-foreground/60">
              Soberanía del Dato
            </span>
          </div>

          {profileUrl ? (
            <Link href={profileUrl} className="block group">
              <div className="flex items-center gap-4 p-4 bg-background/40 rounded-[1.8rem] border border-border/40 group-hover:border-primary/40 transition-all duration-500 shadow-sm">
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
            <div className="flex items-center gap-4 p-4 bg-background/20 rounded-[1.8rem] border border-dashed border-white/10 opacity-50">
              <div className="h-12 w-12 rounded-2xl bg-zinc-800 flex items-center justify-center">
                <UserIcon size={20} className="text-zinc-600" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Autor no identificado
              </span>
            </div>
          )}
        </div>

        {/* 2. SECCIÓN: TELEMETRÍA DE REGISTRO */}
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
            <span className="text-[10px] font-bold text-foreground font-mono">
              {duration > 0 ? formatTime(duration) : "--:--"}
            </span>
          </div>
        </div>

        <Separator className="opacity-10" />

        {/* 3. SECCIÓN: ESPECIFICACIONES TÉCNICAS (AI Meta) */}
        <div className="pt-1">
          <div className="flex items-center gap-2 mb-4 px-1">
            <Info size={12} className="text-muted-foreground/40" />
            <span className="text-[8px] font-black uppercase tracking-[0.4em] text-muted-foreground/60">
              Malla de Inteligencia
            </span>
          </div>
          {/* 
              CreationMetadata: Renderiza el historial de investigación, 
              agentes utilizados y fuentes primarias.
          */}
          <CreationMetadata data={creationData} sources={sources} />
        </div>

      </CardContent>
    </Card>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * Este componente ha sido optimizado para la 'Economía de Espacio'. 
 * Al utilizar 'rounded-2xl' en los bloques internos y un padding denso, 
 * logramos que la información técnica no distraiga del contenido del podcast 
 * pero esté disponible para el escrutinio del usuario senior. La inyección 
 * de 'reputation_score' es vital para el sistema de Social Graph de NicePod.
 */