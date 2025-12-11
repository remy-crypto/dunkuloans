import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/SupabaseClient";

export default function AdminPLE() {
  const [financials, setFinancials] = useState({
    income: 0,
    fees: 0,
    penalties: 0,
    commissions: 0,
    returns: 0,
    netProfit: 0
  });

  useEffect(() => {
    calculateFinances();
  }, []);

  const calculateFinances = async () => {
    // 1. Get Interest Income (Total Repayment - Principal Amount for Active Loans)
    const { data: loans } = await supabase.from('loans').select('amount, total_repayment, status');
    
    // 2. Get Agent Commissions
    const { data: agents } = await supabase.from('agents').select('total_commission');

    // 3. Get Investor Returns
    const { data: investors } = await supabase.from('investors').select('total_returns');

    if (loans && agents && investors) {
      // Calculate Loan Income (Interest)
      const activeLoans = loans.filter(l => l.status === 'active' || l.status === 'settled');
      const totalInterest = activeLoans.reduce((sum, l) => sum + (Number(l.total_repayment) - Number(l.amount)), 0);
      
      // Calculate Expenses
      const totalComm = agents.reduce((sum, a) => sum + Number(a.total_commission), 0);
      const totalRet = investors.reduce((sum, i) => sum + Number(i.total_returns), 0);

      // Mock Fees/Penalties (10% of interest for demo)
      const fees = totalInterest * 0.05; 
      const penalties = totalInterest * 0.02;

      setFinancials({
        income: totalInterest,
        fees: fees,
        penalties: penalties,
        commissions: totalComm,
        returns: totalRet,
        netProfit: (totalInterest + fees + penalties) - (totalComm + totalRet)
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">P&L Dashboard</h1>
          <p className="text-gray-500">Financial performance and projections.</p>
        </div>
        <button onClick={() => window.print()} className="px-4 py-2 bg-indigo-600 text-white rounded shadow hover:bg-indigo-700">Download Report</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Income Statement Summary */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Income Statement (YTD)</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-gray-600">Interest Income</span>
              <span className="font-bold text-green-600">+ K {financials.income.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-gray-600">Processing Fees</span>
              <span className="font-bold text-green-600">+ K {financials.fees.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-gray-600">Late Penalties</span>
              <span className="font-bold text-green-600">+ K {financials.penalties.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-gray-600">Agent Commissions</span>
              <span className="font-bold text-red-500">- K {financials.commissions.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-gray-600">Investor Returns</span>
              <span className="font-bold text-red-500">- K {financials.returns.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pt-4">
              <span className="text-lg font-bold text-gray-900">Net Profit</span>
              <span className={`text-xl font-bold ${financials.netProfit >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>
                K {financials.netProfit.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Projection Chart Placeholder (Static Visual) */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path></svg>
          </div>
          <h3 className="font-bold text-gray-800">Growth Projection</h3>
          <p className="text-sm text-gray-500 mt-2">Projected 15% growth based on current loan volume.</p>
        </div>
      </div>
    </div>
  );
}