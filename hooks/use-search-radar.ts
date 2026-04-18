/**
 * ARCHIVO: hooks/use-search-radar.ts
 * VERSIÓN: 5.0 (NicePod Search Intelligence - Industrial Radar Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Orquestar el descubrimiento semántico reactivo mediante la base de 
 * datos vectorial, gestionando la persistencia de la memoria táctica local.
 * [REFORMA V5.0]: Resolución definitiva de TS2724 (SearchRadarResult Export). 
 * Aplicación absoluta de la Zero Abbreviations Policy (ZAP). Blindaje del 
 * Build Shield Sovereignty (BSS) eliminando tipos 'any'.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { 
  SearchActionResponse, 
  searchGlobalIntelligence 
} from "@/actions/search-actions";
import { useCallback, useEffect, useState } from "react";
import { nicepodLog } from "@/lib/utils";

/**
 * TIPO: SearchRadarResultCategory
 * Taxonomía de los nodos de inteligencia recuperables por el radar.
 */
export type SearchRadarResultCategory = 
  | 'podcast' 
  | 'user' 
  | 'vault_chunk' 
  | 'place';

/**
 * TIPO: SearchRadarResultMetadata
 * Dossier de metadatos técnicos para la discriminación visual del resultado.
 */
export type SearchRadarResultMetadata = {
  authorDisplayName?: string;
  playbackDurationSeconds?: number;
  creationMode?: string;
  reputationScoreMagnitude?: number;
  categoryMission?: string;
  sourceUniformResourceLocator?: string;
  latitudeCoordinate?: number;
  longitudeCoordinate?: number;
};

/**
 * TIPO: SearchRadarResult
 * [RESOLUCIÓN TS2724]: Exportación nominal alineada con el Dashboard.
 * Define la estructura unificada de los nodos semánticos en la terminal.
 */
export type SearchRadarResult = {
  resultCategoryType: SearchRadarResultCategory;
  identification: string;
  titleTextContent: string;
  subtitleContentText: string;
  imageUniformResourceLocator?: string;
  semanticSimilarityMagnitude: number;
  geographicDistanceMagnitude?: number;
  intellectualMetadata?: SearchRadarResultMetadata;
};

/**
 * INTERFAZ: UseSearchRadarIntelligenceOptions
 */
interface UseSearchRadarIntelligenceOptions {
  resultsLimitMagnitude?: number;
  latitudeCoordinate?: number;
  longitudeCoordinate?: number;
}

/**
 * HOOK: useSearchRadarIntelligence
 * El motor reactivo de descubrimiento para la Workstation NicePod.
 */
