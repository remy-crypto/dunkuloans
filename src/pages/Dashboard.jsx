import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/SupabaseClient";
import { useNavigate } from "react-router-dom";

// IMPORT THE PAGES
import BorrowerDashboard from "./BorrowerDashboard";
import AdminDashboard from "./AdminDashboard";

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, navigate]);

  // Loading State (Dark Theme Match)
  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-100">
        <div className="animate-pulse">Loading Dunkuloans...</div>
      </div>
    );
  }

  // === ROLE BASED SWITCHING ===
  
  if (profile.role === 'admin') {
    return <AdminDashboard />;
  }

  if (profile.role === 'borrower') {
    return <BorrowerDashboard />;
  }

  // Fallback for other roles (e.g. Agent/Investor) if not yet built
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-100">
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2">Welcome, {profile.full_name}</h2>
        <p className="text-gray-400">Role: {profile.role}</p>
        <p className="mt-4 text-sm text-gray-500">Dashboard for this role is coming soon.</p>
      </div>
    </div>
  );
}