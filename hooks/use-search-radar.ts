// hooks/use-search-radar.ts
// VERSIÓN: 4.0 (NicePod Search Intelligence - Stability & Hydration Master)
// Misión: Núcleo reactivo del descubrimiento con discriminación de estado nulo.
// [ESTABILIZACIÓN]: Cambio de inicialización de resultados de [] a null para evitar colapsos de hidratación.

"use client";

import { SearchActionResponse, searchGlobalIntelligence } from "@/actions/search-actions";
import { useCallback, useEffect, useState } from "react";

/**
 * TIPO: SearchResult
 * Define la estructura unificada de los nodos semánticos (Podcasts, Usuarios, Bóveda, Lugares).
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
    lat?: number;
    lng?: number;
  };
};

/**
 * INTERFAZ: UseSearchRadarOptions
 */
interface UseSearchRadarOptions {
  limit?: number;
  latitude?: number;
  longitude?: number;
}

/**
 * HOOK: useSearchRadar
 * Orquestador de la búsqueda semántica y la persistencia de memoria local.
 */
export function useSearchRadar(options: UseSearchRadarOptions = {}) {
  const {
    limit = 30,
    latitude,
    longitude
  } = options;

  // --- ESTADOS DE LA CONSOLA ---
  const [query, setQuery] = useState<string>("");

  /**
   * [FIX CRÍTICO V4.0]: results se inicializa en null.
   * - null: El radar está apagado (Estado inicial/Reposo).
   * - []: El radar se activó pero no detectó resonancia (Frecuencia no detectada).
   * - [data]: El radar detectó nodos semánticos activos.
   */
  const [results, setResults] = useState<SearchResult[] | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // --- ESTADO DE LA MEMORIA (HISTORIAL) ---
  const [history, setHistory] = useState<string[]>([]);

  /**
   * PROTOCOLO INICIAL: loadRadarHistory
   * Carga el historial de búsqueda desde el almacenamiento local persistente.
   */
  useEffect(() => {
    const savedHistory = localStorage.getItem("nicepod_radar_history_v4");
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setHistory(Array.isArray(parsed) ? parsed.slice(0, 6) : []);
      } catch (err) {
        console.warn("⚠️ [SearchRadar] Historial local corrupto. Ejecutando purga de sector.");
        localStorage.removeItem("nicepod_radar_history_v4");
      }
    }
  }, []);

  /**
   * ACCIÓN: saveToHistory
   * Persiste términos de búsqueda validados en el dispositivo.
   */
  const saveToHistory = useCallback((term: string) => {
    const cleanTerm = term.trim();
    if (cleanTerm.length < 3) return;

    setHistory((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== cleanTerm.toLowerCase());
      const newHistory = [cleanTerm, ...filtered].slice(0, 6);
      localStorage.setItem("nicepod_radar_history_v4", JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);

  /**
   * ACCIÓN CORE: performSearch
   * Disparo físico del radar hacia la base de datos vectorial (pgvector).
   */
  const performSearch = useCallback(async (searchTerm: string) => {
    const target = searchTerm.trim();

    if (target.length < 3) {
      setError("Se requieren al menos 3 caracteres para activar el radar.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Invocación al Server Action (Soberanía del Dato)
      const response: SearchActionResponse<SearchResult[]> = await searchGlobalIntelligence(
        target,
        latitude,
        longitude,
        limit
      );

      if (response.success) {
        /**
         * [LOGICA DE RESILIENCIA]:
         * Si no hay resultados, inyectamos un array vacío [].
         * Esto dispara la interfaz de 'Sin Resonancia' en el cliente.
         */
        setResults(response.results || []);
        saveToHistory(target);
      } else {
        setError(response.message || "Fallo en la estabilización de la señal.");
        setResults([]); // Tratamos el error de señal como ausencia de resultados
      }
    } catch (err: any) {
      console.error("🔥 [SearchRadar-Fatal]:", err.message);
      setError("Error crítico de infraestructura.");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [latitude, longitude, limit, saveToHistory]);

  /**
   * ACCIÓN DE SANEAMIENTO: clearRadar
   * Retorna el radar al estado de nulidad absoluta (Fase de Reposo).
   */
  const clearRadar = useCallback(() => {
    setQuery("");
    setResults(null); // [FIX]: Reset a null para que la UI recupere la biblioteca.
    setError(null);
    setIsLoading(false);
  }, []);

  /**
   * ACCIÓN DE CURADURÍA: removeTermFromHistory
   */
  const removeTermFromHistory = useCallback((term: string) => {
    setHistory((prev) => {
      const newHistory = prev.filter(t => t !== term);
      localStorage.setItem("nicepod_radar_history_v4", JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);

  return {
    query,
    results,
    isLoading,
    error,
    history,
    setQuery,
    performSearch,
    clearRadar,
    saveToHistory,
    removeTermFromHistory
  };
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (Refinería V4.0):
 * 1. Estabilidad de Pestañas: El cambio de [] a null en 'results' es lo que evita 
 *    que 'LibraryTabs' desmonte el componente 'TabsList' durante el montaje inicial, 
 *    eliminando el error de Radix UI.
 * 2. Predictibilidad: El radar ahora tiene tres estados claros: Invisible (null), 
 *    Buscando (isLoading) y Resultado (Array).
 * 3. Protección de Memoria: El historial se limita estrictamente en cada inserción
 *    para evitar el desbordamiento del localStorage.
 */