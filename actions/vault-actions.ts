/**
 * ARCHIVO: actions/vault-actions.ts
 * VERSIÓN: 4.1 (Madrid Resonance)
 * PROTOCOLO: Madrid Resonance Protocol V4.0
 * MISIÓN: Gestión administrativa del Knowledge Vault (NKV) con tipado soberano y ZAP absoluto.
 * NIVEL DE INTEGRIDAD: CRITICAL
 */

"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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
    exceptionMessageInformation?: string;
};

/**
 * PROTOCOLO: ensureAdminAuthority
 * Misión: Validar que la petición proviene de un nodo con privilegios administrativos.
 */
async function ensureAdminAuthority() {
    const supabase = createClient();

    const { data: { user }, error: authenticationError } = await supabase.auth.getUser();
    if (authenticationError || !user) {
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

    return { supabase, administratorIdentification: user.id };
}

/**
 * FUNCIÓN: listVaultSources
 * Misión: Recuperar el inventario completo de fuentes de sabiduría (NKV).
 */
export async function listVaultSources(): Promise<VaultActionResponse<VaultKnowledgeSource[]>> {
    try {
        const { supabase } = await ensureAdminAuthority();

        const { data, error } = await supabase
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

        if (error) throw error;

        return {
            success: true,
            message: "Inventario de Bóveda sincronizado con éxito.",
            data: data as unknown as VaultKnowledgeSource[]
        };
    } catch (vaultException: unknown) {
        const errorMessage = vaultException instanceof Error ? vaultException.message : "Error desconocido";
        console.error("🔥 [Vault-Action][List-Sources]:", errorMessage);
        return {
            success: false,
            message: "Fallo al recuperar el inventario de la Bóveda.",
            exceptionMessageInformation: errorMessage,
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
        const { supabase } = await ensureAdminAuthority();

        const { error } = await supabase
            .from("knowledge_sources")
            .delete()
            .eq("id", sourceIdentification);

        if (error) throw error;

        revalidatePath("/admin/vault");

        return {
            success: true,
            message: "Fuente y vectores asociados eliminados de la Bóveda.",
            data: null
        };
    } catch (vaultException: unknown) {
        const errorMessage = vaultException instanceof Error ? vaultException.message : "Error desconocido";
        console.error("🔥 [Vault-Action][Delete-Source]:", errorMessage);
        return {
            success: false,
            message: "No se pudo procesar la eliminación de la fuente.",
            exceptionMessageInformation: errorMessage,
            data: null
        };
    }
}

/**
 * FUNCIÓN: injectManualKnowledge
 * Misión: Inyección de inteligencia curada manualmente por el administrador.
 */
export async function injectManualKnowledge(knowledgeInjectionPayload: {
    title: string;
    text: string;
    uniformResourceLocator?: string;
}): Promise<VaultActionResponse> {
    try {
        const { supabase } = await ensureAdminAuthority();

        const { data, error: functionError } = await supabase.functions.invoke('vault-refinery', {
            body: {
                title: knowledgeInjectionPayload.title,
                text: knowledgeInjectionPayload.text,
                url: knowledgeInjectionPayload.uniformResourceLocator,
                source_type: 'admin',
                is_public: true
            }
        });

        if (functionError) throw new Error(functionError.message || "Error en el pipeline de refinería.");

        revalidatePath("/admin/vault");

        return {
            success: true,
            message: "Inteligencia inyectada y vectorizada correctamente.",
            data: null
        };
    } catch (vaultException: unknown) {
        const errorMessage = vaultException instanceof Error ? vaultException.message : "Error desconocido";
        console.error("🔥 [Vault-Action][Inject-Knowledge]:", errorMessage);
        return {
            success: false,
            message: "La Bóveda rechazó la inyección de conocimiento.",
            exceptionMessageInformation: errorMessage,
            data: null
        };
    }
}

/**
 * FUNCIÓN: simulateVaultSearch
 * Misión: Laboratorio de Resonancia Semántica.
 */
export async function simulateVaultSearch(
    searchQueryTerm: string,
    similarityThreshold: number = 0.5
): Promise<VaultActionResponse<SemanticResonanceNode[]>> {
    try {
        const { supabase } = await ensureAdminAuthority();

        const { data, error: searchError } = await supabase.functions.invoke('search-pro', {
            body: {
                query: searchQueryTerm,
                match_threshold: similarityThreshold,
                match_count: 10,
                target: 'vault_only'
            }
        });

        if (searchError) throw searchError;

        return {
            success: true,
            message: "Simulación de búsqueda completada.",
            data: data as SemanticResonanceNode[]
        };
    } catch (vaultException: unknown) {
        const errorMessage = vaultException instanceof Error ? vaultException.message : "Error desconocido";
        console.error("🔥 [Vault-Action][Simulate-Search]:", errorMessage);
        return {
            success: false,
            message: "Error en la simulación de resonancia.",
            exceptionMessageInformation: errorMessage,
            data: []
        };
    }
}

/**
 * FUNCIÓN: getVaultMetrics
 * Misión: Telemetría de densidad informativa de NicePod.
 */
export async function getVaultMetrics(): Promise<VaultActionResponse<{
    totalSourcesCount: number;
    totalChunksCount: number;
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
                totalSourcesCount: sourcesCount.count || 0,
                totalChunksCount: chunksCount.count || 0
            }
        };
    } catch (vaultException: unknown) {
        const errorMessage = vaultException instanceof Error ? vaultException.message : "Error desconocido";
        return {
            success: false,
            message: "No se pudieron obtener métricas del sistema.",
            exceptionMessageInformation: errorMessage,
            data: null
        };
    }
}
