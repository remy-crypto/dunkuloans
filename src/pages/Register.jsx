// src/pages/Register.jsx
import { useState } from "react";
import { supabase } from "../lib/SupabaseClient";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    // SIMPLE SIGN UP
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      // SUCCESS
      alert("Registration Successful! Please Login.");
      navigate("/login");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleRegister} className="bg-white p-8 rounded shadow-md">
        <h2 className="text-2xl mb-4">Register</h2>
        <input 
          className="border p-2 w-full mb-4" 
          placeholder="Email" 
          onChange={(e) => setEmail(e.target.value)} 
        />
        <input 
          className="border p-2 w-full mb-4" 
          type="password" 
          placeholder="Password" 
          onChange={(e) => setPassword(e.target.value)} 
        />
        <button disabled={loading} className="bg-blue-600 text-white p-2 w-full">
          {loading ? "Loading..." : "Register"}
        </button>
      </form>
    </div>
  );
}