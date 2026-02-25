// hooks/use-search-radar.ts
// VERSIÓN: 3.5

"use client";

import { useState, useEffect, useCallback } from "react";
import { searchGlobalIntelligence, SearchActionResponse } from "@/actions/search-actions";

/**
 * TIPO: SearchResult
 * Define la estructura unificada de los nodos semánticos que devuelve el RPC.
 * Garantiza que la interfaz pueda identificar si es un podcast, un usuario, un 
 * hecho atómico o un lugar físico (Madrid Resonance).
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
 * Configura los parámetros de entrada del radar según el contexto donde se invoque.
 */
interface UseSearchRadarOptions {
  limit?: number;
  latitude?: number;
  longitude?: number;
}

/**
 * HOOK: useSearchRadar
 * El núcleo reactivo del descubrimiento en NicePod V2.5.
 * 
 * [CARACTERÍSTICAS V3.5]:
 * 1. Disparo Manual: No hay auto-search; protege la cuota de la API.
 * 2. Persistencia V4: Soporta y purga el historial de búsquedas.
 * 3. Auto-Saneamiento: La función clearRadar purga el input para evitar estados zombis.
 */
export function useSearchRadar(options: UseSearchRadarOptions = {}) {
  const { 
    limit = 30, 
    latitude, 
    longitude 
  } = options;

  // --- ESTADOS DE LA CONSOLA ---
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // --- ESTADO DE LA MEMORIA (HISTORIAL) ---
  const [history, setHistory] = useState<string[]>([]);

  /**
   * PROTOCOLO INICIAL: loadRadarHistory
   * Recupera el historial confirmado desde el almacenamiento local del dispositivo.
   */
  useEffect(() => {
    const savedHistory = localStorage.getItem("nicepod_radar_history_v4");
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        // Restringimos a 6 elementos para evitar que el dropdown sature la pantalla móvil.
        setHistory(Array.isArray(parsed) ? parsed.slice(0, 6) : []);
      } catch (err) {
        console.warn("⚠️ [SearchRadar] Historial local corrupto. Purgando sector de memoria.");
        localStorage.removeItem("nicepod_radar_history_v4");
      }
    }
  }, []);

  /**
   * ACCIÓN: saveToHistory
   * Registra una búsqueda exitosa, asegurando que sea única y prioritaria.
   */
  const saveToHistory = useCallback((term: string) => {
    const cleanTerm = term.trim();
    if (cleanTerm.length < 3) return;

    setHistory((prev) => {
      // Filtramos cualquier duplicado existente antes de insertarlo al principio.
      const filtered = prev.filter((item) => item.toLowerCase() !== cleanTerm.toLowerCase());
      const newHistory = [cleanTerm, ...filtered].slice(0, 6);
      localStorage.setItem("nicepod_radar_history_v4", JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);

  /**
   * ACCIÓN CORE: performSearch
   * Invoca el motor de inteligencia en el Edge (Deno) mediante el Server Action.
   */
  const performSearch = useCallback(async (searchTerm: string) => {
    const target = searchTerm.trim();
    
    // Barrera 1: No procesar intenciones vacías o demasiado cortas.
    if (target.length < 3) {
      setError("Se requieren al menos 3 caracteres para iniciar el radar.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.info(`🔍 [SearchRadar] Ejecutando pulso para intención: "${target}"`);

      const response: SearchActionResponse<SearchResult[]> = await searchGlobalIntelligence(
        target,
        latitude,
        longitude,
        limit
      );

      if (response.success) {
        setResults(response.results || []);
        
        // Si el motor devuelve éxito, consideramos la búsqueda válida para el historial.
        saveToHistory(target);
      } else {
        setError(response.message || "Fallo en la estabilización de la señal de radar.");
        setResults([]);
      }
    } catch (err: any) {
      console.error("🔥 [SearchRadar-Fatal]:", err.message);
      setError("Error crítico de red. La Bóveda no responde.");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [latitude, longitude, limit, saveToHistory]);

  /**
   * ACCIÓN DE SANEAMIENTO: clearRadar
   * Purga absoluta de la sesión de búsqueda actual.
   * [UX]: Vital para asegurar que la próxima vez que el usuario abra la lupa,
   * encuentre un lienzo en blanco (Historial) y no su búsqueda anterior a medias.
   */
  const clearRadar = useCallback(() => {
    setQuery("");
    setResults([]);
    setError(null);
    setIsLoading(false);
  }, []);

  /**
   * ACCIÓN DE CURADURÍA: removeTermFromHistory
   * Permite al usuario borrar elementos específicos de su memoria de búsqueda.
   */
  const removeTermFromHistory = useCallback((term: string) => {
    setHistory((prev) => {
      const newHistory = prev.filter(t => t !== term);
      localStorage.setItem("nicepod_radar_history_v4", JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);

  return {
    // Estados Reactivos
    query,
    results,
    isLoading,
    error,
    history,
    // Acciones de Control
    setQuery,
    performSearch,
    clearRadar,
    saveToHistory,
    removeTermFromHistory
  };
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Independencia Total: Al eliminar el Debounce (temporizador automático), 
 *    el hook se vuelve predecible. La función performSearch solo corre cuando 
 *    la interfaz se lo ordena explícitamente (Enter / Click).
 * 2. Limpieza Garantizada: La función clearRadar garantiza que el estado de
 *    la consola 'The Void' se resetee, ofreciendo una experiencia inmaculada
 *    cada vez que el usuario acciona el trigger.
 */