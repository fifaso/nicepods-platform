// components/navigation.tsx
// VERSIÓN: 12.0 (Production Ready - Asset Safe & Performance Optimized)

"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationBell } from "@/components/notification-bell";
import { Mic, Menu, LogOut, ShieldCheck, Loader, User as UserIcon, Sparkles } from "lucide-react";
import { cn, getSafeAsset } from "@/lib/utils";

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

  const handleMobileLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    setIsMobileMenuOpen(false);
    try {
      await signOut();
      window.location.href = "/";
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // Assets Seguros para evitar errores de consola
  const logoSrc = getSafeAsset("/nicepod-logo.png", "logo");

  return (
    <header className="sticky top-0 z-50 w-full p-4">
      <div className="relative max-w-screen-xl mx-auto flex h-16 items-center rounded-2xl border border-border/40 bg-background/80 px-4 shadow-lg shadow-black/5 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">

        {/* 1. LOGO Y BRANDING */}
        <div className="flex-1 flex justify-start">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-white/10 shadow-inner">
              <Image
                src={logoSrc}
                alt="NicePod Icon"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                priority
              />
            </div>
            <span className="font-black text-xl tracking-tighter inline-block hidden sm:block">NicePod</span>
          </Link>
        </div>

        {/* 2. CTA ESTRATÉGICO CENTRAL (Solo Móvil) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:hidden">
          <Link href="/create">
            <Button
              size="sm"
              className="h-9 px-4 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl animate-aurora bg-aurora border-none text-white hover:scale-105 transition-transform"
            >
              <Mic className="mr-1.5 h-3.5 w-3.5 animate-pulse" />
              Crear
            </Button>
          </Link>
        </div>

        {/* 3. MENÚ NAVEGACIÓN (Desktop) */}
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
                        className="rounded-full px-5 h-8 text-[10px] font-black uppercase tracking-widest transition-all hover:brightness-110 bg-aurora animate-aurora border-none text-white shadow-md"
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
                  <Link
                    href={item.href}
                    className={cn(
                      "rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition-all block",
                      isActive(item.href)
                        ? "bg-background shadow-sm text-primary"
                        : "text-muted-foreground hover:text-primary"
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* 4. HERRAMIENTAS Y ACCESO (Derecha) */}
        <div className="flex-1 flex items-center justify-end space-x-2">
          <ThemeToggle />

          <div className="hidden sm:flex items-center space-x-2">
            {isLoading ? (
              <div className="w-10 h-10 flex items-center justify-center">
                <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : user && profile ? (
              <>
                <NotificationBell />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-9 w-9 cursor-pointer border border-border hover:border-primary transition-all shadow-sm">
                      <AvatarImage src={getSafeAsset(profile.avatar_url, 'avatar')} />
                      <AvatarFallback className="font-black bg-primary/10 text-primary">
                        {profile.full_name?.substring(0, 2).toUpperCase() || 'NP'}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-2xl border-border/40">
                    <DropdownMenuLabel className="text-[10px] font-black uppercase text-muted-foreground tracking-widest px-2 py-1.5">
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
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild className="rounded-xl cursor-pointer bg-red-500/5 focus:bg-red-500/10 focus:text-red-600">
                          <Link href="/admin" className="flex items-center text-red-500">
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            <span className="font-black text-xs uppercase tracking-tighter">Torre de Control</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}

                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="rounded-xl text-muted-foreground focus:text-destructive cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span className="font-bold text-sm">Cerrar Sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link href='/login'>
                <Button variant="ghost" className="font-bold text-sm hover:bg-primary/5 transition-colors">
                  Ingresar
                </Button>
              </Link>
            )}
          </div>

          {/* MENÚ MÓVIL (Sheet) */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-xs p-6 rounded-l-[2.5rem] border-l-border/40">
                <SheetHeader className="text-left">
                  <SheetTitle>
                    <Link href="/" onClick={handleMobileLinkClick} className="flex items-center space-x-3">
                      <Image src={logoSrc} alt="Icon" width={32} height={32} className="rounded-lg shadow-sm" />
                      <span className="font-black tracking-tighter text-xl">NicePod</span>
                    </Link>
                  </SheetTitle>
                  {/* A11y Shield: Descripción para silenciar advertencia de Radix */}
                  <SheetDescription className="sr-only">Navegación principal para móviles.</SheetDescription>
                </SheetHeader>

                <div className="flex flex-col space-y-4 mt-12">
                  {navItems.map((item) => {
                    const isCreateBtn = item.href === '/create';

                    return (
                      <Link key={item.href} href={item.href} onClick={handleMobileLinkClick}>
                        <Button
                          variant={isActive(item.href) && !isCreateBtn ? "secondary" : "ghost"}
                          className={cn(
                            "w-full justify-start text-lg h-14 rounded-2xl transition-all",
                            isCreateBtn && "bg-aurora animate-aurora text-white font-black uppercase tracking-widest shadow-lg border-none hover:scale-[1.02]"
                          )}
                        >
                          {isCreateBtn && <Mic className="mr-3 h-5 w-5 animate-pulse" />}
                          {item.label}
                        </Button>
                      </Link>
                    );
                  })}

                  <div className="pt-4 mt-4 border-t border-border/40 space-y-4">
                    {user && profile ? (
                      <>
                        <Link href="/notifications" onClick={handleMobileLinkClick}>
                          <Button variant="ghost" className="w-full justify-start text-lg font-bold">Notificaciones</Button>
                        </Link>
                        <Link href={`/profile/${profile.username}`} onClick={handleMobileLinkClick}>
                          <Button variant="ghost" className="w-full justify-start text-lg font-bold">Mi Perfil</Button>
                        </Link>
                        {isAdmin && (
                          <Link href="/admin" onClick={handleMobileLinkClick}>
                            <Button variant="ghost" className="w-full justify-start text-lg text-red-500 font-black uppercase tracking-tighter">
                              <ShieldCheck className="mr-3 h-5 w-5" /> Admin
                            </Button>
                          </Link>
                        )}
                        <Button
                          variant="ghost"
                          onClick={handleLogout}
                          className="w-full justify-start text-lg text-muted-foreground font-medium"
                        >
                          Cerrar Sesión
                        </Button>
                      </>
                    ) : (
                      <Link href="/login" onClick={handleMobileLinkClick}>
                        <Button className="w-full py-8 text-xl font-black uppercase tracking-widest rounded-2xl shadow-xl">
                          Ingresar
                        </Button>
                      </Link>
                    )}
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