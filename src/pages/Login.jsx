import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "2rem auto" }}>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required style={{ width: "100%", marginBottom: "1rem", padding: "0.5rem" }} />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required style={{ width: "100%", marginBottom: "1rem", padding: "0.5rem" }} />
        <button type="submit" style={{ width: "100%", padding: "0.5rem", background: "#2c3e50", color: "#fff", border: "none" }}>Login</button>
      </form>
      <p style={{ marginTop: "1rem" }}>Don't have an account? <Link to="/register">Register</Link></p>
    </div>
  );
}
