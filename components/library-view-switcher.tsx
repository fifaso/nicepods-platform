// components/library-view-switcher.tsx
// VERSIÓN DE PRODUCCIÓN FINAL: Simplificado para manejar solo las vistas estándar.

"use client";

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List, Compass } from 'lucide-react';
import { cn } from '@/lib/utils';

type LibraryViewMode = 'grid' | 'list' | 'compass';

export function LibraryViewSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const currentView = searchParams.get('view') || 'grid';

  const setView = (view: 'grid' | 'list') => {
    const params = new URLSearchParams(searchParams);
    params.set('view', view);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setView('grid')} 
        title="Vista de Cuadrícula" 
        className={cn('transition-colors', currentView === 'grid' && 'bg-accent text-accent-foreground')}
      >
        <LayoutGrid className="h-5 w-5" />
      </Button>
      
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setView('list')} 
        title="Vista de Lista" 
        className={cn('transition-colors', currentView === 'list' && 'bg-accent text-accent-foreground')}
      >
        <List className="h-5 w-5" />
      </Button>
    </div>
  );
}