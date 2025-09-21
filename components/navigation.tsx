"use client"

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
// ================== INTERVENCIÓN QUIRÚRGICA #1: IMPORTACIÓN DE COMPONENTES SHEET ==================
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
// =================================================================================================
import { Mic, Menu, X, LogIn, LogOut, ShieldCheck, Loader } from "lucide-react";

export function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { user, isAdmin, signOut, isLoading } = useAuth();

  const navItems = [
    { href: "/create", label: "Create" },
    { href: "/podcasts", label: "Micro-pods" },
    { href: "/pricing", label: "Pricing" }
  ];

  const isActive = (href: string) => pathname === href;

  // Esta función ahora se usará tanto en escritorio como en móvil.
  const handleNavigation = (href: string) => {
    // Cerramos el menú móvil antes de navegar
    setIsMobileMenuOpen(false);
    // Llevamos al usuario al principio de la página
    window.scrollTo(0, 0);
    router.push(href);
  };

  const handleLogout = async () => {
    await signOut();
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/20 backdrop-blur-xl border-b border-white/30 shadow-glass dark:bg-gray-900/20 dark:border-gray-700/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo y Nombre de la App */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="p-1 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600">
              <Mic className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
              NicePod
            </span>
          </Link>
          
          {/* Navegación de Escritorio */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant={isActive(item.href) ? "secondary" : "ghost"}
                onClick={() => handleNavigation(item.href)}
              >
                {item.label}
              </Button>
            ))}
          </div>

          {/* Controles del Lado Derecho */}
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            
            <div className="hidden md:flex items-center space-x-2">
              {isLoading ? (
                <div className="w-24 h-10 flex items-center justify-center"><Loader className="h-5 w-5 animate-spin"/></div>
              ) : user ? (
                <>
                  {isAdmin && (<Button onClick={() => handleNavigation("/admin/prompts")} variant="ghost" size="icon" title="Admin Panel"><ShieldCheck className="h-5 w-5 text-green-500" /></Button>)}
                  <Button onClick={() => handleNavigation("/profile")} variant="ghost" size="icon" title="Profile">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback>{user.email?.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                  <Button onClick={handleLogout} variant="ghost" size="icon" title="Sign Out"><LogOut className="h-5 w-5" /></Button>
                </>
              ) : (
                <Button onClick={() => handleNavigation('/login')} variant="ghost">
                  <LogIn className="h-5 w-5 mr-2" /> Ingresar
                </Button>
              )}
              <Button onClick={() => handleNavigation("/create")}><Mic className="mr-2 h-4 w-4" />Create New Podcast</Button>
            </div>

            {/* ================== INTERVENCIÓN QUIRÚRGICA #2: IMPLEMENTACIÓN DEL MENÚ MÓVIL ================== */}
            <div className="md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Abrir menú</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full max-w-sm">
                  <SheetHeader>
                    <SheetTitle>
                      <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center space-x-2 group">
                        <div className="p-1 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600">
                          <Mic className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">NicePod</span>
                      </Link>
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col space-y-4 mt-8">
                    {navItems.map((item) => (
                      <Button
                        key={item.href}
                        variant={isActive(item.href) ? "secondary" : "ghost"}
                        onClick={() => handleNavigation(item.href)}
                        className="justify-start text-lg py-6"
                      >
                        {item.label}
                      </Button>
                    ))}

                    <hr className="border-border" />
                    
                    {isLoading ? (
                      <div className="flex items-center justify-center p-4"><Loader className="h-6 w-6 animate-spin"/></div>
                    ) : user ? (
                      <>
                        <Button variant="ghost" onClick={() => handleNavigation("/profile")} className="justify-start text-lg py-6">Perfil</Button>
                        {isAdmin && <Button variant="ghost" onClick={() => handleNavigation("/admin/prompts")} className="justify-start text-lg py-6 text-green-500">Panel de Admin</Button>}
                        <Button variant="ghost" onClick={handleLogout} className="justify-start text-lg py-6 text-red-500">Cerrar Sesión</Button>
                      </>
                    ) : (
                      <Button variant="ghost" onClick={() => handleNavigation('/login')} className="justify-start text-lg py-6">
                        <LogIn className="h-5 w-5 mr-2" /> Ingresar
                      </Button>
                    )}
                    
                    <hr className="border-border" />

                    <Button onClick={() => handleNavigation("/create")} size="lg" className="w-full py-6 text-lg">
                      <Mic className="mr-2 h-5 w-5" />Crear Nuevo Podcast
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
             {/* ================================================================================================= */}
          </div>
        </div>
      </div>
    </nav>
  );
}