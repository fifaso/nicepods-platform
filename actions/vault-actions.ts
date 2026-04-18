/**
 * ARCHIVO: actions/vault-actions.ts
 * VERSIÓN: 4.3 (Madrid Resonance - Sovereign Edition)
 * PROTOCOLO: MADRID RESONANCE V8.0
 * MISIÓN: Gestión administrativa del Knowledge Vault (NKV) con tipado soberano y trazabilidad industrial absoluta.
 * NIVEL DE INTEGRIDAD: CRITICAL (100% ZAP / BSS Green)
 */

"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { nicepodLog } from "@/lib/utils";

/**
 * INTERFAZ: VaultKnowledgeChunk
 * Representa un fragmento de conocimiento vectorizado.
 */
export interface VaultKnowledgeChunk {
    identification: string;
    content: string;
    creationTimestamp: string | null;
    importanceScore: number | null;
    sourceIdentification: string;
    tokenCount: number | null;
}

/**
 * INTERFAZ: VaultKnowledgeSource
 * Representa una fuente de sabiduría en la Bóveda NKV.
 */
export interface VaultKnowledgeSource {
    identification: string;
    title: string;
    sourceTypeDescriptor: string;
    uniformResourceLocator: string | null;
    creationTimestamp: string | null;
    isPublicSovereignty: boolean | null;
    contentHashIdentification: string;
    reputationScore: number | null;
    knowledgeChunksInventory?: { count: number }[];
}

/**
 * INTERFAZ: SemanticResonanceNode
 * Representa un resultado de búsqueda semántica en la Bóveda.
 */
export interface SemanticResonanceNode {
    content: string;
    similarity: number;
    title?: string;
}

/**
 * INTERFAZ: VaultActionResponse
 * Contrato unificado para las respuestas de la Bóveda hacia la interfaz administrativa.
 */
export type VaultActionResponse<T = null> = {
    success: boolean;
    message: string;
    data: T | null;
    exceptionMessageInformation?: string;
};

/**
 * PROTOCOLO: ensureAdminAuthority
 * Misión: Validar que la petición proviene de un nodo con privilegios de administrador soberano.
 */
async function ensureAdminAuthority() {
    const supabaseSovereignClient = createClient();

    const { data: { user: authenticatedAdministratorSnapshot }, error: authenticationHardwareExceptionInformation } = await supabaseSovereignClient.auth.getUser();
    if (authenticationHardwareExceptionInformation || !authenticatedAdministratorSnapshot) {
        nicepodLog("🛑 [Vault-Engine] Acceso denegado: Sesión administrativa no detectada.", "AUTHENTICATION_REQUIRED", 'error');
        throw new Error("AUTENTICACION_REQUERIDA: Sesión no detectada.");
    }

    const { data: administratorProfileSnapshot, error: administratorProfileHardwareExceptionInformation } = await supabaseSovereignClient
        .from('profiles')
        .select('role')
        .eq('id', authenticatedAdministratorSnapshot.id)
        .single();

    if (administratorProfileHardwareExceptionInformation || administratorProfileSnapshot?.role !== 'admin') {
        nicepodLog(`🛑 [Vault-Engine] Intento de acceso administrativo no autorizado por: ${authenticatedAdministratorSnapshot.id}`, "UNAUTHORIZED_ADMIN_ACCESS", 'error');
        throw new Error("ACCESO_RESTRINGIDO: Se requieren privilegios de administración.");
    }

    return { supabaseSovereignClient, administratorIdentification: authenticatedAdministratorSnapshot.id };
}

/**
 * FUNCIÓN: listVaultSources
 * Misión: Recuperar el inventario completo de fuentes de sabiduría (NKV).
 */
