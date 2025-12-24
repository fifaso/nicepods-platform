// components/creation-metadata.tsx
// VERSIÓN: 4.0 (Intelligence Hub - Full Transparency & Sources)

"use client";

import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  Lightbulb, 
  Link2, 
  Mic, 
  Settings, 
  BookOpen, 
  Info, 
  MessageCircle,
  Globe,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { ResearchSource, CreationMetadataPayload } from '@/types/podcast';
import { cn } from "@/lib/utils";

function MetadataSection({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
                <Icon className="h-3 w-3" />
                <span>{title}</span>
            </div>
            <div className="pl-5 border-l border-primary/10 space-y-3">
                {children}
            </div>
        </div>
    );
}

function DataRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="group">
      <p className="text-[10px] text-muted-foreground/60 font-medium">{label}</p>
      <p className="text-sm text-foreground/90 font-medium leading-relaxed group-hover:text-primary transition-colors">{value}</p>
    </div>
  );
}

export function CreationMetadata({ data, sources = [] }: { data: CreationMetadataPayload | any; sources?: ResearchSource[] }) {
  if (!data) {
    return (
      <div className="p-4 rounded-xl border border-dashed border-border/50 text-center">
          <p className="text-xs text-muted-foreground italic">Arquitectura de IA no disponible para este registro.</p>
      </div>
    );
  }

  const style = data.style || (data.creation_mode === 'remix' ? 'remix' : 'solo');
  const inputs = data.inputs || {};

  return (
    <div className="space-y-8 py-2">
      
      {/* SECCIÓN 1: ADN DEL AGENTE */}
      <MetadataSection title="Identidad Creativa" icon={Bot}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DataRow label="Metodología" value={style === 'solo' ? 'Monólogo Estructurado' : style === 'link' ? 'Sintetizador de Ejes' : 'Hilo Conversacional'} />
            <DataRow label="Agente Inteligente" value={data.agentName} />
            <DataRow label="Nivel de Profundidad" value={inputs.depth || "Estándar"} />
            <DataRow label="Tono Narrativo" value={inputs.tone || "Equilibrado"} />
        </div>
      </MetadataSection>

      {/* SECCIÓN 2: CONTEXTO SEMILLLA */}
      <MetadataSection title="Contexto Semilla" icon={Lightbulb}>
        {style === 'solo' && (
          <>
            <DataRow label="Eje Temático" value={inputs.topic} />
            <DataRow label="Motivación / Objetivo" value={inputs.motivation || inputs.goal} />
          </>
        )}
        {style === 'link' && (
          <>
            <div className="flex items-center gap-3 py-1">
                <span className="text-xs font-bold text-primary/80 bg-primary/5 px-2 py-1 rounded">{inputs.topicA}</span>
                <ChevronRight className="h-3 w-3 text-muted-foreground/30" />
                <span className="text-xs font-bold text-primary/80 bg-primary/5 px-2 py-1 rounded">{inputs.topicB}</span>
            </div>
            <DataRow label="Catalizador" value={inputs.catalyst} />
          </>
        )}
        {data.creation_mode === 'remix' && (
          <DataRow label="Postura del Autor" value={data.user_reaction} />
        )}
      </MetadataSection>

      {/* SECCIÓN 3: FUENTES DE VERDAD (Transparencia Real) */}
      {sources && sources.length > 0 && (
          <MetadataSection title="Fuentes de Investigación" icon={Globe}>
            <div className="grid grid-cols-1 gap-2">
                {sources.map((source, index) => (
                    <a 
                      key={index} 
                      href={source.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/30 border border-border/40 hover:border-primary/30 hover:bg-secondary/50 transition-all group"
                    >
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold truncate pr-4">{source.title}</p>
                            <p className="text-[10px] text-muted-foreground truncate opacity-60">{new URL(source.url).hostname}</p>
                        </div>
                        <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary shrink-0" />
                    </a>
                ))}
            </div>
          </MetadataSection>
      )}

    </div>
  );
}