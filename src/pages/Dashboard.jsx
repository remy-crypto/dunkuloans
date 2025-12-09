import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line
} from 'recharts';
import { 
  Users, Briefcase, ShieldAlert, Activity, ArrowUpRight, DollarSign, TrendingUp, Filter, Calendar, X, Globe, Database, Cpu
} from 'lucide-react';
import { LoanStatus } from '../../types';

const AdminDashboard = () => {
  const { loans, collaterals, formatCurrency, userRole } = useApp();
  const navigate = useNavigate();
  const [chartView, setChartView] = useState<'revenue' | 'volume'>('revenue');
  const [showHealthModal, setShowHealthModal] = useState(false);

  const isSuperAdmin = userRole === 'super_admin';

  // --- Metrics Calculation ---

  // 1. Active Loans & Volume
  const activeLoans = loans.filter(l => l.status === LoanStatus.ACTIVE);
  const activeLoansCount = activeLoans.length;
  const activeLoanVolume = activeLoans.reduce((sum, l) => sum + l.amount, 0);

  // 2. Collateral Value (Securing the portfolio)
  const activeCollateral = collaterals.filter(c => c.status === 'APPROVED' || c.status === 'RETRIEVAL_REQUESTED');
  const totalCollateralValue = activeCollateral.reduce((sum, c) => sum + c.estimatedValue, 0);

  // 3. Revenue & Repayments
  const monthlyRepaymentVolume = activeLoans.reduce((sum, l) => sum + l.monthlyPayment, 0);

  // 4. Risk Indicators
  const defaultedLoans = loans.filter(l => l.status === LoanStatus.DEFAULTED);
  
  // Average LTV (Loan to Value)
  let totalLtv = 0;
  let ltvCount = 0;
  activeLoans.forEach(loan => {
      const col = collaterals.find(c => c.id === loan.collateralId);
      if (col && col.estimatedValue > 0) {
          totalLtv += (loan.amount / col.estimatedValue);
          ltvCount++;
      }
  });
  const avgLtv = ltvCount > 0 ? (totalLtv / ltvCount) * 100 : 0;

  // 5. Investors & Agents
  const investorCapitalDeployed = activeLoanVolume;
  const agentOriginatedVolume = activeLoanVolume * 0.4;
  const agentCommissionsPaid = agentOriginatedVolume * 0.025;

  // --- Chart Data ---
  const loanStatusData = [
    { name: 'Active', value: activeLoansCount, color: '#0ea5e9' },
    { name: 'Pending', value: loans.filter(l => l.status === LoanStatus.PENDING).length, color: '#f59e0b' },
    { name: 'Paid', value: loans.filter(l => l.status === LoanStatus.PAID).length, color: '#10b981' },
    { name: 'Default', value: defaultedLoans.length, color: '#ef4444' },
  ];

  const trendData = [
    { month: 'Jan', revenue: 12000, volume: 45000, expenses: 5000 },
    { month: 'Feb', revenue: 15000, volume: 52000, expenses: 5500 },
    { month: 'Mar', revenue: 18000, volume: 61000, expenses: 6000 },
    { month: 'Apr', revenue: 16000, volume: 58000, expenses: 5800 },
    { month: 'May', revenue: 21000, volume: 75000, expenses: 7000 },
    { month: 'Jun', revenue: 25000, volume: 82000, expenses: 8500 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-gray-900">Executive Overview</h2>
           <p className="text-gray-500">Portfolio performance, risk metrics, and operational stats.</p>
        </div>
        <div className="flex gap-2 text-sm">
           <button className="px-3 py-1 bg-white border border-gray-200 text-gray-700 rounded-full font-medium flex items-center gap-2 hover:bg-gray-50">
             <Calendar className="w-4 h-4 text-gray-500" /> This Month
           </button>
           {isSuperAdmin && (
             <button 
               onClick={() => setShowHealthModal(true)}
               className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium flex items-center gap-1 hover:bg-green-200 transition-colors cursor-pointer"
             >
               <Activity className="w-4 h-4" /> System Healthy
             </button>
           )}
        </div>
      </div>

      {/* Interactive Top Level Metrics */}
      <div className={`grid grid-cols-1 md:grid-cols-${isSuperAdmin ? '4' : '2'} gap-6`}>
          {isSuperAdmin && (
            <div 
                onClick={() => navigate('/admin/clients')}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group"
            >
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-sm font-medium text-gray-500 group-hover:text-blue-600 transition-colors">Active Loan Volume</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(activeLoanVolume)}</h3>
                    </div>
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:scale-110 transition-transform">
                        <DollarSign className="w-5 h-5" />
                    </div>
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                    <span className="text-green-600 font-medium flex items-center"><ArrowUpRight className="w-3 h-3" /> 12%</span>
                    vs last month
                </div>
            </div>
          )}

          {isSuperAdmin && (
            <div 
                onClick={() => navigate('/admin/review')}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:border-purple-300 hover:shadow-md transition-all group"
            >
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-sm font-medium text-gray-500 group-hover:text-purple-600 transition-colors">Total Collateral Value</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalCollateralValue)}</h3>
                    </div>
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg group-hover:scale-110 transition-transform">
                        <Briefcase className="w-5 h-5" />
                    </div>
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                    <span className="text-gray-600 font-medium">{activeLoansCount}</span>
                    active loans secured
                </div>
            </div>
          )}

          <div 
             onClick={() => navigate('/admin/clients')}
             className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:border-emerald-300 hover:shadow-md transition-all group"
          >
             <div className="flex justify-between items-start mb-4">
                 <div>
                     <p className="text-sm font-medium text-gray-500 group-hover:text-emerald-600 transition-colors">Upcoming Repayments</p>
                     <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(monthlyRepaymentVolume)}</h3>
                 </div>
                 <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:scale-110 transition-transform">
                     <TrendingUp className="w-5 h-5" />
                 </div>
             </div>
             <div className="text-xs text-gray-500">
                Due in next 30 days
             </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <div className="flex justify-between items-start mb-4">
                 <div>
                     <p className="text-sm font-medium text-gray-500">Portfolio Risk (LTV)</p>
                     <h3 className="text-2xl font-bold text-gray-900 mt-1">{avgLtv.toFixed(1)}%</h3>
                 </div>
                 <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                     <ShieldAlert className="w-5 h-5" />
                 </div>
             </div>
             <div className="text-xs text-gray-500 flex items-center gap-1">
                <span className={`${avgLtv < 60 ? 'text-green-600' : 'text-red-600'} font-medium`}>
                    {avgLtv < 60 ? 'Low Risk' : 'High Risk'}
                </span>
                Target: &lt;60%
             </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue & Operations */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">
                    {chartView === 'revenue' ? 'Revenue & Expenses' : 'Loan Volume Trends'}
                </h3>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button 
                        onClick={() => setChartView('revenue')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${chartView === 'revenue' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Revenue
                    </button>
                    <button 
                        onClick={() => setChartView('volume')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${chartView === 'volume' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Volume
                    </button>
                </div>
             </div>
             
             <div className="h-72">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                        <defs>
                            <linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={chartView === 'revenue' ? "#0ea5e9" : "#8b5cf6"} stopOpacity={0.1}/>
                                <stop offset="95%" stopColor={chartView === 'revenue' ? "#0ea5e9" : "#8b5cf6"} stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6b7280'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6b7280'}} />
                        <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey={chartView === 'revenue' ? 'revenue' : 'volume'} 
                            stroke={chartView === 'revenue' ? "#0ea5e9" : "#8b5cf6"} 
                            strokeWidth={3} 
                            fillOpacity={1} 
                            fill="url(#colorMain)" 
                            name={chartView === 'revenue' ? 'Revenue' : 'Volume'} 
                        />
                        {chartView === 'revenue' && (
                            <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} fillOpacity={0} fill="transparent" name="Expenses" />
                        )}
                    </AreaChart>
                 </ResponsiveContainer>
             </div>
          </div>

          {/* Risk & Distribution */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
             <h3 className="text-lg font-bold text-gray-900 mb-2">Loan Status Distribution</h3>
             <div className="flex-1 min-h-[200px] relative">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={loanStatusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {loanStatusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                 </ResponsiveContainer>
                 {/* Center Text */}
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                        <span className="block text-3xl font-bold text-gray-900">{loans.length}</span>
                        <span className="block text-xs text-gray-500">Total Loans</span>
                    </div>
                 </div>
             </div>
             
             <div className="grid grid-cols-2 gap-4 mt-4">
                 {loanStatusData.map((item) => (
                     <div key={item.name} className="flex items-center gap-2 text-sm">
                         <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}}></div>
                         <span className="text-gray-600 flex-1">{item.name}</span>
                         <span className="font-bold text-gray-900">{item.value}</span>
                     </div>
                 ))}
             </div>
          </div>
      </div>

      {/* Partner & Investor Impact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div 
            onClick={() => navigate('/admin/investors')}
            className="bg-indigo-900 rounded-xl p-6 text-white relative overflow-hidden cursor-pointer hover:bg-indigo-800 transition-colors group"
          >
             <div className="relative z-10">
                <h3 className="text-lg font-bold mb-1 flex items-center gap-2 group-hover:gap-3 transition-all">
                    <Users className="w-5 h-5 text-indigo-300" /> Investor Capital
                    <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-indigo-200 text-sm mb-6">Capital deployed from external liquidity providers.</p>
                
                <div className="flex items-end gap-2 mb-2">
                    <span className="text-4xl font-bold">{formatCurrency(investorCapitalDeployed)}</span>
                </div>
                <div className="text-sm text-indigo-300">
                    Generating <span className="text-white font-bold">{formatCurrency(investorCapitalDeployed * 0.12)}</span> projected annual yield for partners.
                </div>
             </div>
             {/* Decor */}
             <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mb-10"></div>
          </div>

          {isSuperAdmin && (
            <div 
                onClick={() => navigate('/admin/agents')}
                className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm relative overflow-hidden cursor-pointer hover:border-emerald-300 transition-colors group"
            >
                <div className="relative z-10">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2 group-hover:gap-3 transition-all">
                        <Briefcase className="w-5 h-5 text-emerald-600" /> Agent Network
                        <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-600" />
                    </h3>
                    <p className="text-gray-500 text-sm mb-6">Performance of field agent origination.</p>
                    
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <span className="block text-xs text-gray-500 uppercase tracking-wider">Originated Volume</span>
                            <span className="block text-2xl font-bold text-gray-900 mt-1">{formatCurrency(agentOriginatedVolume)}</span>
                        </div>
                        <div>
                            <span className="block text-xs text-gray-500 uppercase tracking-wider">Commissions Paid</span>
                            <span className="block text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(agentCommissionsPaid)}</span>
                        </div>
                    </div>
                </div>
            </div>
          )}
      </div>

      {/* System Health Modal */}
      {showHealthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowHealthModal(false)}></div>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 relative z-10 animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-green-100 rounded-lg">
                    <Activity className="w-5 h-5 text-green-600" />
                 </div>
                 <div>
                    <h3 className="font-bold text-gray-900">System Status</h3>
                    <p className="text-xs text-gray-500">Last updated: Just now</p>
                 </div>
              </div>
              <button onClick={() => setShowHealthModal(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
                {/* Status Items */}
                <div className="grid grid-cols-1 gap-3">
                   {/* Item 1 */}
                   <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-white hover:border-green-200 transition-colors group">
                      <div className="flex items-center gap-3">
                         <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100"><Globe className="w-4 h-4" /></div>
                         <span className="font-medium text-gray-700">API Gateway</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <span className="text-xs font-mono text-gray-400">24ms latency</span>
                         <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Operational</span>
                      </div>
                   </div>
                   {/* Item 2 */}
                   <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-white hover:border-green-200 transition-colors group">
                      <div className="flex items-center gap-3">
                         <div className="p-2 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-100"><Database className="w-4 h-4" /></div>
                         <span className="font-medium text-gray-700">Primary Database</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <span className="text-xs font-mono text-gray-400">98% uptime</span>
                         <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Connected</span>
                      </div>
                   </div>
                   {/* Item 3 */}
                   <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-white hover:border-green-200 transition-colors group">
                      <div className="flex items-center gap-3">
                         <div className="p-2 bg-amber-50 text-amber-600 rounded-lg group-hover:bg-amber-100"><Cpu className="w-4 h-4" /></div>
                         <span className="font-medium text-gray-700">AI Engine (Gemini)</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Online</span>
                      </div>
                   </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mt-4">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">System Resources</h4>
                    <div className="space-y-3">
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-600">CPU Usage</span>
                                <span className="font-bold text-gray-900">12%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div className="bg-blue-500 h-1.5 rounded-full" style={{width: '12%'}}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-600">Memory Usage</span>
                                <span className="font-bold text-gray-900">45%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div className="bg-purple-500 h-1.5 rounded-full" style={{width: '45%'}}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-gray-50 px-6 py-3 text-center border-t border-gray-100">
                <p className="text-xs text-gray-400">System Version: v2.4.0-stable • Region: Africa-South-1</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;