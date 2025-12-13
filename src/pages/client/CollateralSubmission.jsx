import React, { useState } from "react";
import { supabase } from "../../lib/SupabaseClient";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function CollateralSubmission() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [desc, setDesc] = useState("");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Check if user has an active loan to link to (Optional logic)
      const { data: loan } = await supabase
        .from('loans')
        .select('id')
        .eq('borrower_id', user.id)
        .eq('status', 'active')
        .limit(1)
        .maybeSingle();

      // If no active loan, we create a record with null loan_id (requires DB update) 
      // OR we just alert them they need a loan. 
      // For now, let's assume they are updating collateral for their latest loan.
      
      if (!loan) {
        alert("You need an active or pending loan to submit collateral.");
        setLoading(false);
        return;
      }

      const { error } = await supabase.from("collateral").insert([
        {
          loan_id: loan.id,
          description: desc,
          estimated_value: value,
          status: 'pending_review'
        }
      ]);

      if (error) throw error;

      alert("Collateral Submitted for Review!");
      navigate("/client");

    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-gray-800 p-8 rounded-xl border border-gray-700">
      <h1 className="text-2xl font-bold text-white mb-2">Submit Collateral</h1>
      <p className="text-gray-400 text-sm mb-6">Add assets to secure your current loan.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Item Description</label>
          <textarea 
            className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-indigo-500"
            rows="3"
            placeholder="E.g. iPhone 14 Pro Max, 256GB, Blue"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            required
          ></textarea>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Estimated Value (ZMW)</label>
          <input 
            type="number"
            className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-indigo-500"
            placeholder="0.00"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Asset"}
        </button>
      </form>
    </div>
  );
}