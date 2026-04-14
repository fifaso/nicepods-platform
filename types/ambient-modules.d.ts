/**
 * ARCHIVO: types/ambient-modules.d.ts
 * VERSIÓN: 1.1 (NicePod Ambient Declarations - Static Asset Shield Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Declarar explícitamente los contratos para módulos no ejecutables 
 * (Cascading Style Sheets, Imágenes, Scalable Vector Graphics), permitiendo 
 * importaciones de efectos secundarios sin violar el rigor del Build Shield 
 * Sovereignty (BSS).
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

/**
 * DECLARACIÓN: Cascading Style Sheets (Estilos)
 * Misión: Permitir importaciones de hojas de estilo globales y modulares.
 */
declare module "*.css" {
  const cascadingStyleSheetContent: { [styleClassName: string]: string };
  export default cascadingStyleSheetContent;
}

/**
 * DECLARACIÓN: Activos Visuales e Imágenes de Mapa de Bits
 */
declare module "*.png";
declare module "*.jpg";
declare module "*.jpeg";
declare module "*.webp";
declare module "*.avif";

/**
 * DECLARACIÓN: Scalable Vector Graphics (Gráficos Vectoriales)
 */
declare module "*.svg" {
  import type { FC, SVGProps } from "react";
  const scalableVectorGraphicIcon: FC<SVGProps<SVGSVGElement>>;
  export default scalableVectorGraphicIcon;
}

/**
 * DECLARACIÓN: Activos de Motores de Renderizado Externos (Mapbox GL)
 */
declare module "mapbox-gl/dist/mapbox-gl.css";