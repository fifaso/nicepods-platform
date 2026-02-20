// components/profile/profile-content-vault.tsx
// VERSIÓN: 1.0 (NicePod Profile Content Vault - Intelligence Architecture Standard)
// Misión: Renderizar la narrativa, descripción, fuentes y mapa semántico del podcast.
// [ESTABILIZACIÓN]: Aislamiento de contenido denso y normalización de guion JSONB.

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
 * ScriptViewer: Carga diferida estratégica.
 * Evita que el parseo de miles de palabras bloquee el renderizado inicial del perfil.
 */
const ScriptEditor = dynamic(
  () => import('../script-viewer').then((mod) => mod.ScriptViewer),
  {
    ssr: false,
    loading: () => (
      <div className="h-32 w-full flex flex-col items-center justify-center bg-black/20 rounded-3xl border border-dashed border-white/5">
        <Loader2 className="h-5 w-5 animate-spin text-primary/40 mb-2" />
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20">
          Sincronizando Crónica...
        </span>
      </div>
    )
  }
);

/**
 * INTERFAZ: ProfileContentVaultProps
 */
interface ProfileContentVaultProps {
  title: string;
  description: string | null;
  scriptText: any;
  aiTags: string[] | null;
  userTags: string[] | null;
  isOwner: boolean;
  onSaveTags: (tags: string[]) => Promise<void>;
}

/**
 * ProfileContentVault: El santuario de sabiduría en el perfil del curador.
 */
export function ProfileContentVault({
  title,
  description,
  scriptText,
  aiTags,
  userTags,
  isOwner,
  onSaveTags
}: ProfileContentVaultProps) {

  // --- ESTADOS DE INTERFAZ LOCAL ---
  const [isScriptExpanded, setIsScriptExpanded] = useState<boolean>(false);
  const [isSourcesExpanded, setIsSourcesExpanded] = useState<boolean>(false);

  /**
   * normalizedScript: Extrae el cuerpo del guion detectando el formato (JSONB v2.5 vs Legacy).
   * Memoizado para evitar ruidos de CPU durante el scroll.
   */
  const normalizedScript = useMemo(() => {
    if (!scriptText) return "";
    try {
      const parsed = typeof scriptText === 'string' ? JSON.parse(scriptText) : scriptText;
      // Protocolo NicePod: Priorizamos script_body para la experiencia de lectura completa.
      return parsed.script_body || parsed.script_plain || String(scriptText);
    } catch {
      return String(scriptText);
    }
  }, [scriptText]);

  /**
   * displayTags: Unión de inteligencia artificial y soberanía humana.
   */
  const displayTags = useMemo(() => {
    const finalTags = userTags?.length ? userTags : (aiTags || []);
    return finalTags;
  }, [userTags, aiTags]);

  return (
    <Card className="bg-card/40 backdrop-blur-3xl border-border/40 shadow-2xl rounded-[2.5rem] overflow-hidden w-full transition-all duration-500">

      <CardHeader className="p-6 md:p-10 pb-4">

        {/* CABECERA NARRATIVA */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="space-y-4 flex-grow">
            <CardTitle className="text-3xl md:text-5xl font-black leading-[0.9] tracking-tighter uppercase italic text-foreground text-balance">
              {title}
            </CardTitle>
            <CardDescription className="text-base md:text-xl text-muted-foreground font-medium leading-snug max-w-3xl">
              {description || "Sin descripción disponible."}
            </CardDescription>
          </div>

          {/* ACCIÓN DE EDICIÓN: Solo visible para el soberano del perfil */}
          {isOwner && (
            <Button
              variant="ghost"
              size="icon"
              className="rounded-2xl hover:bg-primary/10 hover:text-primary transition-all flex-shrink-0 h-12 w-12 border border-white/5 bg-white/[0.02]"
            >
              <Pencil size={18} />
            </Button>
          )}
        </div>

        {/* MALLA DE ETIQUETAS SEMÁNTICAS */}
        <div className="flex flex-wrap gap-2 mt-8">
          {displayTags.length > 0 ? (
            displayTags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="bg-white/5 border-white/10 hover:border-primary/40 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider text-muted-foreground transition-all cursor-default"
              >
                <Hash className="h-3 w-3 mr-1.5 opacity-30 text-primary" />
                {tag}
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

        {/* SECCIÓN: TRASCRIPCIÓN SOBERANA */}
        <Collapsible
          open={isScriptExpanded}
          onOpenChange={setIsScriptExpanded}
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
                {isScriptExpanded ? 'CERRAR' : 'DESPLEGAR'}
                <ChevronDown className={cn(
                  "ml-2 h-3.5 w-3.5 transition-transform duration-500",
                  isScriptExpanded && 'rotate-180'
                )} />
              </Button>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent className="animate-in slide-in-from-top-2 duration-500">
            <div className="relative p-6 md:p-10 bg-black/40 rounded-[2rem] border border-border/40 shadow-inner overflow-hidden group">
              {/* Marca de Agua de Bóveda */}
              <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none group-hover:opacity-[0.05] transition-opacity duration-1000">
                <FileText size={150} />
              </div>

              <div className="relative z-10">
                <ScriptEditor scriptText={normalizedScript} />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* SECCIÓN: FUENTES DE VERDAD (Bibliografía)
            Implementada como Collapsible para no saturar el eje vertical.
        */}
        <Separator className="opacity-5" />

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 px-1">
            <Globe className="h-4 w-4 text-zinc-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
              Fuentes Bibliográficas
            </span>
          </div>
          {/* El componente de fuentes se maneja aquí de forma densa */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(scriptText?.sources || []).slice(0, 4).map((source: any, idx: number) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between group/link hover:bg-white/[0.04] transition-all cursor-pointer"
                onClick={() => source.url && window.open(source.url, '_blank')}
              >
                <span className="text-[10px] font-bold text-zinc-400 truncate max-w-[80%] uppercase tracking-tight">
                  {source.title || "Evidencia Detectada"}
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

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * Este componente es el núcleo de lectura de la Workstation. He aplicado un 
 * 'staggered rendering' implícito mediante el uso de Collapsibles. El diseño 
 * visual prioriza el Título Monumental (LCP) y las Etiquetas (Taxonomía), 
 * relegando los datos masivos a la interacción del usuario, lo que mantiene 
 * la fluidez de 60 FPS durante el scroll del perfil.
 */