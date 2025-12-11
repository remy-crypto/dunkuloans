import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    // Debugging: Check what is being sent
    console.log("Attempting login with:", email); 

    try {
      if (!email || !password) {
        throw new Error("Please enter both email and password.");
      }

      await signIn(email, password);
      
      // If successful, redirect
      console.log("Login successful, redirecting...");
      navigate("/dashboard");

    } catch (err) {
      console.error("Login Error:", err);
      // Show the actual message from Supabase (e.g. "Invalid login credentials")
      setErrorMsg(err.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-100">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow border border-gray-700">
        <h2 className="text-2xl font-semibold mb-4 text-white">Sign In</h2>
        
        {/* Error Display */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700 text-red-200 text-sm rounded">
            {errorMsg}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input 
              className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:border-indigo-500 outline-none" 
              placeholder="name@example.com" 
              type="email"
              value={email} 
              onChange={(e) => setEmail(e.target.value.trim())} // Added trim() to remove accidental spaces
              required 
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input 
              className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:border-indigo-500 outline-none" 
              placeholder="••••••••" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          <button 
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50" 
            type="submit" 
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p className="text-sm mt-4 text-gray-400">
          Don't have an account? <Link to="/register" className="text-indigo-400 hover:text-indigo-300">Register</Link>
        </p>
      </div>
    </div>
  );
}