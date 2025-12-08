import { useState } from "react";
import { supabase } from "../lib/SupabaseClient";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 1. Sign up the user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName, 
        },
      },
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Registration Successful! Check your email to confirm.");
      navigate("/login");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-200">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl">
        <h2 className="text-3xl font-extrabold text-center text-slate-800 mb-8">
          Join Dunkuloans
        </h2>
        
        <form onSubmit={handleRegister} className="flex flex-col gap-6">
          {/* Full Name Input */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
            <input
              type="text"
              required
              placeholder="John Doe"
              className="w-full p-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-slate-900 bg-slate-50"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              className="w-full p-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-slate-900 bg-slate-50"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full p-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-slate-900 bg-slate-50"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* THE REGISTER BUTTON - High Visibility */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-4 rounded-lg shadow-md transition-colors duration-200 mt-2"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-slate-600">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-blue-600 hover:underline">
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
}