export function useSearchRadarIntelligence(options: UseSearchRadarIntelligenceOptions = {}) {
  const {
    resultsLimitMagnitude = 30,
    latitudeCoordinate,
    longitudeCoordinate
  } = options;

  // --- I. ESTADOS DE LA CONSOLA TÁCTICA (ZAP COMPLIANT) ---
  const [currentSearchQueryText, setCurrentSearchQueryText] = useState<string>("");

  /**
   * searchRadarResultsCollection: Inicialización en 'null' para control de hidratación.
   * - null: Radar en reposo (Estado Inicial).
   * - []: Radar activo con frecuencia cero (Sin Resonancia).
   * - [SearchRadarResult]: Radar con detección de nodos semánticos.
   */
  const [searchRadarResultsCollection, setSearchRadarResultsCollection] = useState<SearchRadarResult[] | null>(null);

  const [isSearchProcessActive, setIsSearchProcessActive] = useState<boolean>(false);
  const [operationalHardwareException, setOperationalHardwareException] = useState<string | null>(null);

  // --- II. ESTADO DE LA MEMORIA TÁCTICA (HISTORIAL) ---
  const [searchHistoryCollection, setSearchHistoryCollection] = useState<string[]>([]);
  const TACTICAL_HISTORY_STORAGE_KEY = "nicepod_tactical_search_history_v12";

  /**
   * loadTacticalSearchHistoryAction:
   * Misión: Recuperar el historial desde el Metal del dispositivo al arrancar.
   */
  useEffect(() => {
    const serializedHistory = localStorage.getItem(TACTICAL_HISTORY_STORAGE_KEY);
    if (serializedHistory) {
      try {
        const parsedHistory = JSON.parse(serializedHistory);
        setSearchHistoryCollection(Array.isArray(parsedHistory) ? parsedHistory.slice(0, 6) : []);
      } catch (hardwareException) {
        nicepodLog("⚠️ [Search-Radar] Historial corrupto. Ejecutando purga.", hardwareException, 'warning');
        localStorage.removeItem(TACTICAL_HISTORY_STORAGE_KEY);
      }
    }
  }, []);

  /**
   * saveSearchQueryToHistoryAction:
   * Misión: Persistir términos validados protegiendo la cuota de almacenamiento.
   */
  const saveSearchQueryToHistoryAction = useCallback((queryText: string) => {
    const cleanQueryText = queryText.trim();
    if (cleanQueryText.length < 3) return;

    setSearchHistoryCollection((previousHistoryState) => {
      const filteredHistory = previousHistoryState.filter(
        (item) => item.toLowerCase() !== cleanQueryText.toLowerCase()
      );
      const updatedHistory = [cleanQueryText, ...filteredHistory].slice(0, 6);
      localStorage.setItem(TACTICAL_HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
      return updatedHistory;
    });
  }, []);

  /**
   * executeSearchRadarAction:
   * Misión: Disparo físico del radar hacia la base de datos vectorial (pgvector).
   * [BSS]: Erradicación de 'any' mediante el uso de 'unknown' y tipado estricto de respuesta.
   */
  const executeSearchRadarAction = useCallback(async (searchQueryText: string) => {
    const sanitizedTargetText = searchQueryText.trim();

    if (sanitizedTargetText.length < 3) {
      setOperationalHardwareException("Se requieren al menos 3 caracteres para activar el radar.");
      return;
    }

    setIsSearchProcessActive(true);
    setOperationalHardwareException(null);

    try {
      // Invocación al Server Action (Soberanía del Dato)
      const actionResponse: SearchActionResponse<SearchRadarResult[]> = await searchGlobalIntelligence(
        sanitizedTargetText,
        latitudeCoordinate,
        longitudeCoordinate,
        resultsLimitMagnitude
      );

      if (actionResponse.success) {
        setSearchRadarResultsCollection(actionResponse.results || []);
        saveSearchQueryToHistoryAction(sanitizedTargetText);
      } else {
        setOperationalHardwareException(actionResponse.message || "Fallo en la estabilización de señal.");
        setSearchRadarResultsCollection([]); 
      }
    } catch (hardwareException: unknown) {
      const exceptionMessage = hardwareException instanceof Error ? hardwareException.message : "Fallo de infraestructura.";
      nicepodLog("🔥 [Search-Radar-Fatal]", exceptionMessage, 'exceptionInformation');
      setOperationalHardwareException(exceptionMessage);
      setSearchRadarResultsCollection([]);
    } finally {
      setIsSearchProcessActive(false);
    }
  }, [latitudeCoordinate, longitudeCoordinate, resultsLimitMagnitude, saveSearchQueryToHistoryAction]);

  /**
   * clearSearchRadarAction:
   * Misión: Retornar el radar a la fase de reposo absoluto.
   */
  const clearSearchRadarAction = useCallback(() => {
    setCurrentSearchQueryText("");
    setSearchRadarResultsCollection(null);
    setOperationalHardwareException(null);
    setIsSearchProcessActive(false);
  }, []);

  /**
   * removeSearchTermFromHistoryAction:
   * Misión: Eliminación quirúrgica de un nodo del historial local.
   */
  const removeSearchTermFromHistoryAction = useCallback((termToRemove: string) => {
    setSearchHistoryCollection((previousHistoryState) => {
      const updatedHistory = previousHistoryState.filter(term => term !== termToRemove);
      localStorage.setItem(TACTICAL_HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
      return updatedHistory;
    });
  }, []);

  return {
    currentSearchQueryText,
    searchRadarResultsCollection,
    isSearchProcessActive,
    operationalHardwareException,
    searchHistoryCollection,
    setCurrentSearchQueryText,
    executeSearchRadarAction,
    clearSearchRadarAction,
    saveSearchQueryToHistoryAction,
    removeSearchTermFromHistoryAction
  };
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V5.0):
 * 1. Zero Abbreviations Policy (ZAP): Purga absoluta. 'id' -> 'identification', 
 *    'lat' -> 'latitudeCoordinate', 'lng' -> 'longitudeCoordinate', 'res' -> 'results'.
 * 2. TS2724 Resolution: Se renombró el tipo a 'SearchRadarResult' para satisfacer la 
 *    importación del DashboardClient, sellando la comunicación entre capas.
 * 3. BSS Contract Seal: Se definió 'SearchRadarResultMetadata' con precisión industrial 
 *    para evitar el uso de objetos genéricos en la UI del radar.
 */