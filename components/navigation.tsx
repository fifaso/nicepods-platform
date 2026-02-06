// components/navigation.tsx
// VERSIÓN: 14.0 (NicePod Architecture Standard - Total Identity Sync)
// Misión: Orquestar la navegación global, gestionar la soberanía de la sesión y unificar la estética Aurora.

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
  Bell,
  LayoutDashboard,
  Loader,
  LogOut,
  Menu,
  Mic,
  ShieldCheck,
  Sparkles,
  User as UserIcon,
  Search,
  Globe
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useCallback, useMemo } from "react";

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  
  // Consumimos el estado de identidad desde el motor de sintonía sincronizado (use-auth.tsx V16.0)
  const { user, profile, isAdmin, isAuthenticated, signOut, isLoading } = useAuth();

  /**
   * [ESTRATEGIA DE RUTAS DINÁMICAS]
   * Definimos los destinos según la soberanía del usuario. 
   * Si el usuario está autenticado, la raíz de su experiencia es el Dashboard.
   */
  const navItems = useMemo(() => {
    if (isAuthenticated) {
      return [
        { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
        { href: "/create", label: "Crear", icon: Mic },
        { href: "/podcasts", label: "Biblioteca", icon: Sparkles },
      ];
    }
    return [
      { href: "/podcasts", label: "Explorar", icon: Globe },
      { href: "/pricing", label: "Suscripciones", icon: Sparkles }
    ];
  }, [isAuthenticated]);

  /**
   * isActive: Valida si la ruta actual coincide con el ítem del menú para el resaltado visual.
   */
  const isActive = (href: string): boolean => {
    if (href === '/dashboard' && pathname === '/') return true;
    return pathname === href;
  };

  /**
   * handleLogout: Orquesta la desconexión y limpia el rastro de cookies.
   */
  const handleLogout = useCallback(async () => {
    setIsMobileMenuOpen(false);
    try {
      await signOut();
      // Tras el logout, el middleware nos impedirá volver a entrar, 
      // pero forzamos la navegación a la landing pública.
      router.push("/");
    } catch (error: any) {
      console.error("🔥 [Navigation-Logout-Error]:", error.message);
    }
  }, [signOut, router]);

  const logoSrc = getSafeAsset("/nicepod-logo.png", "logo");

  /**
   * auroraClasses: El estándar de diseño para elementos destacados.
   */
  const auroraClasses = cn(
    "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600",
    "animate-aurora text-white border border-white/10 shadow-lg",
    "shadow-purple-500/20 dark:shadow-white/5",
    "hover:scale-105 hover:brightness-110 transition-all duration-300 active:scale-95"
  );

  return (
    <header className="sticky top-0 z-50 w-full p-4 animate-in fade-in duration-700">
      <div className="relative max-w-screen-xl mx-auto flex h-16 items-center rounded-2xl border border-border/40 bg-background/80 px-4 shadow-xl backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">

        {/* 1. SECCIÓN IZQUIERDA: IDENTIDAD VISUAL (LOGO) */}
        <div className="flex-1 flex justify-start">
          <Link 
            href={isAuthenticated ? "/dashboard" : "/"} 
            className="flex items-center space-x-3 group"
          >
            <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-white/10 shadow-inner">
              <Image
                src={logoSrc}
                alt="NicePod"
                fill
                sizes="40px"
                className="object-cover group-hover:scale-110 transition-all duration-500"
                priority
              />
            </div>
            <span className="font-black text-xl tracking-tighter hidden sm:block uppercase italic text-foreground">
              NicePod
            </span>
          </Link>
        </div>

        {/* 2. SECCIÓN CENTRAL: NAVEGACIÓN TÁCTICA (DESKTOP) */}
        <nav className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <ul className="flex items-center space-x-1 rounded-full bg-muted/30 p-1 border border-border/10 backdrop-blur-sm">
            {navItems.map((item) => {
              const isCreateButton = item.href === '/create';
              
              if (isCreateButton) {
                return (
                  <li key={item.href}>
                    <Link href={item.href}>
                      <Button
                        size="sm"
                        className={cn("rounded-full px-6 h-9 text-[10px] font-black uppercase tracking-widest", auroraClasses)}
                      >
                        <Sparkles className="mr-2 h-3.5 w-3.5" />
                        {item.label}
                      </Button>
                    </Link>
                  </li>
                );
              }
              
              return (
                <li key={item.href}>
                  <Link 
                    href={item.href} 
                    className={cn(
                        "rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-widest transition-all block",
                        isActive(item.href) 
                            ? "bg-background shadow-md text-primary" 
                            : "text-muted-foreground/70 hover:text-primary hover:bg-white/5"
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* 3. SECCIÓN DERECHA: ESTADO DE CUENTA Y HERRAMIENTAS */}
        <div className="flex-1 flex items-center justify-end space-x-3">
          
          <div className="hidden md:block">
            <ThemeToggle />
          </div>

          <div className="flex items-center space-x-3">
            {isLoading ? (
              <div className="h-9 w-9 flex items-center justify-center">
                <Loader className="h-4 w-4 animate-spin text-primary/40" />
              </div>
            ) : isAuthenticated && profile ? (
              <div className="flex items-center gap-4 animate-in zoom-in-95 duration-500">
                <div className="hidden lg:block">
                    <NotificationBell />
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-10 w-10 cursor-pointer border-2 border-border/40 hover:border-primary transition-all shadow-lg scale-100 hover:scale-105 active:scale-95">
                      <AvatarImage src={getSafeAsset(profile.avatar_url, 'avatar')} className="object-cover" />
                      <AvatarFallback className="font-black bg-primary/10 text-primary text-xs uppercase">
                        {profile.full_name?.substring(0, 2).toUpperCase() || 'CP'}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  
                  <DropdownMenuContent align="end" className="w-64 p-3 rounded-[1.5rem] shadow-2xl border-border/40 bg-background/95 backdrop-blur-xl">
                    <DropdownMenuLabel className="flex flex-col px-3 py-2">
                        <span className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest">Estación de Control</span>
                        <span className="text-sm font-black truncate text-foreground">{profile.full_name}</span>
                    </DropdownMenuLabel>
                    
                    <DropdownMenuSeparator className="my-2 opacity-50" />

                    <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-2.5">
                      <Link href={`/profile/${profile.username}`} className="flex items-center w-full">
                        <UserIcon className="mr-3 h-4 w-4 text-primary/70" />
                        <span className="font-bold text-sm">Mi Perfil Soberano</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-2.5">
                      <Link href="/dashboard" className="flex items-center w-full">
                        <LayoutDashboard className="mr-3 h-4 w-4 text-primary/70" />
                        <span className="font-bold text-sm">Dashboard</span>
                      </Link>
                    </DropdownMenuItem>

                    {isAdmin && (
                      <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-2.5 bg-red-500/5 focus:bg-red-500/10">
                        <Link href="/admin" className="flex items-center w-full text-red-500">
                          <ShieldCheck className="mr-3 h-4 w-4" />
                          <span className="font-black text-[10px] uppercase tracking-widest">Admin Console</span>
                        </Link>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator className="my-2 opacity-50" />
                    
                    <DropdownMenuItem 
                        onClick={handleLogout} 
                        className="rounded-xl text-muted-foreground focus:text-destructive cursor-pointer py-2.5"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      <span className="font-bold text-sm">Desconectar Frecuencia</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Link href='/login'>
                <Button 
                    variant="default" 
                    className="rounded-full px-6 h-10 font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-primary/20"
                >
                    Ingresar
                </Button>
              </Link>
            )}
          </div>

          {/* 4. MENÚ MÓVIL (Sheet Controller) */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 hover:bg-white/5">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-[300px] p-0 rounded-l-[2.5rem] border-l-border/40 bg-background/95 backdrop-blur-3xl shadow-2xl">
                <div className="flex flex-col h-full p-8">
                  <SheetHeader className="text-left mb-10">
                    <div className="flex items-center justify-between">
                      <SheetTitle className="flex items-center space-x-3">
                        <div className="h-8 w-8 relative rounded-lg overflow-hidden border border-white/10">
                            <Image src={logoSrc} alt="NicePod" fill sizes="32px" className="object-cover" />
                        </div>
                        <span className="font-black text-xl tracking-tighter uppercase italic">NicePod</span>
                      </SheetTitle>
                    </div>
                    <SheetDescription className="sr-only">Navegación de terminal NicePod.</SheetDescription>
                  </SheetHeader>

                  <div className="flex flex-col space-y-4">
                    {isAuthenticated ? (
                      <>
                        <Link href="/create" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button className={cn("w-full justify-center text-lg h-16 rounded-[1.5rem] font-black mb-4 shadow-2xl", auroraClasses)}>
                            <Mic className="mr-3 h-6 w-6 animate-pulse" />
                            CREAR AHORA
                          </Button>
                        </Link>
                        {navItems.map((item) => (
                          <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                            <Button
                              variant={isActive(item.href) ? "secondary" : "ghost"}
                              className="w-full justify-start text-base h-14 rounded-2xl font-black px-6 uppercase tracking-widest text-xs"
                            >
                              {item.label}
                            </Button>
                          </Link>
                        ))}
                      </>
                    ) : (
                      <>
                        <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button className="w-full h-16 rounded-[1.5rem] font-black text-lg uppercase tracking-tighter shadow-xl shadow-primary/20">
                            INGRESAR
                          </Button>
                        </Link>
                        <Link href="/pricing" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start text-sm h-12 rounded-xl font-bold px-6 text-muted-foreground">
                            Ver Planes Pro
                          </Button>
                        </Link>
                      </>
                    )}

                    <div className="pt-8 mt-8 border-t border-white/5 space-y-4">
                      {isAuthenticated && profile ? (
                        <>
                          <Link href="/notifications" onClick={() => setIsMobileMenuOpen(false)}>
                            <Button variant="ghost" className="w-full justify-start text-sm h-12 rounded-xl font-bold text-muted-foreground/80">
                              <Bell className="mr-4 h-5 w-5 opacity-50" /> Notificaciones
                            </Button>
                          </Link>
                          <Link href={`/profile/${profile.username}`} onClick={() => setIsMobileMenuOpen(false)}>
                            <Button variant="ghost" className="w-full justify-start text-sm h-12 rounded-xl font-bold text-muted-foreground/80">
                              <UserIcon className="mr-4 h-5 w-5 opacity-50" /> Mi Perfil
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            onClick={handleLogout}
                            className="w-full justify-start text-sm h-12 rounded-xl font-black text-red-500/70 hover:bg-red-500/5"
                          >
                            <LogOut className="mr-4 h-5 w-5" /> Cerrar Sesión
                          </Button>
                        </>
                      ) : (
                        <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10">
                          <p className="text-[10px] font-black uppercase text-primary tracking-[0.2em] mb-2">Witness Protocol</p>
                          <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
                            Únete a la red de inteligencia urbana y ancla tus ideas en el mapa de Madrid.
                          </p>
                        </div>
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