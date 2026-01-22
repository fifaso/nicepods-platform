// supabase/functions/_shared/pulse-utils.ts
// VERSIÓN: 1.0 (Pulse Core Utils - Data Normalization & Authority Scoring)

/**
 * 🏷️ TAXONOMÍA DE CONTENIDO
 */
export type PulseCategory = 'paper' | 'report' | 'news' | 'analysis' | 'trend';

/**
 * 📊 MATRIZ DE PESOS DE AUTORIDAD (Jerarquía de Verdad NicePod)
 */
const AUTHORITY_WEIGHTS: Record<PulseCategory, number> = {
  'paper': 10.0,    // Investigación científica (arXiv, OpenAlex)
  'report': 8.5,    // Informes técnicos y económicos
  'news': 7.0,      // Agencias de prensa primarias
  'analysis': 5.0,  // Ensayos y pensamiento estratégico
  'trend': 3.0      // Tendencias de comunidad (HackerNews)
};

/**
 * Interface: RawSourceItem
 * Representa el dato crudo antes de entrar a la refinería interna.
 */
export interface RawSourceItem {
  title: string;
  summary: string;
  url: string;
  source_name: string;
  raw_category: string;
  metadata?: any;
}

/**
 * 1. NORMALIZADOR DE CONTENIDO (Sanitización)
 * Limpia el ruido común de las APIs (etiquetas HTML, espacios extra).
 */
export function cleanContent(text: string): string {
  if (!text) return "";
  return text
    .replace(/<[^>]*>?/gm, '') // Elimina HTML
    .replace(/\\n/g, ' ')      // Limpia saltos de línea
    .replace(/\s+/g, ' ')      // Normaliza espacios
    .trim();
}

/**
 * 2. ALGORITMO DE SCORING DE AUTORIDAD
 * Calcula el peso del dato basándose en la fuente y metadatos adicionales.
 */
export function calculateAuthorityScore(category: PulseCategory, metadata: any = {}): number {
  let score = AUTHORITY_WEIGHTS[category] || 1.0;

  // BONIFICACIONES ESTRATÉGICAS
  // Si un paper tiene muchas citas (OpenAlex), subimos su relevancia
  if (category === 'paper' && metadata.cited_by_count > 100) {
    score = Math.min(10.0, score + 0.5);
  }

  // Si la fuente es de confianza extrema (Whitelist)
  const whitelist = ['The Economist', 'Nature', 'HBR', 'MIT Tech Review'];
  if (whitelist.includes(metadata.source_name)) {
    score = Math.min(10.0, score + 1.0);
  }

  return parseFloat(score.toFixed(1));
}

/**
 * 3. NORMALIZADOR DE ESQUEMA (XML/JSON to NicePod JSON)
 * Convierte cualquier entrada en un objeto listo para 'pulse_staging'.
 */
export function normalizePulseItem(item: RawSourceItem) {
  const category = mapToPulseCategory(item.raw_category);

  return {
    title: cleanContent(item.title),
    summary: cleanContent(item.summary),
    url: item.url,
    source_name: item.source_name,
    content_type: category,
    authority_score: calculateAuthorityScore(category, item.metadata),
    veracity_verified: false, // Pendiente de Cross-check IA
    is_high_value: calculateAuthorityScore(category, item.metadata) >= 8.5
  };
}

/**
 * Mapeo inteligente de categorías externas a NicePod Pulse
 */
function mapToPulseCategory(raw: string): PulseCategory {
  const r = raw.toLowerCase();
  if (r.includes('arxiv') || r.includes('paper') || r.includes('journal')) return 'paper';
  if (r.includes('report') || r.includes('whitepaper')) return 'report';
  if (r.includes('news') || r.includes('reuters') || r.includes('ap')) return 'news';
  if (r.includes('analysis') || r.includes('review') || r.includes('hbr')) return 'analysis';
  return 'trend';
}

/**
 * 4. CONFIGURACIÓN DEL PARSER XML
 * Centralizamos las opciones de 'fast-xml-parser' para arXiv y RSS.
 */
export const XML_PARSER_OPTIONS = {
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  allowBooleanAttributes: true,
  parseTagValue: true,
  trimValues: true
};