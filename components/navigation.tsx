// components/navigation.tsx

"use client"

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Mic, Menu, X, LogIn, LogOut, ShieldCheck, Loader } from "lucide-react";

export function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // --- MODIFICACIÓN: Obtenemos el estado directamente del AuthProvider ---
  const { user, isAdmin, signOut, isLoading } = useAuth();

  const navItems = [
    { href: "/create", label: "Create" },
    { href: "/podcasts", label: "Micro-pods" },
    { href: "/pricing", label: "Pricing" }
  ];

  const isActive = (href: string) => pathname === href;
  const handleNavigation = (href: string) => {
    setIsMobileMenuOpen(false);
    window.scrollTo(0, 0);
    router.push(href);
  };
  const handleLogout = async () => {
    await signOut();
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/20 backdrop-blur-xl border-b border-white/30 shadow-glass dark:bg-gray-900/20 dark:border-gray-700/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative pt-4">
        <div className="relative z-10 bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30 shadow-glass mx-2 dark:bg-gray-900/20 dark:border-gray-700/30">
          <div className="flex justify-between items-center h-16 px-4">
            <button
              onClick={() => handleNavigation("/")}
              className="flex items-center space-x-2 group cursor-pointer"
            >
              <div className="p-1 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 animate-glow">
                <Mic className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gradient">NicePod</span>
            </button>
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => handleNavigation(item.href)}
                  className={`px-4 py-2 rounded-lg transition-all duration-300 ${isActive(item.href) ? "bg-white/30 backdrop-blur-sm text-purple-accessible-dark font-medium shadow-glass border border-white/40 dark:bg-white/20 dark:text-purple-accessible dark:border-white/30" : "text-gray-700 hover:bg-white/20 hover:backdrop-blur-sm hover:text-purple-accessible hover:border hover:border-white/30 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-purple-accessible"}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              
              {/* --- LÓGICA DE RENDERIZADO MEJORADA --- */}
              {isLoading ? (
                <div className="w-24 h-8 flex items-center justify-center">
                   <Loader className="h-5 w-5 animate-spin"/>
                </div>
              ) : user ? (
                <>
                  {isAdmin && (<Button onClick={() => handleNavigation("/admin/prompts")} variant="ghost" size="icon" title="Admin Panel" className="..."><ShieldCheck className="h-5 w-5 text-green-500" /></Button>)}
                  <Button onClick={() => handleNavigation("/profile")} variant="ghost" size="icon" title="Profile" className="..."><Avatar className="h-7 w-7"><AvatarImage src={user.user_metadata?.avatar_url || '/images/authors/default-avatar.png'} alt={user.email ?? 'User Avatar'} /><AvatarFallback className="...">{user.email?.substring(0, 2).toUpperCase() ?? 'U'}</AvatarFallback></Avatar></Button>
                  <Button onClick={handleLogout} variant="ghost" size="icon" title="Sign Out" className="..."><LogOut className="h-5 w-5" /></Button>
                </>
              ) : (
                <Button onClick={() => handleNavigation('/login')} variant="ghost" className="hidden md:flex items-center space-x-2 ...">
                  <LogIn className="h-5 w-5" />
                  <span>Ingresar</span>
                </Button>
              )}
              
              <Button variant="ghost" size="icon" className="md:hidden ..." onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>{isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</Button>
              <div className="hidden sm:flex"><Button onClick={() => handleNavigation("/create")} className="..."><Mic className="mr-2 h-4 w-4" />Create New Podcast</Button></div>
            </div>
          </div>
          {/* ... (El JSX del menú móvil no cambia) ... */}
        </div>
      </div>
    </nav>
  );
}