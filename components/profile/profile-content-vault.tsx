/**
 * ARCHIVO: components/profile/profile-content-vault.tsx
 * VERSIÓN: 2.1 (NicePod Profile Content Vault - Absolute Contract Sync Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Renderizar la narrativa, descripción técnica y fuentes bibliográficas 
 * del podcast dentro del perfil del curador, garantizando la soberanía del dato.
 * [REFORMA V2.1]: Sincronización nominal estricta con ScriptViewer V8.0
 * (narrativeScriptContent) para evitar colisiones en el Build Shield.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import {
  BookOpen,
  ChevronDown,
  ExternalLink,
  FileText,
  Globe,
  Hash,
  Loader2,
  Pencil
} from "lucide-react";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

// --- INFRAESTRUCTURA UI ---
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/**
 * ScriptViewer: Carga diferida estratégica para proteger la fluidez del perfil (60 FPS).
 */
const ScriptEditor = dynamic(
  () => import('@/components/podcast/script-viewer').then((module) => module.ScriptViewer),
  {
    ssr: false,
    loading: () => (
      <div className="h-32 w-full flex flex-col items-center justify-center bg-black/20 rounded-3xl border border-white/5 animate-pulse">
        <Loader2 className="h-5 w-5 animate-spin text-primary/40 mb-2" />
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20">
          Sincronizando Crónica...
        </span>
      </div>
    )
  }
);

/**
 * INTERFAZ: ProfileContentVaultProperties
 */
interface ProfileContentVaultProperties {
  title: string;
  description: string | null;
  narrativeScriptContent: string | any | null; // Mantenemos compatibilidad con JSONB
  artificialIntelligenceTags: string[] | null;
  administratorCuratedTags: string[] | null;
  isAdministratorOwner: boolean;
  onTagPersistenceAction: (tags: string[]) => Promise<void>;
}

/**
 * ProfileContentVault: El santuario de sabiduría en el perfil del curador.
 */
