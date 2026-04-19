/**
 * ARCHIVO: actions/vault-actions.ts
 * VERSIÓN: 8.3 (Madrid Resonance - Sovereign Protocol V8.3)
 * PROTOCOLO: Madrid Resonance Protocol V8.3
 * MISIÓN: Gestión administrativa del Knowledge Vault (NKV) con tipado soberano y trazabilidad industrial.
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
 * Representa una fuente de sabiduría en la Bóveda.
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
    exceptionInformationText?: string;
};

/**
 * PROTOCOLO: ensureAdminAuthority
 *
 * INTENCIÓN ARQUITECTÓNICA:
 * Implementar una barrera de seguridad de "Confianza Cero" (Zero Trust) para acciones administrativas.
 * Verifica la identidad del usuario y su rol de 'admin' en el Metal antes de permitir cualquier mutación.
 */
async function ensureAdminAuthority() {
    const supabaseSovereignClient = createClient();

    const { data: { user: authenticatedAdministratorSnapshot }, error: authenticationHardwareExceptionInformation } = await supabaseSovereignClient.auth.getUser();
    if (authenticationHardwareExceptionInformation || !authenticatedAdministratorSnapshot) {
        nicepodLog("🛑 [Vault-Authority] Intento de acceso administrativo sin sesión válida.", "AUTHENTICATION_REQUIRED", 'exceptionInformation');
        throw new Error("AUTENTICACION_REQUERIDA: Sesión no detectada.");
    }

    const { data: administratorProfileSnapshot, error: administratorProfileHardwareExceptionInformation } = await supabaseSovereignClient
        .from('profiles')
        .select('role')
        .eq('id', authenticatedAdministratorSnapshot.id)
        .single();

    if (administratorProfileHardwareExceptionInformation || administratorProfileSnapshot?.role !== 'admin') {
        nicepodLog(
            "🛑 [Vault-Authority] Violación de privilegios administrativos detectada.",
            { userIdentification: authenticatedAdministratorSnapshot.id },
            'warning'
        );
        throw new Error("ACCESO_RESTRINGIDO: Se requieren privilegios de administración.");
    }

    return { supabaseSovereignClient, administratorIdentification: authenticatedAdministratorSnapshot.id };
}

/**
 * FUNCIÓN: listVaultSources
 *
 * INTENCIÓN ARQUITECTÓNICA:
 * Recuperar el inventario de fuentes de conocimiento (NKV) para su gestión en el panel administrativo.
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

        return {
            success: true,
            message: "Inventario de Bóveda sincronizado con éxito.",
            data: knowledgeSourcesDatabaseResultsCollection as unknown as VaultKnowledgeSource[]
        };
    } catch (exceptionInformation: unknown) {
        const exceptionInformationText = exceptionInformation instanceof Error ? exceptionInformation.message : "Error desconocido";
        nicepodLog("🔥 [Vault-Action][List-Sources]: Excepción en recuperación de inventario.", { exceptionInformationText }, 'exceptionInformation');
        return {
            success: false,
            message: "Fallo al recuperar el inventario de la Bóveda.",
            exceptionInformationText,
            data: []
        };
    }
}

/**
 * FUNCIÓN: deleteVaultSource
 *
 * INTENCIÓN ARQUITECTÓNICA:
 * Ejecutar la eliminación atómica de una fuente y sus vectores de conocimiento asociados.
 */
export async function deleteVaultSource(sourceIdentification: string): Promise<VaultActionResponse> {
    try {
        const { supabaseSovereignClient } = await ensureAdminAuthority();

        const { error: databaseDeleteHardwareExceptionInformation } = await supabaseSovereignClient
            .from("knowledge_sources")
            .delete()
            .eq("id", sourceIdentification);

        if (databaseDeleteHardwareExceptionInformation) throw databaseDeleteHardwareExceptionInformation;

        nicepodLog("🗑️ [Vault-Action][Delete-Source]: Fuente eliminada correctamente.", { sourceIdentification });
        revalidatePath("/admin/vault");

        return {
            success: true,
            message: "Fuente y vectores asociados eliminados de la Bóveda.",
            data: null
        };
    } catch (exceptionInformation: unknown) {
        const exceptionInformationText = exceptionInformation instanceof Error ? exceptionInformation.message : "Error desconocido";
        nicepodLog("🔥 [Vault-Action][Delete-Source]: Fallo en purga física.", { exceptionInformationText, sourceIdentification }, 'exceptionInformation');
        return {
            success: false,
            message: "No se pudo procesar la eliminación de la fuente.",
            exceptionInformationText,
            data: null
        };
    }
}

