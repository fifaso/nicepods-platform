// components/profile-client-component.tsx

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2, Crown, User as UserIcon, Edit } from "lucide-react"
import { Tables } from "@/types/supabase"
import { useToast } from "@/components/ui/use-toast"

// Definimos un tipo que representa el resultado de nuestro JOIN
type ProfileWithSubscription = Tables<'profiles'> & {
  subscriptions: (Tables<'subscriptions'> & {
    plans: Tables<'plans'> | null;
  }) | null;
};

interface ProfileClientComponentProps {
  profileData?: ProfileWithSubscription | null;
}

export function ProfileClientComponent({ profileData }: ProfileClientComponentProps) {
  const { user, profile: authProfile, isLoading, signOut, supabase } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  const displayProfile = authProfile || profileData;

  const [fullName, setFullName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    if (displayProfile) {
      setFullName(displayProfile.full_name || "");
    }
  }, [displayProfile]);
  
  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', user.id);

    if (error) {
      toast({ title: "Error", description: "Could not update your profile.", variant: "destructive" });
    } else {
      toast({ title: "Success!", description: "Your profile has been updated." });
      router.refresh(); // Refrescamos para que la página del servidor obtenga los nuevos datos
    }
    setIsSaving(false);
  };
  
  // --- LÓGICA DE CARGA ---
  if (isLoading || !displayProfile) {
    return (
      <div className="space-y-4 p-4">
        <p className="text-center text-muted-foreground">Initializing profile...</p>
        <div className="flex items-center space-x-4"><Skeleton className="h-12 w-12 rounded-full" /><div className="space-y-2"><Skeleton className="h-4 w-[250px]" /><Skeleton className="h-4 w-[200px]" /></div></div>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }
  
  // --- CORRECCIÓN: Lógica para obtener los datos del plan de forma segura ---
  const subscriptionPlan = displayProfile.subscriptions?.plans?.name || 'Free';
  const subscriptionStatus = displayProfile.subscriptions?.status || 'Inactive';

  return (
    <div className="grid lg:grid-cols-3 gap-8 p-4">
      {/* Columna 1: Tarjeta de Perfil y Sign Out */}
      <div className="lg:col-span-1 space-y-6">
        <div className="p-6 border rounded-lg bg-card/50 flex flex-col items-center text-center">
            <Avatar className="w-24 h-24 mb-4 border-4 border-primary">
              <AvatarImage src={displayProfile.avatar_url || ''} alt={displayProfile.full_name || ''} />
              <AvatarFallback className="text-3xl bg-muted">
                {displayProfile.full_name ? displayProfile.full_name.charAt(0) : <UserIcon />}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold">{displayProfile.full_name}</h2>
            <p className="text-sm text-muted-foreground">{displayProfile.username}</p>
            
            <div className="mt-6 w-full">
              <Button onClick={signOut} variant="destructive" className="w-full">
                Sign Out
              </Button>
            </div>
        </div>
      </div>
      
      {/* Columna 2: Detalles de Suscripción y Edición de Perfil */}
      <div className="lg:col-span-2 space-y-8">
        {/* Módulo de Suscripción */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Subscription Details</h3>
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
              <div className="flex items-center gap-3">
                <Crown className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-semibold text-lg capitalize">{subscriptionPlan} Plan</p>
                  <Badge variant={subscriptionStatus === 'active' ? 'default' : 'destructive'} className="capitalize">{subscriptionStatus}</Badge>
                </div>
              </div>
              <Button variant="outline" onClick={() => router.push('/pricing')}>Manage Plan</Button>
          </div>
        </div>

        {/* Módulo de Edición de Perfil */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Account Settings</h3>
          <div className="space-y-4 p-4 rounded-lg bg-muted/50 border">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={user?.email || ""} disabled className="opacity-70" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input id="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSaveProfile} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}