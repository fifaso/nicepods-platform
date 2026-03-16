// app/map/page.tsx
// VERSIÓN: 3.0 (NicePod Sovereign Explorer - V2.6 Integration)
// Misión: Proyectar el motor geoespacial y gobernar el acceso a la creación urbana.
// [ESTABILIZACIÓN]: RBAC en Servidor, eliminación de ImmersiveMap e inyección de SpatialEngine.

import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

// --- INFRAESTRUCTURA DE VISUALIZACIÓN SOBERANA ---
import { GeoCreatorOverlay } from "@/components/geo/geo-creator-overlay"; // Componente Cliente de Orquestación

/**
 * [METADATA API]: Identidad de Visualización
 */
export const metadata: Metadata = {
  title: 'Madrid Resonance | Malla Urbana Activa',
  description: 'Explora y ancla la memoria de la ciudad en la red neuronal de NicePod.',
  // Evitamos que los motores de búsqueda indexen el mapa dinámico completo
  robots: { index: false, follow: false }
};

/**
 * COMPONENTE: MapExplorerPage (Server Component)
 * Esta página vive fuera del PlatformLayout, otorgándole soberanía absoluta 
 * sobre el viewport del dispositivo (100dvh).
 */
export default async function MapExplorerPage() {

  // 1. HANDSHAKE SOBERANO EN EL SERVIDOR (RBAC)
  // Evaluamos la identidad y los privilegios ANTES de enviar un solo byte de Mapbox al cliente.
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login?redirect=/map');
  }

  // 2. VERIFICACIÓN DE PRIVILEGIOS DE SIEMBRA (El Futuro V2.7)
  // Determinamos si el usuario tiene capacidad para mutar el mapa (Admin o Pro).
  const userRole = user.app_metadata.user_role || user.app_metadata.role || 'user';
  const isAdmin = userRole === 'admin';

  // TODO (V2.7): Aquí consultaremos la tabla 'subscriptions' para habilitar el true a usuarios Pro.
  const canForgeNodes = isAdmin;

  return (
    /**
     * [CHASIS TÁCTICO]: h-[100dvh]
     * Garantiza que las barras de navegación colapsables de iOS/Android no 
     * oculten los controles del mapa en la parte inferior.
     */
    <div className="fixed inset-0 w-full h-[100dvh] bg-[#020202] overflow-hidden selection:bg-primary/20">

      {/* 
          I. EL MOTOR CARTOGRÁFICO UNIFICADO (V2.6)
          Si el usuario no está forjando un nodo, el mapa opera en modo consumo (EXPLORE).
          La lógica de cambio a FORGE se maneja dentro del GeoCreatorOverlay si el Admin lo activa.
      */}
      <div className="absolute inset-0 z-0">
        {/* Renderizamos el componente cliente que envuelve al SpatialEngine 
            para poder reaccionar a los estados de creación del Admin. */}
        <GeoCreatorOverlay
          canForge={canForgeNodes}
          userId={user.id}
        />
      </div>

      {/* 
          NOTA DE HIGIENE: 
          No incluimos aquí el <Navigation> global de la plataforma para 
          evitar colisiones de z-index con las capas 3D de Mapbox.
      */}

    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V3.0):
 * 1. Aniquilación de Renderizado Basura: Al hacer el chequeo de sesión en SSR 
 *    (`await supabase.auth.getUser()`), evitamos que el cliente descargue los 
 *    MBs de React-Map-GL si no está logueado.
 * 2. Desacoplamiento Lógico: El componente 'GeoCreatorOverlay' (que crearemos a continuación) 
 *    es un Client Component que montará el 'SpatialEngine' y, si 'canForge' es true, 
 *    inyectará el botón flotante (FAB) para abrir el 'ScannerUI'.
 * 3. Escalabilidad Pro: La variable 'canForgeNodes' está preparada para el despliegue 
 *    comercial. En el futuro, bastará con una consulta SQL rápida a la tabla de 
 *    suscripciones para abrir la captura a los Voyagers de pago.
 */