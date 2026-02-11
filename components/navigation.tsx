// components/navigation.tsx
// VERSIÓN: 16.5 (NicePod Identity Sovereignty - Mobile Tactical Hub & Zero Warning)
// Misión: Gestionar el acceso, la identidad y la sintonía visual con rendimiento de 60 FPS.
// [FIX]: Resolución de TS2339, eliminación de Forced Reflow y rediseño de jerarquía móvil.

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
  SheetHeader,
  SheetTitle,
  SheetTrigger
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
  Plus,
  ShieldCheck,
  Sparkles,
  User as UserIcon,
  Zap
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
   * CONSUMO DE IDENTIDAD (NCIS V1.0)
   * Sincronización con use-auth V18.5 para estados de carga granulares.
   */
  const {
    profile,
    isAdmin,
    isAuthenticated,
    signOut,
    isInitialLoading,
    isProfileLoading
  } = useAuth();

  /**
   * [ESTRATEGIA DE RUTAS DINÁMICAS]
   * Segmentación de acceso según soberanía de cuenta.
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
      { href: "/pricing", label: "Planes", icon: Zap }
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
      console.error("🔥 [Navigation-Logout-Critical]:", error.message);
    }
  }, [signOut, router]);

  const logoSrc = getSafeAsset("/nicepod-logo.png", "logo");

  /**
   * auroraClasses: Estética de alta conversión coherente con el sistema.
   * [NUEVO]: Variante pulsante para el botón 'Crear' en móvil.
   */
  const auroraClasses = cn(
    "bg-gradient-to-r from-indigo-600 via-primary to-fuchsia-600",
    "animate-aurora text-white border border-white/20 shadow-lg",
    "hover:scale-105 transition-all duration-300 active:scale-95 shadow-primary/20"
  );

  return (
    <header className="sticky top-0 z-50 w-full p-4 animate-in fade-in duration-1000">
      <div className="relative max-w-screen-xl mx-auto flex h-16 items-center rounded-2xl border border-border/40 bg-background/80 px-4 shadow-xl backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">

        {/* 1. NÚCLEO IZQUIERDO: MARCA */}
        <div className="flex-1 flex justify-start items-center">
          <Link
            href={isAuthenticated ? "/dashboard" : "/"}
            className="flex items-center space-x-2.5 group"
          >
            <div className="relative h-9 w-9 overflow-hidden rounded-xl border border-white/10 shadow-inner">
              <Image
                src={logoSrc}
                alt="NicePod"
                fill
                sizes="36px"
                className="object-cover group-hover:scale-110 transition-all duration-500"
                priority
              />
            </div>
            <span className="font-black text-lg tracking-tighter hidden sm:block uppercase italic text-foreground leading-none">
              NicePod
            </span>
          </Link>
        </div>

        {/* 2. NÚCLEO CENTRAL: NAVEGACIÓN DESKTOP (Hidden on Mobile) */}
        <nav className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <ul className="flex items-center space-x-1 rounded-full bg-muted/30 p-1 border border-border/10 backdrop-blur-sm">
            {navItems.map((item) => {
              const isCreateBtn = item.href === '/create';
              if (isCreateBtn) {
                return (
                  <li key={item.href}>
                    <Link href={item.href}>
                      <Button size="sm" className={cn("rounded-full px-6 h-8 text-[10px] font-black uppercase tracking-widest", auroraClasses)}>
                        <Plus className="mr-1.5 h-3.5 w-3.5" /> {item.label}
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

        {/* 3. NÚCLEO DERECHO: HERRAMIENTAS Y ACCESO (Mobile Precision) */}
        <div className="flex-1 flex items-center justify-end gap-1 sm:gap-3">

          {/* --- BLOQUE TÁCTICO MÓVIL (Sincronizado con su requerimiento) --- */}
          <div className="flex md:hidden items-center gap-1.5">
            {/* Botón Crear: Alta Visibilidad */}
            {isAuthenticated && (
              <Link href="/create">
                <Button className={cn("h-9 px-3 rounded-xl font-black text-[10px] uppercase tracking-tighter shadow-primary/40 animate-pulse", auroraClasses)}>
                  CREAR
                </Button>
              </Link>
            )}

            {/* Control Lumínico */}
            <ThemeToggle />

            {/* Avatar de Usuario (Mobile Trigger) */}
            {isAuthenticated && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="relative cursor-pointer">
                    <Avatar className="h-9 w-9 border-2 border-border/40 overflow-hidden">
                      {isProfileLoading ? (
                        <AvatarFallback className="bg-muted animate-pulse" />
                      ) : (
                        <>
                          <AvatarImage src={getSafeAsset(profile?.avatar_url, 'avatar')} className="object-cover" />
                          <AvatarFallback className="font-black bg-primary/10 text-primary text-[10px]">U</AvatarFallback>
                        </>
                      )}
                    </Avatar>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-3 rounded-[1.5rem] shadow-2xl border-border/40 bg-background/95 backdrop-blur-xl">
                  <DropdownMenuItem asChild className="rounded-xl py-3">
                    <Link href="/dashboard" className="flex items-center gap-3">
                      <LayoutDashboard className="h-4 w-4 text-primary" />
                      <span className="font-bold text-xs uppercase tracking-widest">Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="rounded-xl text-red-500 py-3">
                    <LogOut className="h-4 w-4 mr-2" />
                    <span className="font-bold text-xs uppercase tracking-widest">Salir</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Hamburguesa Final */}
            <div className="ml-0.5">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9 bg-white/5 border border-white/5">
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
                    </SheetHeader>

                    {/* Identidad dentro del menú lateral */}
                    {isAuthenticated && profile && (
                      <div className="mb-8 p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4">
                        <Avatar className="h-10 w-10 border border-primary/20">
                          <AvatarImage src={getSafeAsset(profile.avatar_url, 'avatar')} className="object-cover" />
                          <AvatarFallback className="font-black bg-primary/10 text-primary text-[10px]">{profile.full_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-black text-xs text-foreground truncate uppercase">{profile.full_name}</p>
                          <p className="text-[9px] text-muted-foreground uppercase tracking-widest">@{profile.username}</p>
                        </div>
                      </div>
                    )}

                    <nav className="flex flex-col space-y-3">
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
                                <Bell className="mr-4 h-5 w-5 opacity-50" /> Notificaciones
                              </Button>
                            </Link>
                            <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-[10px] h-12 rounded-xl font-black text-red-500/70 uppercase tracking-widest">
                              <LogOut className="mr-4 h-4 w-4" /> Desconectar
                            </Button>
                          </>
                        ) : (
                          <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                            <Button className="w-full h-12 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl bg-primary text-white">
                              Ingresar
                            </Button>
                          </Link>
                        )}
                      </div>
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* --- BLOQUE HERRAMIENTAS DESKTOP --- */}
          <div className="hidden md:flex items-center space-x-3">
            {isInitialLoading ? (
              <div className="h-10 w-10 flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin text-primary/40" />
              </div>
            ) : isAuthenticated ? (
              <div className="flex items-center gap-3 animate-in zoom-in-95 duration-500">
                <NotificationBell />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="relative cursor-pointer">
                      <Avatar className="h-10 w-10 border-2 border-border/40 hover:border-primary transition-all shadow-lg">
                        {isProfileLoading ? (
                          <AvatarFallback className="bg-muted animate-pulse" />
                        ) : (
                          <>
                            <AvatarImage src={getSafeAsset(profile?.avatar_url, 'avatar')} className="object-cover" />
                            <AvatarFallback className="font-black bg-primary/10 text-primary text-xs">U</AvatarFallback>
                          </>
                        )}
                      </Avatar>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 p-3 rounded-[1.5rem] shadow-2xl border-border/40 bg-background/95 backdrop-blur-xl">
                    <DropdownMenuLabel className="flex flex-col px-3 py-2">
                      <span className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest">Soberanía de Datos</span>
                      <span className="text-sm font-black truncate text-foreground">{profile?.full_name || 'Curador'}</span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="my-2 opacity-50" />
                    <DropdownMenuItem asChild className="rounded-xl py-2.5">
                      <Link href={`/profile/${profile?.username}`} className="flex items-center w-full">
                        <UserIcon className="mr-3 h-4 w-4 text-primary/70" />
                        <span className="font-bold text-sm">Mi Perfil</span>
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild className="rounded-xl py-2.5 bg-red-500/5 text-red-500">
                        <Link href="/admin" className="flex items-center w-full">
                          <ShieldCheck className="mr-3 h-4 w-4" />
                          <span className="font-black text-[10px] uppercase tracking-widest">Admin Control</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="my-2 opacity-50" />
                    <DropdownMenuItem onClick={handleLogout} className="rounded-xl text-muted-foreground py-2.5">
                      <LogOut className="mr-3 h-4 w-4" />
                      <span className="font-bold text-sm">Cerrar Sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Link href='/login'>
                <Button variant="default" className="rounded-full px-5 h-10 font-black text-[9px] uppercase tracking-[0.2em] shadow-lg">
                  Ingresar
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}