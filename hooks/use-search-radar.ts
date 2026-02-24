// hooks/use-search-radar.ts
// VERSIÓN: 2.0

"use client";

import { SearchActionResponse, searchGlobalIntelligence } from "@/actions/search-actions";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * TIPO: SearchResult
 * Define el contrato de datos unificado para los impactos localizados por el radar.
 * Refleja fielmente la salida del RPC 'unified_search_v4'.
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
 * Configuración dinámica para el comportamiento del radar semántico.
 */
interface UseSearchRadarOptions {
  debounceMs?: number;
  limit?: number;
  latitude?: number;
  longitude?: number;
}

/**
 * HOOK: useSearchRadar
 * El motor lógico que alimenta la terminal de búsqueda inmersiva de NicePod V2.5.
 * 
 * [RESPONSABILIDADES]:
 * 1. Gestionar el estado de la consulta (query) y los resultados (results).
 * 2. Orquestar el historial de exploraciones persistente en LocalStorage.
 * 3. Ejecutar el 'Debounce' para optimizar costos de API y rendimiento del hilo principal.
 * 4. Sincronizar el contexto geoespacial con el motor de búsqueda.
 */
export function useSearchRadar(options: UseSearchRadarOptions = {}) {
  const {
    debounceMs = 600,
    limit = 20,
    latitude,
    longitude
  } = options;

  // --- ESTADOS DE CONTROL DEL RADAR ---
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  // Referencia para la gestión del temporizador de escritura (Debounce)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  /**
   * PROTOCOLO: loadRadarHistory
   * Misión: Recuperar las exploraciones confirmadas desde la memoria física del dispositivo.
   * [VERSIONAMIENTO]: v4 para asegurar compatibilidad con la nueva estructura de Lugares.
   */
  useEffect(() => {
    const savedHistory = localStorage.getItem("nicepod_radar_history_v4");
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        // Limitamos el historial a los 6 ecos más recientes para mantener la elegancia de la consola.
        setHistory(Array.isArray(parsed) ? parsed.slice(0, 6) : []);
      } catch (err) {
        console.warn("⚠️ [SearchRadar] Historial local corrupto. Iniciando purga.");
        localStorage.removeItem("nicepod_radar_history_v4");
      }
    }
  }, []);

  /**
   * ACCIÓN: saveToHistory
   * Misión: Almacenar un término de búsqueda de forma atómica y única.
   */
  const saveToHistory = useCallback((term: string) => {
    const cleanTerm = term.trim();
    if (cleanTerm.length < 3) return;

    setHistory((prev) => {
      // Evitamos duplicidad y movemos el término al inicio del array.
      const filtered = prev.filter((item) => item.toLowerCase() !== cleanTerm.toLowerCase());
      const newHistory = [cleanTerm, ...filtered].slice(0, 6);
      localStorage.setItem("nicepod_radar_history_v4", JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);

  /**
   * ACCIÓN CORE: performSearch
   * Misión: El Handshake final con el servidor para la extracción de inteligencia.
   * 
   * [ARQUITECTURA]:
   * Invoca a la Server Action 'searchGlobalIntelligence' la cual actúa como 
   * pasarela hacia la Edge Function 'search-pro' en Deno 2.
   */
  const performSearch = useCallback(async (searchTerm: string) => {
    const target = searchTerm.trim();

    // Validación de Potencia: Mínimo 3 caracteres para activar el pulso semántico.
    if (target.length < 3) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.info(`🔍 [SearchRadar] Lanzando pulso semántico: "${target}"`);

      const response: SearchActionResponse<SearchResult[]> = await searchGlobalIntelligence(
        target,
        latitude,
        longitude,
        limit
      );

      if (response.success) {
        setResults(response.results || []);

        // Si el término es nuevo y exitoso, lo registramos en la memoria persistente.
        if (target !== query) {
          saveToHistory(target);
        }
      } else {
        // Reporte de error desde el subsistema (Edge / SQL)
        setError(response.message || "La señal del radar es inestable.");
        setResults([]);
      }
    } catch (err: any) {
      console.error("🔥 [SearchRadar-Fatal]:", err.message);
      setError("Fallo crítico de comunicación con el motor semántico.");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [latitude, longitude, limit, query, saveToHistory]);

  /**
   * ACCIÓN: clearRadar
   * Misión: Restablecer la terminal a su estado original de silencio.
   */
  const clearRadar = useCallback(() => {
    setQuery("");
    setResults([]);
    setError(null);
    setIsLoading(false);
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
  }, []);

  /**
   * EFECTO: Debounce Orchestrator
   * Misión: Vigilar la escritura del curador y disparar el radar tras el reposo.
   * Este protocolo ahorra tokens de IA y reduce la carga del servidor.
   */
  useEffect(() => {
    // Cancelamos cualquier ejecución pendiente si el usuario sigue escribiendo.
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (query.trim().length >= 3) {
      // Feedback Visual Instantáneo
      setIsLoading(true);

      debounceTimer.current = setTimeout(() => {
        performSearch(query);
      }, debounceMs);
    } else if (query.trim().length === 0) {
      // Limpieza instantánea si el input se vacía.
      setResults([]);
      setIsLoading(false);
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query, debounceMs, performSearch]);

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
    saveToHistory
  };
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Independencia de UI: Este hook puede alimentar tanto a la 'UnifiedSearchBar'
 *    de pantalla completa como a un buscador de comandos tipo Ctrl+P.
 * 2. Optimización Termodinámica: El uso de 'useCallback' y 'useRef' garantiza 
 *    que el hook no genere re-renderizados innecesarios en el Dashboard, 
 *    manteniendo la plataforma a 60 FPS consistentes.
 * 3. Escalabilidad Multimodal: La interfaz 'SearchResult' está preparada para 
 *    recibir metadatos variables (JSONB), permitiendo que el sistema crezca 
 *    con nuevos tipos de hallazgos sin modificar este código.
 */