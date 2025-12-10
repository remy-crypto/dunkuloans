import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  // FIX: Use 'signIn' instead of 'login'
  const { signIn } = useAuth(); 
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // FIX: Call 'signIn'
      await signIn(email, password);
      navigate("/dashboard");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-100">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow border border-gray-700">
        <h2 className="text-2xl font-semibold mb-4 text-white">Sign In</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <input 
            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:border-indigo-500 outline-none" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <input 
            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:border-indigo-500 outline-none" 
            placeholder="Password" 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          <button 
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition-colors font-medium" 
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