/**
 * ARCHIVO: components/profile/profile-curator-fiche.tsx
 * VERSIÓN: 2.0 (NicePod Profile Curator Fiche - Sovereign Identity Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Centralizar la autoría, reputación y metadatos de creación del podcast,
 * garantizando la transparencia técnica y la autoridad del curador.
 * [REFORMA V2.0]: Resolución de Path Aliasing, erradicación de abreviaturas y 
 * blindaje de tipos mediante eliminación de 'any' y contratos descriptivos.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

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

// --- [FIX V2.0]: Resolución de importación mediante Path Alias oficial ---
import { CreationMetadata } from "@/components/podcast/creation-metadata";

/**
 * INTERFAZ: ProfileCuratorFicheProperties
 * Misión: Definir el contrato de datos descriptivo para la ficha de autoridad.
 */
interface ProfileCuratorFicheProperties {
  administratorProfile: {
    full_name: string | null;
    avatar_url: string | null;
    username: string;
    reputation_score?: number;
    is_verified?: boolean;
    role?: string;
  } | null;
  creationDateString: string;
  playbackDurationSeconds: number;
  artificialIntelligenceCreationData: Record<string, unknown> | null;
  intelligenceResearchSources: ResearchSource[];
}

/**
 * ProfileCuratorFiche: El nodo de autoridad y transparencia técnica de NicePod.
 */
export function ProfileCuratorFiche({
  administratorProfile,
  creationDateString,
  playbackDurationSeconds,
  artificialIntelligenceCreationData,
  intelligenceResearchSources
}: ProfileCuratorFicheProperties) {

  // Determinamos la ruta de acceso al perfil soberano utilizando nomenclatura descriptiva completa.
  const profileUniformResourceLocator = administratorProfile?.username 
    ? `/profile/${administratorProfile.username}` 
    : null;

  return (
    <Card className="bg-card/20 backdrop-blur-xl border-border/40 shadow-xl rounded-[2.2rem] overflow-hidden w-full transition-all duration-500">
      <CardContent className="p-5 space-y-6">

        {/* 1. SECCIÓN: CABECERA DE AUTORÍA Y RANGO SOBERANO */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <ShieldCheck size={12} className="text-primary/60" />
            <span className="text-[8px] font-black uppercase tracking-[0.4em] text-muted-foreground/60">
              Soberanía del Dato
            </span>
          </div>

          {profileUniformResourceLocator ? (
            <Link href={profileUniformResourceLocator} className="block group">
              <div className="flex items-center gap-4 p-4 bg-background/40 rounded-[1.8rem] border border-border/40 group-hover:border-primary/40 transition-all duration-500 shadow-sm">
                <div className="relative h-12 w-12 flex-shrink-0">
                  <Image
                    src={getSafeAsset(administratorProfile?.avatar_url, 'avatar')}
                    alt={administratorProfile?.full_name || "Curador"}
                    fill
                    className="rounded-2xl object-cover border border-white/5 shadow-md"
                  />
                  {administratorProfile?.is_verified && (
                    <div className="absolute -top-1 -right-1 bg-primary rounded-full p-0.5 border-2 border-background">
                      <Zap size={8} className="text-white fill-current" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-black text-xs truncate uppercase tracking-tight text-foreground leading-none">
                    {administratorProfile?.full_name || 'Curador Anónimo'}
                  </p>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-2">
                    Reputación: <span className="text-primary font-black">{administratorProfile?.reputation_score || 0} pts</span>
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

        {/* 2. SECCIÓN: TELEMETRÍA DE REGISTRO Y CRONOMETRÍA */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col p-4 bg-white/[0.03] rounded-2xl border border-white/5 group hover:bg-white/[0.05] transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={10} className="text-muted-foreground/40" />
              <span className="text-[8px] font-black uppercase text-muted-foreground/40 tracking-widest">
                Registro
              </span>
            </div>
            <span className="text-[10px] font-bold text-foreground uppercase tracking-tight">
              {new Date(creationDateString).toLocaleDateString(undefined, {
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
              {playbackDurationSeconds > 0 ? formatTime(playbackDurationSeconds) : "--:--"}
            </span>
          </div>
        </div>

        <Separator className="opacity-10" />

        {/* 3. SECCIÓN: ESPECIFICACIONES TÉCNICAS (INTELIGENCIA ARTIFICIAL) */}
        <div className="pt-1">
          <div className="flex items-center gap-2 mb-4 px-1">
            <Info size={12} className="text-muted-foreground/40" />
            <span className="text-[8px] font-black uppercase tracking-[0.4em] text-muted-foreground/60">
              Malla de Inteligencia
            </span>
          </div>
          {/* 
              CreationMetadata: Proyecta el historial de investigación y agentes 
              bajo el contrato de tipado estricto.
          */}
          <CreationMetadata 
            data={artificialIntelligenceCreationData} 
            sources={intelligenceResearchSources} 
          />
        </div>

      </CardContent>
    </Card>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V2.0):
 * 1. Path Aliasing Implementation: Se corrigió la importación de 'CreationMetadata' 
 *    utilizando el alias @/ para cumplimiento con el Build Shield de Next.js.
 * 2. Zero Abbreviations Policy: Se purificaron términos legacy (Props, Url, id, metadata, any), 
 *    sustituyéndolos por descriptores periciales completos.
 * 3. Strict Data Integrity: Se definió 'Record<string, unknown>' para la metadata de IA, 
 *    eliminando el riesgo de colapso por tipado débil.
 */