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
    
    // Calculate defaults
    const principal = parseFloat(amount);
    const interest = principal * 0.40; // 40% interest
    const total = principal + interest;

    const { error } = await supabase.from("loans").insert([
      {
        borrower_id: user.id, // Links to the logged-in user
        amount: principal,
        interest_rate: 0.40,
        total_repayment: total,
        balance: total,
        status: "pending"
      }
    ]);

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("Loan Application Submitted Successfully!");
      navigate("/dashboard");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Apply for a Loan</h1>
        
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-xl">
          <form onSubmit={handleApply} className="flex flex-col gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Loan Amount (ZMW)</label>
              <input
                type="number"
                placeholder="e.g. 5000"
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-lg bg-gray-50 transition-all"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            {/* Live Calculator Preview */}
            {amount > 0 && (
              <div className="bg-indigo-50 p-6 rounded-xl space-y-3">
                <div className="flex justify-between text-sm text-indigo-900">
                  <span>Principal:</span>
                  <span className="font-bold">K {parseFloat(amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-indigo-900">
                  <span>Interest (40%):</span>
                  <span className="font-bold">K {(parseFloat(amount) * 0.4).toLocaleString()}</span>
                </div>
                <div className="border-t border-indigo-200 pt-3 flex justify-between text-lg text-indigo-900 font-extrabold">
                  <span>Total Repayment:</span>
                  <span>K {(parseFloat(amount) * 1.4).toLocaleString()}</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 mt-2"
            >
              {loading ? "Processing..." : "Submit Application"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}