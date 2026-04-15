/**
 * ARCHIVO: components/social/profile-header.tsx
 * VERSIÓN: 2.0 (NicePod Profile Header - Sovereign Protocol V4.0)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * MISIÓN: Proveer la cabecera de perfil social con integridad nominal y ZAP.
 * NIVEL DE INTEGRIDAD: 100% (Soberano / ZAP Compliant / Build Shield Green)
 */

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { followUserAction } from "@/actions/social-actions";
import { useTransition, useState } from "react";
import { Settings, UserPlus, Check } from "lucide-react";
import { toast } from "sonner";
import { ProfileData } from "@/types/profile";

/**
 * INTERFAZ: ProfileHeaderComponentProperties
 */
interface ProfileHeaderComponentProperties {
  profile: ProfileData;
  isOwnProfileSovereignty: boolean;
  isFollowingInitialState: boolean;
}

export const ProfileHeader = ({ profile, isOwnProfileSovereignty, isFollowingInitialState }: ProfileHeaderComponentProperties) => {
  const [isProcessingActive, startTransition] = useTransition();
  const [isFollowingSovereignty, setIsFollowingSovereignty] = useState(isFollowingInitialState);

  const handleFollowAction = () => {
    setIsFollowingSovereignty(!isFollowingSovereignty); // Optimistic UI
    
    startTransition(async () => {
      const response = await followUserAction(profile.identification);
      if (!response.isOperationSuccessful) {
        setIsFollowingSovereignty(isFollowingInitialState); // Rollback
        toast.error(response.responseStatusMessage);
      } else {
        toast.success(response.responseStatusMessage);
      }
    });
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 items-center md:items-start p-6">

      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-tr from-violet-500 to-fuchsia-500 rounded-full opacity-70 blur group-hover:opacity-100 transition duration-1000"></div>
        <Avatar className="w-32 h-32 border-4 border-black relative">
          <AvatarImage 
            src={profile.avatarUniformResourceLocator || ""}
            className="object-cover w-full h-full"
            alt={profile.fullName || "Usuario"}
          />
          <AvatarFallback className="text-3xl font-black bg-zinc-900 text-zinc-500">
            {profile.fullName?.slice(0, 2).toUpperCase() || "??"}
          </AvatarFallback>
        </Avatar>
      </div>

      <div className="flex-1 space-y-4 text-center md:text-left">
        <div>
          <h1 className="text-3xl font-black tracking-tight">{profile.fullName || profile.username}</h1>
          <p className="text-muted-foreground font-medium">@{profile.username}</p>
        </div>
        
        {profile.biographyTextContent && (
          <p className="text-sm text-zinc-300 max-w-md leading-relaxed mx-auto md:mx-0">
            {profile.biographyTextContent}
          </p>
        )}

        <div className="flex items-center justify-center md:justify-start gap-6 text-sm">
          <div className="flex flex-col items-center md:items-start">
            <span className="font-bold text-white">{profile.reputationScoreValue || 0}</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Reputación</span>
          </div>
          <div className="flex flex-col items-center md:items-start">
            <span className="font-bold text-white">{profile.followersCountInventory || 0}</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Seguidores</span>
          </div>
        </div>
      </div>

      <div className="pt-2">
        {isOwnProfileSovereignty ? (
          <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 gap-2">
            <Settings size={16} />
            Editar Perfil
          </Button>
        ) : (
          <Button 
            onClick={handleFollowAction}
            disabled={isProcessingActive}
            className={isFollowingSovereignty
              ? "bg-transparent border border-white/20 text-white" 
              : "bg-white text-black hover:bg-zinc-200"
            }
          >
            {isFollowingSovereignty ? <><Check size={16} className="mr-2"/> Siguiendo</> : <><UserPlus size={16} className="mr-2"/> Seguir</>}
          </Button>
        )}
      </div>
    </div>
  );
};
