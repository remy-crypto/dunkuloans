import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/SupabaseClient';
import { CheckCircle, XCircle, AlertTriangle, FileText, Search, Filter, Eye, ArrowUp, ArrowDown, Clock } from 'lucide-react';

export default function AdminPayments() {
    const [repayments, setRepayments] = useState([]);
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Tabs & State
    const [activeTab, setActiveTab] = useState('repayments');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    
    // Modals
    const [selectedProof, setSelectedProof] = useState(null);
    const [rejectId, setRejectId] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [actionType, setActionType] = useState(null); // 'repayment' or 'withdrawal'

    // --- REAL TIME DATA FETCHING ---
    useEffect(() => {
        fetchData();
        const sub1 = supabase.channel('pay-realtime').on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, fetchData).subscribe();
        const sub2 = supabase.channel('wd-realtime').on('postgres_changes', { event: '*', schema: 'public', table: 'withdrawals' }, fetchData).subscribe();
        return () => { supabase.removeChannel(sub1); supabase.removeChannel(sub2); };
    }, []);

    const fetchData = async () => {
        setLoading(true);
        // 1. Fetch Repayments (Transactions where type = repayment)
        const { data: trans } = await supabase
            .from('transactions')
            .select('*, profiles(full_name, email)')
            .eq('type', 'repayment')
            .order('created_at', { ascending: false });
        if (trans) setRepayments(trans);

        // 2. Fetch Withdrawals
        const { data: wds } = await supabase
            .from('withdrawals')
            .select('*, profiles(full_name, email, role)')
            .order('created_at', { ascending: false });
        if (wds) setWithdrawals(wds);
        
        setLoading(false);
    };

    // --- ACTIONS ---
    const handleVerifyRepayment = async (id, status, reason = null) => {
        // If approved, ensure loan balance updates (handled in client usually, but safe to verify here)
        // For now, we just flag the transaction status.
        // Assuming 'transactions' has a status column. If not, you might need to add it or just use this for logs.
        // If your schema doesn't have status on transactions, we assume they are 'completed' by default.
        // Let's assume we added a status column to transactions for this feature:
        /* ALTER TABLE transactions ADD COLUMN status text default 'completed'; */
        
        await supabase.from('transactions').update({ 
            status: status === 'APPROVE' ? 'completed' : 'rejected',
            notes: reason 
        }).eq('id', id);
        
        fetchData();
    };

    const handleProcessWithdrawal = async (id, status, reason = null) => {
        const dbStatus = status === 'APPROVE' ? 'approved' : 'rejected';
        await supabase.from('withdrawals').update({ 
            status: dbStatus, 
            reject_reason: reason 
        }).eq('id', id);
        
        fetchData();
    };

    const submitRejection = () => {
        if (!rejectId || !rejectReason) return;
        if (actionType === 'repayment') handleVerifyRepayment(rejectId, 'REJECT', rejectReason);
        if (actionType === 'withdrawal') handleProcessWithdrawal(rejectId, 'REJECT', rejectReason);
        setRejectId(null);
        setRejectReason('');
    };

    // --- FILTERING ---
    const filteredRepayments = repayments.filter(r => {
        const matchesStatus = filterStatus === 'ALL' || (r.status || 'completed') === filterStatus.toLowerCase();
        const matchesSearch = (r.id.includes(searchQuery) || r.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesStatus && matchesSearch;
    });

    const filteredWithdrawals = withdrawals.filter(w => {
         const matchesStatus = filterStatus === 'ALL' || w.status === filterStatus.toLowerCase();
         const matchesSearch = w.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || w.details?.toLowerCase().includes(searchQuery.toLowerCase());
         return matchesStatus && matchesSearch;
    });

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Financial Operations</h2>
                    <p className="text-gray-500">Manage incoming repayments and outgoing withdrawals.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button onClick={() => { setActiveTab('repayments'); setFilterStatus('ALL'); }} className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'repayments' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                        <ArrowDown className="w-4 h-4" /> Repayments
                    </button>
                    <button onClick={() => { setActiveTab('withdrawals'); setFilterStatus('ALL'); }} className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'withdrawals' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                        <ArrowUp className="w-4 h-4" /> Withdrawal Requests
                        {withdrawals.filter(w => w.status === 'pending').length > 0 && (
                            <span className="bg-orange-100 text-orange-600 py-0.5 px-2 rounded-full text-xs ml-1">{withdrawals.filter(w => w.status === 'pending').length}</span>
                        )}
                    </button>
                </nav>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex gap-4 items-center">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input type="text" placeholder="Search..." className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm focus:border-indigo-500 outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <select className="border border-gray-300 rounded-lg py-2 px-3 text-sm bg-white focus:border-indigo-500 outline-none" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="ALL">All Statuses</option>
                        <option value={activeTab === 'repayments' ? 'COMPLETED' : 'APPROVED'}>Approved</option>
                        <option value="PENDING">Pending</option>
                        <option value="REJECTED">Rejected</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-1">
                {activeTab === 'repayments' ? (
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">Transaction Details</th>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredRepayments.map(pay => (
                                <tr key={pay.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900 font-mono">{pay.id.slice(0,8)}</div>
                                        <div className="text-xs text-gray-500">{new Date(pay.created_at).toLocaleString()}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{pay.profiles?.full_name}</div>
                                        <div className="text-xs text-gray-500">{pay.profiles?.email}</div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-900">K {pay.amount.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                            pay.status === 'completed' ? 'bg-green-100 text-green-700' :
                                            pay.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                            'bg-blue-50 text-blue-700'
                                        }`}>
                                            {pay.status || 'completed'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {/* Since transactions are usually auto-recorded, actions might be limited unless verifying manual proofs */}
                                        <button className="text-indigo-600 hover:underline text-xs">View Details</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Request Details</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredWithdrawals.map(wd => (
                                <tr key={wd.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900">{wd.profiles?.full_name}</div>
                                        <div className="text-xs text-gray-500">{wd.profiles?.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600">{wd.profiles?.role}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 font-medium">{wd.details}</div>
                                        <div className="text-[10px] text-gray-400 mt-1">{new Date(wd.created_at).toLocaleString()}</div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-900">K {wd.amount.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                            wd.status === 'approved' ? 'bg-green-100 text-green-700' :
                                            wd.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                            'bg-orange-50 text-orange-700 border border-orange-100'
                                        }`}>
                                            {wd.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {wd.status === 'pending' ? (
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => { setRejectId(wd.id); setActionType('withdrawal'); }} className="px-3 py-1 text-red-600 hover:bg-red-50 rounded border border-red-200 text-xs font-bold">Reject</button>
                                                <button onClick={() => handleProcessWithdrawal(wd.id, 'APPROVE')} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs font-bold shadow-sm">Pay Out</button>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">Processed</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Reject Modal */}
            {rejectId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Rejection</h3>
                        <textarea 
                            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-red-500 focus:border-red-500 outline-none"
                            rows={4}
                            placeholder="Enter rejection reason..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                        />
                        <div className="flex gap-3 mt-4">
                            <button onClick={() => setRejectId(null)} className="flex-1 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200">Cancel</button>
                            <button onClick={submitRejection} className="flex-1 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700">Confirm</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}