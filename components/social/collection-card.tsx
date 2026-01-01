"use client";

import { AuroraCard } from "@/components/ui/aurora-card";
import { Lock, Unlock, Layers } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface CollectionCardProps {
  id: string;
  title: string;
  itemCount: number;
  isPublic: boolean;
  coverImage?: string;
}

export const CollectionCard = ({ 
  id, 
  title, 
  itemCount, 
  isPublic, 
  coverImage 
}: CollectionCardProps) => {
  return (
    <Link href={`/collection/${id}`} className="group block relative">
      {/* Efecto de Apilado (Stack Effect) */}
      <div className="absolute top-0 inset-x-2 h-full bg-white/5 rounded-2xl -translate-y-2 scale-95 group-hover:-translate-y-3 transition-transform duration-300" />
      
      <AuroraCard className="h-full group-hover:border-violet-500/30 transition-colors duration-300">
        <div className="aspect-[4/3] relative bg-muted/50 overflow-hidden">
          {coverImage ? (
            <Image 
              src={coverImage} 
              alt={title} 
              fill 
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-white/20">
              <Layers size={48} strokeWidth={1} />
            </div>
          )}
          
          {/* Badge de Privacidad */}
          <div className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/70">
            {isPublic ? <Unlock size={12} /> : <Lock size={12} />}
          </div>
        </div>

        <div className="p-4 space-y-1">
          <h3 className="font-bold text-lg leading-tight group-hover:text-violet-300 transition-colors">
            {title}
          </h3>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
            {itemCount} {itemCount === 1 ? "Audio" : "Audios"}
          </p>
        </div>
      </AuroraCard>
    </Link>
  );
};