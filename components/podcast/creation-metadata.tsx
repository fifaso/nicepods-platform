/**
 * ARCHIVO: components/podcast/creation-metadata.tsx
 * VERSIÓN: 8.0 (NicePod Intelligence Meta - Build Shield Final Seal Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Renderizar la arquitectura de creación del podcast, exponiendo la 
 * configuración de agentes, telemetría de ubicación y fuentes de evidencia 
 * con precisión pericial de grado industrial.
 * [REFORMA V8.0]: Resolución definitiva de 18 errores de tipo (TS2551, TS2339, TS2322). 
 * Sincronización nominal absoluta con 'CreationMetadataPayload' V12.0 y 
 * 'DiscoveryContextPayload' V12.0. Aplicación integral de la ley ZAP.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { 
  CreationMetadataPayload, 
  ResearchSource, 
  LocalRecommendation 
} from '@/types/podcast';
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
import { classNamesUtility } from '@/lib/utils';

/**
 * INTERFAZ: IntelligenceMetadataSectionProperties
 */
interface IntelligenceMetadataSectionProperties {
  titleTextContent: string;
  IconComponent: React.ElementType;
  children: React.ReactNode;
}

/**
 * IntelligenceMetadataSection: Contenedor estandarizado para bloques técnicos.
 */
function IntelligenceMetadataSection({ 
  titleTextContent, 
  IconComponent, 
  children 
}: IntelligenceMetadataSectionProperties) {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-700 isolate">
      <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">
        <IconComponent className="h-4 w-4 text-primary/40" />
        <span>{titleTextContent}</span>
      </div>
      <div className="pl-5 border-l-2 border-primary/5 space-y-5">
        {children}
      </div>
    </div>
  );
}

/**
 * INTERFAZ: IntelligenceDataRowProperties
 */
interface IntelligenceDataRowProperties {
  labelHeaderText: string;
  displayValue: string | number | null | undefined;
  IconComponent?: React.ElementType;
}

/**
 * IntelligenceDataRow: Fila de datos de alta densidad para inspección.
 * [RESOLUCIÓN TS2322]: Control de tipos para evitar asignaciones de objetos vacíos.
 */
function IntelligenceDataRow({ labelHeaderText, displayValue, IconComponent }: IntelligenceDataRowProperties) {
  if (displayValue === null || displayValue === undefined || displayValue === "undefined" || displayValue === "") {
    return null;
  }
  
  // Garantizamos que el valor sea una cadena o número para el Cristal.
  const finalDisplayContent = typeof displayValue === 'object' ? JSON.stringify(displayValue) : String(displayValue);

  return (
    <div className="group transition-all duration-500 isolate">
      <div className="flex items-center gap-2 mb-1">
        {IconComponent && <IconComponent className="h-3 w-3 text-zinc-700 group-hover:text-primary transition-colors" />}
        <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">{labelHeaderText}</p>
      </div>
      <p className="text-sm text-zinc-300 font-bold leading-relaxed group-hover:text-white transition-colors">
        {finalDisplayContent}
      </p>
    </div>
  );
}

/**
 * CreationMetadata: El componente de peritaje de la arquitectura de Inteligencia Artificial.
 */
