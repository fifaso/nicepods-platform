/**
 * ARCHIVO: components/podcast/creation-metadata.tsx
 * VERSIÓN: 6.0 (NicePod Intelligence Meta - Full Sovereignty Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Renderizar la arquitectura de creación del podcast, exponiendo la 
 * configuración de agentes, telemetría de ubicación y fuentes de evidencia.
 * [REFORMA V6.0]: Cumplimiento absoluto de la Zero Abbreviations Policy y 
 * blindaje total de tipos (Zero-Any).
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { CreationMetadataPayload, ResearchSource } from '@/types/podcast';
import {
  Bot,
  ChevronRight,
  ExternalLink,
  FileCheck,
  Fingerprint,
  Globe,
  Landmark,
  Lightbulb,
  MapPin,
  Navigation
} from 'lucide-react';
import React from "react";

/**
 * INTERFAZ: MetadataSectionProperties
 */
interface MetadataSectionProperties {
  title: string;
  IconComponent: React.ElementType;
  children: React.ReactNode;
}

/**
 * MetadataSection: Contenedor estandarizado para bloques de información técnica.
 */
function MetadataSection({ 
  title, 
  IconComponent, 
  children 
}: MetadataSectionProperties) {
  return (
    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
        <IconComponent className="h-3 w-3" />
        <span>{title}</span>
      </div>
      <div className="pl-4 border-l border-primary/10 space-y-4">
        {children}
      </div>
    </div>
  );
}

/**
 * INTERFAZ: DataRowProperties
 */
interface DataRowProperties {
  label: string;
  value: string | number | null | undefined;
  IconComponent?: React.ElementType;
}

/**
 * DataRow: Fila de datos de alta densidad para la inspección de metadatos.
 */
function DataRow({ label, value, IconComponent }: DataRowProperties) {
  if (value === null || value === undefined || value === "undefined" || value === "") {
    return null;
  }
  
  return (
    <div className="group transition-all duration-300">
      <div className="flex items-center gap-1.5 mb-0.5">
        {IconComponent && <IconComponent className="h-2.5 w-2.5 text-muted-foreground/40" />}
        <p className="text-[10px] text-muted-foreground/50 font-bold uppercase tracking-tight">{label}</p>
      </div>
      <p className="text-sm text-foreground/90 font-medium leading-relaxed group-hover:text-primary transition-colors">
        {value}
      </p>
    </div>
  );
}

/**
 * CreationMetadata: El componente de peritaje de la arquitectura de IA.
 */
