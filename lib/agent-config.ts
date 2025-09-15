// lib/agent-config.ts

export type AgentOption = {
  value: string; // Este es el 'agent_name' de nuestra base de datos
  label: string; // Este es el nombre legible por humanos
  description: string; // Una breve explicación para la UI
};

export const soloTalkAgents: AgentOption[] = [
  {
    value: 'solo-talk-narrator',
    label: 'Narrador Maestro',
    description: 'Crea una historia cautivadora y memorable a partir de tu idea.',
  },
  {
    value: 'solo-talk-analyst',
    label: 'Analista Profundo',
    description: 'Desglosa tu tema de forma lógica, estructurada y clara.',
  },
];

export const linkPointsAgents: AgentOption[] = [
  {
    value: 'link-points-synthesizer',
    label: 'Sintetizador de Ideas',
    description: 'Encuentra la conexión y armonía entre tus conceptos.',
  },
  {
    value: 'link-points-catalyst',
    label: 'Catalizador Dialéctico',
    description: 'Usa la tensión entre tus ideas para forjar un concepto nuevo y superior.',
  },
];