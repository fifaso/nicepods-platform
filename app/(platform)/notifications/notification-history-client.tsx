// app/notifications/notification-history-client.tsx
// VERSIÓN: 4.0 (Madrid Resonance - Full Integrity & Motion Orchestration)
// Misión: Central de notificaciones con arquitectura de datos pura y diseño táctico inmersivo.

"use client";

import { format, isToday, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';
import { AnimatePresence, motion } from 'framer-motion';
import { BellOff, Clock, History, Sparkles } from 'lucide-react';
import { useMemo } from 'react';

import { Notification, NotificationItem } from "@/components/notification-bell";
import { Card, CardContent } from '@/components/ui/card';

interface NotificationHistoryClientProps {
  initialNotifications: Notification[];
}

/**
 * COMPONENTE: NotificationHistoryClient
 * Maneja la agrupación y visualización de notificaciones con un motor de renderizado puro.
 */
export function NotificationHistoryClient({ initialNotifications }: NotificationHistoryClientProps) {

  /**
   * DATA ENGINE: Grouping & Sorting
   * [SISTEMA]: Procesamos las notificaciones fuera del flujo principal de renderizado
   * para garantizar que el componente sea idempotente y libre de efectos colaterales (impurezas).
   */
  const sortedAndGrouped = useMemo(() => {
    if (!initialNotifications || initialNotifications.length === 0) return [];

    const groups: Record<string, { title: string; date: Date; items: Notification[] }> = {};

    initialNotifications.forEach((notification) => {
      // Validamos que exista la fecha antes de procesar
      if (!notification.created_at) return;

      const notifyDate = new Date(notification.created_at);
      let groupKey: string;
      let groupTitle: string;

      if (isToday(notifyDate)) {
        groupKey = '0_today';
        groupTitle = 'Hoy';
      } else if (isYesterday(notifyDate)) {
        groupKey = '1_yesterday';
        groupTitle = 'Ayer';
      } else {
        // Generamos una clave única por día para agrupar históricamente
        groupKey = format(notifyDate, 'yyyy-MM-dd');
        groupTitle = format(notifyDate, "d 'de' MMMM 'de' yyyy", { locale: es });
      }

      if (!groups[groupKey]) {
        groups[groupKey] = {
          title: groupTitle,
          date: notifyDate,
          items: []
        };
      }
      groups[groupKey].items.push(notification);
    });

    /**
     * ORDENAMIENTO CRONOLÓGICO:
     * Ordenamos los grupos por fecha descendente (lo más reciente primero).
     */
    return Object.values(groups).sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [initialNotifications]);

  // --- RENDERIZADO DE ESTADO VACÍO ---
  if (!initialNotifications || initialNotifications.length === 0) {
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
        <p className="text-zinc-500 mt-2 max-w-sm font-medium">
          Tu historial está limpio. Las nuevas resonancias aparecerán aquí cuando la ciudad interactúe contigo.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="w-full space-y-8 pb-12">

      {/* CABECERA TÁCTICA */}
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
              Historial de actividad geolocalizada
            </p>
          </div>
        </div>

        {/* INDICADOR DE MÁXIMA CALIDAD */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
          <Sparkles size={12} className="text-primary" />
          <span className="text-[9px] font-black text-white/50 uppercase tracking-widest">Estado: Online</span>
        </div>
      </header>

      {/* CONTENEDOR DE CRISTALISMO (NOTIFICACIONES) */}
      <Card className="bg-card/40 backdrop-blur-3xl border-white/5 shadow-2xl rounded-[3rem] overflow-hidden">
        <CardContent className="p-8 md:p-12">
          <div className="space-y-16">
            <AnimatePresence mode="popLayout">
              {sortedAndGrouped.map((group, index) => (
                <motion.section
                  key={group.title}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  {/* LÍNEA DE TIEMPO VISUAL */}
                  <div className="absolute left-[-4px] top-10 bottom-0 w-[1px] bg-gradient-to-b from-primary/40 to-transparent hidden md:block" />

                  <div className="flex items-center gap-4 mb-8">
                    <div className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_15px_rgba(var(--primary),0.6)]" />
                    <h3 className="text-xs font-black uppercase tracking-[0.4em] text-primary/80">
                      {group.title}
                    </h3>
                  </div>

                  {/* LISTADO DE ITEMS DE NOTIFICACIÓN */}
                  <div className="grid grid-cols-1 gap-4 md:pl-10">
                    {group.items.map((notification) => (
                      <motion.div
                        key={notification.id}
                        whileHover={{ x: 4 }}
                        className="transition-all active:scale-[0.99]"
                      >
                        <NotificationItem notification={notification} />
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              ))}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* FIRMA DE INFRAESTRUCTURA */}
      <footer className="flex flex-col items-center justify-center gap-2 pt-8 opacity-20">
        <div className="flex items-center gap-3">
          <div className="h-px w-8 bg-zinc-700" />
          <Clock size={14} className="text-zinc-500" />
          <div className="h-px w-8 bg-zinc-700" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">
          NicePod Malla de Inteligencia v2.5.2
        </span>
      </footer>
    </div>
  );
}