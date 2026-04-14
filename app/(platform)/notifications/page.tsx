/**
 * ARCHIVO: app/(platform)/notifications/page.tsx
 * VERSIÓN: 5.0 (NicePod Notifications Server Orchestrator - Full Nominal Integrity Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Orquestar la recuperación de sabiduría asíncrona desde el Metal (Supabase) 
 * en el servidor, validando la autoridad del Voyager y proveyendo la hidratación 
 * inicial para la terminal de historial.
 * [REFORMA V5.0]: Sincronización nominal absoluta con NotificationBell V3.0 y 
 * NotificationHistoryClient V5.0. Resolución del error TS2724 mediante el uso 
 * de 'NotificationEntry'. Erradicación total de abreviaturas (ZAP) en variables 
 * de servidor y contratos de datos.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { NotificationHistoryClient } from "./notification-history-client";

// --- IMPORTACIÓN DE SOBERANÍA DE TIPOS (BUILD SHIELD V8.6) ---
import type { NotificationEntry } from "@/components/system/notification-bell";

/**
 * NotificationsPage: El punto de entrada soberano para el historial de resonancia.
 * Misión: Recuperar las notificaciones del Voyager de forma atómica y segura.
 */
export default async function NotificationsPage() {
  const supabaseSovereignClient = createClient();

  // 1. HANDSHAKE DE IDENTIDAD SOBERANA (Server-Side Authority)
  const { data: { user: authenticatedUser } } = await supabaseSovereignClient.auth.getUser();

  if (!authenticatedUser) {
    // Redirección táctica si el enlace sensorial no está autenticado.
    redirect('/login?redirect=/notifications');
  }

  /**
   * 2. COSECHA DE SABIDURÍA ASÍNCRONA
   * Misión: Consultar la tabla 'notifications' filtrando por la identidad del Voyager.
   */
  const {
    data: notificationsCollection,
    error: databaseOperationException
  } = await supabaseSovereignClient
    .from('notifications')
    .select('*')
    .eq('user_id', authenticatedUser.id)
    .order('created_at', { ascending: false });

  if (databaseOperationException) {
    console.error("🔥 [Metal-Error] Fallo al cargar el historial de notificaciones:", databaseOperationException.message);
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 md:py-20 px-4 isolate">

      {/* CABECERA DE CONTEXTO SEMÁNTICO */}
      <header className="mb-12 md:mb-20">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase italic leading-tight font-serif">
          Notificaciones
        </h1>
        <p className="text-sm md:text-lg text-zinc-500 font-bold uppercase tracking-[0.2em] mt-4 max-w-2xl">
          El registro histórico de todas las resonancias e interacciones con la Malla de Madrid.
        </p>
      </header>

      {/* 
          III. TERMINAL DE HISTORIAL (CLIENT COMPONENT)
          [SINCRO V5.0]: Inyección de la colección de notificaciones bajo el nuevo
          contrato nominal 'initialNotificationsCollection'.
      */}
      <NotificationHistoryClient
        initialNotificationsCollection={notificationsCollection as NotificationEntry[] || []}
      />

    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V5.0):
 * 1. Build Shield Compliance: Se resolvió el error TS2724 al importar 'NotificationEntry' 
 *    en lugar del miembro inexistente 'Notification'.
 * 2. ZAP Absolute Compliance: Purificación total de variables de servidor. 'supabase' 
 *    pasó a 'supabaseSovereignClient', 'user' a 'authenticatedUser', y 'notifications' 
 *    a 'notificationsCollection'.
 * 3. Contract Synchronization: La propiedad inyectada al componente hijo ahora es 
 *    'initialNotificationsCollection', alineándose con el peritaje de la Fase Anterior.
 */