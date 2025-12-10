import React, { useState } from "react";
import { supabase } from "../lib/SupabaseClient"; // Direct Supabase usage for raw control
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState(""); // Added Name field
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Sign up with Metadata (Important for the SQL Trigger)
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName, // This gets sent to the profiles table
          },
        },
      });

      if (signUpError) throw signUpError;

      // 2. Success - Redirect to Login
      alert("Registration Successful! Please log in.");
      navigate("/login");

    } catch (err) {
      console.error("Registration failed:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Full Name</label>
            <input 
              type="text" 
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:border-indigo-500 outline-none text-white"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input 
              type="email" 
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:border-indigo-500 outline-none text-white"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input 
              type="password" 
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:border-indigo-500 outline-none text-white"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 rounded font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account? <Link to="/login" className="text-indigo-400 hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}