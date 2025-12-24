// types/podcast.ts
// VERSIÓN: 3.1 (Extended Metadata Support)

// ... (todo lo anterior se mantiene)

export type CreationDataPayload = {
  style?: 'solo' | 'link' | 'archetype' | 'qa' | 'legacy' | 'remix';
  agentName: string;
  creation_mode?: 'standard' | 'remix';
  user_reaction?: string;
  quote_context?: string;
  inputs: {
    topic?: string;
    motivation?: string;
    goal?: string;
    topicA?: string;
    topicB?: string;
    catalyst?: string;
    narrative?: any;
    tags?: string[];
    [key: string]: any;
  };
};

// ... (el resto del archivo igual)