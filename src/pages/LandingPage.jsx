import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Menu, X, Facebook, Twitter, Instagram, Linkedin, Smartphone, 
  CheckCircle, Briefcase, ShoppingBag, Users, User, ArrowRight 
} from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- CALCULATOR STATE ---
  const [amount, setAmount] = useState(500);
  const [months, setMonths] = useState(3);
  const [loanType, setLoanType] = useState("SME");

  // Mock Calculation
  const serviceFee = 50;
  const interestRate = 0.15;
  const totalRepayment = amount * (1 + (interestRate * months));
  const monthlyRepayment = totalRepayment / months;
  const nextPaymentDate = new Date();
  nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);

  return (
    <div className="font-sans text-gray-800 bg-white">
      
      {/* --- NAVBAR --- */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white sticky top-0 z-50 shadow-sm border-b border-gray-100">
        <div className="flex items-center gap-2">
           <div className="text-2xl font-extrabold text-[#0e2a47] tracking-tighter">
             DUNKU<span className="text-[#84cc16]">LOANS</span>
           </div>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <a href="#" className="hover:text-[#84cc16]">Loans</a>
          <a href="#" className="hover:text-[#84cc16]">Payments</a>
          <a href="#" className="hover:text-[#84cc16]">Investments</a>
          <a href="#" className="hover:text-[#84cc16]">About</a>
        </div>

        <div className="hidden md:block">
          <Link to="/register" className="px-6 py-3 bg-[#84cc16] hover:bg-[#65a30d] text-white font-bold rounded-lg transition shadow-lg shadow-lime-200">
            Apply for a Loan
          </Link>
        </div>

        <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t p-4 flex flex-col gap-4 shadow-lg absolute w-full z-40">
          <Link to="/register" className="w-full text-center py-3 bg-[#84cc16] text-white font-bold rounded-lg">Apply Now</Link>
        </div>
      )}

      {/* --- HERO SECTION --- */}
      <div className="relative bg-[#0e2a47] min-h-[600px] overflow-hidden flex items-center">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-10 items-center relative z-10 py-12">
          
          <div className="hidden md:block">
             <img 
               src="https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?q=80&w=1000&auto=format&fit=crop" 
               alt="Happy Client" 
               className="object-cover h-[500px] w-full rounded-2xl shadow-2xl"
               style={{ maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)' }} 
             />
          </div>

          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md ml-auto mr-auto md:mr-0 w-full border-t-4 border-[#84cc16]">
            <h2 className="text-lg font-bold text-[#0e2a47] mb-4">How much would you like?</h2>
            <div className="mb-4">
              <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#84cc16] text-lg font-semibold text-[#0e2a47]" />
            </div>

            <h2 className="text-lg font-bold text-[#0e2a47] mb-4">For how many months?</h2>
            <div className="mb-4">
              <input type="number" value={months} onChange={(e) => setMonths(Number(e.target.value))} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#84cc16] text-lg font-semibold text-[#0e2a47]" />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-6">
              <div className="flex justify-between text-sm mb-2 text-gray-600"><span>Service Fee</span><span>K {serviceFee.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm mb-2 text-green-600 font-bold"><span>Receive</span><span>K {(amount - serviceFee).toFixed(2)}</span></div>
              <div className="flex justify-between text-sm mb-2 text-gray-800 font-bold"><span>Monthly Repayment</span><span>K {monthlyRepayment.toLocaleString(undefined, {maximumFractionDigits: 2})}</span></div>
            </div>

            <button onClick={() => navigate('/register')} className="w-full py-4 bg-[#84cc16] hover:bg-[#65a30d] text-white font-bold text-lg rounded-lg shadow-lg transition">Apply Now</button>
          </div>
        </div>
      </div>

      {/* --- NEW SECTION: EASY STEPS (Screenshot 1) --- */}
      <div className="py-20 px-6 bg-white text-center">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0e2a47] mb-16">Easy Steps to Get Your Loan</h2>
          
          <div className="grid md:grid-cols-3 gap-12">
            
            {/* Step 1 */}
            <div className="flex flex-col items-center">
              <div className="h-[400px] w-[220px] bg-gray-100 rounded-[3rem] border-8 border-gray-900 shadow-xl flex flex-col overflow-hidden relative mb-6">
                <div className="absolute top-0 w-full h-6 bg-gray-900 rounded-b-xl z-20"></div>
                <div className="flex-1 bg-white p-4 flex flex-col justify-center items-center">
                   <div className="w-full space-y-3">
                      <div className="h-2 w-1/2 bg-gray-200 rounded"></div>
                      <div className="h-8 w-full bg-gray-100 rounded border border-gray-200"></div>
                      <div className="h-8 w-full bg-gray-100 rounded border border-gray-200"></div>
                      <div className="h-10 w-full bg-[#84cc16] rounded mt-4"></div>
                   </div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-[#0e2a47]">Easy Application</h3>
              <p className="text-gray-500 mt-2 max-w-xs">Apply right here on our website or through the Dunkuloans app—fast and easy.</p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center">
              <div className="h-[400px] w-[220px] bg-gray-100 rounded-[3rem] border-8 border-gray-900 shadow-xl flex flex-col overflow-hidden relative mb-6">
                <div className="absolute top-0 w-full h-6 bg-gray-900 rounded-b-xl z-20"></div>
                <div className="flex-1 bg-[#84cc16] p-4 flex flex-col justify-center items-center text-white relative">
                   <div className="absolute inset-0 bg-black/10"></div>
                   <div className="z-10 text-center space-y-2">
                      <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">Flexible Plans</div>
                      <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">Low Rates</div>
                   </div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-[#0e2a47]">Flexible Options</h3>
              <p className="text-gray-500 mt-2 max-w-xs">Select type of loan and choose repayment plan and rate that works for you.</p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center">
              <div className="h-[400px] w-[220px] bg-gray-100 rounded-[3rem] border-8 border-gray-900 shadow-xl flex flex-col overflow-hidden relative mb-6">
                <div className="absolute top-0 w-full h-6 bg-gray-900 rounded-b-xl z-20"></div>
                <div className="flex-1 bg-white p-4 flex flex-col items-center pt-10">
                   <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold mb-4">Disbursed</div>
                   <div className="text-2xl font-bold text-[#0e2a47]">K 7,702.11</div>
                   <div className="grid grid-cols-2 gap-2 mt-4 w-full">
                      <div className="h-16 bg-gray-50 rounded-lg border border-gray-100"></div>
                      <div className="h-16 bg-gray-50 rounded-lg border border-gray-100"></div>
                   </div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-[#0e2a47]">Smooth Disbursement</h3>
              <p className="text-gray-500 mt-2 max-w-xs">Once approved, your funds are sent directly to your mobile money or account.</p>
            </div>

          </div>
        </div>
      </div>

      {/* --- NEW SECTION: LOAN OPTIONS (Screenshot 2 - Mapped to Dunku) --- */}
      <div className="py-20 px-6 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0e2a47] text-center mb-16">Flexible Loan Options, Made for You</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            
            {/* Card 1: Personal/Collateral */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow border border-gray-100 flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold text-[#0e2a47] mb-2">Personal Loans</h3>
                <p className="text-gray-500 mb-6 max-w-sm">Get from ZMW 500 to ZMW 250,000 for your personal needs against collateral.</p>
                <Link to="/register" className="inline-block bg-[#84cc16] hover:bg-[#65a30d] text-white font-bold py-3 px-6 rounded-lg transition">Apply Now</Link>
              </div>
              <div className="hidden sm:block text-[#84cc16] bg-lime-50 p-4 rounded-full">
                <User className="w-12 h-12" />
              </div>
            </div>

            {/* Card 2: Business Loans */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow border border-gray-100 flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold text-[#0e2a47] mb-2">Business Loans</h3>
                <p className="text-gray-500 mb-6 max-w-sm">Boost your business with loans from ZMW 500 to ZMW 1,000,000.</p>
                <Link to="/register" className="inline-block bg-[#84cc16] hover:bg-[#65a30d] text-white font-bold py-3 px-6 rounded-lg transition">Apply Now</Link>
              </div>
              <div className="hidden sm:block text-[#84cc16] bg-lime-50 p-4 rounded-full">
                <Briefcase className="w-12 h-12" />
              </div>
            </div>

            {/* Card 3: Marketeer Group (Replaces Agri) */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow border border-gray-100 flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold text-[#0e2a47] mb-2">Marketeer Loans</h3>
                <p className="text-gray-500 mb-6 max-w-sm">Group loans for marketeers—fund your stall and grow together.</p>
                <Link to="/register" className="inline-block bg-[#84cc16] hover:bg-[#65a30d] text-white font-bold py-3 px-6 rounded-lg transition">Apply Now</Link>
              </div>
              <div className="hidden sm:block text-[#84cc16] bg-lime-50 p-4 rounded-full">
                <Users className="w-12 h-12" />
              </div>
            </div>

            {/* Card 4: Item Loan (Replaces Bill Credit) */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow border border-gray-100 flex justify-between items-start">
              <div>
                <div className="inline-block bg-sky-100 text-sky-600 text-xs font-bold px-2 py-1 rounded mb-2">Popular</div>
                <h3 className="text-2xl font-bold text-[#0e2a47] mb-2">Item Credit</h3>
                <p className="text-gray-500 mb-6 max-w-sm">Get phones, TVs, solar kits, and gadgets on flexible credit.</p>
                <Link to="/register" className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-6 rounded-lg transition">Apply Now</Link>
              </div>
              <div className="hidden sm:block text-[#84cc16] bg-lime-50 p-4 rounded-full">
                <ShoppingBag className="w-12 h-12" />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* --- NEW SECTION: APP PROMO (Screenshot 3) --- */}
      <div className="bg-[#0e2a47] text-white py-20 px-6 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#133457] rounded-l-[100px] hidden md:block"></div>

        <div className="container mx-auto relative z-10 flex flex-col md:flex-row items-center gap-12">
          
          <div className="flex-1 space-y-6">
             <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">Money when <br/> you need it</h2>
             <p className="text-lg text-gray-300 max-w-md">Manage payments, secure loans, and invest smartly with the Dunkuloans platform.</p>
             <button className="px-8 py-4 bg-[#84cc16] hover:bg-[#65a30d] text-white font-bold rounded-lg shadow-lg text-lg transition">
               Get the app
             </button>
          </div>

          <div className="flex-1 relative flex justify-center">
             {/* Decorative circles */}
             <div className="absolute top-10 left-10 bg-[#84cc16] p-4 rounded-full font-bold shadow-xl animate-bounce">Invest</div>
             <div className="absolute bottom-20 right-10 bg-sky-500 p-4 rounded-full font-bold shadow-xl">Send Money</div>
             
             {/* Phone in Hand Image Simulation */}
             <div className="relative">
                <div className="w-[300px] h-[600px] bg-black rounded-[3rem] border-8 border-gray-800 shadow-2xl relative overflow-hidden">
                  {/* Screen Content */}
                  <div className="h-full w-full bg-white text-gray-900 p-4 pt-12">
                     <div className="flex justify-between items-center mb-6">
                        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                        <div className="text-xs text-gray-500">Good evening!</div>
                     </div>
                     <div className="bg-[#84cc16] text-white p-6 rounded-2xl mb-4 shadow-lg">
                        <p className="text-sm opacity-90">Wallet Balance</p>
                        <p className="text-3xl font-bold">K 9,846.90</p>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-sky-50 p-4 rounded-xl text-center">
                           <div className="font-bold text-sky-700">Borrow</div>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-xl text-center">
                           <div className="font-bold text-orange-700">Repay</div>
                        </div>
                     </div>
                  </div>
                </div>
             </div>
          </div>

        </div>
      </div>

      {/* --- REPRESENTATIVE EXAMPLE --- */}
      <div className="bg-[#1a1a1a] text-white py-12 px-6">
        <div className="container mx-auto">
          <p className="text-xs text-gray-400 mb-6">Minimum Tenure: 62 days | Maximum Tenure: 60 months | Maximum APR: 40%</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 border-t border-gray-700 pt-6">
            <div><p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Interest Rate</p><p className="text-xl font-bold text-[#84cc16]">2.5%</p></div>
            <div><p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Loan Value</p><p className="text-xl font-bold">K 1,000,000</p></div>
            <div><p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Loan Term</p><p className="text-xl font-bold">12 Months</p></div>
            <div><p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Total Amount</p><p className="text-xl font-bold">K 1,169,845.52</p></div>
            <div><p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Monthly Repayment</p><p className="text-xl font-bold">K 97,487.13</p></div>
          </div>
        </div>
      </div>

      {/* --- FOOTER --- */}
      <footer className="bg-[#000] text-white pt-20 pb-10 px-6 border-t border-gray-900">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-gray-800 pb-12">
            <div>
              <h2 className="text-2xl font-extrabold text-white mb-6">DUNKU<span className="text-[#84cc16]">LOANS</span></h2>
              <p className="text-gray-400 text-sm leading-relaxed">DunkuLoans is an award-winning fintech startup providing seamless online loans.</p>
            </div>
            <div><h3 className="font-bold text-white mb-4 uppercase text-xs tracking-widest">Contact</h3><ul className="space-y-3 text-sm text-gray-400"><li>Counting House, Lusaka</li><li>info@dunkuloans.com</li><li>+260 761 167 020</li></ul></div>
          </div>
          <p className="text-xs text-gray-500 mt-8">© 2025 Dunkuloans. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}