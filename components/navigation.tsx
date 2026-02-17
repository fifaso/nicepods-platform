// components/navigation.tsx
// VERSIÓN: 17.0 (NicePod Identity Sovereignty - Tactical Elegance Edition)
// Misión: Gestionar el acceso y la identidad eliminando el pestañeo y optimizando la jerarquía visual.
// [ESTABILIZACIÓN]: Integración de ThemeToggle en Desktop y suavizado de animaciones críticas.

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
   * CONSUMO DE IDENTIDAD SINCRO
   * Aprovechamos la optimización del Nivel 1 donde el perfil ya viene de SSR.
   */
  const {
    profile,
    isAdmin,
    isAuthenticated,
    signOut,
    isInitialLoading,
    isProfileLoading
  } = useAuth();

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
      console.error("🔥 [Navigation-Error]:", error.message);
    }
  }, [signOut, router]);

  const logoSrc = getSafeAsset("/nicepod-logo.png", "logo");

  /**
   * auroraClasses: Estética refinada NicePod V2.5.
   * [MEJORA]: Se aumenta el ancho un 15% y se suaviza la animación para mayor elegancia.
   */
  const auroraClasses = cn(
    "bg-gradient-to-r from-indigo-600 via-primary to-fuchsia-600",
    "text-white border border-white/20 shadow-lg",
    "transition-all duration-500 ease-out active:scale-95 shadow-primary/20",
    "hover:shadow-[0_0_25px_rgba(139,92,246,0.4)] hover:scale-[1.03]",
    "relative overflow-hidden group/crear"
  );

  return (
    /**
     * [FIX]: Se reduce el tiempo de fade-in para evitar la sensación de carga lenta.
     * La navegación debe sentirse como una constante, no como un elemento que 'llega'.
     */
    <header className="sticky top-0 z-50 w-full p-4 animate-in fade-in duration-300">
      <div className="relative max-w-screen-xl mx-auto flex h-16 items-center rounded-2xl border border-border/40 bg-background/80 px-4 shadow-xl backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">

        {/* 1. NÚCLEO IZQUIERDO: IDENTIDAD DE MARCA */}
        <div className="flex-1 flex justify-start items-center">
          <Link
            href={isAuthenticated ? "/dashboard" : "/"}
            className="flex items-center space-x-2.5 group"
          >
            <div className="relative h-9 w-9 overflow-hidden rounded-xl border border-white/10 shadow-inner bg-zinc-900/50">
              <Image
                src={logoSrc}
                alt="NicePod"
                fill
                sizes="36px"
                className="object-cover group-hover:scale-110 transition-all duration-700"
                priority
              />
            </div>
            <span className="font-black text-lg tracking-tighter hidden sm:block uppercase italic text-foreground leading-none">
              NicePod
            </span>
          </Link>
        </div>

        {/* 2. NÚCLEO CENTRAL: NAVEGACIÓN DESKTOP */}
        <nav className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <ul className="flex items-center space-x-1 rounded-full bg-muted/30 p-1 border border-border/10 backdrop-blur-sm">
            {navItems.map((item) => {
              const isCreateBtn = item.href === '/create';
              if (isCreateBtn) {
                return (
                  <li key={item.href}>
                    <Link href={item.href}>
                      <Button
                        size="sm"
                        className={cn(
                          "rounded-full h-8 text-[10px] font-black uppercase tracking-widest",
                          "px-9 min-w-[110px]", // [FIX]: Aumento del 15% de ancho y base mínima
                          auroraClasses
                        )}
                      >
                        {/* Brillo cinemático suave en lugar de pulse brusco */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/crear:animate-shimmer" />
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
                      isActive(item.href)
                        ? "bg-background shadow-md text-primary"
                        : "text-muted-foreground/70 hover:text-primary"
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* 3. NÚCLEO DERECHO: HERRAMIENTAS Y PERFIL */}
        <div className="flex-1 flex items-center justify-end gap-1.5 sm:gap-3">

          {/* BLOQUE MÓVIL */}
          <div className="flex md:hidden items-center gap-2">
            {isAuthenticated && !isInitialLoading && (
              <Link href="/create">
                <Button className={cn("h-9 px-5 rounded-xl font-black text-[10px] uppercase tracking-tighter", auroraClasses)}>
                  CREAR
                </Button>
              </Link>
            )}
            <ThemeToggle />
            {/* ... Resto del menú móvil se mantiene igual para evitar errores de lógica ... */}
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
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9 bg-white/5 border border-white/5">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-[280px] p-0 rounded-l-[2.5rem] border-l-border/40 bg-background/95 backdrop-blur-3xl">
                <div className="flex flex-col h-full p-8">
                  <SheetHeader className="text-left mb-10">
                    <SheetTitle className="flex items-center space-x-3">
                      <div className="h-7 w-7 relative rounded-lg overflow-hidden border border-white/10">
                        <Image src={logoSrc} alt="NicePod" fill sizes="28px" />
                      </div>
                      <span className="font-black text-xl tracking-tighter uppercase italic">NicePod</span>
                    </SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col space-y-3">
                    {navItems.map((item) => (
                      <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant={isActive(item.href) ? "secondary" : "ghost"} className="w-full justify-start text-[10px] h-12 rounded-xl font-black px-6 uppercase tracking-widest">
                          <item.icon className="mr-4 h-4 w-4 opacity-50" /> {item.label}
                        </Button>
                      </Link>
                    ))}
                    <div className="pt-8 mt-4 border-t border-white/5 space-y-3">
                      <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-[10px] h-12 rounded-xl font-black text-red-500/70 uppercase tracking-widest">
                        <LogOut className="mr-4 h-4 w-4" /> Desconectar
                      </Button>
                    </div>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* BLOQUE DESKTOP */}
          <div className="hidden md:flex items-center space-x-3">
            {/* [NUEVO]: Integración de ThemeToggle en Desktop */}
            <ThemeToggle />

            {isInitialLoading ? (
              <div className="h-10 w-[40px] flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin text-primary/40" />
              </div>
            ) : isAuthenticated ? (
              <div className="flex items-center gap-3 animate-in zoom-in-95 duration-300">
                <NotificationBell />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="relative cursor-pointer">
                      <Avatar className="h-10 w-10 border-2 border-border/40 hover:border-primary transition-all shadow-lg overflow-hidden">
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
                <Button variant="default" className="rounded-full px-7 h-10 font-black text-[9px] uppercase tracking-[0.2em] shadow-lg">
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