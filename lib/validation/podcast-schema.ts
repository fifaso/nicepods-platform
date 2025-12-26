// lib/validation/podcast-schema.ts
// VERSIÓN: 3.0 (Enterprise Standard - Full Data Provenance & Remix Support)

import { z } from 'zod';

// --- CAPA DE SEGURIDAD Y LIMPIEZA ---
const sanitizeInput = (val: string | undefined) => {
  if (!val) return undefined;
  return val
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "") // Elimina scripts
    .replace(/<iframe\b[^>]*>([\s\S]*?)<\/iframe>/gim, "") // Elimina frames
    .replace(/<[^>]+>/g, "") // Elimina HTML residual
    .trim();
};

const safeInputString = z.string()
  .max(8000, { message: "El texto excede el límite de seguridad permitido." })
  .transform(sanitizeInput);

/**
 * Esquema de Fuente de Investigación
 * Garantiza la transparencia de la información recolectada por Tavily/IA.
 */
const SourceSchema = z.object({
  title: z.string().min(1, "El título de la fuente es requerido"),
  url: z.string().url("URL de fuente inválida"),
  snippet: z.string().optional(),
});

// -------------------------

export const PodcastCreationSchema = z.object({
  // Identidad del Proceso
  purpose: z.enum(['learn', 'inspire', 'explore', 'reflect', 'answer', 'freestyle']),
  creation_mode: z.enum(['standard', 'remix']).default('standard'),
  
  // Metodología de Producción
  style: z.enum(['solo', 'link', 'archetype', 'legacy', 'qa', 'remix']).optional(),
  
  // [SINCRONIZACIÓN MAESTRA] 
  // agentName es el campo oficial de la DB. 
  // Mantendremos selectedAgent temporalmente para evitar errores en componentes antiguos.
  agentName: z.string().min(1, "El Agente de IA es obligatorio"),
  selectedAgent: z.string().optional(), 

  // --- INPUTS DE MATERIA PRIMA (SEMILLA) ---
  solo_topic: safeInputString.optional(),
  solo_motivation: safeInputString.optional(),
  
  link_topicA: safeInputString.optional(),
  link_topicB: safeInputString.optional(),
  link_catalyst: safeInputString.optional(),
  
  // Lógica de Narrativa (Link Points)
  link_selectedNarrative: z.object({ 
    title: z.string(), 
    thesis: z.string() 
  }).nullable().optional(),
  link_selectedTone: z.string().optional(),
  
  // Lógica de Arquetipos e Historias
  selectedArchetype: z.string().optional(),
  archetype_topic: z.string().optional(),
  archetype_goal: z.string().optional(),
  
  // Otros Flujos
  legacy_lesson: z.string().optional(),
  question_to_answer: z.string().optional(),

  // --- GENEALOGÍA (Remixes / Threads) ---
  parent_id: z.number().optional().nullable(),
  root_id: z.number().optional().nullable(),
  user_reaction: z.string().optional(),
  quote_context: z.string().optional(),

  // --- CAMPOS DE PRODUCCIÓN FINAL ---
  final_title: z.string().min(1, "El título es necesario").max(120).optional(),
  
  final_script: z.string()
    .max(30000, { message: "El guion excede la capacidad del motor de voz." })
    .optional(),

  // CUSTODIA DE FUENTES: Array de bibliografía real
  sources: z.array(SourceSchema).default([]),

  // Configuración Técnica
  duration: z.string().min(1, "Selecciona una duración aproximada"),
  narrativeDepth: z.string().min(1, "Define el nivel de profundidad"),
  
  selectedTone: z.string().optional(), 
  
  // Configuración de Voz (Motor Neural2)
  voiceGender: z.enum(['Masculino', 'Femenino']).default('Masculino'),
  voiceStyle: z.enum(['Calmado', 'Energético', 'Profesional', 'Inspirador']).default('Profesional'),
  voicePace: z.string().default('Moderado'),
  speakingRate: z.number().default(1.0),

  // Metadatos Adicionales
  tags: z.array(z.string()).optional().default([]),
  generateAudioDirectly: z.boolean().default(true),
})
.superRefine((data, ctx) => {
  /**
   * REGLAS DE NEGOCIO DINÁMICAS
   * Validamos según el propósito para asegurar que la IA tenga datos suficientes.
   */
  if (data.creation_mode === 'remix') {
    if (!data.user_reaction) ctx.addIssue({ code: 'custom', message: 'La reacción es necesaria para el remix.', path: ['user_reaction'] });
    return;
  }

  switch (data.purpose) {
    case 'learn':
      if (!data.solo_topic) ctx.addIssue({ code: 'custom', message: 'Define el tema a aprender.', path: ['solo_topic'] });
      break;
      
    case 'inspire':
      if (!data.selectedArchetype) ctx.addIssue({ code: 'custom', message: 'Selecciona una personalidad épica.', path: ['selectedArchetype'] });
      if (!data.archetype_goal) ctx.addIssue({ code: 'custom', message: '¿Qué quieres inspirar?', path: ['archetype_goal'] });
      break;
      
    case 'explore':
      if (!data.link_topicA || !data.link_topicB) ctx.addIssue({ code: 'custom', message: 'Se requieren dos ejes para explorar.', path: ['link_topicA'] });
      break;

    case 'reflect':
      if (!data.legacy_lesson) ctx.addIssue({ code: 'custom', message: 'Escribe tu reflexión o lección.', path: ['legacy_lesson'] });
      break;
  }
});

/**
 * TIPO DE DATOS INFERIDO
 * Este tipo es el que usan todos nuestros componentes de React.
 */
export type PodcastCreationData = z.infer<typeof PodcastCreationSchema>;