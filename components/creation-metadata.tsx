// components/creation-metadata.tsx
// VERSIÓN: 3.0 (Holistic Visibility & Remix Aware)

"use client";

import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  Lightbulb, 
  Link2, 
  Mic, 
  Settings, 
  BookOpen, 
  Info, 
  MessageCircle,
  Hash
} from 'lucide-react';
import type React from 'react';

interface MetadataItemProps {
  icon: React.ElementType;
  label: string;
  value: string | null | undefined;
}

function MetadataItem({ icon: Icon, label, value }: MetadataItemProps) {
  if (!value || value === "undefined") return null;
  return (
    <div className="flex items-start animate-in fade-in slide-in-from-left-2">
      <Icon className="h-4 w-4 mr-3 mt-1 flex-shrink-0 text-primary/60" />
      <div className="min-w-0">
        <p className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground/50">{label}</p>
        <p className="text-sm text-foreground font-medium truncate md:whitespace-normal">{value}</p>
      </div>
    </div>
  );
}

export function CreationMetadata({ data }: { data: any }) {
  if (!data) {
    return (
      <div className="flex items-center p-4 rounded-xl bg-secondary/10 border border-border/50 text-muted-foreground/70">
        <Info className="h-3.5 w-3.5 mr-2.5 flex-shrink-0" />
        <span className="text-xs italic">Arquitectura de creación no disponible.</span>
      </div>
    );
  }

  // Desestructuración con fallbacks estratégicos
  const style = data.style || (data.creation_mode === 'remix' ? 'remix' : 'solo');
  const agentName = data.agentName || "Arquitecto Base";
  const inputs = data.inputs || {};

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4">
        
        {/* Lógica de Identidad del Podcast */}
        <MetadataItem 
          icon={Mic} 
          label="Metodología" 
          value={
            style === 'solo' ? 'Monólogo Creativo' : 
            style === 'link' ? 'Sustracción de Ideas' : 
            data.creation_mode === 'remix' ? 'Respuesta Contextual' : 'Producción Estándar'
          } 
        />
        
        <MetadataItem icon={Bot} label="Agente Inteligente" value={agentName} />

        {/* Sección Dinámica: Remix */}
        {data.creation_mode === 'remix' && (
          <MetadataItem 
            icon={MessageCircle} 
            label="Postura del Autor" 
            value={data.user_reaction || "Respuesta generada a partir de intervención de voz."} 
          />
        )}

        {/* Sección Dinámica: Solo Talk */}
        {style === 'solo' && (
          <>
            <MetadataItem icon={BookOpen} label="Eje Temático" value={inputs.topic} />
            <MetadataItem icon={Lightbulb} label="Motivación" value={inputs.motivation || inputs.goal || "Exploración de conocimiento."} />
          </>
        )}

        {/* Sección Dinámica: Link Points (Sustracción) */}
        {style === 'link' && (
          <>
            <div className="grid grid-cols-2 gap-2">
                <MetadataItem icon={Link2} label="Tema A" value={inputs.topicA} />
                <MetadataItem icon={Link2} label="Tema B" value={inputs.topicB} />
            </div>
            <MetadataItem icon={Lightbulb} label="Catalizador" value={inputs.catalyst} />
            {inputs.narrative && (
                <MetadataItem icon={Settings} label="Lente Narrativa" value={inputs.narrative.title || inputs.narrative} />
            )}
          </>
        )}
      </div>
      
      {/* Visualización de Tags de Origen */}
      {inputs.tags && Array.isArray(inputs.tags) && inputs.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-3 border-t border-border/20">
          <Hash className="h-3 w-3 text-muted-foreground/40 mt-1" />
          {inputs.tags.map((tag: string) => (
            <Badge key={tag} variant="outline" className="text-[9px] font-bold bg-primary/5 text-primary/80 border-primary/10 uppercase">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}