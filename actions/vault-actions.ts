/**
 * ARCHIVO: actions/vault-actions.ts
 * VERSIÓN: 8.3 (Madrid Resonance - Sovereign Edition)
 * PROTOCOLO: Madrid Resonance Protocol V8.3
 * MISIÓN: Gestión administrativa del NicePodKnowledgeVault con tipado soberano y ZAP absoluto.
 * NIVEL DE INTEGRIDAD: 100% (Soberano / ZAP 2.0 / Build Shield Green)
 */

"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { nicepodLog } from "@/lib/utils";
import {
    transformDatabaseVaultSourceToSovereignEntity,
    transformDatabaseVaultChunkToSovereignEntity
} from "@/lib/mappers/vault-sovereign-mapper";

/**
 * INTERFAZ: VaultKnowledgeChunk
 * Representa un fragmento de conocimiento vectorizado purificado.
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
 * Representa una fuente de sabiduría en la Bóveda purificada.
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
    similarityMagnitude: number;
    titleTextContent?: string;
}

/**
 * INTERFAZ: VaultActionResponse
 * Contrato unificado para las respuestas de la Bóveda siguiendo el Traceability Protocol.
 */
export type VaultActionResponse<PayloadDataType = null> = {
    success: boolean;
    message: string;
    dataPayload: PayloadDataType | null;
    exceptionInformation?: string;
    traceIdentification: string;
};

/**
 * PROTOCOLO: ensureAdminAuthority
 * Misión: Validar que la petición proviene de un nodo con privilegios administrativos.
 */
async function ensureAdminAuthority() {
    const supabaseSovereignClient = createClient();

    const { data: { user: authenticatedAdministratorSnapshot }, error: authenticationHardwareExceptionInformation } = await supabaseSovereignClient.auth.getUser();

    if (authenticationHardwareExceptionInformation || !authenticatedAdministratorSnapshot) {
        nicepodLog("🛑 [Vault-Authority] Intento de acceso administrativo sin sesión válida.", "AUTHENTICATION_REQUIRED", 'exceptionInformation');
        throw new Error("AUTHENTICATION_REQUIRED: Sesión no detectada.");
    }

    const { data: administratorProfileSnapshot, error: administratorProfileHardwareExceptionInformation } = await supabaseSovereignClient
        .from('profiles')
        .select('role')
        .eq('id', authenticatedAdministratorSnapshot.id)
        .single();

    if (administratorProfileHardwareExceptionInformation || administratorProfileSnapshot?.role !== 'admin') {
        nicepodLog("🛑 [Vault-Authority] Acceso denegado: Se requieren privilegios de administración.", { userIdentification: authenticatedAdministratorSnapshot.id }, 'exceptionInformation');
        throw new Error("ACCESO_RESTRINGIDO: Se requieren privilegios de administración.");
    }

    return { supabaseSovereignClient, administratorIdentification: authenticatedAdministratorSnapshot.id };
}

/**
 * FUNCIÓN: listVaultSources
 * Misión: Recuperar el inventario completo de fuentes de sabiduría (NicePodKnowledgeVault).
 */
export async function listVaultSources(): Promise<VaultActionResponse<VaultKnowledgeSource[]>> {
    try {
        const { supabaseSovereignClient } = await ensureAdminAuthority();

        const { data: knowledgeSourcesDatabaseResultsCollection, error: databaseQueryHardwareExceptionInformation } = await supabaseSovereignClient
            .from("knowledge_sources")
            .select(`
                *,
                knowledge_chunks (count)
            `)
            .order("created_at", { ascending: false });

        if (databaseQueryHardwareExceptionInformation) throw databaseQueryHardwareExceptionInformation;

        // Auditoría de Trazabilidad
        nicepodLog(
            "🔄 [Vault-Action][List-Sources]: Sincronizando inventario de sabiduría.",
            { collectionCountMagnitude: (knowledgeSourcesDatabaseResultsCollection || []).length }
        );

        return {
            success: true,
            message: "Inventario de Bóveda sincronizado con éxito.",
            dataPayload: (knowledgeSourcesDatabaseResultsCollection || []).map(transformDatabaseVaultSourceToSovereignEntity),
            traceIdentification: "VAULT_LIST_SUCCESS"
        };
    } catch (exceptionMessageInformation: unknown) {
        const exceptionMessageInformationText = exceptionMessageInformation instanceof Error ? exceptionMessageInformation.message : "Error desconocido";
        nicepodLog("🔥 [Vault-Action-Fatal][List-Sources]:", exceptionMessageInformationText, 'exceptionInformation');
        return {
            success: false,
            message: "Fallo al recuperar el inventario de la Bóveda.",
            exceptionInformation: exceptionMessageInformationText,
            dataPayload: [],
            traceIdentification: "VAULT_LIST_FAIL"
        };
    }
}

/**
 * FUNCIÓN: deleteVaultSource
 * Misión: Purga física y lógica de una fuente de conocimiento y sus vectores asociados.
 */
export async function deleteVaultSource(sourceIdentification: string): Promise<VaultActionResponse> {
    try {
        const { supabaseSovereignClient } = await ensureAdminAuthority();

        const { error: databaseDeleteHardwareExceptionInformation } = await supabaseSovereignClient
            .from("knowledge_sources")
            .delete()
            .eq("id", sourceIdentification);

        if (databaseDeleteHardwareExceptionInformation) throw databaseDeleteHardwareExceptionInformation;

        revalidatePath("/admin/vault");

        nicepodLog("🗑️ [Vault-Action][Delete-Source]: Fuente purgada de la Bóveda.", { sourceIdentification });

        return {
            success: true,
            message: "Fuente y vectores asociados eliminados de la Bóveda.",
            dataPayload: null,
            traceIdentification: "VAULT_DELETE_SUCCESS"
        };
    } catch (exceptionMessageInformation: unknown) {
        const exceptionMessageInformationText = exceptionMessageInformation instanceof Error ? exceptionMessageInformation.message : "Error desconocido";
        nicepodLog("🔥 [Vault-Action-Fatal][Delete-Source]:", exceptionMessageInformationText, 'exceptionInformation');
        return {
            success: false,
            message: "No se pudo procesar la eliminación de la fuente.",
            exceptionInformation: exceptionMessageInformationText,
            dataPayload: null,
            traceIdentification: "VAULT_DELETE_FAIL"
        };
    }
}

