import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/SupabaseClient";
import { useAuth } from "../../context/AuthContext";

export default function ClientProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
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

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        phone: profile.phone,
        address: profile.address,
        id_number: profile.id_number
      })
      .eq("id", user.id);

    if (error) alert(error.message);
    else alert("Profile updated successfully!");
    setLoading(false);
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

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Full Name</label>
              <input type="text" className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white"
                value={profile.full_name || ""}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email (Read Only)</label>
              <input type="text" disabled className="w-full bg-gray-900/50 border border-gray-700 rounded p-3 text-gray-500 cursor-not-allowed"
                value={profile.email || ""}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Phone Number</label>
              <input type="text" className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white"
                value={profile.phone || ""}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">NRC / ID Number</label>
              <input type="text" className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white"
                value={profile.id_number || ""}
                onChange={(e) => setProfile({ ...profile, id_number: e.target.value })}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Physical Address</label>
            <textarea className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white h-24"
              value={profile.address || ""}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
            ></textarea>
          </div>

          <div className="pt-4 border-t border-gray-700 flex justify-end">
            <button disabled={loading} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold transition">
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
