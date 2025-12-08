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

    try {
      // 1. Sign Up the User (Authentication)
      // We include metadata here so Supabase Auth knows the name too
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (authError) throw authError;

      // 2. Create the Profile (Database) - MANUAL INSERT
      // This runs from the client side to avoid the 500 Server Error trigger
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              email: email,
              full_name: fullName,
              role: 'borrower' // Default role
            }
          ]);

        if (profileError) {
          console.error("Profile creation failed:", profileError);
          // We continue anyway because the Auth account was created successfully.
        }
      }

      alert("Registration Successful! Please Log in.");
      navigate("/login");

    } catch (error) {
      console.error("Registration Error:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Join Dunkuloans</h2>
          <p className="text-sm text-gray-500 mt-2">Create your account to get started</p>
        </div>
        
        <form onSubmit={handleRegister} className="flex flex-col gap-5">
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              placeholder="John Doe"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-lg shadow-md transition-all mt-2 disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-blue-600 hover:underline">
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
}