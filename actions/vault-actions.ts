//actions/vault-actions.ts
//VERSIÓN: 2.0 (NicePod Vault Engine - Industrial Admin & NKV Standard)
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * INTERFAZ: VaultActionResponse
 * Contrato unificado para las respuestas de la Bóveda hacia la interfaz administrativa.
 */
export type VaultActionResponse<T = null> = {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
};

/**
 * PROTOCOLO: ensureAdminAuthority
 * Misión: Validar que la petición proviene de un nodo con privilegios administrativos.
 * 
 * Este guardia realiza una doble verificación:
 * 1. Validación de Token (JWT) mediante el motor de Supabase Auth.
 * 2. Validación de Rol en la tabla 'profiles' para prevenir escalada de privilegios.
 */
async function ensureAdminAuthority() {
    const supabase = createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        throw new Error("AUTENTICACION_REQUERIDA: Sesión no detectada.");
    }

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profileError || profile?.role !== 'admin') {
        throw new Error("ACCESO_RESTRINGIDO: Se requieren privilegios de administración.");
    }

    return { supabase, adminId: user.id };
}

/**
 * FUNCIÓN: listVaultSources
 * Misión: Recuperar el inventario completo de fuentes de sabiduría (NKV).
 * 
 * [OPTIMIZACIÓN]: Incluye conteo de 'knowledge_chunks' para evaluar la densidad 
 * semántica de cada entrada en la Bóveda.
 */
export async function listVaultSources(): Promise<VaultActionResponse<any[]>> {
    try {
        const { supabase } = await ensureAdminAuthority();

        const { data, error } = await supabase
            .from("knowledge_sources")
            .select(`
        *,
        knowledge_chunks (count)
      `)
            .order("created_at", { ascending: false });

        if (error) throw error;

        return {
            success: true,
            message: "Inventario de Bóveda sincronizado con éxito.",
            data: data || []
        };
    } catch (err: any) {
        console.error("🔥 [Vault-Action][List-Sources]:", err.message);
        return {
            success: false,
            message: "Fallo al recuperar el inventario de la Bóveda.",
            error: err.message,
            data: []
        };
    }
}

/**
 * FUNCIÓN: deleteVaultSource
 * Misión: Purga física y lógica de una fuente de conocimiento y sus vectores asociados.
 * 
 * [INTEGRIDAD]: Gracias al esquema PostgreSQL, la eliminación dispara un CASCADE 
 * que limpia automáticamente los 'knowledge_chunks' del índice HNSW.
 */
export async function deleteVaultSource(sourceId: string): Promise<VaultActionResponse> {
    try {
        const { supabase } = await ensureAdminAuthority();

        const { error } = await supabase
            .from("knowledge_sources")
            .delete()
            .eq("id", sourceId);

        if (error) throw error;

        // Sincronizamos la visualización administrativa tras la purga.
        revalidatePath("/admin/vault");

        return {
            success: true,
            message: "Fuente y vectores asociados eliminados de la Bóveda."
        };
    } catch (err: any) {
        console.error("🔥 [Vault-Action][Delete-Source]:", err.message);
        return {
            success: false,
            message: "No se pudo procesar la eliminación de la fuente.",
            error: err.message
        };
    }
}

/**
 * FUNCIÓN: injectManualKnowledge
 * Misión: Inyección de inteligencia curada manualmente por el administrador.
 * 
 * [PROCESAMIENTO]: Envía el crudo a la Edge Function 'vault-refinery' para:
 * 1. Generar Hash SHA-256 (Deduplicación).
 * 2. Destilar hechos atómicos mediante IA Flash.
 * 3. Generar Embeddings de 768 dimensiones.
 */
export async function injectManualKnowledge(payload: {
    title: string;
    text: string;
    url?: string;
}): Promise<VaultActionResponse> {
    try {
        const { supabase } = await ensureAdminAuthority();

        // Invocación a la Refinería de Bóveda (NKV Pipeline)
        const { data, error: functionError } = await supabase.functions.invoke('vault-refinery', {
            body: {
                ...payload,
                source_type: 'admin',
                is_public: true
            }
        });

        if (functionError) throw new Error(functionError.message || "Error en el pipeline de refinería.");

        revalidatePath("/admin/vault");

        return {
            success: true,
            message: "Inteligencia inyectada y vectorizada correctamente."
        };
    } catch (err: any) {
        console.error("🔥 [Vault-Action][Inject-Knowledge]:", err.message);
        return {
            success: false,
            message: "La Bóveda rechazó la inyección de conocimiento.",
            error: err.message
        };
    }
}

/**
 * FUNCIÓN: simulateVaultSearch
 * Misión: Laboratorio de Resonancia Semántica.
 * 
 * Permite a los administradores auditar qué fragmentos de verdad recuperaría la 
 * IA ante una consulta específica, permitiendo el ajuste de umbrales de similitud.
 */
export async function simulateVaultSearch(
    query: string,
    threshold: number = 0.5
): Promise<VaultActionResponse<any>> {
    try {
        const { supabase } = await ensureAdminAuthority();

        // Invocamos al buscador profesional (Search Pro)
        const { data, error: searchError } = await supabase.functions.invoke('search-pro', {
            body: {
                query,
                match_threshold: threshold,
                match_count: 10,
                target: 'vault_only'
            }
        });

        if (searchError) throw searchError;

        return {
            success: true,
            message: "Simulación de búsqueda completada.",
            data: data
        };
    } catch (err: any) {
        console.error("🔥 [Vault-Action][Simulate-Search]:", err.message);
        return {
            success: false,
            message: "Error en la simulación de resonancia.",
            error: err.message,
            data: []
        };
    }
}

/**
 * FUNCIÓN: getVaultMetrics
 * Misión: Telemetría de densidad informativa de NicePod V2.5.
 * 
 * Devuelve estadísticas vitales sobre la salud del NKV.
 */
export async function getVaultMetrics(): Promise<VaultActionResponse<{
    totalSources: number;
    totalChunks: number;
}>> {
    try {
        const { supabase } = await ensureAdminAuthority();

        const [sourcesCount, chunksCount] = await Promise.all([
            supabase.from('knowledge_sources').select('*', { count: 'exact', head: true }),
            supabase.from('knowledge_chunks').select('*', { count: 'exact', head: true })
        ]);

        return {
            success: true,
            message: "Métricas de Bóveda actualizadas.",
            data: {
                totalSources: sourcesCount.count || 0,
                totalChunks: chunksCount.count || 0
            }
        };
    } catch (err: any) {
        return {
            success: false,
            message: "No se pudieron obtener métricas del sistema.",
            error: err.message
        };
    }
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Seguridad Hermética: El uso de 'ensureAdminAuthority' en cada acción previene 
 *    ejecuciones no autorizadas desde el cliente.
 * 2. Economía Circular: La integración con 'vault-refinery' garantiza que el 
 *    conocimiento manual siga el mismo rigor de hashing y vectorización que el 
 *    conocimiento recolectado automáticamente.
 * 3. Observabilidad: Se ha añadido 'getVaultMetrics' para que el administrador 
 *    tenga una visión holística del crecimiento del capital intelectual.
 */