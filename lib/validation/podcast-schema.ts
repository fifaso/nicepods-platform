// lib/validation/podcast-schema.ts
// VERSIÓN FINAL: Esquema actualizado para Flujo de Tonos y Edición.

import { z } from 'zod';

export const PodcastCreationSchema = z.object({
  // Discriminador Principal
  purpose: z.enum(['learn', 'inspire', 'explore', 'reflect', 'answer', 'freestyle']),
  
  // Estilo (Opcional en base, requerido por lógica)
  style: z.enum(['solo', 'link', 'archetype', 'legacy', 'qa']).optional(),
  
  // Inputs de Materia Prima (Texto Libre)
  solo_topic: z.string().optional(),
  solo_motivation: z.string().optional(),
  link_topicA: z.string().optional(),
  link_topicB: z.string().optional(),
  link_catalyst: z.string().optional(),
  link_selectedNarrative: z.object({ title: z.string(), thesis: z.string() }).nullable().optional(),
  link_selectedTone: z.enum(['Educativo', 'Inspirador', 'Analítico']).optional(),
  selectedArchetype: z.string().optional(),
  archetype_topic: z.string().optional(),
  archetype_goal: z.string().optional(),
  legacy_lesson: z.string().optional(),
  question_to_answer: z.string().optional(),

  // Campos de Edición Final (Salida del Editor)
  final_title: z.string().optional(),
  final_script: z.string().optional(),

  // Configuración Técnica
  duration: z.string().nonempty({ message: "Debes seleccionar una duración." }),
  narrativeDepth: z.string().nonempty({ message: "Debes definir una profundidad." }),
  
  // [NUEVO]: Tono Creativo (Reemplaza a Agente)
  selectedTone: z.string().optional(), 
  
  // Configuración de Audio
  voiceGender: z.enum(['Masculino', 'Femenino']),
  voiceStyle: z.enum(['Calmado', 'Energético', 'Profesional', 'Inspirador']),
  voicePace: z.enum(['Lento', 'Moderado', 'Rápido']),
  speakingRate: z.number(),

  tags: z.array(z.string()).optional(),
  generateAudioDirectly: z.boolean().optional(),
})
.superRefine((data, ctx) => {
  // Validaciones de contenido mínimo para generar un borrador decente
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