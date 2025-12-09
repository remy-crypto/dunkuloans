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

  // --- LOGIC REMAINS EXACTLY THE SAME ---
  const handleApply = async (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) return alert("Please enter a valid amount");
    
    setLoading(true);
    
    // Calculate defaults (Logic unchanged)
    const principal = parseFloat(amount);
    const interest = principal * 0.40; // 40% interest
    const total = principal + interest;

    const { error } = await supabase.from("loans").insert([
      {
        borrower_id: user.id,
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
  // --------------------------------------

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* 1. Sidebar fixed on the left */}
      <Sidebar />

      {/* 2. Main Content Area */}
      <div className="flex-1 p-8 md:p-12 ml-0 md:ml-64 transition-all">
        
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Apply for a Loan</h1>
            <p className="text-gray-500 mt-2 text-lg">Get quick access to funds. Simple terms, fast approval.</p>
          </div>
          
          {/* Loan Card */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            <div className="p-8 md:p-10">
              
              <form onSubmit={handleApply} className="flex flex-col gap-8">
                
                {/* Input Field */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">
                    Loan Amount (ZMW)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">K</span>
                    <input
                      type="number"
                      placeholder="e.g. 5000"
                      className="w-full pl-10 pr-4 py-5 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none text-2xl font-bold text-gray-900 bg-gray-50 transition-all placeholder-gray-300"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                </div>

                {/* Live Calculator / Summary Box */}
                <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100 space-y-4">
                  <h3 className="text-indigo-900 font-bold text-sm uppercase tracking-wider mb-2">Repayment Preview</h3>
                  
                  <div className="flex justify-between items-center text-indigo-800">
                    <span className="text-sm">Principal Amount</span>
                    <span className="font-semibold">K {amount ? parseFloat(amount).toLocaleString() : "0"}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-indigo-800">
                    <span className="text-sm">Interest (40%)</span>
                    <span className="font-semibold">K {amount ? (parseFloat(amount) * 0.4).toLocaleString() : "0"}</span>
                  </div>

                  <div className="border-t border-indigo-200 pt-4 flex justify-between items-center">
                    <span className="text-indigo-900 font-bold text-lg">Total Repayment</span>
                    <span className="text-indigo-600 font-black text-2xl">
                      K {amount ? (parseFloat(amount) * 1.4).toLocaleString() : "0"}
                    </span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-5 rounded-2xl font-bold text-lg shadow-lg transition-all transform hover:-translate-y-1 ${
                    loading 
                      ? "bg-gray-400 text-gray-200 cursor-not-allowed" 
                      : "bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-indigo-500/30"
                  }`}
                >
                  {loading ? "Processing Application..." : "Submit Application"}
                </button>

              </form>
            </div>
            
            {/* Footer Note */}
            <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
              <p className="text-xs text-center text-gray-500">
                By submitting, you agree to our terms. Repayment period is strictly 4 weeks.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}