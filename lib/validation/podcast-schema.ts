// lib/validation/podcast-schema.ts
// VERSIÓN RE-ARQUITECTADA: Soporte para flujo de Edición de Guion (Drafting -> Editing -> Production).

import { z } from 'zod';

export const PodcastCreationSchema = z.object({
  // Se mantiene 'purpose' como el discriminador principal.
  purpose: z.enum(['learn', 'inspire', 'explore', 'reflect', 'answer', 'freestyle']),

  // El campo 'style' es opcional en la base.
  style: z.enum(['solo', 'link', 'archetype', 'legacy', 'qa']).optional(),
  
  // Campos de Ingesta (Materia Prima)
  // Nota: Estos campos ahora actúan como contenedores temporales o inputs de "texto libre".
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

  // [CAMBIO QUIRÚRGICO #1]: Nuevos campos para la Fase de Edición.
  // Estos almacenarán el resultado final aprobado por el usuario (post-IA).
  final_title: z.string().optional(), // Título editado por el usuario
  final_script: z.string().optional(), // Cuerpo del guion (Markdown/Texto) editado

  // Campos comunes de configuración
  duration: z.string().nonempty({ message: "Debes seleccionar una duración." }),
  narrativeDepth: z.string().nonempty({ message: "Debes definir una profundidad." }),
  selectedAgent: z.string().optional(),
  
  voiceGender: z.enum(['Masculino', 'Femenino']),
  voiceStyle: z.enum(['Calmado', 'Energético', 'Profesional', 'Inspirador']),
  voicePace: z.enum(['Lento', 'Moderado', 'Rápido']),
  speakingRate: z.number(),

  tags: z.array(z.string()).optional(),
  generateAudioDirectly: z.boolean().optional(),
})
.superRefine((data, ctx) => {
  // La validación asegura que la "Materia Prima" sea suficiente para generar un buen borrador.
  switch (data.purpose) {
    case 'learn':
      if (!data.solo_topic || data.solo_topic.length < 5) ctx.addIssue({ code: 'custom', message: 'El tema debe tener al menos 5 caracteres.', path: ['solo_topic'] });
      if (!data.solo_motivation || data.solo_motivation.length < 5) ctx.addIssue({ code: 'custom', message: 'La perspectiva debe tener al menos 5 caracteres.', path: ['solo_motivation'] });
      if (!data.selectedAgent) ctx.addIssue({ code: 'custom', message: 'Debes elegir un agente.', path: ['selectedAgent'] });
      break;
      
    case 'inspire':
      if (!data.selectedArchetype) ctx.addIssue({ code: 'custom', message: 'Debes seleccionar un arquetipo.', path: ['selectedArchetype'] });
      if (!data.archetype_topic || data.archetype_topic.length < 5) ctx.addIssue({ code: 'custom', message: 'El tema debe tener al menos 5 caracteres.', path: ['archetype_topic'] });
      if (!data.archetype_goal || data.archetype_goal.length < 5) ctx.addIssue({ code: 'custom', message: 'El objetivo debe tener al menos 5 caracteres.', path: ['archetype_goal'] });
      break;
      
    case 'explore':
      if (!data.link_topicA || data.link_topicA.length < 3) ctx.addIssue({ code: 'custom', message: 'El Tema A es requerido.', path: ['link_topicA'] });
      if (!data.link_topicB || data.link_topicB.length < 3) ctx.addIssue({ code: 'custom', message: 'El Tema B es requerido.', path: ['link_topicB'] });
      if (!data.link_selectedNarrative) ctx.addIssue({ code: 'custom', message: 'Debes seleccionar una narrativa.', path: ['link_selectedNarrative'] });
      if (!data.link_selectedTone) ctx.addIssue({ code: 'custom', message: 'Debes seleccionar un tono.', path: ['link_selectedTone'] });
      if (!data.selectedAgent) ctx.addIssue({ code: 'custom', message: 'Debes elegir un agente.', path: ['selectedAgent'] });
      break;

    case 'reflect':
      if (!data.legacy_lesson || data.legacy_lesson.length < 10) ctx.addIssue({ code: 'custom', message: 'La lección debe tener al menos 10 caracteres.', path: ['legacy_lesson'] });
      if (!data.selectedAgent) ctx.addIssue({ code: 'custom', message: 'Debes elegir un agente.', path: ['selectedAgent'] });
      break;

    case 'answer':
      if (!data.question_to_answer || data.question_to_answer.length < 10) ctx.addIssue({ code: 'custom', message: 'La pregunta debe tener al menos 10 caracteres.', path: ['question_to_answer'] });
      if (!data.selectedAgent) ctx.addIssue({ code: 'custom', message: 'Debes elegir un agente.', path: ['selectedAgent'] });
      break;
    
    case 'freestyle':
      if (!data.style) ctx.addIssue({ code: 'custom', message: 'Debes seleccionar un estilo creativo.', path: ['style'] });
      break;
  }
});

export type PodcastCreationData = z.infer<typeof PodcastCreationSchema>;