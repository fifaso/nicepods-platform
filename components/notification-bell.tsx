// components/notification-bell.tsx
// NUEVO COMPONENTE DEDICADO PARA LAS NOTIFICACIONES

"use client";

import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// TODO: En el futuro, este componente recibirá y gestionará las notificaciones.
// Por ahora, es un placeholder funcional y bien diseñado.

export function NotificationBell() {
  // TODO: Añadir estado para el contador de notificaciones no leídas
  const unreadCount = 0; // Placeholder

  return (
    <Popover>
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
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Notificaciones</h4>
            <p className="text-sm text-muted-foreground">
              Aquí aparecerán las últimas actualizaciones.
            </p>
          </div>
          <div className="text-center text-sm text-muted-foreground py-8">
            {/* TODO: Mapear y renderizar las notificaciones reales aquí */}
            No tienes notificaciones nuevas.
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}