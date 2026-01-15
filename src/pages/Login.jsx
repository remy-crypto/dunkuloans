import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/SupabaseClient"; // Import Supabase directly for the check

export default function Login() {
  const { signIn, signOut } = useAuth(); // Import signOut to kick unverified users
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [matchCode, setMatchCode] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 1. Attempt standard login
      const { user } = await signIn(email, password, matchCode);

      if (user) {
        // 2. CHECK VERIFICATION STATUS
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_verified, role')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        // 3. If NOT verified, kick them out
        if (profile.is_verified === false) {
          await signOut(); // Log them out immediately
          alert("Your account is pending approval by an Administrator. Please wait for verification.");
          setLoading(false);
          return; // Stop here
        }

        // 4. If Verified, proceed to dashboard
        navigate("/dashboard");
      }

    } catch (err) {
      // Handle "Invalid login credentials" or other errors
      alert(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-800 font-sans">
      
      {/* Branding Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-normal text-[#0e2a47]">DUNKU BUSINESS</h1>
        <p className="text-xs font-bold tracking-[0.3em] text-[#0e2a47] mt-1">SOLUTIONS LTD</p>
        <p className="text-green-700 text-sm mt-3 font-medium">Your ideall home filled with Hope</p>
        <p className="text-gray-500 text-xs mt-6">Secure, AI-powered collateral loans at your fingertips.</p>
      </div>

      <div className="mb-6 text-xs text-gray-400 cursor-pointer hover:text-gray-600">
        <Link to="/">← Back to Home</Link>
      </div>

      <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
        <div className="flex justify-center mb-6">
           <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
           </div>
        </div>

        <h2 className="text-xl font-bold mb-2 text-center text-gray-900">Portal Login</h2>
        <p className="text-center text-xs text-gray-500 mb-8">Enter your credentials to access the portal.</p>
        
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg></span>
              <input 
                className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2.5 pl-10 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" 
                placeholder="name@company.com" 
                type="email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg></span>
              <input 
                className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2.5 pl-10 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" 
                placeholder="••••••••" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div>
             <label className="block text-xs font-bold text-gray-700 mb-1">Investor / Admin Match Code</label>
             <div className="relative">
               <span className="absolute left-3 top-3 text-gray-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11.536 19.336A1.5 1.5 0 0110.233 20h-2.466a1.5 1.5 0 01-1.303-.703l-1.303-2.172a1.5 1.5 0 01-.157-1.348l.78-2.6a6 6 0 018.21-6.177z"></path></svg></span>
               <input 
                 className="w-full bg-white border border-gray-300 rounded-lg py-2.5 pl-10 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" 
                 placeholder="Required for Admins" 
                 type="text"
                 value={matchCode}
                 onChange={(e) => setMatchCode(e.target.value)}
               />
             </div>
             <p className="text-[10px] text-gray-400 mt-1">Required for worker verification.</p>
          </div>

          <div className="flex justify-between items-center text-xs">
             <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                <input type="checkbox" className="rounded text-indigo-600" /> Remember me
             </label>
             <a href="#" className="text-indigo-600 hover:underline">Forgot password?</a>
          </div>

          <button 
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg transition-colors font-bold shadow-lg shadow-indigo-200" 
            type="submit" 
            disabled={loading}
          >
            {loading ? "Verifying..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}