import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { getCurrentUser, getUserRole } from "../services/authService";

export default function useAuth() {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    async function loadUser() {
      setLoading(true);

      // Get current logged-in user
      const user = await getCurrentUser();
      setCurrentUser(user);

      // If user exists, fetch role
      if (user) {
        const userRole = await getUserRole();
        setRole(userRole);
      } else {
        setRole(null);
      }

      setLoading(false);
    }

    loadUser();

    // Listen to auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return { loading, currentUser, role };
}