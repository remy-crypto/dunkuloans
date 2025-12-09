// src/pages/admin/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import LoanTable from "../../components/LoanTable";
import { supabase } from "../../lib/SupabaseClient";
import { LoanStatus } from "../../types/loanStatus";
import { ResponsiveContainer, AreaChart, Area } from "recharts";

const AdminDashboard = () => {
  const [loans, setLoans] = useState([]);
  const [collaterals, setCollaterals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const { data: loanData, error: loanError } = await supabase
          .from("loans")
          .select("*, borrower:profiles(full_name,email)")
          .order("created_at", { ascending: false });
        if (loanError) throw loanError;

        const { data: colData } = await supabase.from("collaterals").select("*");
        if (!colData) throw null;

        setLoans(loanData || []);
        setCollaterals(colData || []);
      } catch (err) {
        console.error("admin fetch", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();

    const sub = supabase
      .channel("public:loans_admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "loans" }, () => {
        fetchAll();
      })
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(sub);
      } catch (e) {}
    };
  }, []);

  const approveLoan = async (loan) => {
    try {
      await supabase.from("loans").update({ status: LoanStatus.ACTIVE }).eq("id", loan.id);
      setLoans((p) => p.map((l) => (l.id === loan.id ? { ...l, status: LoanStatus.ACTIVE } : l)));
    } catch (e) {
      console.error(e);
      alert("Failed to approve loan");
    }
  };

  const recordPayment = async (loan) => {
    const amt = prompt("Amount received (K):", "0");
    if (!amt) return;
    const amount = Number(amt);
    if (!amount || amount <= 0) return alert("Enter a valid amount");

    try {
      await supabase.from("payments").insert([{ loan_id: loan.id, amount }]);
      const newBalance = Number(loan.balance ?? loan.amount) - amount;
      await supabase.from("loans").update({ balance: newBalance, status: newBalance <= 0 ? LoanStatus.SETTLED : loan.status }).eq("id", loan.id);

      setLoans((p) => p.map((l) => (l.id === loan.id ? { ...l, balance: newBalance, status: newBalance <= 0 ? LoanStatus.SETTLED : l.status } : l)));
      alert("Payment recorded");
    } catch (e) {
      console.error(e);
      alert("Failed to record payment");
    }
  };

  // compute metrics
  const activeLoans = loans.filter((l) => l.status === LoanStatus.ACTIVE);
  const activeCount = activeLoans.length;
  const activeVolume = activeLoans.reduce((s, l) => s + Number(l.balance ?? l.amount), 0);
  const pendingCount = loans.filter((l) => l.status === LoanStatus.PENDING).length;
  const defaultedCount = loans.filter((l) => l.status === LoanStatus.DEFAULTED).length;

  const trendData = [
    { month: "Jan", revenue: 12000 },
    { month: "Feb", revenue: 15000 },
    { month: "Mar", revenue: 18000 },
    { month: "Apr", revenue: 16000 },
    { month: "May", revenue: 21000 },
    { month: "Jun", revenue: 25000 },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <header className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-gray-500">Monitor portfolio and operations</p>
            </div>
          </header>

          <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Active Loans</p>
              <p className="text-2xl font-bold mt-2">{activeCount}</p>
              <p className="text-sm text-gray-400 mt-1">Volume: K {Number(activeVolume).toLocaleString()}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Pending Approvals</p>
              <p className="text-2xl font-bold mt-2">{pendingCount}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Defaulted Loans</p>
              <p className="text-2xl font-bold mt-2 text-red-600">{defaultedCount}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Total Collaterals</p>
              <p className="text-2xl font-bold mt-2">{collaterals.length}</p>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-4">Portfolio Trend</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <Area type="monotone" dataKey="revenue" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.12} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-4">Loan Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">Active</div>
                  <div className="font-bold">{activeCount}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">Pending</div>
                  <div className="font-bold">{pendingCount}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">Defaulted</div>
                  <div className="font-bold text-red-600">{defaultedCount}</div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">Recent Loans</h2>
            <LoanTable loans={loans} onApprove={approveLoan} onRecordPayment={recordPayment} />
          </section>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
