// components/podcast/content-vault.tsx
// VERSIÓN: 1.0 (NicePod Content Vault - Knowledge Architecture Standard)
// Misión: Renderizar el núcleo narrativo, descripción y mapa de etiquetas del podcast.
// [ESTABILIZACIÓN]: Aislamiento de renderizado de texto masivo y gestión de metadatos visuales.

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
 * ScriptViewer: Carga diferida estratégica.
 * El editor de guiones es un componente pesado que solo debe cargarse 
 * cuando el usuario decide expandir la trascripción.
 */
const ScriptEditor = dynamic(
  () => import('../script-viewer').then((mod) => mod.ScriptViewer),
  {
    ssr: false,
    loading: () => (
      <div className="h-40 w-full flex flex-col items-center justify-center bg-black/20 rounded-[2rem] border border-dashed border-white/10">
        <Loader2 className="h-6 w-6 animate-spin text-primary/40 mb-3" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
          Sincronizando Guion Maestro...
        </span>
      </div>
    )
  }
);

/**
 * INTERFAZ: ContentVaultProps
 */
interface ContentVaultProps {
  title: string;
  description: string | null;
  status: string;
  isConstructing: boolean;
  scriptText: any;
  aiTags: string[] | null;
  userTags: string[] | null;
  isOwner: boolean;
  isScriptExpanded: boolean;
  onScriptToggle: (open: boolean) => void;
  onEditTags: () => void;
}

/**
 * ContentVault: El bastidor de conocimiento de NicePod V2.5.
 */
export function ContentVault({
  title,
  description,
  status,
  isConstructing,
  scriptText,
  aiTags,
  userTags,
  isOwner,
  isScriptExpanded,
  onScriptToggle,
  onEditTags
}: ContentVaultProps) {

  /**
   * normalizedScript: Procesa el objeto JSONB para extraer la versión de lectura.
   */
  const normalizedScript = useMemo(() => {
    if (!scriptText) return "";
    try {
      const parsed = typeof scriptText === 'string' ? JSON.parse(scriptText) : scriptText;
      return parsed.script_body || parsed.script_plain || String(scriptText);
    } catch {
      return String(scriptText);
    }
  }, [scriptText]);

  /**
   * displayTags: Prioriza las etiquetas curadas por el usuario sobre las de la IA.
   */
  const displayTags = useMemo(() => {
    const finalTags = userTags?.length ? userTags : (aiTags || []);
    return finalTags;
  }, [userTags, aiTags]);

  return (
    <Card className="bg-card/40 backdrop-blur-3xl border-border/40 shadow-2xl rounded-[2.5rem] overflow-hidden w-full transition-all duration-500">

      <CardHeader className="p-6 md:p-10">

        {/* LÍNEA DE ESTADO Y BANDERAS */}
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

          {isConstructing && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-primary/40 bg-primary/5 animate-pulse">
              <Loader2 className="h-3 w-3 animate-spin text-primary" />
              <span className="text-[9px] font-black text-primary uppercase tracking-tighter">
                Materializando
              </span>
            </div>
          )}
        </div>

        {/* CABECERA MONUMENTAL */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="space-y-4 flex-grow">
            <CardTitle className="text-3xl md:text-5xl font-black leading-[0.9] tracking-tighter uppercase italic text-foreground text-balance">
              {title}
            </CardTitle>
            <CardDescription className="text-base md:text-xl text-muted-foreground font-medium leading-relaxed max-w-3xl">
              {description}
            </CardDescription>
          </div>

          {/* ACCIÓN DE CURADURÍA: Solo dueño */}
          {isOwner && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onEditTags}
              className="rounded-2xl hover:bg-primary/10 hover:text-primary transition-all flex-shrink-0"
            >
              <Pencil size={20} />
            </Button>
          )}
        </div>

        {/* MAPA SEMÁNTICO (Etiquetas) */}
        <div className="flex flex-wrap gap-2.5 mt-8">
          {displayTags.length > 0 ? (
            displayTags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="bg-white/5 border-white/10 hover:border-primary/40 px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-wider text-muted-foreground/80 transition-colors"
              >
                <Hash className="h-3 w-3 mr-1 opacity-40" />
                {tag}
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

        {/* SECCIÓN: TRANSCRIPCIÓN MAESTRA */}
        <Collapsible
          open={isScriptExpanded}
          onOpenChange={onScriptToggle}
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
              {/* Efecto decorativo de fondo para el visor */}
              <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
                <FileText size={120} />
              </div>

              <div className="relative z-10">
                <ScriptEditor scriptText={normalizedScript} />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

      </CardContent>
    </Card>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * Este componente es el responsable de gestionar el 'Heavy Content'. Al utilizar 
 * 'useMemo' para la normalización del guion, garantizamos que el parseo de JSON 
 * no bloquee el hilo de UI durante los eventos de Realtime. El diseño denso 
 * (p-6 a p-10) elimina el aire innecesario y centra la atención en la sabiduría 
 * del texto forjado.
 */