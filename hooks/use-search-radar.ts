// hooks/use-search-radar.ts
// VERSIÓN: 3.0

"use client";

import { useState, useEffect, useCallback } from "react";
import { searchGlobalIntelligence, SearchActionResponse } from "@/actions/search-actions";

/**
 * TIPO: SearchResult
 * Define el contrato de datos inquebrantable para NicePod V2.5.
 * Proporciona una estructura unificada para Podcasts, Usuarios, Bóveda y Lugares.
 */
export type SearchResult = {
  result_type: 'podcast' | 'user' | 'vault_chunk' | 'place';
  id: string;
  title: string;
  subtitle: string;
  image_url?: string;
  similarity: number;
  geo_distance?: number;
  metadata?: {
    author?: string;
    duration?: number;
    mode?: string;
    reputation?: number;
    category?: string;
    source_url?: string;
    lat?: number; // Coordenada latitud para saltos al mapa
    lng?: number; // Coordenada longitud para saltos al mapa
  };
};

/**
 * INTERFAZ: UseSearchRadarOptions
 * Configuración estratégica para el motor de búsqueda según el contexto (Mapa o Dashboard).
 */
interface UseSearchRadarOptions {
  limit?: number;
  latitude?: number;
  longitude?: number;
  threshold?: number;
}

/**
 * HOOK: useSearchRadar
 * El orquestador de inteligencia reactiva para NicePod V2.5.
 * 
 * Responsabilidades:
 * 1. Gestionar la intención (query) y los hallazgos (results).
 * 2. Administrar el historial de resonancia persistente (v4).
 * 3. Ejecutar el protocolo de búsqueda única (Manual Trigger).
 */
export function useSearchRadar(options: UseSearchRadarOptions = {}) {
  const { 
    limit = 30, 
    latitude, 
    longitude,
    threshold = 0.18 // Sensibilidad optimizada para fase Alpha
  } = options;

  // --- ESTADOS DE CONTROL DE RADAR ---
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  /**
   * PROTOCOLO: loadRadarHistory
   * Misión: Recuperar la memoria local del curador desde el almacenamiento físico.
   */
  useEffect(() => {
    const savedHistory = localStorage.getItem("nicepod_radar_history_v4");
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        // Mantenemos solo los 6 ecos más recientes para una UX de alta densidad.
        setHistory(Array.isArray(parsed) ? parsed.slice(0, 6) : []);
      } catch (err) {
        console.warn("⚠️ [SearchRadar] Error en memoria local. Reiniciando historial.");
        localStorage.removeItem("nicepod_radar_history_v4");
      }
    }
  }, []);

  /**
   * ACCIÓN: saveToHistory
   * Misión: Registrar un término de búsqueda de forma atómica y única.
   */
  const saveToHistory = useCallback((term: string) => {
    const cleanTerm = term.trim();
    if (cleanTerm.length < 3) return;

    setHistory((prev) => {
      // Purgamos duplicados y priorizamos la entrada más reciente.
      const filtered = prev.filter((item) => item.toLowerCase() !== cleanTerm.toLowerCase());
      const newHistory = [cleanTerm, ...filtered].slice(0, 6);
      localStorage.setItem("nicepod_radar_history_v4", JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);

  /**
   * ACCIÓN CORE: performSearch
   * Misión: Ejecutar la extracción de inteligencia desde la Bóveda Global.
   * 
   * [HANDSHAKE INDUSTRIAL]:
   * Invoca a la Server Action 'searchGlobalIntelligence', delegando la 
   * vectorización a la Edge Function protegida por Arcjet.
   */
  const performSearch = useCallback(async (searchTerm: string) => {
    const target = searchTerm.trim();
    
    // Validación de Potencia Mínima para activar el motor.
    if (target.length < 3) {
      setError("Se requieren al menos 3 caracteres.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.info(`🔍 [SearchRadar] Iniciando escaneo de radar para: "${target}"`);

      const response: SearchActionResponse<SearchResult[]> = await searchGlobalIntelligence(
        target,
        latitude,
        longitude,
        limit
      );

      if (response.success) {
        // Normalizamos los resultados para asegurar que la UI reciba datos consistentes.
        const normalizedResults = (response.results || []).map(hit => ({
          ...hit,
          similarity: hit.similarity || 0,
          result_type: hit.result_type || 'podcast'
        }));

        setResults(normalizedResults);
        
        // Si el impacto es exitoso, registramos en el historial.
        saveToHistory(target);
      } else {
        // Reporte de fallo de subsistema.
        setError(response.message || "Señal de radar inestable.");
        setResults([]);
      }
    } catch (err: any) {
      console.error("🔥 [SearchRadar-Fatal]:", err.message);
      setError("Fallo crítico de comunicación con la Bóveda.");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [latitude, longitude, limit, saveToHistory]);

  /**
   * ACCIÓN: clearRadar
   * Misión: Restablecer la terminal a su estado original de silencio semántico.
   */
  const clearRadar = useCallback(() => {
    setQuery("");
    setResults([]);
    setError(null);
    setIsLoading(false);
  }, []);

  /**
   * ACCIÓN: removeTermFromHistory
   * Permite al usuario curar su propia memoria de búsqueda.
   */
  const removeTermFromHistory = useCallback((term: string) => {
    setHistory((prev) => {
      const newHistory = prev.filter(t => t !== term);
      localStorage.setItem("nicepod_radar_history_v4", JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);

  return {
    // ESTADOS
    query,
    results,
    isLoading,
    error,
    history,
    // ACCIONES
    setQuery,
    performSearch,
    clearRadar,
    saveToHistory,
    removeTermFromHistory
  };
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Protocolo de Comando: Al eliminar el autodisparo (debounce), convertimos
 *    el buscador en una herramienta técnica predecible. La intención solo se 
 *    procesa bajo la orden directa del usuario.
 * 2. Resiliencia de Datos: La versión v4 del historial asegura que los ecos 
 *    antiguos no colisionen con los nuevos tipos de datos multimodales.
 * 3. Diseño Profesional: Se expone 'removeTermFromHistory' para permitir una
 *    curaduría manual de la consola, típica de entornos Workstation.
 */