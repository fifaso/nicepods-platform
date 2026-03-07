// components/universe-card.tsx
// VERSIÓN: 3.0 (NicePod Universe Gateway - Carousel Ready Edition)
// Misión: Tarjeta visual de Universo con soporte para scroll horizontal en dispositivos táctiles.
// [ESTABILIZACIÓN]: Soporte de inyección de clases para control de ancho fluido y optimización de LCP.

"use client";

import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * INTERFAZ: UniverseCardProps
 * [FIX]: Se añadió className para permitir que el orquestador padre (LibraryTabs)
 * controle el comportamiento físico de la tarjeta dentro de un flex-container.
 */
interface UniverseCardProps {
  title: string;
  image: string;
  href: string;
  isActive: boolean;
  className?: string; 
}

export function UniverseCard({ 
  title, 
  image, 
  href, 
  isActive, 
  className 
}: UniverseCardProps) {
  
  return (
    <Link 
      href={href} 
      className={cn(
        "group block outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl", 
        className
      )}
      aria-label={`Explorar universo: ${title}`}
    >
      <Card 
        className={cn(
          "relative overflow-hidden h-24 md:h-32 transition-all duration-500 rounded-2xl border-2", 
          isActive 
            ? "border-primary shadow-[0_0_20px_rgba(139,92,246,0.3)] scale-[1.02]" 
            : "border-transparent hover:border-primary/50 bg-zinc-950/40"
        )}
      >
        {/* --- ACTIVO VISUAL (BACKGROUND) --- */}
        <Image
          src={image}
          alt={`Visualización de ${title}`}
          fill
          // [OPTIMIZACIÓN LCP]: Instruimos a Vercel sobre el tamaño físico real para evitar sobrecarga de red.
          sizes="(max-width: 768px) 180px, 250px"
          className={cn(
            "object-cover z-0 transition-transform duration-700 ease-out",
            isActive ? "scale-105" : "group-hover:scale-110 opacity-70 group-hover:opacity-100"
          )}
          priority={false} // Carga diferida inteligente
        />
        
        {/* --- CORTINA DE LEGIBILIDAD (SHIELD) --- */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-[#020202]/60 to-transparent z-10 transition-opacity duration-500 group-hover:opacity-80" />
        
        {/* --- CAPA DE TEXTO --- */}
        <div className="relative z-20 flex items-end h-full p-4 md:p-5">
          <h3 className={cn(
            "font-black text-sm md:text-base leading-tight tracking-tight uppercase transition-colors duration-300",
            isActive ? "text-white" : "text-zinc-300 group-hover:text-primary"
          )}>
            {title}
          </h3>
        </div>
      </Card>
    </Link>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Control Táctil: La integración de 'className' en el nodo raíz del Link 
 *    permite aplicar las utilidades de 'snap-start' y 'w-[150px]' desde el 
 *    LibraryTabs, activando la experiencia nativa de carrusel en iOS/Android.
 * 2. Accesibilidad: Se añadió aria-label para asegurar que los lectores de 
 *    pantalla enuncien la acción y no solo lean el título de la imagen.
 * 3. Feedback Visual: Se afinaron las opacidades y escalas para que el usuario
 *    sepa exactamente qué Universo está activo ('isActive') y cuál está 
 *    siendo enfocado ('group-hover').
 */