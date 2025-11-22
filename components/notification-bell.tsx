// components/notification-bell.tsx
// VERSIÓN FINAL Y COMPLETA: Con popover scrollable, footer de acciones y tipos exportables.

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Bell, User, Heart, Mic, CheckCircle2, AlertCircle, MessageSquare, Rss, Archive, Book } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

// [CAMBIO QUIRÚRGICO #1]: Exportamos el tipo para que sea reutilizable en la página de historial.
export type Notification = {
  id: number;
  type: string;
  is_read: boolean;
  created_at: string;
  data: {
    actor_id?: string;
    actor_name?: string;
    actor_avatar_url?: string;
    podcast_id?: number;
    podcast_title?: string;
    job_title?: string;
    error_message?: string;
    testimonial_text?: string;
  };
};

// [CAMBIO QUIRÚRGICO #2]: Exportamos el sub-componente para reutilizarlo en la página de historial.
export function NotificationItem({ notification }: { notification: Notification }) {
  const iconMap: { [key: string]: React.ReactNode } = {
    'new_like': <Heart className="h-5 w-5 text-red-500" />,
    'new_follower': <User className="h-5 w-5 text-blue-500" />,
    'podcast_created_success': <CheckCircle2 className="h-5 w-5 text-green-500" />,
    'podcast_created_failure': <AlertCircle className="h-5 w-5 text-destructive" />,
    'new_testimonial': <MessageSquare className="h-5 w-5 text-yellow-500" />,
    'new_podcast_from_followed_user': <Rss className="h-5 w-5 text-purple-500" />,
    'default': <Mic className="h-5 w-5 text-primary" />
  };

  const getMessageAndLink = (n: Notification) => {
    switch (n.type) {
      case 'new_like':
        return {
          href: `/podcast/${n.data.podcast_id}`,
          message: <p><span className="font-semibold">{n.data.actor_name}</span> le ha gustado tu podcast: <span className="italic">"{n.data.podcast_title}"</span></p>
        };
      case 'new_follower':
        return {
          href: `/profile/${n.data.actor_id}`,
          message: <p><span className="font-semibold">{n.data.actor_name}</span> ha comenzado a seguirte.</p>
        };
      case 'podcast_created_success':
         return {
          href: `/podcast/${n.data.podcast_id}`,
          message: <p>Tu podcast <span className="font-semibold">"{n.data.podcast_title}"</span> ha sido creado con éxito.</p>
        };
      case 'podcast_created_failure':
         return {
          href: `/create`,
          message: <p>Error al crear <span className="font-semibold">"{n.data.job_title}"</span>. Razón: {n.data.error_message || 'desconocida'}</p>
        };
      case 'new_testimonial':
         return {
          href: `/profile/${n.data.actor_id}`,
          message: <p><span className="font-semibold">{n.data.actor_name}</span> te ha dejado un testimonio.</p>
        };
      case 'new_podcast_from_followed_user':
        return {
          href: `/podcast/${n.data.podcast_id}`,
          message: <p><span className="font-semibold">{n.data.actor_name}</span> ha publicado un nuevo podcast: <span className="italic">"{n.data.podcast_title}"</span></p>
        };
      default:
        return { href: '#', message: <p>Tienes una nueva actualización.</p> };
    }
  };

  const { href, message } = getMessageAndLink(notification);
  const icon = iconMap[notification.type] || iconMap['default'];
  const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: es });

  return (
    <Link href={href}>
        <div className={cn("p-2 rounded-md transition-colors hover:bg-muted/50", !notification.is_read && "bg-primary/5")}>
            <div className="flex items-start space-x-3">
                <div className="mt-1 flex-shrink-0">{icon}</div>
                <div className="flex-grow">
                    <div className="text-sm text-muted-foreground">{message}</div>
                    <p className="text-xs text-muted-foreground/70 mt-1">{timeAgo}</p>
                </div>
                {!notification.is_read && <div className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />}
            </div>
        </div>
    </Link>
  );
}

export function NotificationBell() {
  const { user, supabase } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchInitialNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) {
        console.error("Error al cargar notificaciones:", error);
        return;
      }
      setNotifications(data as Notification[]);
      setUnreadCount(data.filter(n => !n.is_read).length);
    };

    fetchInitialNotifications();

    const channel = supabase.channel(`notifications:${user.id}`)
      .on<Notification>(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload) => {
          setNotifications(currentNotifications => [payload.new as Notification, ...currentNotifications]);
          setUnreadCount(currentCount => currentCount + 1);
        }
      ).subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase]);

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;
    setUnreadCount(0);
    setNotifications(current => current.map(n => ({ ...n, is_read: true })));
    const { error } = await supabase.rpc('mark_notifications_as_read');
    if (error) console.error("Error al marcar notificaciones como leídas:", error);
  };

  return (
    <Popover onOpenChange={(open) => { if (open) markAllAsRead(); }}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 md:w-96 p-0">
        <div className="p-2 border-b">
          <h4 className="font-medium leading-none">Notificaciones</h4>
          <p className="text-sm text-muted-foreground">Tus últimas actualizaciones.</p>
        </div>
        
        <div className="max-h-[400px] overflow-y-auto scrollbar-thin p-2">
          {notifications.length > 0 ? (
            <div className="space-y-1">
              {notifications.map(n => <NotificationItem key={n.id} notification={n} />)}
            </div>
          ) : (
            <div className="text-center text-sm text-muted-foreground py-8">
              No tienes notificaciones nuevas.
            </div>
          )}
        </div>

        <div className="border-t p-2 flex gap-2">
          <Button variant="outline" size="sm" className="w-full" onClick={markAllAsRead}>
            <Archive className="h-4 w-4 mr-2" />
            Marcar como leído
          </Button>
          <Link href="/notifications" className="w-full">
            <Button variant="default" size="sm" className="w-full">
              <Book className="h-4 w-4 mr-2" />
              Ver Todas
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}