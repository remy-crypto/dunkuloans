import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { supabase } from "../lib/SupabaseClient"; // Corrected Import with Uppercase S

// Define status constants locally to ensure it works immediately
const LoanStatus = {
  ACTIVE: 'active',
  SETTLED: 'settled',
  PAID: 'paid',
  PENDING: 'pending'
};

const BorrowerDashboard = () => {
  const [user, setUser] = useState(null);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    activeCount: 0,
    settledCount: 0,
    totalOutstanding: 0,
  });

  // Load user and loans
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      setLoading(true);
      try {
        // Get User
        const { data: authData } = await supabase.auth.getUser();
        const currentUser = authData?.user ?? null;
        
        if (!currentUser) {
          setUser(null);
          setLoans([]);
          setLoading(false);
          return;
        }

        if (mounted) setUser(currentUser);

        const borrowerId = currentUser.id;

        // Fetch Loans
        const { data: loanData, error } = await supabase
          .from("loans")
          .select("*, profiles(full_name, email)")
          .eq("borrower_id", borrowerId)
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Normalize Data
        const normalized = (loanData || []).map((l) => ({
          ...l,
          borrower_name: l.profiles?.full_name ?? currentUser.email,
          borrower_email: l.profiles?.email ?? currentUser.email,
          balance: l.balance ?? l.amount, // Ensure balance exists
        }));

        if (!mounted) return;
        setLoans(normalized);
        computeSummary(normalized);

      } catch (err) {
        console.error("BorrowerDashboard init error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    // Subscribe to Realtime Changes
    const channel = supabase
      .channel("public:loans:borrower")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "loans" },
        (payload) => {
          // Simple refresh on change
          if (user?.id) {
             init();
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []); // Run once on mount

  function computeSummary(list) {
    const active = list.filter((l) => l.status === LoanStatus.ACTIVE);
    const settled = list.filter((l) => l.status === LoanStatus.SETTLED || l.status === LoanStatus.PAID);
    
    // Calculate total outstanding balance
    const totalOutstanding = active.reduce((sum, item) => {
      return sum + Number(item.balance || item.amount || 0);
    }, 0);

    setSummary({
      activeCount: active.length,
      settledCount: settled.length,
      totalOutstanding,
    });
  }

  const handleRecordPayment = async (loan) => {
    const raw = prompt("Enter payment amount (K):", "0");
    if (!raw) return;
    const amount = Number(raw);
    if (isNaN(amount) || amount <= 0) return alert("Enter a valid amount");

    try {
      // 1. Insert transaction record (using 'transactions' table from our DB schema)
      const { error: insertErr } = await supabase.from("transactions").insert([
        {
          profile_id: user?.id,
          loan_id: loan.id,
          amount: amount,
          type: 'repayment'
        },
      ]);
      if (insertErr) throw insertErr;

      // 2. Update loan balance & status
      const currentBalance = Number(loan.balance ?? loan.amount);
      const newBalance = currentBalance - amount;
      const newStatus = newBalance <= 0 ? LoanStatus.SETTLED : loan.status;

      const { error: updErr } = await supabase
        .from("loans")
        .update({ balance: newBalance, status: newStatus })
        .eq("id", loan.id);

      if (updErr) throw updErr;

      // 3. Optimistic UI update
      const updatedLoans = loans.map((l) => (l.id === loan.id ? { ...l, balance: newBalance, status: newStatus } : l));
      setLoans(updatedLoans);
      computeSummary(updatedLoans);
      alert("Payment recorded successfully.");

    } catch (err) {
      console.error("recordPayment error:", err);
      alert(err.message || "Failed to record payment.");
    }
  };

  const handleSettleLoan = async (loan) => {
    if (!confirm("Mark this loan as fully settled?")) return;
    try {
      const { error } = await supabase
        .from("loans")
        .update({ status: LoanStatus.SETTLED, balance: 0 })
        .eq("id", loan.id);

      if (error) throw error;

      const updatedLoans = loans.map((l) => (l.id === loan.id ? { ...l, status: LoanStatus.SETTLED, balance: 0 } : l));
      setLoans(updatedLoans);
      computeSummary(updatedLoans);
      alert("Loan marked settled.");
    } catch (err) {
      console.error("handleSettleLoan error:", err);
      alert("Could not mark as settled.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-100">
        <div>Loading your loans...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      {/* Sidebar */}
      <Sidebar />

      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <header className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">My Loans</h1>
              <p className="text-sm text-gray-400">Overview of active loans, repayments, and history.</p>
            </div>
          </header>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-sm">
              <p className="text-sm text-gray-400">Active Loans</p>
              <p className="text-2xl font-bold mt-2 text-white">{summary.activeCount}</p>
            </div>

            <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-sm">
              <p className="text-sm text-gray-400">Settled Loans</p>
              <p className="text-2xl font-bold mt-2 text-white">{summary.settledCount}</p>
            </div>

            <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-sm">
              <p className="text-sm text-gray-400">Total Outstanding</p>
              <p className="text-2xl font-bold mt-2 text-white">
                K {Number(summary.totalOutstanding).toLocaleString()}
              </p>
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Loan History</h2>
              <div className="text-sm text-gray-400">Recent activity for your account</div>
            </div>

            {loans.length === 0 ? (
              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 text-center text-gray-300">
                No loans found.
              </div>
            ) : (
              <div className="space-y-4">
                {loans.map((loan) => (
                  <div key={loan.id} className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="text-sm text-gray-400">Loan #{loan.id.slice(0, 8)}...</div>
                      <div className="text-lg font-semibold text-white mt-1">
                        K {Number(loan.amount).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Applied: {new Date(loan.created_at).toLocaleDateString()}
                      </div>
                      <div className={`mt-2 text-xs font-bold uppercase tracking-wider ${
                        loan.status === LoanStatus.ACTIVE ? 'text-green-400' : 
                        loan.status === LoanStatus.PENDING ? 'text-yellow-400' : 'text-gray-400'
                      }`}>
                        {loan.status}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-gray-400">Balance</div>
                      <div className="text-lg font-bold text-white mt-1">
                        K {Number(loan.balance ?? loan.amount).toLocaleString()}
                      </div>
                      <div className="mt-3 flex items-center justify-end gap-2">
                        {/* Only show Payment/Settle if active */}
                        {loan.status === LoanStatus.ACTIVE && (
                          <>
                            <button
                              onClick={() => handleRecordPayment(loan)}
                              className="px-3 py-1 text-sm bg-indigo-600 hover:bg-indigo-700 rounded text-white"
                            >
                              Pay
                            </button>
                            <button
                              onClick={() => handleSettleLoan(loan)}
                              className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 rounded text-white"
                            >
                              Settle
                            </button>
                          </>
                        )}
                        <span className="px-3 py-1 text-sm bg-gray-700 rounded text-gray-200 cursor-default">
                          View
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default BorrowerDashboard;