export function CreationMetadata({ 
  intelligenceMetadata, 
  intelligenceResearchSourcesCollection = [] 
}: { 
  intelligenceMetadata: CreationMetadataPayload | null; 
  intelligenceResearchSourcesCollection?: ResearchSource[] 
}) {
  
  if (!intelligenceMetadata) {
    return (
      <div className="p-8 rounded-[2rem] border-2 border-dashed border-white/5 text-center bg-white/[0.02] isolate">
        <Fingerprint className="h-10 w-10 text-zinc-800 mx-auto mb-4 animate-pulse" />
        <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest italic">
            Arquitectura de creación inaccesible en la Bóveda Staging.
        </p>
      </div>
    );
  }

  /** 
   * [SINCRO V8.0 - RESOLUCIÓN TS2551]: 
   * Normalización de variables basada en los descriptores purificados V12.0.
   */
  const methodologyStyleIdentifier = intelligenceMetadata.style || 
    (intelligenceMetadata.creationMode === 'remix' ? 'remix' : 'standard');
  
  const methodologyInputsDossier = intelligenceMetadata.inputs || {};
  const agentIntelligenceNameDescriptor = intelligenceMetadata.agentName || "Arquitecto Base";
  const discoveryContextDossier = intelligenceMetadata.discoveryContext;

  return (
    <div className="space-y-12 py-6 max-w-full overflow-hidden isolate">

      {/* I. ADN DE INTELIGENCIA (IDENTIDAD CREATIVA) */}
      <IntelligenceMetadataSection titleTextContent="Identidad de IA Aplicada" IconComponent={Bot}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
          <IntelligenceDataRow 
            labelHeaderText="Metodología de Forja" 
            displayValue={
              methodologyStyleIdentifier === 'solo' ? 'Monólogo Cognitivo Estructurado' :
              methodologyStyleIdentifier === 'link' ? 'Sintetizador de Ejes Temáticos' :
              methodologyStyleIdentifier === 'local_concierge' ? 'Guía de Resonancia Situacional' :
              intelligenceMetadata.creationMode === 'remix' ? 'Hilo de Respuesta Neuronal' : 'Producción Estándar'
            } 
          />
          <IntelligenceDataRow labelHeaderText="Agente de Autoridad" displayValue={agentIntelligenceNameDescriptor} />
          <IntelligenceDataRow 
            labelHeaderText="Nivel de Peritaje" 
            displayValue={methodologyInputsDossier.narrativeDepth || methodologyInputsDossier.depthValue || "Análisis Estándar"} 
          />
          <IntelligenceDataRow 
            labelHeaderText="Frecuencia Emocional" 
            displayValue={methodologyInputsDossier.voiceStyleSelection || methodologyInputsDossier.selectedToneIdentifier || "Equilibrada"} 
          />
        </div>
      </IntelligenceMetadataSection>

      {/* II. CONTEXTO GEODÉSICO (UBICACIÓN) [RESOLUCIÓN TS2339] */}
      {(intelligenceMetadata.geographicLocation || discoveryContextDossier) && (
        <IntelligenceMetadataSection titleTextContent="Telemetría Geodésica Verificada" IconComponent={MapPin}>
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <IntelligenceDataRow
                labelHeaderText="Anclaje de Origen"
                displayValue={intelligenceMetadata.geographicLocation?.placeName || discoveryContextDossier?.detectedPointOfInterestName || "Malla Urbana"}
                IconComponent={Navigation}
              />
              <IntelligenceDataRow
                labelHeaderText="Coordenadas de Silicio"
                displayValue={intelligenceMetadata.geographicLocation 
                  ? `${intelligenceMetadata.geographicLocation.latitudeCoordinate.toFixed(5)}°N, ${intelligenceMetadata.geographicLocation.longitudeCoordinate.toFixed(5)}°E` 
                  : "Triangulación por Oráculo"}
                IconComponent={MapPin}
              />
            </div>
            {discoveryContextDossier?.imageAnalysisSummaryContent && (
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 shadow-inner isolate">
                <p className="text-[9px] font-black uppercase text-primary mb-2 tracking-widest">Inferencia de Visión Artificial</p>
                <p className="text-xs text-zinc-400 italic leading-relaxed">"{discoveryContextDossier.imageAnalysisSummaryContent}"</p>
              </div>
            )}
          </div>
        </IntelligenceMetadataSection>
      )}

      {/* III. HALLAZGOS LOCALES [RESOLUCIÓN TS2339] */}
      {discoveryContextDossier?.recommendationsCollection && discoveryContextDossier.recommendationsCollection.length > 0 && (
        <IntelligenceMetadataSection titleTextContent="Dossier de Resonancia Local" IconComponent={Landmark}>
          <div className="grid grid-cols-1 gap-3">
            {discoveryContextDossier.recommendationsCollection.map((recommendationItem: LocalRecommendation, itemIndex: number) => (
              <div key={itemIndex} className="flex flex-col p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors group isolate">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-black text-primary uppercase tracking-widest">
                    {recommendationItem.category}
                  </span>
                  {recommendationItem.hasSpecificPodcastAttached && (
                    <FileCheck className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
                  )}
                </div>
                <p className="text-sm font-black text-white uppercase tracking-tight group-hover:text-primary transition-colors">
                  {recommendationItem.name}
                </p>
                <p className="text-xs text-zinc-500 line-clamp-2 mt-1.5 leading-relaxed">
                    {recommendationItem.descriptionTextContent}
                </p>
              </div>
            ))}
          </div>
        </IntelligenceMetadataSection>
      )}

      {/* IV. SEMILLA COGNITIVA (INTENCIONALIDAD) [RESOLUCIÓN TS2322] */}
      <IntelligenceMetadataSection titleTextContent="Semilla de Capital Intelectual" IconComponent={Lightbulb}>
        <div className="space-y-6">
          {methodologyStyleIdentifier === 'solo' && (
            <>
              <IntelligenceDataRow labelHeaderText="Eje Temático Principal" displayValue={methodologyInputsDossier.topic || methodologyInputsDossier.soloTopicSelection} />
              <IntelligenceDataRow labelHeaderText="Motivación de la Crónica" displayValue={methodologyInputsDossier.motivationText || methodologyInputsDossier.soloMotivationContentText} />
            </>
          )}
          {methodologyStyleIdentifier === 'link' && (
            <div className="space-y-6 isolate">
              <div className="flex flex-wrap items-center gap-3 py-2">
                <span className="text-[10px] font-black text-primary bg-primary/10 px-4 py-2 rounded-xl border border-primary/20 shadow-xl uppercase tracking-widest">
                    {methodologyInputsDossier.topicA || methodologyInputsDossier.linkTopicPrimary}
                </span>
                <ChevronRight className="h-5 w-5 text-zinc-800" />
                <span className="text-[10px] font-black text-primary bg-primary/10 px-4 py-2 rounded-xl border border-primary/20 shadow-xl uppercase tracking-widest">
                    {methodologyInputsDossier.topicB || methodologyInputsDossier.linkTopicSecondary}
                </span>
              </div>
              <IntelligenceDataRow labelHeaderText="Catalizador de Síntesis" displayValue={methodologyInputsDossier.catalyst || methodologyInputsDossier.linkCatalystElement} />
            </div>
          )}
          {intelligenceMetadata.creationMode === 'remix' && (
            <IntelligenceDataRow labelHeaderText="Reacción de Voz del Voyager" displayValue={intelligenceMetadata.userReactionContent} />
          )}
        </div>
      </IntelligenceMetadataSection>

      {/* V. BIBLIOGRAFÍA DE GROUNDING [SINCRO V8.0] */}
      {intelligenceResearchSourcesCollection && intelligenceResearchSourcesCollection.length > 0 && (
        <IntelligenceMetadataSection titleTextContent="Evidencias de Autoridad" IconComponent={Globe}>
          <div className="grid grid-cols-1 gap-3">
            {intelligenceResearchSourcesCollection.map((researchSourceItem, sourceIndex) => (
              <a
                key={sourceIndex}
                href={researchSourceItem.uniformResourceLocator}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-primary/40 hover:bg-white/[0.04] transition-all duration-500 group isolate"
              >
                <div className="min-w-0 flex-1 pr-6">
                  <p className="text-xs font-black text-white uppercase tracking-tight truncate mb-1 group-hover:text-primary transition-colors">
                    {researchSourceItem.title}
                  </p>
                  <p className="text-[9px] text-zinc-600 truncate font-mono uppercase tracking-widest">
                    {new URL(researchSourceItem.uniformResourceLocator).hostname}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 group-hover:bg-primary/10 transition-colors">
                  <ExternalLink className="h-4 w-4 text-zinc-700 group-hover:text-primary shrink-0" />
                </div>
              </a>
            ))}
          </div>
        </IntelligenceMetadataSection>
      )}

    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V8.0):
 * 1. Build Shield Final Sync: Resolución de 18 errores de tipo mediante el mapeo pericial 
 *    hacia 'CreationMetadataPayload' e 'DiscoveryContextPayload' (V12.0).
 * 2. ZAP Absolute Compliance: Purificación total. Se eliminaron términos como 'data', 
 *    'inputs', 'idx' o 'res' en favor de descriptores de dominio precisos.
 * 3. Type Safe DataRows: La implementación de 'IntelligenceDataRow' garantiza que tipos 
 *    complejos 'unknown' sean normalizados a texto antes de su renderizado, evitando 
 *    colapsos en el cristal de la terminal.
 */