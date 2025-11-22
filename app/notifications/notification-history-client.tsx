// app/notifications/notification-history-client.tsx
// VERSIÓN FINAL Y COMPLETA

"use client";

import { useMemo } from 'react';
// Asegúrate de que NotificationBell exporte estos componentes
import { Notification, NotificationItem } from "@/components/notification-bell"; 
import { format, isToday, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';

interface NotificationHistoryClientProps {
  initialNotifications: Notification[];
}

export function NotificationHistoryClient({ initialNotifications }: NotificationHistoryClientProps) {
  const groupedNotifications = useMemo(() => {
    if (!initialNotifications || initialNotifications.length === 0) return {};

    return initialNotifications.reduce((acc, notification) => {
      const date = new Date(notification.created_at);
      let groupTitle: string;

      if (isToday(date)) {
        groupTitle = 'Hoy';
      } else if (isYesterday(date)) {
        groupTitle = 'Ayer';
      } else {
        groupTitle = format(date, "d 'de' MMMM 'de' yyyy", { locale: es });
      }

      if (!acc[groupTitle]) {
        acc[groupTitle] = [];
      }
      acc[groupTitle].push(notification);
      return acc;
    }, {} as Record<string, Notification[]>);
  }, [initialNotifications]);

  const sortedGroups = Object.keys(groupedNotifications).sort((a, b) => {
    const dateA = a === 'Hoy' ? new Date() : a === 'Ayer' ? new Date(Date.now() - 86400000) : new Date(groupedNotifications[a][0].created_at);
    const dateB = b === 'Hoy' ? new Date() : b === 'Ayer' ? new Date(Date.now() - 86400000) : new Date(groupedNotifications[b][0].created_at);
    return dateB.getTime() - dateA.getTime();
  });

  if (initialNotifications.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed rounded-lg">
        <h2 className="text-2xl font-semibold">Tu historial está vacío</h2>
        <p className="text-muted-foreground mt-2">Cuando tengas nuevas actualizaciones, aparecerán aquí.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {sortedGroups.map((groupTitle) => (
        <section key={groupTitle}>
          <h3 className="text-lg font-semibold text-muted-foreground mb-4">{groupTitle}</h3>
          <div className="space-y-2">
            {groupedNotifications[groupTitle].map(notification => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}