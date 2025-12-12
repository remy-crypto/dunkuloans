import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/SupabaseClient";
import { useAuth } from "../../context/AuthContext";

export default function ClientProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    id_number: ""
  });

  useEffect(() => {
    if (user) getProfile();
  }, [user]);

  const getProfile = async () => {
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (data) setProfile(data);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Profile & Settings</h1>
      
      <div className="bg-gray-800 p-8 rounded-xl border border-gray-700">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center text-3xl font-bold text-white">
            {profile.full_name?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{profile.full_name}</h2>
            <p className="text-gray-400">{profile.role?.toUpperCase()}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Full Name</label>
              <input type="text" disabled className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-gray-500 cursor-not-allowed"
                value={profile.full_name || ""}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input type="text" disabled className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-gray-500 cursor-not-allowed"
                value={profile.email || ""}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Phone Number</label>
              <input type="text" disabled className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-gray-500 cursor-not-allowed"
                value={profile.phone || ""}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">NRC / ID Number</label>
              <input type="text" disabled className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-gray-500 cursor-not-allowed"
                value={profile.nrc_number || profile.id_number || ""}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Physical Address</label>
            <textarea disabled className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-gray-500 h-24 cursor-not-allowed"
              value={profile.address || ""}
            ></textarea>
          </div>

          <div className="pt-4 border-t border-gray-700 flex items-center justify-between">
            <p className="text-xs text-yellow-500 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              Details are locked for security.
            </p>
            <button className="text-indigo-400 text-sm hover:underline hover:text-indigo-300">
              Request Change via Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}