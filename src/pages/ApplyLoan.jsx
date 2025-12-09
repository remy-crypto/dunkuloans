import { useState } from "react";
import { supabase } from "../lib/SupabaseClient";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

export default function ApplyLoan() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) return alert("Please enter a valid amount");
    
    setLoading(true);
    
    // FIX: Changed 'user_id' to 'borrower_id' to match database
    const { error } = await supabase.from("loans").insert([
      {
        borrower_id: user.id, // <--- THE FIX
        amount: parseFloat(amount),
        status: "active",
        // Default values for other fields required by Master Script:
        total_repayment: parseFloat(amount) * 1.4, // Adding 40% interest automatically
        balance: parseFloat(amount) * 1.4
      }
    ]);

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("Loan Application Submitted!");
      navigate("/dashboard");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Apply for a Loan</h1>
        
        <div className="bg-white p-8 rounded-xl shadow-md max-w-lg">
          <form onSubmit={handleApply} className="flex flex-col gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Loan Amount (ZMW)</label>
              <input
                type="number"
                placeholder="e.g. 5000"
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-lg"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
              <p><strong>Note:</strong> Standard interest rate is 40%. Repayment due in 4 weeks.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-lg shadow transition-all disabled:opacity-50"
            >
              {loading ? "Processing..." : "Submit Application"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}