export function ProfileContentVault({
  title,
  description,
  narrativeScriptContent,
  artificialIntelligenceTags,
  administratorCuratedTags,
  isAdministratorOwner,
  onTagPersistenceAction
}: ProfileContentVaultProperties) {

  // --- ESTADOS DE INTERFAZ LOCAL DESCRIPTIVOS ---
  const [isScriptInterfaceExpanded, setIsScriptInterfaceExpanded] = useState<boolean>(false);

  /**
   * normalizedNarrativeScript: 
   * Misión: Extraer el cuerpo del guion detectando el formato de la Bóveda NKV.
   */
  const normalizedNarrativeScript = useMemo(() => {
    if (!narrativeScriptContent) return "";
    try {
      const parsedContent = typeof narrativeScriptContent === 'string' 
        ? JSON.parse(narrativeScriptContent) 
        : narrativeScriptContent;
      
      return parsedContent.script_body || parsedContent.script_plain || parsedContent.text || String(narrativeScriptContent);
    } catch (exception) {
      return String(narrativeScriptContent);
    }
  }, [narrativeScriptContent]);

  /**
   * displayTaxonomyTags: 
   * Misión: Unión de inteligencia artificial y soberanía humana.
   */
  const displayTaxonomyTags = useMemo(() => {
    return (administratorCuratedTags && administratorCuratedTags.length > 0) 
      ? administratorCuratedTags 
      : (artificialIntelligenceTags || []);
  }, [administratorCuratedTags, artificialIntelligenceTags]);

  /**
   * intelligenceSources:
   * Misión: Extraer la bibliografía del objeto de guion si existe.
   */
  const intelligenceSources = useMemo(() => {
    try {
        const parsed = typeof narrativeScriptContent === 'string' 
            ? JSON.parse(narrativeScriptContent) 
            : narrativeScriptContent;
        return (parsed?.sources || []) as Array<{ title?: string; url?: string }>;
    } catch {
        return [];
    }
  }, [narrativeScriptContent]);

  return (
    <Card className="bg-card/40 backdrop-blur-3xl border-border/40 shadow-2xl rounded-[2.5rem] overflow-hidden w-full transition-all duration-500">

      <CardHeader className="p-6 md:p-10 pb-4">

        {/* CABECERA NARRATIVA MONUMENTAL */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="space-y-4 flex-grow">
            <CardTitle className="text-3xl md:text-5xl font-black leading-[0.9] tracking-tighter uppercase italic text-foreground text-balance font-serif">
              {title}
            </CardTitle>
            <CardDescription className="text-base md:text-xl text-muted-foreground font-medium leading-snug max-w-3xl">
              {description || "Sin descripción disponible."}
            </CardDescription>
          </div>

          {/* ACCIÓN DE EDICIÓN SOBERANA */}
          {isAdministratorOwner && (
            <Button
              variant="ghost"
              size="icon"
              className="rounded-2xl hover:bg-primary/10 hover:text-primary transition-all flex-shrink-0 h-12 w-12 border border-white/5 bg-white/[0.02]"
            >
              <Pencil size={18} />
            </Button>
          )}
        </div>

        {/* MALLA DE ETIQUETAS SEMÁNTICAS (TAXONOMÍA) */}
        <div className="flex flex-wrap gap-2 mt-8">
          {displayTaxonomyTags.length > 0 ? (
            displayTaxonomyTags.map((tagIdentification) => (
              <Badge
                key={tagIdentification}
                variant="outline"
                className="bg-white/5 border-white/10 hover:border-primary/40 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider text-muted-foreground transition-all cursor-default"
              >
                <Hash className="h-3 w-3 mr-1.5 opacity-30 text-primary" />
                {tagIdentification}
              </Badge>
            ))
          ) : (
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest italic">
              Dimensiones no catalogadas
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6 md:p-10 pt-0 space-y-10">
        <Separator className="opacity-10" />

        {/* SECCIÓN: TRASCRIPCIÓN SOBERANA DE INTELIGENCIA */}
        <Collapsible
          open={isScriptInterfaceExpanded}
          onOpenChange={setIsScriptInterfaceExpanded}
          className="w-full"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BookOpen className="h-4 w-4 text-primary" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-tighter text-white">
                Trascripción de Inteligencia
              </h3>
            </div>

            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-4 rounded-xl text-[9px] font-black tracking-[0.2em] hover:bg-primary/10 text-primary transition-all"
              >
                {isScriptInterfaceExpanded ? 'CERRAR' : 'DESPLEGAR'}
                <ChevronDown className={cn(
                  "ml-2 h-3.5 w-3.5 transition-transform duration-500",
                  isScriptInterfaceExpanded && 'rotate-180'
                )} />
              </Button>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent className="animate-in slide-in-from-top-2 duration-500">
            <div className="relative p-6 md:p-10 bg-black/40 rounded-[2rem] border border-border/40 shadow-inner overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none group-hover:opacity-[0.05] transition-opacity duration-1000">
                <FileText size={150} />
              </div>

              <div className="relative z-10">
                {/* [FIX V2.1]: Propiedad 'narrativeScriptContent' sincronizada con ScriptViewer V8.0 */}
                <ScriptEditor narrativeScriptContent={normalizedNarrativeScript} />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* SECCIÓN: FUENTES DE VERDAD (BIBLIOGRAFÍA) */}
        <Separator className="opacity-5" />

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 px-1">
            <Globe className="h-4 w-4 text-zinc-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
              Fuentes Bibliográficas
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {intelligenceSources.slice(0, 4).map((sourceItem, sourceIndex) => (
              <div
                key={sourceIndex}
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between group/link hover:bg-white/[0.04] transition-all cursor-pointer"
                onClick={() => sourceItem.url && window.open(sourceItem.url, '_blank')}
              >
                <span className="text-[10px] font-bold text-zinc-400 truncate max-w-[80%] uppercase tracking-tight">
                  {sourceItem.title || "Evidencia Detectada"}
                </span>
                <ExternalLink size={12} className="text-zinc-600 group-hover/link:text-primary transition-colors" />
              </div>
            ))}
          </div>
        </div>

      </CardContent>
    </Card>
  );
}