"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toggleFollowUser } from "@/actions/social-actions";
import { useTransition, useState } from "react";
import { Settings, UserPlus, Check } from "lucide-react";
import { toast } from "sonner";

// Nota: Idealmente importar 'Tables' de tu database.types.ts
interface ProfileHeaderProps {
  profile: any; 
  isOwnProfile: boolean;
  isFollowingInicial: boolean;
}

export const ProfileHeader = ({ profile, isOwnProfile, isFollowingInicial }: ProfileHeaderProps) => {
  const [isPending, startTransition] = useTransition();
  const [isFollowing, setIsFollowing] = useState(isFollowingInicial);

  const handleFollow = () => {
    setIsFollowing(!isFollowing); // Optimistic UI
    
    startTransition(async () => {
      const result = await toggleFollowUser(profile.id);
      if (!result.success) {
        setIsFollowing(isFollowingInicial); // Rollback
        toast.error(result.message);
      } else {
        toast.success(result.message);
      }
    });
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 items-center md:items-start p-6">
      {/* Avatar Gigante con Borde Glass */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-tr from-violet-500 to-fuchsia-500 rounded-full opacity-70 blur group-hover:opacity-100 transition duration-1000"></div>
        <Avatar className="w-32 h-32 border-4 border-black relative">
          {/* CORRECCIÓN: Usamos tailwind class en lugar de prop antigua */}
          <AvatarImage 
            src={profile.avatar_url} 
            className="object-cover w-full h-full"
            alt={profile.display_name || "Usuario"}
          />
          <AvatarFallback className="text-3xl font-black bg-zinc-900 text-zinc-500">
            {profile.display_name?.slice(0, 2).toUpperCase() || "??"}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Info & Stats */}
      <div className="flex-1 space-y-4 text-center md:text-left">
        <div>
          <h1 className="text-3xl font-black tracking-tight">{profile.display_name}</h1>
          <p className="text-muted-foreground font-medium">@{profile.handle}</p>
        </div>
        
        {profile.bio && (
          <p className="text-sm text-zinc-300 max-w-md leading-relaxed mx-auto md:mx-0">
            {profile.bio}
          </p>
        )}

        {/* Stats Row */}
        <div className="flex items-center justify-center md:justify-start gap-6 text-sm">
          <div className="flex flex-col items-center md:items-start">
            <span className="font-bold text-white">{profile.reputation_score || 0}</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Reputación</span>
          </div>
          <div className="flex flex-col items-center md:items-start">
            <span className="font-bold text-white">{profile.followers_count || 0}</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Seguidores</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-2">
        {isOwnProfile ? (
          <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 gap-2">
            <Settings size={16} />
            Editar Perfil
          </Button>
        ) : (
          <Button 
            onClick={handleFollow} 
            disabled={isPending}
            className={isFollowing 
              ? "bg-transparent border border-white/20 text-white" 
              : "bg-white text-black hover:bg-zinc-200"
            }
          >
            {isFollowing ? <><Check size={16} className="mr-2"/> Siguiendo</> : <><UserPlus size={16} className="mr-2"/> Seguir</>}
          </Button>
        )}
      </div>
    </div>
  );
};