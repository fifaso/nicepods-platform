// components/creation-metadata.tsx
// VERSIÓN: 4.1 (Intelligence Hub - Enhanced Transparency & Direct Research Links)

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
  ChevronRight,
  Fingerprint
} from 'lucide-react';
import { ResearchSource, CreationMetadataPayload } from '@/types/podcast';
import { cn } from "@/lib/utils";

function MetadataSection({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
    return (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
                <Icon className="h-3 w-3" />
                <span>{title}</span>
            </div>
            <div className="pl-4 border-l border-primary/10 space-y-4">
                {children}
            </div>
        </div>
    );
}

function DataRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value || value === "undefined") return null;
  return (
    <div className="group transition-all duration-300">
      <p className="text-[10px] text-muted-foreground/50 font-bold uppercase tracking-tight mb-0.5">{label}</p>
      <p className="text-sm text-foreground/90 font-medium leading-relaxed group-hover:text-primary transition-colors">{value}</p>
    </div>
  );
}

export function CreationMetadata({ data, sources = [] }: { data: CreationMetadataPayload | any; sources?: ResearchSource[] }) {
  if (!data) {
    return (
      <div className="p-6 rounded-2xl border border-dashed border-border/40 text-center bg-secondary/5">
          <Fingerprint className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground italic font-medium">Arquitectura de creación no recuperable para este registro.</p>
      </div>
    );
  }

  // Fallbacks estratégicos para compatibilidad con flujos legacy
  const style = data.style || (data.creation_mode === 'remix' ? 'remix' : 'solo');
  const inputs = data.inputs || {};
  const agentName = data.agentName || "Arquitecto Base";

  return (
    <div className="space-y-10 py-4 max-w-full overflow-hidden">
      
      {/* 1. IDENTIDAD DE INTELIGENCIA */}
      <MetadataSection title="Identidad Creativa" icon={Bot}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            <DataRow label="Metodología" value={
                style === 'solo' ? 'Monólogo Estructurado' : 
                style === 'link' ? 'Sintetizador de Ejes' : 
                style === 'archetype' ? 'Narrativa de Arquetipo' : 
                data.creation_mode === 'remix' ? 'Hilo de Respuesta' : 'Producción Estándar'
            } />
            <DataRow label="Agente Inteligente" value={agentName} />
            <DataRow label="Nivel de Análisis" value={inputs.depth || "Estándar"} />
            <DataRow label="Tono de Voz" value={inputs.tone || inputs.selectedTone || "Equilibrado"} />
        </div>
      </MetadataSection>

      {/* 2. CONTEXTO SEMILLA (PROVENANCE) */}
      <MetadataSection title="Contexto Semilla" icon={Lightbulb}>
        <div className="space-y-4">
            {style === 'solo' && (
              <>
                <DataRow label="Eje Temático Principal" value={inputs.topic} />
                <DataRow label="Motivación de Búsqueda" value={inputs.motivation || inputs.goal} />
              </>
            )}
            {style === 'link' && (
              <>
                <div className="flex flex-wrap items-center gap-2 py-1">
                    <span className="text-xs font-black text-primary/80 bg-primary/5 px-2.5 py-1.5 rounded-lg border border-primary/10 shadow-sm">{inputs.topicA}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/20" />
                    <span className="text-xs font-black text-primary/80 bg-primary/5 px-2.5 py-1.5 rounded-lg border border-primary/10 shadow-sm">{inputs.topicB}</span>
                </div>
                <DataRow label="Catalizador Creativo" value={inputs.catalyst} />
              </>
            )}
            {data.creation_mode === 'remix' && (
              <DataRow label="Postura e Intervención" value={data.user_reaction} />
            )}
        </div>
      </MetadataSection>

      {/* 3. BIBLIOGRAFÍA DE INVESTIGACIÓN (TRANSPARENCIA TOTAL) */}
      {sources && sources.length > 0 && (
          <MetadataSection title="Evidencia y Fuentes" icon={Globe}>
            <div className="grid grid-cols-1 gap-2.5">
                {sources.map((source, index) => (
                    <a 
                      key={index} 
                      href={source.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border/30 hover:border-primary/40 hover:bg-secondary/40 transition-all group"
                    >
                        <div className="min-w-0 flex-1 pr-4">
                            <p className="text-xs font-bold text-foreground/90 truncate mb-0.5">{source.title}</p>
                            <p className="text-[10px] text-muted-foreground/60 truncate font-mono uppercase tracking-tighter">
                                {new URL(source.url).hostname}
                            </p>
                        </div>
                        <div className="p-2 rounded-lg bg-background/50 group-hover:bg-primary/10 transition-colors">
                            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary shrink-0" />
                        </div>
                    </a>
                ))}
            </div>
          </MetadataSection>
      )}

    </div>
  );
}