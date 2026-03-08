// app/map/page.tsx
// VERSIÓN: 2.0 (NicePod Spatial Explorer - Viewport Sovereign Edition)
// Misión: Proyectar el motor geoespacial en pantalla completa absoluta.
// [ESTABILIZACIÓN]: Eliminación de herencia de Layout.tsx de plataforma y corrección de Viewport.

import { Metadata } from 'next';
import { ImmersiveMap } from "@/components/geo/immersive-map";

/**
 * [METADATA API]: Identidad de Visualización
 */
export const metadata: Metadata = {
  title: 'Madrid Resonance | Exploración Espacial',
  description: 'Capa de realidad aumentada y memoria urbana sobre la ciudad de Madrid.',
};

/**
 * COMPONENTE: MapExplorerPage
 * Esta página vive fuera del PlatformLayout, lo que le otorga soberanía sobre 
 * el 100% de la altura y el ancho del dispositivo.
 */
export default function MapExplorerPage() {
  return (
    /**
     * [FIX ESTRUCTURAL]: 
     * Usamos 'h-[100dvh]' (Dynamic Viewport Height) para que el mapa ignore 
     * los márgenes del Layout padre y se ajuste al tamaño real de la pantalla del móvil.
     * La clase 'fixed inset-0' garantiza que este lienzo sea la capa base del sistema.
     */
    <div className="fixed inset-0 w-full h-[100dvh] bg-black overflow-hidden selection:bg-primary/20">
      
      {/* 
          MOTOR DE VISUALIZACIÓN: ImmersiveMap
          Al estar en la ruta raíz y sin Layouts intermedios, 
          este componente tiene control total sobre el canvas de Mapbox.
      */}
      <div className="absolute inset-0 z-0">
        <ImmersiveMap />
      </div>

      {/* 
          CAPAS DE INTERACCIÓN (HUD)
          Estas capas flotan sobre el mapa con un sistema de Z-Index orquestado.
          Están diseñadas para ser ignoradas por lectores de pantalla cuando sea necesario,
          o para ser interactuables de forma táctil y precisa.
      */}
      
      {/* 
          NOTA DE SEGURIDAD: 
          No incluimos aquí el <Navigation> global de la plataforma, 
          ya que es precisamente lo que causaba el conflicto de espacio.
      */}

    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Independencia de Ruta: Al ubicar este archivo en 'app/map/page.tsx', 
 *    desvinculamos el mapa de cualquier padding o cabecera inyectada por 
 *    '(platform)/layout.tsx'.
 * 2. Viewport Dinámico: 'h-[100dvh]' es la solución definitiva al error de 
 *    la barra de herramientas del móvil que cortaba la parte inferior de la UI.
 * 3. Integridad de Saneamiento: Este archivo es ahora un nodo autónomo. 
 *    El mapa ya no está "dentro de una caja", el mapa ES la aplicación.
 */