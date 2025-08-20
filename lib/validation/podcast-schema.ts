// lib/validation/podcast-schema.ts

import { z } from "zod";

const NarrativeOptionSchema = z.object({
    title: z.string().min(1, "El título de la narrativa no puede estar vacío."),
    thesis: z.string().min(1, "La tesis de la narrativa no puede estar vacía."),
});

// Hacemos explícitamente opcionales los campos que no pertenecen a cada estilo.
const SoloPodcastSchema = z.object({
    style: z.literal("solo"),
    solo_topic: z.string().min(3, "El tema debe tener al menos 3 caracteres."),
    solo_motivation: z.string().min(
        10,
        "La motivación debe tener al menos 10 caracteres.",
    ),
    link_topicA: z.string().optional(),
    link_topicB: z.string().optional(),
    link_catalyst: z.string().optional(),
    link_selectedNarrative: NarrativeOptionSchema.nullable().optional(),
    link_selectedTone: z.string().optional(),
    duration: z.string().min(1, "Por favor, selecciona una duración."),
    narrativeDepth: z.string().min(
        1,
        "Por favor, selecciona una profundidad narrativa.",
    ),
    tags: z.array(z.string()).optional(),
});

const LinkPodcastSchema = z.object({
    style: z.literal("link"),
    solo_topic: z.string().optional(),
    solo_motivation: z.string().optional(),
    link_topicA: z.string().min(
        2,
        "El Tema A debe tener al menos 2 caracteres.",
    ),
    link_topicB: z.string().min(
        2,
        "El Tema B debe tener al menos 2 caracteres.",
    ),
    link_catalyst: z.string().min(
        10,
        "El catalizador debe tener al menos 10 caracteres.",
    ),
    link_selectedNarrative: NarrativeOptionSchema.nullable().refine(
        (val) => val !== null,
        { message: "Por favor, selecciona una narrativa." },
    ),
    link_selectedTone: z.enum(["Educativo", "Inspirador", "Analítico"], {
        required_error: "Por favor, selecciona un tono.",
    }),
    duration: z.string().min(1, "Por favor, selecciona una duración."),
    narrativeDepth: z.string().min(
        1,
        "Por favor, selecciona una profundidad narrativa.",
    ),
    tags: z.array(z.string()).optional(),
});

export const PodcastCreationSchema = z.discriminatedUnion("style", [
    SoloPodcastSchema,
    LinkPodcastSchema,
]);

export type PodcastCreationData = z.infer<typeof PodcastCreationSchema>;
