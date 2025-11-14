//components/creation-metadata.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Bot, Lightbulb, Link2, Mic, Settings, BookOpen, Info } from 'lucide-react';
import type React from 'react';

interface MetadataItemProps {
  icon: React.ElementType;
  label: string;
  value: string | null | undefined;
}

function MetadataItem({ icon: Icon, label, value }: MetadataItemProps) {
  if (!value) return null;
  return (
    <div className="flex items-start">
      <Icon className="h-4 w-4 mr-3 mt-1 flex-shrink-0 text-muted-foreground" />
      <div>
        <p className="font-semibold text-sm">{label}</p>
        <p className="text-sm text-muted-foreground">{value}</p>
      </div>
    </div>
  );
}

export function CreationMetadata({ data }: { data: any }) {
  // ================== INTERVENCIÓN QUIRÚRGICA: MANEJO DE ESTADO VACÍO ==================
  // Si los datos de creación no existen (ej. para podcasts antiguos),
  // mostramos un mensaje informativo en lugar de una tarjeta vacía.
  if (!data) {
    return (
      <div className="flex items-center text-muted-foreground">
        <Info className="h-4 w-4 mr-3 flex-shrink-0" />
        <span className="text-sm">Metadatos de creación no disponibles para este podcast.</span>
      </div>
    );
  }
  // ====================================================================================

  const { style, agentName, inputs } = data;

  return (
    <div className="space-y-4">
      <MetadataItem icon={Mic} label="Estilo" value={style === 'solo' ? 'Monólogo' : 'Conexión de Ideas'} />
      <MetadataItem icon={Bot} label="Agente de IA" value={agentName} />

      {style === 'solo' && (
        <>
          <MetadataItem icon={BookOpen} label="Tema Principal" value={inputs.topic} />
          <MetadataItem icon={Lightbulb} label="Concepto a Explorar" value={inputs.motivation} />
        </>
      )}

      {style === 'link' && (
        <>
          <MetadataItem icon={Link2} label="Tema A" value={inputs.topicA} />
          <MetadataItem icon={Link2} label="Tema B" value={inputs.topicB} />
          {inputs.catalyst && <MetadataItem icon={Lightbulb} label="Catalizador Creativo" value={inputs.catalyst} />}
          {inputs.narrative && <MetadataItem icon={Settings} label="Narrativa Seleccionada" value={inputs.narrative.title} />}
          {inputs.tone && <MetadataItem icon={Settings} label="Tono Seleccionado" value={inputs.tone} />}
        </>
      )}
      
      <div className="flex flex-wrap gap-2 pt-2">
        {inputs.tags?.map((tag: string) => <Badge key={tag} variant="secondary">{tag}</Badge>)}
      </div>
    </div>
  );
}