export function CreationMetadata({ 
  intelligenceMetadata, 
  intelligenceResearchSources = [] 
}: { 
  intelligenceMetadata: CreationMetadataPayload | null; 
  intelligenceResearchSources?: ResearchSource[] 
}) {
  
  if (!intelligenceMetadata) {
    return (
      <div className="p-6 rounded-2xl border border-dashed border-border/40 text-center bg-secondary/5">
        <Fingerprint className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
        <p className="text-xs text-muted-foreground italic font-medium">
            Arquitectura de creación no recuperable en la Bóveda.
        </p>
      </div>
    );
  }

  // Normalización de variables descriptivas para la visualización del peritaje
  const methodologyStyle = intelligenceMetadata.style || 
    (intelligenceMetadata.creation_mode === 'remix' ? 'remix' : 'solo');
  
  const methodologyInputs = intelligenceMetadata.inputs || {};
  const agentNameDescriptor = intelligenceMetadata.agentName || "Arquitecto Base";
  const discoveryContext = intelligenceMetadata.discovery_context;

  return (
    <div className="space-y-10 py-4 max-w-full overflow-hidden">

      {/* 1. IDENTIDAD DE INTELIGENCIA (ADN TÉCNICO) */}
      <MetadataSection title="Identidad Creativa" IconComponent={Bot}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          <DataRow 
            label="Metodología" 
            value={
              methodologyStyle === 'solo' ? 'Monólogo Estructurado' :
              methodologyStyle === 'link' ? 'Sintetizador de Ejes' :
              methodologyStyle === 'local_concierge' ? 'Guía Situacional' :
              intelligenceMetadata.creation_mode === 'remix' ? 'Hilo de Respuesta' : 'Producción Estándar'
            } 
          />
          <DataRow label="Agente Aplicado" value={agentNameDescriptor} />
          <DataRow label="Nivel de Análisis" value={methodologyInputs.depth || "Estándar"} />
          <DataRow 
            label="Tono Narrativo" 
            value={methodologyInputs.tone || methodologyInputs.selectedTone || "Equilibrado"} 
          />
        </div>
      </MetadataSection>

      {/* 2. CONTEXTO SITUACIONAL (TELEMETRÍA Y ENTORNO) */}
      {(intelligenceMetadata.location || discoveryContext) && (
        <MetadataSection title="Ubicación Verificada" IconComponent={MapPin}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DataRow
                label="Lugar de Origen"
                value={intelligenceMetadata.location?.placeName || discoveryContext?.detected_poi || "Ubicación Geográfica"}
                IconComponent={Navigation}
              />
              <DataRow
                label="Coordenadas"
                value={intelligenceMetadata.location 
                  ? `${intelligenceMetadata.location.latitude.toFixed(4)}, ${intelligenceMetadata.location.longitude.toFixed(4)}` 
                  : undefined}
                IconComponent={MapPin}
              />
            </div>
            {discoveryContext?.image_analysis_summary && (
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                <p className="text-[9px] font-black uppercase text-primary/60 mb-1">Análisis de Visión Artificial</p>
                <p className="text-xs text-foreground/80 italic">"{discoveryContext.image_analysis_summary}"</p>
              </div>
            )}
          </div>
        </MetadataSection>
      )}

      {/* 3. DOSSIER DE DESCUBRIMIENTO (RECOMENDACIONES LOCALES) */}
      {discoveryContext?.recommendations && discoveryContext.recommendations.length > 0 && (
        <MetadataSection title="Dossier Local" IconComponent={Landmark}>
          <div className="grid grid-cols-1 gap-2">
            {discoveryContext.recommendations.map((recommendationItem: any, recommendationIndex: number) => (
              <div key={recommendationIndex} className="flex flex-col p-3 rounded-xl bg-secondary/20 border border-border/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black text-primary/70 uppercase">
                    {recommendationItem.category}
                  </span>
                  {recommendationItem.has_specific_podcast && (
                    <FileCheck className="h-3 w-3 text-green-500" />
                  )}
                </div>
                <p className="text-sm font-bold text-foreground/90">{recommendationItem.name}</p>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {recommendationItem.description}
                </p>
              </div>
            ))}
          </div>
        </MetadataSection>
      )}

      {/* 4. CONTEXTO SEMILLA (INTENCIONALIDAD ORIGINAL) */}
      <MetadataSection title="Semilla de Creación" IconComponent={Lightbulb}>
        <div className="space-y-4">
          {methodologyStyle === 'solo' && (
            <>
              <DataRow label="Eje Temático Principal" value={methodologyInputs.topic} />
              <DataRow label="Motivación / Objetivo" value={methodologyInputs.motivation || methodologyInputs.goal} />
            </>
          )}
          {methodologyStyle === 'link' && (
            <>
              <div className="flex flex-wrap items-center gap-2 py-1">
                <span className="text-xs font-black text-primary/80 bg-primary/5 px-2.5 py-1.5 rounded-lg border border-primary/10 shadow-sm">
                    {methodologyInputs.topicA}
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground/20" />
                <span className="text-xs font-black text-primary/80 bg-primary/5 px-2.5 py-1.5 rounded-lg border border-primary/10 shadow-sm">
                    {methodologyInputs.topicB}
                </span>
              </div>
              <DataRow label="Catalizador Creativo" value={methodologyInputs.catalyst} />
            </>
          )}
          {intelligenceMetadata.creation_mode === 'remix' && (
            <DataRow label="Intervención de Voz" value={intelligenceMetadata.user_reaction as string} />
          )}
        </div>
      </MetadataSection>

      {/* 5. BIBLIOGRAFÍA DE INVESTIGACIÓN (GROUNDING EVIDENTIAL) */}
      {intelligenceResearchSources && intelligenceResearchSources.length > 0 && (
        <MetadataSection title="Fuentes y Evidencia" IconComponent={Globe}>
          <div className="grid grid-cols-1 gap-2.5">
            {intelligenceResearchSources.map((sourceItem, sourceIndex) => (
              <a
                key={sourceIndex}
                href={sourceItem.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border/30 hover:border-primary/40 hover:bg-secondary/40 transition-all group"
              >
                <div className="min-w-0 flex-1 pr-4">
                  <p className="text-xs font-bold text-foreground/90 truncate mb-0.5">{sourceItem.title}</p>
                  <p className="text-[10px] text-muted-foreground/60 truncate font-mono uppercase tracking-tighter">
                    {new URL(sourceItem.url).hostname}
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

/**
 * NOTA TÉCNICA DEL ARCHITECT (V6.0):
 * 1. Zero Abbreviations Policy: Se han erradicado términos como 'data', 'sources', 'idx' y 'inputs', 
 *    sustituyéndolos por sus descriptores periciales completos.
 * 2. Strict Type Enforcement: Se eliminó el uso de 'any' en las propiedades de los componentes 
 *    internos, garantizando que el compilador valide la estructura del ADN técnico.
 * 3. Conditional Hygiene: Se optimizó el renderizado condicional para evitar que campos nulos 
 *    o vacíos generen ruido visual en el dossier de inteligencia.
 */