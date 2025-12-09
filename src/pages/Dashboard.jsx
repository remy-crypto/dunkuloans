// src/pages/Dashboard.jsx
import React, { useEffect, useState, useContext } from "react";
import Sidebar from "../components/Sidebar";
import LoanTable from "../components/LoanTable";
import { supabase } from "../lib/SupabaseClient";
import { AuthContext } from "../context/AuthContext";
import { LoanStatus } from "../types/loanStatus";

export default function Dashboard() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    activeCount: 0,
    settledCount: 0,
    totalActiveAmount: 0,
  });

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchLoans = async () => {
      setLoading(true);
      try {
        // ensure we have current user id
        const borrowerId = user.id;

        const { data, error } = await supabase
          .from("loans")
          .select("*, borrower:profiles(full_name,email)")
          .eq("borrower_id", borrowerId)
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Normalize and compute balances (if your DB stores balance you can use it)
        const normalized = (data || []).map((l) => ({
          ...l,
          borrower_name: l.borrower?.full_name,
          borrower_email: l.borrower?.email,
          balance: l.balance ?? l.amount,
        }));
        setLoans(normalized);

        const active = normalized.filter((x) => x.status === LoanStatus.ACTIVE);
        const settled = normalized.filter((x) => x.status === LoanStatus.SETTLED || x.status === LoanStatus.PAID);

        setSummary({
          activeCount: active.length,
          settledCount: settled.length,
          totalActiveAmount: active.reduce((s, it) => s + Number(it.balance || 0), 0),
        });
      } catch (err) {
        console.error("fetchLoans", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLoans();

    // subscribe to changes
    const sub = supabase
      .channel("public:loans")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "loans" },
        (payload) => {
          // simple refresh when loans change
          if (payload?.new || payload?.old) {
            fetchLoans();
          }
        }
      )
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(sub);
      } catch (e) {}
    };
  }, [user]);

  const handleSettle = async (loan) => {
    try {
      await supabase.from("loans").update({ status: LoanStatus.SETTLED }).eq("id", loan.id);
      setLoans((prev) => prev.map((l) => (l.id === loan.id ? { ...l, status: LoanStatus.SETTLED } : l)));
    } catch (e) {
      console.error(e);
      alert("Unable to mark as settled.");
    }
  };

  const handleRecordPayment = (loan) => {
    // show simple prompt for admin in future; borrower will only be able to view
    const amt = prompt("Enter payment amount (K):", "0");
    if (!amt) return;
    const amount = Number(amt);
    if (isNaN(amount) || amount <= 0) return alert("Enter a valid number.");

    (async () => {
      try {
        // insert payment and update loan balance
        const { error: payErr } = await supabase.from("payments").insert([
          { loan_id: loan.id, amount, recorded_by: user.id },
        ]);
        if (payErr) throw payErr;

        // update loan balance
        const newBalance = (Number(loan.balance || loan.amount) - amount);
        await supabase.from("loans").update({ balance: newBalance, status: newBalance <= 0 ? LoanStatus.SETTLED : loan.status }).eq("id", loan.id);

        // optimistic update
        setLoans((prev) => prev.map((l) => (l.id === loan.id ? { ...l, balance: newBalance, status: newBalance <= 0 ? LoanStatus.SETTLED : l.status } : l)));
        alert("Payment recorded.");
      } catch (err) {
        console.error(err);
        alert("Failed to record payment.");
      }
    })();
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <header className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-sm text-gray-500">Welcome back — overview of your loans.</p>
            </div>
          </header>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Total Active Loans</p>
              <p className="text-2xl font-bold mt-2">{summary.activeCount}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Total Settled Loans</p>
              <p className="text-2xl font-bold mt-2">{summary.settledCount}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Total Active Amount</p>
              <p className="text-2xl font-bold mt-2">K {Number(summary.totalActiveAmount).toLocaleString()}</p>
            </div>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Your Loans</h2>
            <LoanTable loans={loans} onSettle={handleSettle} onRecordPayment={handleRecordPayment} />
          </section>
        </div>
      </main>
    </div>
  );
}
