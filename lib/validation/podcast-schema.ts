// lib/validation/podcast-schema.ts
// VERSIÓN SEGURA: Incluye sanitización de inputs (Anti-XSS) y límites de longitud (Anti-DoS).

import { z } from 'zod';

// --- CAPA DE SEGURIDAD ---

// 1. Función de Sanitización: Elimina scripts y HTML malicioso de inputs de texto plano.
const sanitizeInput = (val: string | undefined) => {
  if (!val) return undefined;
  return val
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "") // Elimina scripts
    .replace(/<[^>]+>/g, "") // Elimina cualquier otra etiqueta HTML (para inputs planos)
    .trim();
};

// 2. Definición de String Seguro:
// - Limita a 5000 caracteres (Protección contra payloads gigantes/DoS)
// - Aplica sanitización automática
const safeInputString = z.string()
  .max(5000, { message: "El texto excede el límite de seguridad (5000 caracteres)." })
  .transform(sanitizeInput);

// -------------------------

export const PodcastCreationSchema = z.object({
  // Discriminador Principal
  purpose: z.enum(['learn', 'inspire', 'explore', 'reflect', 'answer', 'freestyle']),
  
  // Estilo
  style: z.enum(['solo', 'link', 'archetype', 'legacy', 'qa']).optional(),
  
  // --- INPUTS DE MATERIA PRIMA BLINDADOS ---
  // Aplicamos 'safeInputString' a todos los campos donde el usuario escribe libremente.
  
  solo_topic: safeInputString.optional(),
  solo_motivation: safeInputString.optional(),
  
  link_topicA: safeInputString.optional(),
  link_topicB: safeInputString.optional(),
  link_catalyst: safeInputString.optional(),
  
  link_selectedNarrative: z.object({ 
    title: safeInputString, // También sanitizamos objetos anidados
    thesis: safeInputString 
  }).nullable().optional(),
  
  link_selectedTone: z.enum(['Educativo', 'Inspirador', 'Analítico']).optional(),
  
  selectedArchetype: z.string().optional(),
  archetype_topic: safeInputString.optional(),
  archetype_goal: safeInputString.optional(),
  
  legacy_lesson: safeInputString.optional(),
  question_to_answer: safeInputString.optional(),

  // --- CAMPOS DE EDICIÓN FINAL ---
  final_title: safeInputString.optional(),
  
  // EXCEPCIÓN: final_script puede contener HTML (formato de TipTap), por lo que no usamos
  // el sanitizador estricto que borra tags, pero SÍ limitamos su tamaño para evitar abusos.
  final_script: z.string()
    .max(25000, { message: "El guion es demasiado largo para ser procesado." })
    .optional(),

  // Configuración Técnica
  duration: z.string().nonempty({ message: "Debes seleccionar una duración." }),
  narrativeDepth: z.string().nonempty({ message: "Debes definir una profundidad." }),
  
  // Tono Creativo
  selectedTone: z.string().optional(), 
  
  // Configuración de Audio
  voiceGender: z.enum(['Masculino', 'Femenino']),
  voiceStyle: z.enum(['Calmado', 'Energético', 'Profesional', 'Inspirador']),
  voicePace: z.enum(['Lento', 'Moderado', 'Rápido']),
  speakingRate: z.number(),

  // Tags también sanitizados
  tags: z.array(safeInputString).optional(),
  generateAudioDirectly: z.boolean().optional(),
})
.superRefine((data, ctx) => {
  // Validaciones de contenido mínimo (Reglas de Negocio)
  switch (data.purpose) {
    case 'learn':
      if (!data.solo_topic || data.solo_topic.length < 3) ctx.addIssue({ code: 'custom', message: 'Falta información del tema.', path: ['solo_topic'] });
      if (!data.solo_motivation || data.solo_motivation.length < 3) ctx.addIssue({ code: 'custom', message: 'Describe tu idea un poco más.', path: ['solo_motivation'] });
      break;
      
    case 'inspire':
      if (!data.selectedArchetype) ctx.addIssue({ code: 'custom', message: 'Selecciona un arquetipo.', path: ['selectedArchetype'] });
      if (!data.archetype_goal || data.archetype_goal.length < 3) ctx.addIssue({ code: 'custom', message: 'Describe el objetivo.', path: ['archetype_goal'] });
      break;
      
    case 'explore':
      if (!data.link_topicA) ctx.addIssue({ code: 'custom', message: 'Falta el Tema A.', path: ['link_topicA'] });
      if (!data.link_topicB) ctx.addIssue({ code: 'custom', message: 'Falta el Tema B.', path: ['link_topicB'] });
      break;

    case 'reflect':
      if (!data.legacy_lesson || data.legacy_lesson.length < 5) ctx.addIssue({ code: 'custom', message: 'La lección es muy breve.', path: ['legacy_lesson'] });
      break;

    case 'answer':
      if (!data.question_to_answer || data.question_to_answer.length < 5) ctx.addIssue({ code: 'custom', message: 'La pregunta es muy breve.', path: ['question_to_answer'] });
      break;
  }
});

export type PodcastCreationData = z.infer<typeof PodcastCreationSchema>;