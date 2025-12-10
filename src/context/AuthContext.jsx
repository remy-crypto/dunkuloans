import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/SupabaseClient";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check active session
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

    // 2. Listen for changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  };

  // --- FIX IS HERE: Renamed 'logout' to 'signOut' ---
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