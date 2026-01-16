import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { supabase } from "../lib/SupabaseClient";

// ==========================================
// 0. HELPER: COLLATERAL IMAGE PARSER (FIXED)
// ==========================================
const CollateralDisplay = ({ description }) => {
  if (!description) return <p className="text-gray-500 text-sm italic">No details provided.</p>;

  // Regex to find all instances of "Label: URL" or "Files: URL"
  const urlRegex = /(Collateral Image \d+|Proof of Ownership|Files):?\s*(https?:\/\/[^\s]+)/gi;
  const matches = [...description.matchAll(urlRegex)];

  // Extract the header (anything before the first collateral item, usually the loan type)
  const header = description.split(/Collateral|Files/i)[0].trim();

  return (
    <div className="space-y-4">
      {/* Header / Loan Type Section */}
      {header && (
        <div className="bg-indigo-500/10 border-l-4 border-indigo-500 p-3 rounded-r-lg">
          <p className="text-indigo-300 text-[10px] font-bold uppercase tracking-widest mb-1">Application Details</p>
          <p className="text-gray-200 text-sm">{header}</p>
        </div>
      )}

      {/* Grid for Image Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {matches.length > 0 ? (
          matches.map((match, index) => {
            const label = match[1].replace(/[:]/g, '').trim();
            const url = match[2];

            return (
              <div key={index} className="flex flex-col gap-2 bg-gray-800/60 p-3 rounded-lg border border-gray-700 hover:border-indigo-500/50 transition-all group">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                    {label}
                  </span>
                  <button 
                    onClick={() => navigator.clipboard.writeText(url)}
                    className="text-[9px] text-gray-500 hover:text-white uppercase transition"
                  >
                    Copy Link
                  </button>
                </div>
                
                <a href={url} target="_blank" rel="noopener noreferrer" className="block relative overflow-hidden rounded border border-gray-600 bg-black/40">
                  <img 
                    src={url} 
                    alt={label} 
                    className="h-40 w-full object-contain group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=Image+Load+Error'; }}
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition" />
                  <div className="absolute bottom-2 right-2 bg-indigo-600 px-2 py-1 rounded text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition shadow-lg">
                    VIEW FULL SIZE ↗
                  </div>
                </a>
              </div>
            );
          })
        ) : (
          <p className="text-gray-400 text-sm italic col-span-full bg-gray-900/50 p-3 rounded border border-gray-800">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 1. EXECUTIVE OVERVIEW
// ==========================================
const ExecutiveOverview = () => {
  const [stats, setStats] = useState({
    activeAmount: 0, totalCount: 0, activeCount: 0,
    pendingCount: 0, settledCount: 0, defaultCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("loans").select("*");
      if (!error && data) {
        const active = data.filter(l => l.status === 'active');
        setStats({
          activeAmount: active.reduce((sum, item) => sum + Number(item.amount), 0),
          totalCount: data.length,
          activeCount: active.length,
          pendingCount: data.filter(l => l.status === 'pending').length,
          settledCount: data.filter(l => l.status === 'settled').length,
          defaultCount: data.filter(l => l.status === 'default').length
        });
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-gray-400 animate-pulse">Loading Overview...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Executive Overview</h1>
        <p className="text-gray-400 mt-1">Portfolio performance and risk metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 relative overflow-hidden">
          <p className="text-sm font-medium text-gray-400">Total Active Portfolio</p>
          <h2 className="text-3xl font-bold text-white mt-2">K {stats.activeAmount.toLocaleString()}</h2>
          <div className="absolute top-6 right-6 p-2 bg-green-900/30 rounded-lg text-green-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
          </div>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <p className="text-sm font-medium text-gray-400">Active Loans</p>
          <h2 className="text-3xl font-bold text-white mt-2">{stats.activeCount}</h2>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. CLIENTS VIEW
// ==========================================
const ClientsView = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      const { data, error } = await supabase.from('profiles').select('*').eq('role', 'borrower');
      if (!error) setClients(data);
      setLoading(false);
    };
    fetchClients();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Client Management</h1>
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-gray-900 text-gray-200 uppercase font-medium">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {clients.map(client => (
              <tr key={client.id} className="hover:bg-gray-700/50 transition-colors">
                <td className="px-6 py-4 font-medium text-white">{client.full_name}</td>
                <td className="px-6 py-4">{client.email}</td>
                <td className="px-6 py-4"><span className="px-2 py-1 bg-green-900/50 text-green-400 rounded text-xs">Active</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ==========================================
// 3. INVESTORS VIEW
// ==========================================
const InvestorsView = () => {
  const [investors, setInvestors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvestors = async () => {
      const { data, error } = await supabase.from('investors').select('*, profiles(full_name, email)');
      if (!error) setInvestors(data);
      setLoading(false);
    };
    fetchInvestors();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Investor Management</h1>
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-gray-900 text-gray-200 uppercase font-medium">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Total Invested</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {investors.map(inv => (
              <tr key={inv.id}>
                <td className="px-6 py-4 font-medium text-white">{inv.profiles?.full_name}</td>
                <td className="px-6 py-4 text-indigo-400 font-bold">K {inv.total_invested?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ==========================================
// 4. UNDERWRITING VIEW
// ==========================================
const UnderwritingView = () => {
  const [pendingLoans, setPendingLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(null);

  const fetchPending = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('loans')
      .select('*, profiles!loans_borrower_id_fkey(full_name, email, phone), collateral(*)') 
      .eq('status', 'pending')
      .order('created_at', { ascending: true });
    
    if (!error) setPendingLoans(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchPending(); }, []);

  const processLoan = async (id, decision) => {
    if (!window.confirm(`Are you sure you want to ${decision.toUpperCase()} this loan?`)) return;
    setIsProcessing(id);
    const { error } = await supabase
      .from('loans')
      .update({ status: decision === 'approve' ? 'active' : 'rejected' })
      .eq('id', id);

    if (error) alert(error.message);
    else setPendingLoans(prev => prev.filter(loan => loan.id !== id));
    setIsProcessing(null);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white">Underwriting Desk</h1>

      {loading ? (
        <p className="text-gray-500 animate-pulse">Loading queue...</p>
      ) : pendingLoans.length === 0 ? (
        <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 text-center text-gray-400">
          No pending loan applications.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {pendingLoans.map(loan => (
            <div key={loan.id} className={`bg-gray-800 rounded-xl border border-gray-700 p-6 ${isProcessing === loan.id ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">{loan.profiles?.full_name}</h3>
                  <p className="text-sm text-gray-400">{loan.profiles?.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase font-bold">Requested</p>
                  <p className="text-2xl font-bold text-indigo-400">K {loan.amount?.toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-5 mb-6">
                 <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-4 tracking-widest border-b border-gray-800 pb-2">Verified Documents & Collateral</h4>
                 {loan.collateral && loan.collateral.length > 0 ? (
                    loan.collateral.map((c, idx) => (
                       <CollateralDisplay key={idx} description={c.description} />
                    ))
                 ) : (
                    <p className="text-sm text-gray-500 italic">No documentation found.</p>
                 )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button onClick={() => processLoan(loan.id, 'reject')} className="px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 rounded transition">
                  Reject
                </button>
                <button onClick={() => processLoan(loan.id, 'approve')} className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded transition font-bold">
                  Approve & Disburse
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ComingSoonView = ({ title }) => (
  <div className="flex flex-col items-center justify-center h-[50vh] text-center">
    <h2 className="text-2xl font-bold text-white">{title}</h2>
    <p className="text-gray-400 mt-2">Under Development.</p>
  </div>
);

// ==========================================
// 6. MAIN ADMIN DASHBOARD
// ==========================================
const AdminDashboard = () => {
  const path = useLocation().pathname;

  const renderContent = () => {
    switch (path) {
      case '/dashboard': return <ExecutiveOverview />;
      case '/clients': return <ClientsView />;
      case '/investors': return <InvestorsView />;
      case '/kyc': return <ComingSoonView title="KYC Verification Queue" />;
      case '/collateral': return <ComingSoonView title="Collateral Review" />;
      case '/underwriting': return <UnderwritingView />;
      case '/support': return <ComingSoonView title="Support Tickets" />;
      default: return <ExecutiveOverview />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">{renderContent()}</main>
    </div>
  );
};

export default AdminDashboard;