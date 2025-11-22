// app/notifications/notification-history-client.tsx
// Componente de cliente que agrupa y renderiza el historial de notificaciones por fecha.

"use client";

import { useMemo } from 'react';
// Asumiendo que exportaremos Notification y NotificationItem de notification-bell.tsx
import { Notification, NotificationItem } from "@/components/notification-bell"; 
import { format, isToday, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';

interface NotificationHistoryClientProps {
  initialNotifications: Notification[];
}

export function NotificationHistoryClient({ initialNotifications }: NotificationHistoryClientProps) {
  const groupedNotifications = useMemo(() => {
    if (!initialNotifications) return {};

    return initialNotifications.reduce((acc, notification) => {
      const date = new Date(notification.created_at);
      let groupTitle: string;

      if (isToday(date)) groupTitle = 'Hoy';
      else if (isYesterday(date)) groupTitle = 'Ayer';
      else groupTitle = format(date, "d 'de' MMMM 'de' yyyy", { locale: es });

      if (!acc[groupTitle]) acc[groupTitle] = [];
      acc[groupTitle].push(notification);
      return acc;
    }, {} as Record<string, Notification[]>);
  }, [initialNotifications]);

  const sortedGroups = Object.keys(groupedNotifications).sort((a, b) => {
    if (a === 'Hoy') return -1; if (b === 'Hoy') return 1;
    if (a === 'Ayer') return -1; if (b === 'Ayer') return 1;
    return new Date(b).getTime() - new Date(a).getTime();
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