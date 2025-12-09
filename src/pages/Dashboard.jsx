import { useEffect, useState } from "react";
import { supabase } from "../lib/SupabaseClient";

export default function Dashboard() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = supabase.auth.getUser().then((res) => res.data.user);

  const fetchLoans = async () => {
    try {
      const {
        data,
        error
      } = await supabase
        .from("loans")
        .select("*")
        .eq("borrower_id", (await user).id) // FIX APPLIED
        .order("created_at", { ascending: false });

      if (error) throw error;

      setLoans(data || []);
    } catch (error) {
      console.error("Error loading loans:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading your dashboard...
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Your Loans</h1>

      {loans.length === 0 ? (
        <p className="text-gray-600">You have no loans yet.</p>
      ) : (
        <div className="space-y-4">
          {loans.map((loan) => (
            <div
              key={loan.id}
              className="p-4 bg-white shadow-md rounded-lg border"
            >
              <p>
                <strong>Amount:</strong> {loan.amount}
              </p>
              <p>
                <strong>Status:</strong> {loan.status}
              </p>
              <p>
                <strong>Created:</strong>{" "}
                {new Date(loan.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
