// components/notification-bell.tsx
// VERSIÓN FINAL Y COMPLETA: Componente dinámico con suscripción en tiempo real y renderizado para TODOS los tipos de notificación.

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Bell, User, Heart, Mic, CheckCircle2, AlertCircle, MessageSquare, Rss } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

// Definimos el tipo para una notificación, incluyendo el 'data' parseado.
type Notification = {
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

// Sub-componente para renderizar un item de notificación individual.
function NotificationItem({ notification }: { notification: Notification }) {
  // Mapeo de tipos de notificación a iconos para una fácil extensibilidad.
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
          href: `/profile/${n.data.actor_id}`, // Asumiendo perfil por ID, o se podría usar username si está en 'data'
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
          href: `/profile/${n.data.actor_id}`, // O al perfil del usuario actual para ver sus testimonios
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
    
    // Actualización optimista de la UI para una respuesta instantánea.
    setUnreadCount(0);
    setNotifications(current => current.map(n => ({ ...n, is_read: true })));
    
    // Llamada a la RPC en segundo plano para actualizar la base de datos.
    const { error } = await supabase.rpc('mark_notifications_as_read');
    if (error) {
      console.error("Error al marcar notificaciones como leídas:", error);
      // Opcional: Implementar lógica de rollback si la llamada a la RPC falla.
    }
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
      <PopoverContent className="w-80 md:w-96 p-2">
        <div className="grid gap-2">
          <div className="p-2">
            <h4 className="font-medium leading-none">Notificaciones</h4>
            <p className="text-sm text-muted-foreground">
              Aquí aparecerán las últimas actualizaciones.
            </p>
          </div>
          <div className="space-y-1">
            {notifications.length > 0 ? (
              notifications.map(n => <NotificationItem key={n.id} notification={n} />)
            ) : (
              <div className="text-center text-sm text-muted-foreground py-8">
                No tienes notificaciones nuevas.
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}