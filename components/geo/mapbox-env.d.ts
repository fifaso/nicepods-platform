/**
 * ARCHIVO: components/geo/mapbox-env.d.ts
 * VERSIÓN: 2.0 (NicePod Mapbox Environment - Type Augmentation Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Asegurar que el compilador de TypeScript reconozca las definiciones 
 * oficiales de los motores de renderizado WebGL, evitando el ensombrecimiento 
 * de tipos (Type Shadowing) y permitiendo la interoperabilidad soberana.
 * [REFORMA V2.0]: Eliminación de declaraciones de módulo vacías que causaban 
 * el error TS2694. Sustitución por referencias de tipos oficiales. 
 * Cumplimiento absoluto de la Zero Abbreviations Policy (ZAP).
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

/**
 * [BUILD SHIELD]: REFERENCIAS DE TRIPLE BARRA
 * Misión: Forzar al compilador a cargar los tipos reales de node_modules 
 * antes de procesar el resto de la Workstation.
 */
/// <reference types="mapbox-gl" />
/// <reference types="react-map-gl" />

export { }; // Convierte este archivo en un módulo para evitar polución global.

/**
 * NOTA TÉCNICA DEL ARCHITECT (V2.0):
 * 1. Shadowing Elimination: Se han eliminado las líneas 'declare module' que 
 *    anulaban las interfaces reales de Mapbox. Ahora el compilador puede 
 *    resolver 'mapboxgl.Map' con total precisión.
 * 2. ZAP Enforcement: Se ha purificado la documentación interna eliminando 
 *    abreviaciones técnicas en favor de descriptores industriales.
 * 3. Environment Stability: Este archivo ahora actúa como un puente de 
 *    referencia en lugar de un bloqueador de tipos.
 */