export async function listVaultSources(): Promise<VaultActionResponse<VaultKnowledgeSource[]>> {
    try {
        const { supabaseSovereignClient } = await ensureAdminAuthority();

        const { data: knowledgeSourcesDatabaseResultsCollection, error: databaseQueryHardwareExceptionInformation } = await supabaseSovereignClient
            .from("knowledge_sources")
            .select(`
                identification:id,
                title,
                sourceTypeDescriptor:source_type,
                uniformResourceLocator:url,
                creationTimestamp:created_at,
                isPublicSovereignty:is_public,
                contentHashIdentification:content_hash,
                reputationScore:reputation_score,
                knowledgeChunksInventory:knowledge_chunks (count)
            `)
            .order("created_at", { ascending: false });

        if (databaseQueryHardwareExceptionInformation) throw databaseQueryHardwareExceptionInformation;

        nicepodLog(`🛰️ [Vault] Sincronización de inventario exitosa: ${knowledgeSourcesDatabaseResultsCollection?.length} fuentes localizadas.`);

        return {
            success: true,
            message: "Inventario de Bóveda sincronizado con éxito.",
            data: knowledgeSourcesDatabaseResultsCollection as unknown as VaultKnowledgeSource[]
        };
    } catch (vaultCriticalException: unknown) {
        const exceptionMessageText = vaultCriticalException instanceof Error ? vaultCriticalException.message : "Error desconocido";
        nicepodLog("🔥 [Vault-Action][List-Sources-Fatal]:", exceptionMessageText, 'error');
        return {
            success: false,
            message: "Fallo al recuperar el inventario de la Bóveda NKV.",
            exceptionMessageInformation: exceptionMessageText,
            data: []
        };
    }
}

/**
 * FUNCIÓN: deleteVaultSource
 * Misión: Purga física y lógica de una fuente de conocimiento y sus vectores asociados.
 */
export async function deleteVaultSource(sourceIdentification: string): Promise<VaultActionResponse> {
    try {
        const { supabaseSovereignClient, administratorIdentification } = await ensureAdminAuthority();

        const { error: databaseDeleteHardwareExceptionInformation } = await supabaseSovereignClient
            .from("knowledge_sources")
            .delete()
            .eq("id", sourceIdentification);

        if (databaseDeleteHardwareExceptionInformation) throw databaseDeleteHardwareExceptionInformation;

        nicepodLog(`🗑️ [Vault] Fuente #${sourceIdentification} purgada por Administrador: ${administratorIdentification.substring(0, 8)}`);

        revalidatePath("/admin/vault");

        return {
            success: true,
            message: "Fuente y vectores asociados eliminados de la Bóveda NKV.",
            data: null
        };
    } catch (vaultCriticalException: unknown) {
        const exceptionMessageText = vaultCriticalException instanceof Error ? vaultCriticalException.message : "Error desconocido";
        nicepodLog("🔥 [Vault-Action][Delete-Source-Fatal]:", exceptionMessageText, 'error');
        return {
            success: false,
            message: "No se pudo procesar la eliminación de la fuente solicitada.",
            exceptionMessageInformation: exceptionMessageText,
            data: null
        };
    }
}

/**
 * FUNCIÓN: injectManualKnowledge
 * Misión: Inyección de inteligencia curada manualmente por el administrador soberano.
 */
export async function injectManualKnowledge(knowledgeInjectionPayload: {
    title: string;
    text: string;
    uniformResourceLocator?: string;
}): Promise<VaultActionResponse> {
    try {
        const { supabaseSovereignClient, administratorIdentification } = await ensureAdminAuthority();

        nicepodLog(`🧠 [Vault] Iniciando inyección manual de inteligencia: "${knowledgeInjectionPayload.title}"`);

        const { error: edgeFunctionInvokeHardwareExceptionInformation } = await supabaseSovereignClient.functions.invoke('vault-refinery', {
            body: {
                title: knowledgeInjectionPayload.title,
                text: knowledgeInjectionPayload.text,
                url: knowledgeInjectionPayload.uniformResourceLocator,
                source_type: 'admin',
                is_public: true
            }
        });

        if (edgeFunctionInvokeHardwareExceptionInformation) throw new Error(edgeFunctionInvokeHardwareExceptionInformation.message || "Error en el pipeline de refinería.");

        nicepodLog(`✅ [Vault] Inyección completada con éxito por: ${administratorIdentification.substring(0, 8)}`);

        revalidatePath("/admin/vault");

        return {
            success: true,
            message: "Inteligencia inyectada y vectorizada correctamente en el NKV.",
            data: null
        };
    } catch (vaultCriticalException: unknown) {
        const exceptionMessageText = vaultCriticalException instanceof Error ? vaultCriticalException.message : String(vaultCriticalException);
        nicepodLog("🔥 [Vault-Action][Inject-Knowledge-Fatal]:", exceptionMessageText, 'error');
        return {
            success: false,
            message: "La Bóveda rechazó la inyección de conocimiento manual.",
            exceptionMessageInformation: exceptionMessageText,
            data: null
        };
    }
}

