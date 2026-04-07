/**
 * ARCHIVO: components/podcast/content-vault.tsx
 * VERSIÓN: 2.0 (NicePod Content Vault - Knowledge Architecture Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Renderizar el núcleo narrativo, la descripción técnica y el mapa de 
 * etiquetas periciales, garantizando la inmersión en el capital intelectual.
 * [REFORMA V2.0]: Resolución de Path Aliasing, erradicación de abreviaturas,
 * tipado estricto del guion y sincronía nominal con ScriptViewer.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

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
import {
  ChevronDown,
  FileText,
  Hash,
  Loader2,
  Pencil
} from "lucide-react";
import dynamic from "next/dynamic";
import { useMemo } from "react";

/**
 * ScriptViewer: Carga diferida estratégica para proteger el rendimiento del Main Thread.
 */
const ScriptEditor = dynamic(
  () => import('@/components/podcast/script-viewer').then((module) => module.ScriptViewer),
  {
    ssr: false,
    loading: () => (
      <div className="h-40 w-full flex flex-col items-center justify-center bg-black/20 rounded-[2rem] border border-white/5 animate-pulse">
        <Loader2 className="h-6 w-6 animate-spin text-primary/40 mb-3" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
          Sincronizando Guion Maestro...
        </span>
      </div>
    )
  }
);

/**
 * INTERFAZ: ContentVaultProperties
 */
interface ContentVaultProperties {
  title: string;
  description: string | null;
  status: string;
  isIntelligenceConstructing: boolean;
  narrativeScriptContent: string | Record<string, string> | null;
  artificialIntelligenceTags: string[] | null;
  administratorCuratedTags: string[] | null;
  isAdministratorOwner: boolean;
  isScriptExpanded: boolean;
  onScriptVisibilityToggle: (isExpanded: boolean) => void;
  onTagEditAction: () => void;
}

/**
 * ContentVault: El bastidor de conocimiento central de la Workstation.
 */
export function ContentVault({
  title,
  description,
  status,
  isIntelligenceConstructing,
  narrativeScriptContent,
  artificialIntelligenceTags,
  administratorCuratedTags,
  isAdministratorOwner,
  isScriptExpanded,
  onScriptVisibilityToggle,
  onTagEditAction
}: ContentVaultProperties) {

  /**
   * normalizedNarrativeScript: 
   * Misión: Procesar el contenido de la Bóveda para extraer la versión de lectura purificada.
   */
  const normalizedNarrativeScript = useMemo(() => {
    if (!narrativeScriptContent) {
      return "";
    }
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
   * Misión: Priorizar la curaduría humana sobre la inferencia de la máquina.
   */
  const displayTaxonomyTags = useMemo(() => {
    return (administratorCuratedTags && administratorCuratedTags.length > 0) 
      ? administratorCuratedTags 
      : (artificialIntelligenceTags || []);
  }, [administratorCuratedTags, artificialIntelligenceTags]);

  return (
    <Card className="bg-card/40 backdrop-blur-3xl border-border/40 shadow-2xl rounded-[2.5rem] overflow-hidden w-full transition-all duration-500">

      <CardHeader className="p-6 md:p-10">

        {/* INDICADORES DE ESTADO SOBERANO */}
        <div className="flex items-center gap-3 mb-5">
          <Badge
            variant="secondary"
            className={cn(
              "px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] border-primary/20",
              status === 'published' ? "bg-primary/10 text-primary" : "bg-zinc-800 text-zinc-400"
            )}
          >
            {status === 'published' ? 'PÚBLICO' : 'BÓVEDA PRIVADA'}
          </Badge>

          {isIntelligenceConstructing && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-primary/40 bg-primary/5 animate-pulse">
              <Loader2 className="h-3 w-3 animate-spin text-primary" />
              <span className="text-[9px] font-black text-primary uppercase tracking-tighter">
                Materializando
              </span>
            </div>
          )}
        </div>

        {/* CABECERA MONUMENTAL DE LA CRÓNICA */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="space-y-4 flex-grow">
            <CardTitle className="text-3xl md:text-5xl font-black leading-[0.9] tracking-tighter uppercase italic text-foreground text-balance">
              {title}
            </CardTitle>
            <CardDescription className="text-base md:text-xl text-muted-foreground font-medium leading-relaxed max-w-3xl">
              {description}
            </CardDescription>
          </div>

          {/* ACCIÓN DE CURADURÍA TÁCTICA */}
          {isAdministratorOwner && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onTagEditAction}
              className="rounded-2xl hover:bg-primary/10 hover:text-primary transition-all flex-shrink-0"
            >
              <Pencil size={20} />
            </Button>
          )}
        </div>

        {/* MAPA SEMÁNTICO (TAXONOMÍA DE ETIQUETAS) */}
        <div className="flex flex-wrap gap-2.5 mt-8">
          {displayTaxonomyTags.length > 0 ? (
            displayTaxonomyTags.map((tagIdentification) => (
              <Badge
                key={tagIdentification}
                variant="outline"
                className="bg-white/5 border-white/10 hover:border-primary/40 px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-wider text-muted-foreground/80 transition-colors"
              >
                <Hash className="h-3 w-3 mr-1 opacity-40" />
                {tagIdentification}
              </Badge>
            ))
          ) : (
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest italic">
              Sin etiquetas registradas
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6 md:p-10 pt-0">
        <Separator className="mb-8 opacity-10" />

        {/* SECCIÓN: TRANSCRIPCIÓN MAESTRA DEL PERITAJE */}
        <Collapsible
          open={isScriptExpanded}
          onOpenChange={onScriptVisibilityToggle}
          className="w-full"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-black uppercase tracking-tighter flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              Anatomía del Guion
            </h3>

            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 px-4 rounded-xl text-[10px] font-black tracking-[0.2em] hover:bg-primary/10 transition-all"
              >
                {isScriptExpanded ? 'OCULTAR' : 'DESPLEGAR'}
                <ChevronDown className={cn(
                  "ml-2 h-4 w-4 transition-transform duration-500",
                  isScriptExpanded && 'rotate-180'
                )} />
              </Button>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent className="animate-in slide-in-from-top-3 duration-500">
            <div className="relative p-6 md:p-10 bg-black/40 rounded-[2.5rem] border border-white/5 shadow-inner overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
                <FileText size={120} />
              </div>

              <div className="relative z-10">
                {/* [FIX V2.0]: Propiedad alineada con el contrato esperado por ScriptViewer */}
                <ScriptEditor narrativeScriptText={normalizedNarrativeScript} />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

      </CardContent>
    </Card>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V2.0):
 * 1. Path Aliasing: Se sustituyó la importación relativa por '@/' para asegurar 
 *    la resolución de módulos en el entorno de compilación de Vercel.
 * 2. Zero Abbreviations: Se purificaron términos como 'props', 'mod', 'id', 'ai' y 'user'.
 * 3. Contract Synchronization: El componente ScriptEditor ahora recibe 'narrativeScriptText', 
 *    resolviendo el error TS2322 al sincronizarlo con el estándar nominal de la plataforma.
 * 4. Strict Typing: Se erradicó el uso de 'any' en el contenido del guion narrativo.
 */