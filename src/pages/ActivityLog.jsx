import React, { useEffect, useState } from "react";
import { supabase } from "../lib/SupabaseClient";
import { useAuth } from "../context/AuthContext";

export default function ActivityLog() {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchActivity();
  }, [user]);

  const fetchActivity = async () => {
    // 1. Fetch Transactions (Payments/Disbursements)
    const { data: trans } = await supabase
      .from('transactions')
      .select('*')
      .eq('profile_id', user.id)
      .order('created_at', { ascending: false });

    // 2. Fetch Loan Applications (Creation events)
    const { data: loans } = await supabase
      .from('loans')
      .select('id, created_at, status, amount')
      .eq('borrower_id', user.id)
      .order('created_at', { ascending: false });

    // 3. Merge & Sort
    const combined = [
      ...(trans || []).map(t => ({ 
        type: 'TRANSACTION', 
        desc: `${t.type.toUpperCase()}: K ${t.amount}`, 
        date: t.created_at,
        status: 'completed'
      })),
      ...(loans || []).map(l => ({ 
        type: 'APPLICATION', 
        desc: `Loan Application: K ${l.amount}`, 
        date: l.created_at,
        status: l.status 
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    setActivities(combined);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Activity Log</h1>
        <button onClick={fetchActivity} className="text-sm text-indigo-400 hover:text-indigo-300">Refresh</button>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden p-6">
        {loading ? (
          <p className="text-gray-500 text-center">Loading activity...</p>
        ) : activities.length === 0 ? (
          <p className="text-gray-500 text-center">No recent activity recorded.</p>
        ) : (
          <div className="space-y-6">
            {activities.map((item, index) => (
              <div key={index} className="flex gap-4 relative">
                {/* Timeline Line */}
                {index !== activities.length - 1 && (
                  <div className="absolute left-[19px] top-8 bottom-[-24px] w-0.5 bg-gray-700"></div>
                )}
                
                {/* Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 ${
                  item.type === 'TRANSACTION' ? 'bg-green-900/30 text-green-400' : 'bg-blue-900/30 text-blue-400'
                }`}>
                  {item.type === 'TRANSACTION' ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-200">{item.desc}</h3>
                    <span className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded uppercase font-bold ${
                      item.status === 'completed' || item.status === 'active' ? 'bg-green-900 text-green-400' : 'bg-yellow-900 text-yellow-400'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}