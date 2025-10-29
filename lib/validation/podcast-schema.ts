// lib/validation/podcast-schema.ts
// VERSIÓN FINAL CON LA LÓGICA DE VALIDACIÓN CORREGIDA

import { z } from 'zod';

export const PodcastCreationSchema = z.object({
  style: z.enum(['solo', 'link', 'archetype'], { required_error: "Debes seleccionar un estilo creativo." }),
  
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

  duration: z.string().nonempty({ message: "Selecciona una duración." }),
  narrativeDepth: z.string().nonempty({ message: "Define una profundidad." }),
  selectedAgent: z.string().optional(),
  
  voiceGender: z.enum(['Masculino', 'Femenino'], { required_error: "Debes seleccionar un género de voz." }),
  voiceStyle: z.enum(['Calmado', 'Energético', 'Profesional', 'Inspirador'], { required_error: "Debes seleccionar un estilo de voz." }),
  voicePace: z.enum(['Lento', 'Moderado', 'Rápido'], { required_error: "Debes seleccionar un ritmo." }),
  speakingRate: z.number(),

  tags: z.array(z.string()).optional(),
  generateAudioDirectly: z.boolean().optional(),
})
.superRefine((data, ctx) => {
  if (data.style === 'solo') {
    if (!data.solo_topic || data.solo_topic.length < 3) ctx.addIssue({ code: 'custom', message: 'El tema debe tener al menos 3 caracteres.', path: ['solo_topic'] });
    if (!data.solo_motivation || data.solo_motivation.length < 3) ctx.addIssue({ code: 'custom', message: 'La motivación debe tener al menos 3 caracteres.', path: ['solo_motivation'] });
    if (!data.selectedAgent) ctx.addIssue({ code: 'custom', message: 'Debes elegir un agente.', path: ['selectedAgent'] });
  }
  if (data.style === 'link') {
    if (!data.link_topicA || data.link_topicA.length < 3) ctx.addIssue({ code: 'custom', message: 'El Tema A es requerido.', path: ['link_topicA'] });
    if (!data.link_topicB || data.link_topicB.length < 3) ctx.addIssue({ code: 'custom', message: 'El Tema B es requerido.', path: ['link_topicB'] });
    if (!data.link_selectedNarrative) ctx.addIssue({ code: 'custom', message: 'Debes seleccionar una narrativa.', path: ['link_selectedNarrative'] });
    if (!data.link_selectedTone) ctx.addIssue({ code: 'custom', message: 'Debes seleccionar un tono.', path: ['link_selectedTone'] });
    if (!data.selectedAgent) ctx.addIssue({ code: 'custom', message: 'Debes elegir un agente.', path: ['selectedAgent'] });
  }
  if (data.style === 'archetype') {
    if (!data.selectedArchetype) ctx.addIssue({ code: 'custom', message: 'Debes seleccionar un arquetipo.', path: ['selectedArchetype'] });
    if (!data.archetype_topic || data.archetype_topic.length < 3) ctx.addIssue({ code: 'custom', message: 'El tema debe tener al menos 3 caracteres.', path: ['archetype_topic'] });
    if (!data.archetype_goal || data.archetype_goal.length < 3) ctx.addIssue({ code: 'custom', message: 'El objetivo debe tener al menos 3 caracteres.', path: ['archetype_goal'] });
    // [INTERVENCIÓN QUIRÚRGICA]: Se elimina la validación incorrecta de `selectedAgent` para el flujo de Arquetipo.
    if (!data.selectedAgent) ctx.addIssue({ code: 'custom', message: 'Debes elegir un agente.', path: ['selectedAgent'] });
  }
});

export type PodcastCreationData = z.infer<typeof PodcastCreationSchema>;