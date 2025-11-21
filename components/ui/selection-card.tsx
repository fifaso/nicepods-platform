// components/ui/selection-card.tsx
// VERSIÓN POTENCIADA: Ahora acepta y aplica una prop 'className' externa.

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SelectionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
  badgeText?: string;
  disabled?: boolean;
  className?: string; // [CAMBIO QUIRÚRGICO #1]: Se añade la prop 'className' para aceptar clases externas.
}

export function SelectionCard({ icon, title, description, isSelected, onClick, badgeText, disabled = false, className }: SelectionCardProps) {
  return (
    <Card
      onClick={disabled ? undefined : onClick}
      // [CAMBIO QUIRÚRGICO #2]: Se utiliza `cn()` para fusionar de forma segura las clases internas con la 'className' externa.
      className={cn(
        "transition-all duration-200 relative group h-full flex flex-col",
        isSelected
          ? "border-primary ring-2 ring-primary/50 shadow-lg"
          : "hover:border-primary/50 hover:shadow-md",
        disabled 
          ? "opacity-50 cursor-not-allowed bg-muted/50" 
          : "cursor-pointer",
        className // La nueva className se aplica aquí, permitiendo estilos adicionales desde el componente padre.
      )}
    >
      {badgeText && (
        <Badge variant="secondary" className="absolute -top-2 -right-2">{badgeText}</Badge>
      )}
      <CardContent className="p-4 flex flex-col items-center justify-center text-center flex-grow">
        <div className={cn("mb-3 text-primary", !disabled && "transition-transform duration-300 group-hover:scale-110")}>
          {icon}
        </div>
        <h3 className="font-semibold text-base mb-1">{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </CardContent>
    </Card>
  );
}