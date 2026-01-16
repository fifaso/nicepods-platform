// components/navigation.tsx
// VERSIÓN: 12.1 (Ultimate Aesthetic - Professional Contrast & Aurora Fix)

"use client";

import { NotificationBell } from "@/components/notification-bell";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { cn, getSafeAsset } from "@/lib/utils";
import { 
  Loader, 
  LogOut, 
  Menu, 
  Mic, 
  ShieldCheck, 
  Sparkles, 
  User as UserIcon, 
  Bell,
  X
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function Navigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, profile, isAdmin, signOut, isLoading } = useAuth();

  const navItems = [
    { href: "/create", label: "Crear" },
    { href: "/podcasts", label: "Micro-pods" },
    { href: "/pricing", label: "Precios" }
  ];

  const isActive = (href: string) => pathname === href;

  const handleLogout = async () => {
    setIsMobileMenuOpen(false);
    try {
      await signOut();
      window.location.href = "/";
    } catch (error) {
      console.error("Error logout:", error);
    }
  };

  const logoSrc = getSafeAsset("/nicepod-logo.png", "logo");

  /**
   * DEFINICIÓN DE ESTILO AURORA MAESTRO
   * Diseñado para máxima legibilidad y contraste profesional.
   */
  const auroraClasses = cn(
    "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600", // Colores vibrantes
    "animate-aurora text-white border border-white/10 shadow-lg",
    "shadow-purple-500/20 dark:shadow-white/5", // Sombras adaptativas
    "hover:scale-105 hover:brightness-110 transition-all duration-300 active:scale-95"
  );

  return (
    <header className="sticky top-0 z-50 w-full p-4">
      <div className="relative max-w-screen-xl mx-auto flex h-16 items-center rounded-2xl border border-border/40 bg-background/80 px-4 shadow-xl backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">

        {/* 1. LOGO */}
        <div className="flex-1 flex justify-start">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-white/10 shadow-inner">
              <Image
                src={logoSrc}
                alt="NicePod"
                fill
                className="object-cover group-hover:scale-110 transition-all duration-500"
                priority
              />
            </div>
            <span className="font-black text-xl tracking-tighter hidden sm:block">NicePod</span>
          </Link>
        </div>

        {/* 2. CTA CENTRAL MÓVIL (Vibrante y Centrado) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:hidden">
          <Link href="/create">
            <Button
              size="sm"
              className={cn("h-9 px-5 rounded-full font-black text-[10px] uppercase tracking-widest", auroraClasses)}
            >
              <Mic className="mr-1.5 h-3.5 w-3.5 animate-pulse" />
              Crear
            </Button>
          </Link>
        </div>

        {/* 3. MENÚ DESKTOP CENTRAL */}
        <nav className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <ul className="flex items-center space-x-1 rounded-full bg-muted/50 p-1 border border-border/20">
            {navItems.map((item) => {
              const isCreateBtn = item.href === '/create';
              if (isCreateBtn) {
                return (
                  <li key={item.href}>
                    <Link href={item.href}>
                      <Button 
                        size="sm" 
                        className={cn("rounded-full px-5 h-8 text-[10px] font-black uppercase tracking-widest", auroraClasses)}
                      >
                        <Sparkles className="mr-1.5 h-3 w-3" />
                        {item.label}
                      </Button>
                    </Link>
                  </li>
                );
              }
              return (
                <li key={item.href}>
                  <Link href={item.href} className={cn(
                    "rounded-full px-4 py-1.5 text-xs font-bold uppercase transition-all block", 
                    isActive(item.href) ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-primary"
                  )}>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* 4. ZONA DERECHA (HERRAMIENTAS & AUTH) */}
        <div className="flex-1 flex items-center justify-end space-x-2">
          <ThemeToggle />
          
          <div className="hidden sm:flex items-center space-x-2">
            {isLoading ? (
              <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : user && profile ? (
              <>
                <NotificationBell />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-9 w-9 cursor-pointer border border-border hover:border-primary transition-all shadow-sm">
                      <AvatarImage src={getSafeAsset(profile.avatar_url, 'avatar')} />
                      <AvatarFallback className="font-black bg-primary/10 text-primary">
                        {profile.full_name?.substring(0, 2).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-2xl border-border/40">
                    <DropdownMenuLabel className="text-[10px] font-black uppercase text-muted-foreground px-2 py-1.5 tracking-widest opacity-70">
                      Mi Estación
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                      <Link href={`/profile/${profile.username}`} className="flex items-center">
                        <UserIcon className="mr-2 h-4 w-4 opacity-70" /> 
                        <span className="font-bold text-sm">Perfil Público</span>
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild className="rounded-xl cursor-pointer bg-red-500/5 focus:bg-red-500/10 focus:text-red-600">
                        <Link href="/admin" className="flex items-center text-red-500">
                          <ShieldCheck className="mr-2 h-4 w-4" /> 
                          <span className="font-black text-xs uppercase">Admin Console</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="rounded-xl text-muted-foreground focus:text-destructive cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" /> 
                      <span className="font-bold text-sm">Cerrar Sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link href='/login'>
                <Button variant="ghost" className="font-bold text-sm">Ingresar</Button>
              </Link>
            )}
          </div>

          {/* 5. MENÚ MÓVIL (Sheet) */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-[280px] p-0 rounded-l-[2rem] border-l-border/40 bg-background/95 backdrop-blur-2xl">
                <div className="flex flex-col h-full p-6">
                  <SheetHeader className="text-left mb-8">
                    <div className="flex items-center justify-between">
                      <SheetTitle className="flex items-center space-x-3">
                        <Image src={logoSrc} alt="NicePod" width={28} height={28} className="rounded-lg shadow-sm" />
                        <span className="font-black text-xl tracking-tighter">NicePod</span>
                      </SheetTitle>
                    </div>
                    <SheetDescription className="sr-only">Navegación móvil NicePod.</SheetDescription>
                  </SheetHeader>

                  <div className="flex flex-col space-y-3">
                    {/* Botón Crear Especial en Móvil */}
                    <Link href="/create" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className={cn("w-full justify-center text-lg h-14 rounded-2xl font-black mb-4", auroraClasses)}>
                        <Mic className="mr-3 h-5 w-5 animate-pulse" />
                        CREAR
                      </Button>
                    </Link>

                    {/* Otros NavItems */}
                    {navItems.filter(item => item.href !== "/create").map((item) => (
                      <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                        <Button 
                          variant={isActive(item.href) ? "secondary" : "ghost"} 
                          className="w-full justify-start text-base h-12 rounded-xl font-bold px-4"
                        >
                          {item.label}
                        </Button>
                      </Link>
                    ))}

                    <div className="pt-6 mt-6 border-t border-border/40 space-y-3">
                      {user && profile ? (
                        <>
                          <Link href="/notifications" onClick={() => setIsMobileMenuOpen(false)}>
                            <Button variant="ghost" className="w-full justify-start text-base h-12 rounded-xl font-medium text-muted-foreground">
                              <Bell className="mr-4 h-5 w-5" /> Notificaciones
                            </Button>
                          </Link>
                          <Link href={`/profile/${profile.username}`} onClick={() => setIsMobileMenuOpen(false)}>
                            <Button variant="ghost" className="w-full justify-start text-base h-12 rounded-xl font-medium text-muted-foreground">
                              <UserIcon className="mr-4 h-5 w-5" /> Mi Perfil
                            </Button>
                          </Link>
                          <DropdownMenuSeparator className="opacity-50" />
                          <Button 
                            variant="ghost" 
                            onClick={handleLogout} 
                            className="w-full justify-start text-base h-12 rounded-xl font-medium text-destructive hover:bg-destructive/5"
                          >
                            <LogOut className="mr-4 h-5 w-5" /> Cerrar Sesión
                          </Button>
                        </>
                      ) : (
                        <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button className="w-full py-7 text-lg font-black uppercase tracking-widest rounded-2xl shadow-xl bg-primary text-white">
                            Ingresar
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}