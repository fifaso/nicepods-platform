"use client";

import { useMemo } from 'react';

// Se define el tipo de dato que espera el guion.
type ScriptLine = { speaker: string; line: string; };

// Se definen las props que recibirá el componente.
interface ScriptViewerProps { 
  scriptText: string | null; 
}

// Se exporta la función para que pueda ser importada en otros archivos.
export function ScriptViewer({ scriptText }: ScriptViewerProps) {
  const formattedScript = useMemo(() => {
    if (!scriptText) return null;
    try {
      const scriptData = JSON.parse(scriptText);
      if (!Array.isArray(scriptData)) { 
        throw new Error("El formato del guion no es un array válido."); 
      }
      return scriptData.map((item: ScriptLine) => item.line).join('\n\n');
    } catch (error) {
      console.error("Error al parsear o formatear el guion JSON:", error);
      return null;
    }
  }, [scriptText]);

  if (formattedScript === null) {
    return <p className="text-destructive">El guion no se pudo cargar o tiene un formato incorrecto.</p>;
  }

  return (
    <div className="prose prose-sm max-w-none dark:prose-invert font-serif">
      <p style={{ whiteSpace: 'pre-wrap' }}>{formattedScript}</p>
    </div>
  );
}