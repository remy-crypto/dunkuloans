import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/SupabaseClient";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Initial Session Check
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setUser(data?.session?.user ?? null);
      } catch (error) {
        console.error("Auth check failed", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // 2. Match Code Expiration Monitor (Runs every minute)
  useEffect(() => {
    if (!user) return;

    const checkCodeExpiration = async () => {
      // Get user role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      // Only check for Worker Admins
      if (profile && profile.role === 'admin') {
        const { data: codeData } = await supabase
          .from('access_codes')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (codeData) {
          const now = new Date();
          const expiresAt = new Date(codeData.expires_at);

          if (now > expiresAt) {
            alert("Your Match Code has expired. Please log in with a new code.");
            await signOut();
          }
        } else {
          // No code exists at all? Security risk, logout.
          await signOut();
        }
      }
    };

    const interval = setInterval(checkCodeExpiration, 60000); // Check every 60s
    return () => clearInterval(interval);
  }, [user]);

  // 3. Login Logic with Match Code
  const signIn = async (email, password, matchCode) => {
    // A. Perform Standard Auth
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const loggedInUser = data.user;

    // B. Check Role & Match Code
    if (loggedInUser) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', loggedInUser.id)
        .single();

      // If user is a WORKER ADMIN, enforce Match Code
      if (profile && profile.role === 'admin') {
        if (!matchCode) {
          await supabase.auth.signOut();
          throw new Error("Match Code is required for Admin access.");
        }

        // Fetch latest active code
        const { data: latestCode } = await supabase
          .from('access_codes')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (!latestCode) {
          await supabase.auth.signOut();
          throw new Error("System error: No active Match Code found.");
        }

        // Check if code matches
        if (latestCode.code !== matchCode) {
          await supabase.auth.signOut();
          throw new Error("Invalid Match Code.");
        }

        // Check expiry
        if (new Date() > new Date(latestCode.expires_at)) {
          await supabase.auth.signOut();
          throw new Error("Match Code has expired. Ask Super Admin for a new one.");
        }
      }
    }

    setUser(loggedInUser);
    return data;
  };

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {!loading ? children : <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);