/**
 * FUNCIÓN: injectManualKnowledge
 *
 * INTENCIÓN ARQUITECTÓNICA:
 * Permitir la inyección de inteligencia curada por humanos en el pipeline de vectorización.
 */
export async function injectManualKnowledge(knowledgeInjectionPayload: {
    title: string;
    text: string;
    uniformResourceLocator?: string;
}): Promise<VaultActionResponse> {
    try {
        const { supabaseSovereignClient } = await ensureAdminAuthority();

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

        nicepodLog("🧪 [Vault-Action][Inject-Knowledge]: Inyección manual procesada por Refinería.");
        revalidatePath("/admin/vault");

        return {
            success: true,
            message: "Inteligencia inyectada y vectorizada correctamente.",
            data: null
        };
    } catch (exceptionInformation: unknown) {
        const exceptionInformationText = exceptionInformation instanceof Error ? exceptionInformation.message : String(exceptionInformation);
        nicepodLog("🔥 [Vault-Action][Inject-Knowledge]: Rechazo en pipeline de inyección.", { exceptionInformationText }, 'exceptionInformation');
        return {
            success: false,
            message: "La Bóveda rechazó la inyección de conocimiento.",
            exceptionInformationText,
            data: null
        };
    }
}

/**
 * FUNCIÓN: simulateVaultSearch
 *
 * INTENCIÓN ARQUITECTÓNICA:
 * Proporcionar una terminal de prueba para validar la relevancia semántica de los vectores almacenados.
 */
export async function simulateVaultSearch(
    searchQueryTerm: string,
    similarityThresholdMagnitude: number = 0.5
): Promise<VaultActionResponse<SemanticResonanceNode[]>> {
    try {
        const { supabaseSovereignClient } = await ensureAdminAuthority();

        const { data: resonanceResultsData, error: searchHardwareExceptionInformation } = await supabaseSovereignClient.functions.invoke('search-pro', {
            body: {
                query: searchQueryTerm,
                match_threshold: similarityThresholdMagnitude,
                match_count: 10,
                target: 'vault_only'
            }
        });

        if (searchHardwareExceptionInformation) throw searchHardwareExceptionInformation;

        return {
            success: true,
            message: "Simulación de búsqueda completada.",
            data: resonanceResultsData as SemanticResonanceNode[]
        };
    } catch (exceptionInformation: unknown) {
        const exceptionInformationText = exceptionInformation instanceof Error ? exceptionInformation.message : "Error desconocido";
        nicepodLog("🔥 [Vault-Action][Simulate-Search]: Error en resonancia semántica.", { exceptionInformationText }, 'exceptionInformation');
        return {
            success: false,
            message: "Error en la simulación de resonancia.",
            exceptionInformationText,
            data: []
        };
    }
}

/**
 * FUNCIÓN: getVaultMetrics
 *
 * INTENCIÓN ARQUITECTÓNICA:
 * Monitorear la densidad informativa y el volumen de fragmentos de conocimiento en el NKV.
 */
export async function getVaultMetrics(): Promise<VaultActionResponse<{
    totalSourcesCount: number;
    totalChunksCount: number;
}>> {
    try {
        const { supabaseSovereignClient } = await ensureAdminAuthority();

        const [sourcesCountResultsSnapshot, chunksCountResultsSnapshot] = await Promise.all([
            supabaseSovereignClient.from('knowledge_sources').select('*', { count: 'exact', head: true }),
            supabaseSovereignClient.from('knowledge_chunks').select('*', { count: 'exact', head: true })
        ]);

        return {
            success: true,
            message: "Métricas de Bóveda actualizadas.",
            data: {
                totalSourcesCount: sourcesCountResultsSnapshot.count || 0,
                totalChunksCount: sourcesCountResultsSnapshot.count || 0
            }
        };
    } catch (exceptionInformation: unknown) {
        const exceptionInformationText = exceptionInformation instanceof Error ? exceptionInformation.message : "Error desconocido";
        nicepodLog("🔥 [Vault-Action][Get-Metrics]: Fallo en telemetría de densidad.", { exceptionInformationText }, 'exceptionInformation');
        return {
            success: false,
            message: "No se pudieron obtener métricas del sistema.",
            exceptionInformationText,
            data: null
        };
    }
}
