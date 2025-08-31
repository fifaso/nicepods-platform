// app/profile/page.tsx

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'
// Ahora estas importaciones funcionarán porque los tipos son exportados.
import { ProfileClientComponent, type ProfileClientComponentProps } from './profile-client-component'
import { type ProfileData } from './profile-client-component'

export default async function ProfilePage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login?redirect=/profile');
  }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, subscriptions(*, plans(*))')
    .eq('id', user.id)
    .single<ProfileData>();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { count: podcastsCreatedThisMonth } = await supabase
    .from('micro_pods')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', thirtyDaysAgo.toISOString());
    
  const clientProps: ProfileClientComponentProps = {
    profile: profile, 
    podcastsCreatedThisMonth: podcastsCreatedThisMonth ?? 0
  };

  return (
    <ProfileClientComponent {...clientProps} />
  );
}