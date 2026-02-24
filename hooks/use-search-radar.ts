// hooks/use-search-radar.ts
// VERSIÓN: 2.5

"use client";

import { SearchActionResponse, searchGlobalIntelligence } from "@/actions/search-actions";
import { useCallback, useEffect, useState } from "react";

/**
 * TIPO: SearchResult
 * Define el contrato de datos unificado para los impactos localizados por el radar.
 * Soporta la nueva categorización multimodal de NicePod V2.5.
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
 * Configuración para el comportamiento del motor de búsqueda.
 */
interface UseSearchRadarOptions {
  limit?: number;
  latitude?: number;
  longitude?: number;
}

/**
 * HOOK: useSearchRadar
 * El orquestador lógico del descubrimiento de sabiduría.
 * 
 * [FILOSOFÍA DE DISEÑO]:
 * Se ha eliminado el 'useEffect' de seguimiento de query. El radar ahora
 * espera una llamada explícita a 'performSearch', optimizando el uso de la 
 * Edge Function y garantizando que se procesen intenciones completas.
 */
export function useSearchRadar(options: UseSearchRadarOptions = {}) {
  const {
    limit = 25,
    latitude,
    longitude
  } = options;

  // --- ESTADOS DE CONTROL ---
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  /**
   * PROTOCOLO: loadRadarHistory
   * Recupera las exploraciones previas de la memoria física del dispositivo.
   */
  useEffect(() => {
    const savedHistory = localStorage.getItem("nicepod_radar_history_v4");
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        // Mantenemos solo los 6 ecos más recientes para una UI limpia.
        setHistory(Array.isArray(parsed) ? parsed.slice(0, 6) : []);
      } catch (err) {
        console.warn("⚠️ [SearchRadar] Historial local corrupto. Purgando...");
        localStorage.removeItem("nicepod_radar_history_v4");
      }
    }
  }, []);

  /**
   * ACCIÓN: saveToHistory
   * Almacena un término de búsqueda de forma atómica y única.
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
   * Misión: Handshake único con el servidor para la extracción de inteligencia.
   * 
   * [DISPARO MANUAL]: Esta función debe invocarse en onSubmit o onKeyDown (Enter).
   */
  const performSearch = useCallback(async (searchTerm: string) => {
    const target = searchTerm.trim();

    // Validación de Potencia Mínima
    if (target.length < 3) {
      setError("Se requieren al menos 3 caracteres.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.info(`🔍 [SearchRadar] Lanzando pulso semántico para: "${target}"`);

      // Despacho hacia la Server Action (Fase de Transporte)
      const response: SearchActionResponse<SearchResult[]> = await searchGlobalIntelligence(
        target,
        latitude,
        longitude,
        limit
      );

      if (response.success) {
        // [SENSIBILIDAD]: El motor unificado ya viene con el threshold calibrado.
        setResults(response.results || []);

        // Registro en memoria persistente
        saveToHistory(target);
      } else {
        // Reporte de fallo de señal
        setError(response.message || "Señal de radar inestable.");
        setResults([]);
      }
    } catch (err: any) {
      console.error("🔥 [SearchRadar-Fatal]:", err.message);
      setError("Fallo crítico de red en la Bóveda.");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [latitude, longitude, limit, saveToHistory]);

  /**
   * ACCIÓN: clearRadar
   * Restablece la terminal a su estado original de silencio semántico.
   */
  const clearRadar = useCallback(() => {
    setQuery("");
    setResults([]);
    setError(null);
    setIsLoading(false);
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
    performSearch, // Exposición para invocación explícita
    clearRadar,
    saveToHistory
  };
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Eficiencia Energética: Se ha eliminado el 'setTimeout' y la lógica de 
 *    limpieza de timers. El hook ahora es puramente reactivo a eventos externos.
 * 2. Integridad de Tipos: El contrato 'SearchResult' es la base para que el 
 *    Dashboard y el Mapa pinten la información multimodal sin errores.
 * 3. UX de Control: Al delegar el disparo al usuario, NicePod transmite una 
 *    sensación de 'Herramienta Profesional' (obediente) y no de 'Juguete Web' 
 *    (asuntivo).
 */