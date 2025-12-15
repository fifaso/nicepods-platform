// lib/validation/podcast-schema.ts
// VERSIÓN: 2.0 (Evolutiva: Inclusión de selectedAgent para enrutamiento de IA)

import { z } from 'zod';

// --- CAPA DE SEGURIDAD ---
const sanitizeInput = (val: string | undefined) => {
  if (!val) return undefined;
  return val
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
    .replace(/<[^>]+>/g, "")
    .trim();
};

const safeInputString = z.string()
  .max(5000, { message: "El texto excede el límite de seguridad (5000 caracteres)." })
  .transform(sanitizeInput);

const SourceSchema = z.object({
  title: z.string().optional(),
  url: z.string().optional(),
  snippet: z.string().optional(),
});

// -------------------------

export const PodcastCreationSchema = z.object({
  purpose: z.enum(['learn', 'inspire', 'explore', 'reflect', 'answer', 'freestyle']),
  
  style: z.enum(['solo', 'link', 'archetype', 'legacy', 'qa']).optional(),
  
  // [MODIFICACIÓN ESTRATÉGICA]
  // Permitimos guardar el nombre del agente técnico seleccionado en el paso 1.
  // Esto facilita el enrutamiento en el backend sin lógica condicional redundante.
  selectedAgent: z.string().optional(),

  // --- INPUTS DE MATERIA PRIMA BLINDADOS ---
  solo_topic: safeInputString.optional(),
  solo_motivation: safeInputString.optional(),
  
  link_topicA: safeInputString.optional(),
  link_topicB: safeInputString.optional(),
  link_catalyst: safeInputString.optional(),
  
  link_selectedNarrative: z.object({ title: z.string(), thesis: z.string() }).nullable().optional(),
  link_selectedTone: z.enum(['Educativo', 'Inspirador', 'Analítico']).optional(),
  
  selectedArchetype: z.string().optional(),
  archetype_topic: z.string().optional(),
  archetype_goal: z.string().optional(),
  
  legacy_lesson: z.string().optional(),
  question_to_answer: z.string().optional(),

  // --- CAMPOS DE EDICIÓN FINAL ---
  final_title: z.string().optional(),
  
  final_script: z.string()
    .max(25000, { message: "El guion es demasiado largo para ser procesado." })
    .optional(),

  sources: z.array(SourceSchema).optional(),

  duration: z.string().nonempty({ message: "Debes seleccionar una duración." }),
  narrativeDepth: z.string().nonempty({ message: "Debes definir una profundidad." }),
  
  selectedTone: z.string().optional(), 
  
  voiceGender: z.enum(['Masculino', 'Femenino']),
  voiceStyle: z.enum(['Calmado', 'Energético', 'Profesional', 'Inspirador']),
  voicePace: z.enum(['Lento', 'Moderado', 'Rápido']),
  speakingRate: z.number(),

  tags: z.array(safeInputString).optional(),
  generateAudioDirectly: z.boolean().optional(),
})
.superRefine((data, ctx) => {
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