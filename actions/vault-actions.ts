// actions/vault-actions.ts
// VERSIÓN: 1.0 (Master Standard - NKV Admin Logic & Simulation Engine)

"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * UTILS: Verificador de Privilegios Administrativos
 * Asegura que solo cuentas con role 'admin' puedan interactuar con el Vault.
 */
async function ensureAdmin(supabase: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("SESION_EXPIRADA: Inicia sesión nuevamente.");

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        throw new Error("ACCESO_DENEGADO: Se requieren privilegios de administrador.");
    }
    return user.id;
}

/**
 * listVaultSources: Recupera el inventario completo de sabiduría.
 * Incluye el conteo de Chunks para medir la densidad informativa de cada fuente.
 */
export async function listVaultSources() {
    const supabase = createClient();

    try {
        await ensureAdmin(supabase);

        const { data, error } = await supabase
            .from("knowledge_sources")
            .select(`
        *,
        knowledge_chunks (count)
      `)
            .order("created_at", { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (err: any) {
        console.error("🔥 [Vault-Action][list]:", err.message);
        return [];
    }
}

/**
 * deleteVaultSource: Purga física de una fuente y sus vectores.
 * El CASCADE en la base de datos se encarga de eliminar los chunks asociados.
 */
export async function deleteVaultSource(sourceId: string) {
    const supabase = createClient();

    try {
        await ensureAdmin(supabase);

        const { error } = await supabase
            .from("knowledge_sources")
            .delete()
            .eq("id", sourceId);

        if (error) throw error;

        revalidatePath("/admin/vault");
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

/**
 * injectManualKnowledge: Puerta de entrada para curaduría manual.
 * Invocamos a la refinería (Edge Function) para que el texto siga el pipeline de
 * hashing, destilación de hechos (IA Flash) y vectorización.
 */
export async function injectManualKnowledge(payload: { title: string, text: string, url?: string }) {
    const supabase = createClient();

    try {
        await ensureAdmin(supabase);

        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/vault-refinery`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`, // Bypass RLS para sistema
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...payload,
                source_type: 'admin',
                is_public: true
            })
        });

        if (!response.ok) throw new Error("La refinería de IA no pudo procesar la fuente.");

        revalidatePath("/admin/vault");
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

/**
 * simulateVaultSearch: Laboratorio de Resonancia.
 * Permite al administrador auditar qué hechos atómicos recuperará la IA ante un tema.
 */
export async function simulateVaultSearch(query: string, threshold: number = 0.5) {
    const supabase = createClient();

    try {
        await ensureAdmin(supabase);

        const { data, error } = await supabase.functions.invoke('search-pro', {
            body: {
                query,
                match_threshold: threshold,
                match_count: 10,
                target: 'vault_only'
            }
        });

        if (error) throw error;
        return { success: true, results: data };
    } catch (err: any) {
        console.error("🔥 [Vault-Action][simulate]:", err.message);
        return { success: false, error: err.message, results: [] };
    }
}