// components/ui/quadrant-card.tsx
// Una tarjeta interactiva y animada para representar las categorías de descubrimiento.

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

interface QuadrantCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}

export function QuadrantCard({ icon, title, description, href }: QuadrantCardProps) {
  return (
    <Link href={href} className="block group" passHref>
      <motion.div
        whileHover={{ y: -5, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="h-full" // Asegura que la animación ocupe toda la altura disponible.
      >
        <Card className="h-full bg-card/50 backdrop-blur-lg border-border/20 shadow-lg group-hover:border-primary/50 transition-colors duration-300">
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-lg text-primary flex-shrink-0">
              {icon}
            </div>
            <div>
              <h3 className="font-semibold text-base text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}