// supabase/functions/_shared/vault-utils.ts
// VERSIÓN: 1.0 (NKV Operations Engine - Hashing & Sufficiency)

/**
 * generateContentHash: Genera un identificador único basado en el contenido.
 * Evita procesar y pagar por la misma información múltiples veces.
 */
export async function generateContentHash(text: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(text.trim().toLowerCase());
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}

/**
 * checkKnowledgeSufficiency: Determina si el Vault tiene suficiente información 
 * para evitar una llamada a Tavily (Ahorro de créditos).
 */
export function checkKnowledgeSufficiency(vaultResults: any[]): boolean {
    if (!vaultResults || vaultResults.length === 0) return false;

    // Si tenemos más de 3 hechos con una similitud superior al 85%, 
    // consideramos que la base es lo suficientemente sólida.
    const highQualityFacts = vaultResults.filter(res => res.similarity > 0.85);

    return highQualityFacts.length >= 3;
}

/**
 * normalizeSourceOrigin: Asegura que cada fuente tenga su sello de proveniencia.
 */
export function formatSourcesForAI(vaultData: any[], webData: any[]) {
    return [
        ...vaultData.map(v => ({
            title: v.title,
            content: v.content,
            origin: 'vault',
            relevance: v.similarity
        })),
        ...webData.map(w => ({
            title: w.title,
            content: w.content || w.snippet,
            origin: 'web',
            url: w.url
        }))
    ];
}