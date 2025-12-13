import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/SupabaseClient";
import { useNavigate } from "react-router-dom";

// --- IMPORT THE SPECIFIC DASHBOARDS ---
import ClientDashboard from "./client/ClientDashboard"; // Borrower Portal
import AdminDashboard from "./admin/AdminDashboard";   // Worker Portal
import SuperAdminDashboard from "./admin/SuperAdminDashboard"; // Super Admin Console
import PartnerDashboard from "./partner/PartnerDashboard"; // Agent Portal
import InvestorDashboard from "./investor/InvestorDashboard"; // Investor Portal

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. If no user is logged in via AuthContext, redirect immediately
    if (!user) {
      navigate("/login");
      return;
    }

    // 2. Fetch the user's Profile to get their Role
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

  // --- LOADING STATE (Dark Theme) ---
  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-100">
        <div className="flex flex-col items-center gap-4">
          {/* Simple Spinner */}
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-gray-400">Loading Portal...</p>
        </div>
      </div>
    );
  }

  // --- ROLE BASED SWITCHING ---
  
  // 1. Super Admin View (Light Theme)
  if (profile.role === 'super_admin') {
    return (
      <div className="flex min-h-screen bg-gray-50 text-gray-900">
        <div className="flex-1 overflow-hidden">
           <SuperAdminDashboard />
        </div>
      </div>
    );
  }

  // 2. Admin (Worker) View (Dark Theme)
  if (profile.role === 'admin') {
    return (
      <div className="flex min-h-screen bg-gray-900 text-gray-100">
        <div className="flex-1 overflow-hidden">
          <AdminDashboard />
        </div>
      </div>
    );
  }

  // 3. Partner (Agent) View
  if (profile.role === 'partner') {
    return (
      <div className="flex min-h-screen bg-gray-900 text-gray-100">
        <div className="flex-1 overflow-hidden">
          <PartnerDashboard />
        </div>
      </div>
    );
  }

  // 4. Investor View
  if (profile.role === 'investor') {
    return (
      <div className="flex min-h-screen bg-gray-900 text-gray-100">
        <div className="flex-1 overflow-hidden">
          <InvestorDashboard />
        </div>
      </div>
    );
  }

  // 5. Client (Borrower) View - Default
  // Handles 'borrower' (db default) or 'client' aliases
  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      <div className="flex-1 overflow-hidden">
        <ClientDashboard />
      </div>
    </div>
  );
}