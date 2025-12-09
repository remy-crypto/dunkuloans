import { useEffect, useState } from "react";
import { supabase } from "../lib/SupabaseClient";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      // 1. Fetch Profile Name
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      
      if (profileData) setProfile(profileData);

      // 2. Fetch Loans
      const { data: loansData, error } = await supabase
        .from("loans")
        .select("*")
        .eq("borrower_id", user.id) // Get ONLY my loans
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLoans(loansData || []);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Stats Calculations
  const activeLoans = loans.filter((l) => l.status === "active" || l.status === "pending");
  const settledLoans = loans.filter((l) => l.status === "settled");
  const totalBalance = activeLoans.reduce((sum, l) => sum + (l.balance || 0), 0);

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />
      
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {profile?.full_name || "Client"}
            </h1>
            <p className="text-gray-500 text-sm mt-1">Here is your financial overview.</p>
          </div>
          <Link to="/apply" className="bg-indigo-600 text-white px-6 py-3 rounded-xl shadow-md hover:bg-indigo-700 transition font-semibold">
            + New Request
          </Link>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-gray-400 text-xs uppercase tracking-wider font-bold">Outstanding Balance</h3>
            <p className="text-3xl font-extrabold text-indigo-600 mt-2">K {totalBalance.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-2">Includes interest</p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-gray-400 text-xs uppercase tracking-wider font-bold">Active Loans</h3>
            <p className="text-3xl font-extrabold text-gray-800 mt-2">{activeLoans.length}</p>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3">
              <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-gray-400 text-xs uppercase tracking-wider font-bold">Settled Loans</h3>
            <p className="text-3xl font-extrabold text-green-600 mt-2">{settledLoans.length}</p>
            <p className="text-xs text-gray-400 mt-2">Paid off successfully</p>
          </div>
        </div>

        {/* Loan History Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
            <h2 className="font-bold text-gray-800">Recent History</h2>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading your data...</div>
          ) : loans.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p className="mb-4">No loans found.</p>
              <Link to="/apply" className="text-indigo-600 font-bold hover:underline">Apply for your first loan</Link>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-6 py-4 font-bold">Amount</th>
                  <th className="px-6 py-4 font-bold">Total Due</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold">Date Applied</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">K {loan.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-bold text-indigo-600">K {loan.total_repayment.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                        loan.status === 'active' ? 'bg-blue-100 text-blue-700' : 
                        loan.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {loan.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(loan.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}