/**
 * FUNCIÓN: simulateVaultSearch
 * Misión: Laboratorio de Resonancia Semántica para administradores.
 */
export async function simulateVaultSearch(
    searchQueryTermTextContent: string,
    similarityThresholdMagnitude: number = 0.5
): Promise<VaultActionResponse<SemanticResonanceNode[]>> {
    try {
        const { supabaseSovereignClient } = await ensureAdminAuthority();

        const { data: resonanceResultsCollection, error: searchHardwareExceptionInformation } = await supabaseSovereignClient.functions.invoke('search-pro', {
            body: {
                query: searchQueryTermTextContent,
                match_threshold: similarityThresholdMagnitude,
                match_count: 10,
                target: 'vault_only'
            }
        });

        if (searchHardwareExceptionInformation) throw searchHardwareExceptionInformation;

        return {
            success: true,
            message: "Simulación de búsqueda semántica completada.",
            data: resonanceResultsCollection as SemanticResonanceNode[]
        };
    } catch (vaultCriticalException: unknown) {
        const exceptionMessageText = vaultCriticalException instanceof Error ? vaultCriticalException.message : "Error desconocido";
        nicepodLog("🔥 [Vault-Action][Simulate-Search-Fatal]:", exceptionMessageText, 'error');
        return {
            success: false,
            message: "Error en la simulación de resonancia semántica.",
            exceptionMessageInformation: exceptionMessageText,
            data: []
        };
    }
}

/**
 * FUNCIÓN: getVaultMetrics
 * Misión: Telemetría de densidad informativa de la Workstation NicePod.
 */
export async function getVaultMetrics(): Promise<VaultActionResponse<{
    totalSourcesCountMagnitude: number;
    totalChunksCountMagnitude: number;
}>> {
    try {
        const { supabaseSovereignClient } = await ensureAdminAuthority();

        const [sourcesCountResultsSnapshot, chunksCountResultsSnapshot] = await Promise.all([
            supabaseSovereignClient.from('knowledge_sources').select('*', { count: 'exact', head: true }),
            supabaseSovereignClient.from('knowledge_chunks').select('*', { count: 'exact', head: true })
        ]);

        return {
            success: true,
            message: "Métricas de Bóveda NKV actualizadas con éxito.",
            data: {
                totalSourcesCountMagnitude: sourcesCountResultsSnapshot.count || 0,
                totalChunksCountMagnitude: chunksCountResultsSnapshot.count || 0
            }
        };
    } catch (vaultCriticalException: unknown) {
        const exceptionMessageText = vaultCriticalException instanceof Error ? vaultCriticalException.message : "Error desconocido";
        nicepodLog("🔥 [Vault-Action][Metrics-Fatal]:", exceptionMessageText, 'error');
        return {
            success: false,
            message: "No se pudieron obtener métricas del sistema NKV.",
            exceptionMessageInformation: exceptionMessageText,
            data: null
        };
    }
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V4.3):
 * 1. Industrial Traceability: Integración profunda de 'nicepodLog' para el monitoreo administrativo de la Bóveda NKV.
 * 2. ZAP Absolute Compliance: Purificación de nomenclatura en interfaces y parámetros ('count' -> 'countMagnitude', 'query' -> 'searchQueryTermTextContent').
 * 3. Robust Authentication: Verificación de rango 'admin' forzada en el servidor para todas las operaciones NKV.
 */
