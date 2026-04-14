/**
 * ARCHIVO: app/(platform)/notifications/notification-history-client.tsx
 * VERSIÓN: 5.0 (NicePod Madrid Resonance - Full Nominal Sync & ZAP Absolute Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Orquestar la central de notificaciones histórica con arquitectura 
 * de datos pura, gestionando la agrupación cronológica y la visualización 
 * táctica inmersiva del capital intelectual recibido.
 * [REFORMA V5.0]: Sincronización nominal total con el componente NotificationBell 
 * V3.0. Resolución del error TS2724 mediante el uso de 'NotificationEntry'. 
 * Aplicación integral de la Zero Abbreviations Policy (ZAP) en la lógica de 
 * agrupación y mapeo de interfaz.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { format, isToday, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';
import { AnimatePresence, motion } from 'framer-motion';
import { BellOff, Clock, History, Sparkles } from 'lucide-react';
import { useMemo } from 'react';

// --- INFRAESTRUCTURA DE COMPONENTES SOBERANOS ---
import { NotificationEntry, NotificationItem } from "@/components/system/notification-bell";
import { Card, CardContent } from '@/components/ui/card';

/**
 * INTERFAZ: NotificationHistoryClientProperties
 */
interface NotificationHistoryClientProperties {
  /** initialNotificationsCollection: Listado de sabiduría asíncrona inyectada desde el servidor. */
  initialNotificationsCollection: NotificationEntry[];
}

/**
 * COMPONENTE: NotificationHistoryClient
 * Maneja la agrupación y visualización del historial de actividad con un motor de renderizado puro.
 */
export function NotificationHistoryClient({
  initialNotificationsCollection
}: NotificationHistoryClientProperties) {

  /**
   * notificationGroupsCollection: Motor de Procesamiento Cronológico
   * [MTI]: Ejecutamos la agrupación dentro de useMemo para evitar cálculos redundantes 
   * en el Hilo Principal durante re-renderizados de la interfaz.
   */
  const notificationGroupsCollection = useMemo(() => {
    if (!initialNotificationsCollection || initialNotificationsCollection.length === 0) {
      return [];
    }

    const notificationGroupsRecord: Record<string, {
      localizedTitle: string;
      referenceDate: Date;
      entriesCollection: NotificationEntry[]
    }> = {};

    initialNotificationsCollection.forEach((notificationEntry) => {
      // Validamos la integridad temporal del nodo antes de su procesamiento.
      if (!notificationEntry.created_at) return;

      const notificationCreationDate = new Date(notificationEntry.created_at);
      let groupIdentificationKey: string;
      let groupLocalizedTitle: string;

      if (isToday(notificationCreationDate)) {
        groupIdentificationKey = '0_today';
        groupLocalizedTitle = 'Hoy';
      } else if (isYesterday(notificationCreationDate)) {
        groupIdentificationKey = '1_yesterday';
        groupLocalizedTitle = 'Ayer';
      } else {
        // Generamos una firma temporal unívoca para la agrupación histórica por día.
        groupIdentificationKey = format(notificationCreationDate, 'yyyy-MM-dd');
        groupLocalizedTitle = format(notificationCreationDate, "d 'de' MMMM 'de' yyyy", { locale: es });
      }

      if (!notificationGroupsRecord[groupIdentificationKey]) {
        notificationGroupsRecord[groupIdentificationKey] = {
          localizedTitle: groupLocalizedTitle,
          referenceDate: notificationCreationDate,
          entriesCollection: []
        };
      }
      notificationGroupsRecord[groupIdentificationKey].entriesCollection.push(notificationEntry);
    });

    /**
     * ORDENAMIENTO CRONOLÓGICO SOBERANO:
     * Los grupos se disponen en orden descendente (el capital intelectual más reciente primero).
     */
    return Object.values(notificationGroupsRecord).sort((comparativeA, comparativeB) =>
      comparativeB.referenceDate.getTime() - comparativeA.referenceDate.getTime()
    );
  }, [initialNotificationsCollection]);

  // --- RENDERIZADO DE ESTADO DE VACÍO SEMÁNTICO ---
  if (!initialNotificationsCollection || initialNotificationsCollection.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-24 text-center"
      >
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="relative bg-zinc-900 p-8 rounded-full border border-white/10 shadow-inner">
            <BellOff className="h-12 w-12 text-zinc-700" />
          </div>
        </div>
        <h3 className="text-2xl font-black text-white uppercase tracking-tight italic">Silencio en la Red</h3>
        <p className="text-zinc-500 mt-2 max-w-sm font-medium uppercase text-[10px] tracking-widest leading-relaxed">
          Su historial de resonancia está limpio. Las nuevas crónicas aparecerán aquí tras la interacción con la malla.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="w-full space-y-8 pb-12 isolate">

      {/* CABECERA TÁCTICA DE COMANDO */}
      <header className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20 shadow-lg shadow-primary/5">
            <History className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-white italic leading-none">
              Centro de <span className="text-primary">Resonancia</span>
            </h2>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mt-1 opacity-70">
              Historial de actividad geolocalizada y peritaje
            </p>
          </div>
        </div>

        {/* INDICADOR DE SINTONÍA DE RED */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
          <Sparkles size={12} className="text-primary" />
          <span className="text-[9px] font-black text-white/50 uppercase tracking-widest">Protocolo: Activo</span>
        </div>
      </header>

      {/* CONTENEDOR DE CRISTALISMO (NOTIFICACIONES GRUPO) */}
      <Card className="bg-card/40 backdrop-blur-3xl border-white/5 shadow-2xl rounded-[3rem] overflow-hidden">
        <CardContent className="p-8 md:p-12">
          <div className="space-y-16">
            <AnimatePresence mode="popLayout">
              {notificationGroupsCollection.map((notificationGroup, itemIndex) => (
                <motion.section
                  key={notificationGroup.localizedTitle}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: itemIndex * 0.1 }}
                  className="relative"
                >
                  {/* LÍNEA DE TIEMPO VISUAL CINEMÁTICA */}
                  <div className="absolute left-[-4px] top-10 bottom-0 w-[1px] bg-gradient-to-b from-primary/40 to-transparent hidden md:block" />

                  <div className="flex items-center gap-4 mb-8">
                    <div className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.6)]" />
                    <h3 className="text-xs font-black uppercase tracking-[0.4em] text-primary/80">
                      {notificationGroup.localizedTitle}
                    </h3>
                  </div>

                  {/* LISTADO DE NODOS DE NOTIFICACIÓN */}
                  <div className="grid grid-cols-1 gap-4 md:pl-10">
                    {notificationGroup.entriesCollection.map((notificationEntry) => (
                      <motion.div
                        key={notificationEntry.id}
                        whileHover={{ x: 4 }}
                        className="transition-all active:scale-[0.99]"
                      >
                        <NotificationItem notification={notificationEntry} />
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              ))}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* FIRMA DE INFRAESTRUCTURA SOBERANA */}
      <footer className="flex flex-col items-center justify-center gap-2 pt-8 opacity-20">
        <div className="flex items-center gap-3">
          <div className="h-px w-8 bg-zinc-700" />
          <Clock size={14} className="text-zinc-500" />
          <div className="h-px w-8 bg-zinc-700" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">
          NicePod Architecture V4.9 • Madrid Resonance
        </span>
      </footer>
    </div>
  );
}