// components/navigation.tsx
// VERSIÓN: 15.0 (NicePod Architecture Standard - Triple Layer UI & Mobile Precision)
// Misión: Orquestar la navegación global con estados de carga precisos y una fila de herramientas dedicada para móvil.
// [FIX]: Resolución de error TS2339 'isInitialLoading' y limpieza de conflictos CSS.

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
  Globe,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Mic,
  ShieldCheck,
  Sparkles,
  User as UserIcon
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  /**
   * CONSUMO DE IDENTIDAD (NCIS V1.0 Standards)
   * Utilizamos los nuevos estados de carga para el Auth-Skeleton State.
   */
  const {
    user,
    profile,
    isAdmin,
    isAuthenticated,
    signOut,
    isInitialLoading,
    isProfileLoading
  } = useAuth();

  /**
   * [ESTRATEGIA DE RUTAS DINÁMICAS]
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
      { href: "/pricing", label: "Planes", icon: Sparkles }
    ];
  }, [isAuthenticated]);

  const isActive = (href: string): boolean => {
    if (href === '/dashboard' && pathname === '/') return true;
    return pathname === href;
  };

  const handleLogout = useCallback(async () => {
    setIsMobileMenuOpen(false);
    try {
      await signOut();
      router.push("/");
    } catch (error: any) {
      console.error("🔥 [Navigation-Logout-Fail]:", error.message);
    }
  }, [signOut, router]);

  const logoSrc = getSafeAsset("/nicepod-logo.png", "logo");

  const auroraClasses = cn(
    "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600",
    "animate-aurora text-white border border-white/10 shadow-lg",
    "hover:scale-105 transition-all duration-300 active:scale-95"
  );

  return (
    <header className="sticky top-0 z-50 w-full p-4 animate-in fade-in duration-700">
      <div className="relative max-w-screen-xl mx-auto flex h-16 items-center rounded-2xl border border-border/40 bg-background/80 px-4 shadow-xl backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">

        {/* 1. SECCIÓN: LOGO (Identidad Unificada) */}
        <div className="flex-1 flex justify-start">
          <Link
            href={isAuthenticated ? "/dashboard" : "/"}
            className="flex items-center space-x-3 group"
          >
            <div className="relative h-9 w-9 overflow-hidden rounded-xl border border-white/10">
              <Image
                src={logoSrc}
                alt="NicePod"
                fill
                sizes="36px"
                className="object-cover group-hover:scale-110 transition-all duration-500"
                priority
              />
            </div>
            <span className="font-black text-lg tracking-tighter hidden xs:block uppercase italic text-foreground">
              NicePod
            </span>
          </Link>
        </div>

        {/* 2. SECCIÓN CENTRAL: NAVEGACIÓN DESKTOP */}
        <nav className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <ul className="flex items-center space-x-1 rounded-full bg-muted/30 p-1 border border-border/10 backdrop-blur-sm">
            {navItems.map((item) => {
              const isCreateBtn = item.href === '/create';
              if (isCreateBtn) {
                return (
                  <li key={item.href}>
                    <Link href={item.href}>
                      <Button size="sm" className={cn("rounded-full px-6 h-8 text-[10px] font-black uppercase tracking-widest", auroraClasses)}>
                        <Sparkles className="mr-1.5 h-3 w-3" /> {item.label}
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
                      "rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all block",
                      isActive(item.href) ? "bg-background shadow-md text-primary" : "text-muted-foreground/70 hover:text-primary"
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* 3. SECCIÓN DERECHA: MULTI-DEVICE TOOLS */}
        <div className="flex-1 flex items-center justify-end space-x-1.5 md:space-x-3">

          {/* HERRAMIENTAS DIRECTAS (Móvil y Desktop) */}
          <ThemeToggle />

          {isAuthenticated && (
            <Link href="/create" className="md:hidden">
              <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl bg-primary/10 text-primary border border-primary/20">
                <Mic className="h-4 w-4" />
              </Button>
            </Link>
          )}

          {/* ÁREA DE PERFIL Y ESTADO DE CARGA */}
          <div className="flex items-center">
            {isInitialLoading ? (
              <div className="h-9 w-9 flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin text-primary/40" />
              </div>
            ) : isAuthenticated ? (
              <div className="flex items-center gap-2 md:gap-4 animate-in zoom-in-95 duration-500">
                <div className="hidden lg:block">
                  <NotificationBell />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="relative cursor-pointer">
                      <Avatar className="h-9 w-9 md:h-10 md:w-10 border-2 border-border/40 hover:border-primary transition-all">
                        {isProfileLoading ? (
                          <AvatarFallback className="bg-muted animate-pulse" />
                        ) : (
                          <>
                            <AvatarImage src={getSafeAsset(profile?.avatar_url, 'avatar')} className="object-cover" />
                            <AvatarFallback className="font-black bg-primary/10 text-primary text-xs">
                              {profile?.full_name?.substring(0, 2).toUpperCase() || 'CP'}
                            </AvatarFallback>
                          </>
                        )}
                      </Avatar>
                      {isProfileLoading && (
                        <div className="absolute inset-0 bg-background/50 rounded-full flex items-center justify-center">
                          <Loader2 className="h-3 w-3 animate-spin text-primary" />
                        </div>
                      )}
                    </div>
                  </DropdownMenuTrigger>

                  {/* MENÚ DROPDOWN (Soberanía) */}
                  <DropdownMenuContent align="end" className="w-64 p-3 rounded-[1.5rem] shadow-2xl border-border/40 bg-background/95 backdrop-blur-xl">
                    <DropdownMenuLabel className="flex flex-col px-3 py-2">
                      <span className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest">Soberanía de Datos</span>
                      <span className="text-sm font-black truncate text-foreground">{profile?.full_name || 'Curador'}</span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="my-2 opacity-50" />
                    <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-2.5">
                      <Link href={`/profile/${profile?.username}`} className="flex items-center w-full">
                        <UserIcon className="mr-3 h-4 w-4 text-primary/70" />
                        <span className="font-bold text-sm">Mi Perfil</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-2.5">
                      <Link href="/dashboard" className="flex items-center w-full">
                        <LayoutDashboard className="mr-3 h-4 w-4 text-primary/70" />
                        <span className="font-bold text-sm">Estación de Control</span>
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-2.5 bg-red-500/5 focus:bg-red-500/10 text-red-500">
                        <Link href="/admin" className="flex items-center w-full">
                          <ShieldCheck className="mr-3 h-4 w-4" />
                          <span className="font-black text-[10px] uppercase tracking-widest">Admin Console</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="my-2 opacity-50" />
                    <DropdownMenuItem onClick={handleLogout} className="rounded-xl text-muted-foreground focus:text-destructive cursor-pointer py-2.5">
                      <LogOut className="mr-3 h-4 w-4" />
                      <span className="font-bold text-sm">Cerrar Frecuencia</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Link href='/login' className="ml-2">
                <Button variant="default" className="rounded-full px-5 h-9 font-black text-[9px] uppercase tracking-[0.2em] shadow-lg shadow-primary/20">
                  Ingresar
                </Button>
              </Link>
            )}

            {/* 4. HAMBURGUESA MÓVIL (Más Opciones) */}
            <div className="md:hidden ml-1.5">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 hover:bg-white/5">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full max-w-[280px] p-0 rounded-l-[2.5rem] border-l-border/40 bg-background/95 backdrop-blur-3xl shadow-2xl">
                  <div className="flex flex-col h-full p-8">
                    <SheetHeader className="text-left mb-10">
                      <SheetTitle className="flex items-center space-x-3">
                        <div className="h-7 w-7 relative rounded-lg overflow-hidden border border-white/10">
                          <Image src={logoSrc} alt="NicePod" fill sizes="28px" className="object-cover" />
                        </div>
                        <span className="font-black text-xl tracking-tighter uppercase italic">NicePod</span>
                      </SheetTitle>
                      <SheetDescription className="sr-only">Navegación extendida.</SheetDescription>
                    </SheetHeader>

                    <div className="flex flex-col space-y-4">
                      {navItems.map((item) => (
                        <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                          <Button variant={isActive(item.href) ? "secondary" : "ghost"} className="w-full justify-start text-[10px] h-12 rounded-xl font-black px-6 uppercase tracking-widest">
                            <item.icon className="mr-4 h-4 w-4 opacity-50" /> {item.label}
                          </Button>
                        </Link>
                      ))}

                      <div className="pt-8 mt-4 border-t border-white/5 space-y-3">
                        {isAuthenticated ? (
                          <>
                            <Link href="/notifications" onClick={() => setIsMobileMenuOpen(false)}>
                              <Button variant="ghost" className="w-full justify-start text-[10px] h-12 rounded-xl font-black text-muted-foreground/80 uppercase tracking-widest">
                                <Bell className="mr-4 h-4 w-4 opacity-50" /> Alertas
                              </Button>
                            </Link>
                            <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-[10px] h-12 rounded-xl font-black text-red-500/70 uppercase tracking-widest">
                              <LogOut className="mr-4 h-4 w-4" /> Desconectar
                            </Button>
                          </>
                        ) : (
                          <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                            <Button className="w-full h-12 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl">
                              Iniciar Sesión
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
      </div>
    </header>
  );
}