/**
 * FUNCIÓN: injectManualKnowledge
 * Misión: Inyección de inteligencia curada manualmente por el administrador.
 */
export async function injectManualKnowledge(knowledgeInjectionPayloadSnapshot: {
    titleTextContent: string;
    textBodyContent: string;
    uniformResourceLocator?: string;
}): Promise<VaultActionResponse> {
    try {
        const { supabaseSovereignClient } = await ensureAdminAuthority();

        const { error: edgeFunctionInvokeHardwareExceptionInformation } = await supabaseSovereignClient.functions.invoke('vault-refinery', {
            body: {
                title: knowledgeInjectionPayloadSnapshot.titleTextContent,
                text: knowledgeInjectionPayloadSnapshot.textBodyContent,
                url: knowledgeInjectionPayloadSnapshot.uniformResourceLocator,
                source_type: 'admin',
                is_public: true
            }
        });

        if (edgeFunctionInvokeHardwareExceptionInformation) throw new Error(edgeFunctionInvokeHardwareExceptionInformation.message || "Error en el pipeline de refinería.");

        revalidatePath("/admin/vault");

        nicepodLog("💉 [Vault-Action][Inject-Knowledge]: Inteligencia inyectada exitosamente.", { titleTextContent: knowledgeInjectionPayloadSnapshot.titleTextContent });

        return {
            success: true,
            message: "Inteligencia inyectada y vectorizada correctamente.",
            dataPayload: null,
            traceIdentification: "VAULT_INJECT_SUCCESS"
        };
    } catch (exceptionMessageInformation: unknown) {
        const exceptionMessageInformationText = exceptionMessageInformation instanceof Error ? exceptionMessageInformation.message : String(exceptionMessageInformation);
        nicepodLog("🔥 [Vault-Action-Fatal][Inject-Knowledge]:", exceptionMessageInformationText, 'exceptionInformation');
        return {
            success: false,
            message: "La Bóveda rechazó la inyección de conocimiento.",
            exceptionInformation: exceptionMessageInformationText,
            dataPayload: null,
            traceIdentification: "VAULT_INJECT_FAIL"
        };
    }
}

/**
 * FUNCIÓN: simulateVaultSearch
 * Misión: Laboratorio de Resonancia Semántica.
 */
export async function simulateVaultSearch(
    searchQueryTerm: string,
    similarityThresholdMagnitude: number = 0.5
): Promise<VaultActionResponse<SemanticResonanceNode[]>> {
    try {
        const { supabaseSovereignClient } = await ensureAdminAuthority();

        const { data: resonanceResultsDataSnapshot, error: searchHardwareExceptionInformation } = await supabaseSovereignClient.functions.invoke('search-pro', {
            body: {
                query: searchQueryTerm,
                match_threshold: similarityThresholdMagnitude,
                match_count: 10,
                target: 'vault_only'
            }
        });

        if (searchHardwareExceptionInformation) throw searchHardwareExceptionInformation;

        // Transmutación Soberana de resultados de simulación
        const purifedResonanceResultsCollection = (resonanceResultsDataSnapshot || []).map((nodeItem: any) => ({
            content: nodeItem.content || "",
            similarityMagnitude: nodeItem.similarity || 0,
            titleTextContent: nodeItem.title || "Nodo Sin Título"
        }));

        return {
            success: true,
            message: "Simulación de búsqueda completada.",
            dataPayload: purifedResonanceResultsCollection,
            traceIdentification: "VAULT_SIMULATE_SUCCESS"
        };
    } catch (exceptionMessageInformation: unknown) {
        const exceptionMessageInformationText = exceptionMessageInformation instanceof Error ? exceptionMessageInformation.message : "Error desconocido";
        nicepodLog("🔥 [Vault-Action-Fatal][Simulate-Search]:", exceptionMessageInformationText, 'exceptionInformation');
        return {
            success: false,
            message: "Error en la simulación de resonancia.",
            exceptionInformation: exceptionMessageInformationText,
            dataPayload: [],
            traceIdentification: "VAULT_SIMULATE_FAIL"
        };
    }
}

/**
 * FUNCIÓN: getVaultMetrics
 * Misión: Telemetría de densidad informativa de NicePod.
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
            message: "Métricas de Bóveda actualizadas.",
            dataPayload: {
                totalSourcesCountMagnitude: sourcesCountResultsSnapshot.count || 0,
                totalChunksCountMagnitude: chunksCountResultsSnapshot.count || 0
            },
            traceIdentification: "VAULT_METRICS_SUCCESS"
        };
    } catch (exceptionMessageInformation: unknown) {
        const exceptionMessageInformationText = exceptionMessageInformation instanceof Error ? exceptionMessageInformation.message : "Error desconocido";
        nicepodLog("🔥 [Vault-Action-Fatal][Metrics]:", exceptionMessageInformationText, 'exceptionInformation');
        return {
            success: false,
            message: "No se pudieron obtener métricas del sistema.",
            exceptionInformation: exceptionMessageInformationText,
            dataPayload: null,
            traceIdentification: "VAULT_METRICS_FAIL"
        };
    }
}
