// components/universe-card.tsx
// Una tarjeta visual para representar un "Universo de Resonancia".

"use client";

import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface UniverseCardProps {
  title: string;
  image: string;
  href: string;
  isActive: boolean;
}

export function UniverseCard({ title, image, href, isActive }: UniverseCardProps) {
  return (
    <Link href={href} className="group block">
      <Card className={cn(
        "relative overflow-hidden h-24 md:h-32 transition-all duration-300 border-2 rounded-2xl", // Esquinas más redondeadas
        isActive ? "border-primary shadow-lg shadow-primary/20" : "border-transparent hover:border-primary/50"
      )}>
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover z-0 transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
        <div className="relative z-20 flex items-end h-full p-3">
          <h3 className="font-bold text-white text-sm md:text-base">{title}</h3>
        </div>
      </Card>
    </Link>
  );
}