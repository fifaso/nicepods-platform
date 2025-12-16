// components/navigation.tsx
// VERSIÓN: 8.0 (UX Fix: Smart Auth State & Admin Access)

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
import { Mic, Menu, LogIn, LogOut, ShieldCheck, Loader, User as UserIcon, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

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
    await signOut();
  };

  return (
    <header className="sticky top-0 z-50 w-full p-4">
      <div className="relative max-w-screen-xl mx-auto flex h-16 items-center rounded-2xl border border-border/40 bg-background/80 px-4 shadow-lg shadow-black/5 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
        
        {/* LOGO */}
        <div className="flex-1 flex justify-start">
          <Link href="/" className="flex items-center space-x-3">
            <Image
              src="/nicepod-logo.png"
              alt="NicePod Icon"
              width={40}
              height={40}
              className="rounded-lg"
              priority
            />
            <span className="font-bold text-xl inline-block">NicePod</span>
          </Link>
        </div>

        {/* MENÚ CENTRAL DESKTOP */}
        <nav className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <ul className="flex items-center space-x-2 rounded-full bg-muted/50 p-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-background shadow-sm text-primary"
                      : "text-muted-foreground hover:text-primary"
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* ZONA DERECHA (AUTH & TOOLS) */}
        <div className="flex-1 flex items-center justify-end space-x-2">
          <ThemeToggle />
          
          <div className="hidden sm:flex items-center space-x-2">
            {isLoading ? (
              <div className="w-10 h-10 flex items-center justify-center"><Loader className="h-4 w-4 animate-spin"/></div>
            ) : user && profile ? (
              <>
                <NotificationBell />
                
                {/* DROPDOWN DE USUARIO (SOLUCIÓN DISONANCIA) */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-9 w-9 cursor-pointer border border-border hover:border-primary transition-colors">
                      <AvatarImage src={profile.avatar_url || ''} />
                      <AvatarFallback>{profile.full_name?.substring(0, 2).toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem asChild>
                      <Link href={`/profile/${profile.username}`} className="cursor-pointer">
                        <UserIcon className="mr-2 h-4 w-4" /> Perfil Público
                      </Link>
                    </DropdownMenuItem>
                    
                    {/* ENLACE ADMIN: Solo si es admin */}
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild className="bg-red-500/10 focus:bg-red-500/20">
                          <Link href="/admin" className="cursor-pointer text-red-500 font-medium">
                            <ShieldCheck className="mr-2 h-4 w-4" /> Torre de Control
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-600 cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link href='/login'>
                <Button variant="ghost" className="font-semibold">Ingresar</Button>
              </Link>
            )}
          </div>
          
          {/* BOTÓN NUEVO PODCAST (Solo si logueado o Desktop) */}
          <Link href="/create">
            <Button className="hidden lg:inline-flex bg-primary hover:bg-primary/90 text-white shadow-md">
                <Mic className="mr-2 h-4 w-4" /> Nuevo Podcast
            </Button>
          </Link>

          {/* MENÚ MÓVIL */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-xs">
                <SheetHeader>
                  <SheetTitle>
                    <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center space-x-3">
                       <Image src="/nicepod-logo.png" alt="Icon" width={32} height={32} className="rounded-md"/>
                       <span className="font-bold">NicePod</span>
                    </Link>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col space-y-4 mt-8">
                  {navItems.map((item) => (
                    <Link key={item.href} href={item.href} onClick={handleMobileLinkClick}>
                      <Button variant="ghost" className={cn("w-full justify-start text-lg", isActive(item.href) && "bg-secondary")}>
                        {item.label}
                      </Button>
                    </Link>
                  ))}
                  <hr className="border-border" />
                  
                  {user && profile ? (
                    <>
                      <Link href="/notifications" onClick={handleMobileLinkClick}>
                        <Button variant="ghost" className="w-full justify-start text-lg">Notificaciones</Button>
                      </Link>
                      <Link href={`/profile/${profile.username}`} onClick={handleMobileLinkClick}>
                        <Button variant="ghost" className="w-full justify-start text-lg">Mi Perfil</Button>
                      </Link>
                      {isAdmin && (
                        <Link href="/admin" onClick={handleMobileLinkClick}>
                            <Button variant="ghost" className="w-full justify-start text-lg text-red-500 font-bold">
                                <ShieldCheck className="mr-2 h-5 w-5" /> Admin
                            </Button>
                        </Link>
                      )}
                      <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-lg text-muted-foreground">
                        Cerrar Sesión
                      </Button>
                    </>
                  ) : (
                    <Link href="/login" onClick={handleMobileLinkClick}>
                        <Button className="w-full py-6 text-lg font-bold">Ingresar</Button>
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}