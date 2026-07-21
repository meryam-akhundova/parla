import { useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../store/authStore";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setSession = useAuthStore((s) => s.setSession);
  const setInitialized = useAuthStore((s) => s.setInitialized);
  const loadProfile = useAuthStore((s) => s.loadProfile);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setInitialized(true);
      if (data.session) {
        useAuthStore.setState({ profileLoaded: false });
        loadProfile();
      } else {
        useAuthStore.setState({ profileLoaded: true });
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        useAuthStore.setState({ profileLoaded: false });
        loadProfile();
      } else {
        useAuthStore.setState({ profile: null, profileLoaded: false });
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  return <>{children}</>;
}