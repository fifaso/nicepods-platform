// components/ui/selection-card.tsx
// COMPONENTE REUTILIZABLE EN SU UBICACIÓN CORRECTA Y CON PROP `disabled`

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
  disabled?: boolean; // [INTERVENCIÓN QUIRÚRGICA #1]: Se añade la prop `disabled`
}

export function SelectionCard({ icon, title, description, isSelected, onClick, badgeText, disabled = false }: SelectionCardProps) {
  return (
    <Card
      onClick={disabled ? undefined : onClick}
      className={cn(
        "transition-all duration-200 relative group h-full flex flex-col",
        isSelected
          ? "border-primary ring-2 ring-primary/50 shadow-lg"
          : "hover:border-primary/50 hover:shadow-md",
        // [INTERVENCIÓN QUIRÚRGICA #2]: Clases para el estado deshabilitado
        disabled 
          ? "opacity-50 cursor-not-allowed bg-muted/50" 
          : "cursor-pointer"
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