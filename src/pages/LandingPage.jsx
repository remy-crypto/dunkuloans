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

  // Mock Calculation Logic (Live Updates)
  const serviceFee = 50;
  const interestRate = 0.15; // 15% flat
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
             DUNKU<span className="text-blue-600">LOANS</span>
           </div>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <a href="#" className="hover:text-blue-600 transition-colors">Loans</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Payments</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Investments</a>
          <a href="#" className="hover:text-blue-600 transition-colors">About</a>
        </div>

        <div className="hidden md:block">
          <Link 
            to="/register" 
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition shadow-lg shadow-blue-200"
          >
            Apply for a Loan
          </Link>
        </div>

        <button className="md:hidden text-gray-700" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t p-4 flex flex-col gap-4 shadow-lg absolute w-full z-40">
          <Link to="/register" className="font-medium text-gray-700">Loans</Link>
          <Link to="/register" className="font-medium text-gray-700">Payments</Link>
          <Link to="/register" className="font-medium text-gray-700">Investments</Link>
          <Link to="/register" className="w-full text-center py-3 bg-blue-600 text-white font-bold rounded-lg">
            Apply Now
          </Link>
        </div>
      )}

      {/* --- HERO SECTION --- */}
      <div className="relative bg-[#0e2a47] min-h-[600px] overflow-hidden flex items-center">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-10 items-center relative z-10 py-12">
          
          {/* Hero Image */}
          <div className="hidden md:block">
             <img 
               src="https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?q=80&w=1000&auto=format&fit=crop" 
               alt="Happy Client" 
               className="object-cover h-[500px] w-full rounded-2xl shadow-2xl"
               style={{ maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)' }} 
             />
          </div>

          {/* Calculator Card */}
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md ml-auto mr-auto md:mr-0 w-full border-t-4 border-blue-600">
            <h2 className="text-lg font-bold text-[#0e2a47] mb-4">How much would you like?</h2>
            <div className="mb-4">
              <input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(Number(e.target.value))} 
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-lg font-semibold text-[#0e2a47]" 
              />
            </div>

            <h2 className="text-lg font-bold text-[#0e2a47] mb-4">For how many months?</h2>
            <div className="mb-4">
              <input 
                type="number" 
                value={months} 
                onChange={(e) => setMonths(Number(e.target.value))} 
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-lg font-semibold text-[#0e2a47]" 
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
              <div className="flex justify-between text-sm mb-2 text-gray-600"><span>Service Fee</span><span>K {serviceFee.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm mb-2 text-blue-600 font-bold"><span>Receive</span><span>K {(amount - serviceFee).toFixed(2)}</span></div>
              <div className="flex justify-between text-sm mb-2 text-gray-800 font-bold"><span>Monthly Repayment</span><span>K {monthlyRepayment.toLocaleString(undefined, {maximumFractionDigits: 2})}</span></div>
            </div>

            <button 
              onClick={() => navigate('/register')} 
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-lg shadow-lg transition transform hover:-translate-y-1"
            >
              Apply Now
            </button>
            
            <div className="mt-4 flex justify-end items-center gap-2 text-right cursor-pointer hover:opacity-80">
              <p className="text-[10px] text-blue-600 font-bold">Scan to get app</p>
              <Smartphone className="w-6 h-6 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* --- EASY STEPS SECTION --- */}
      <div className="py-20 px-6 bg-white text-center">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0e2a47] mb-16">Easy Steps to Get Your Loan</h2>
          
          <div className="grid md:grid-cols-3 gap-12">
            
            {/* Step 1 */}
            <div className="flex flex-col items-center group">
              <div className="h-[400px] w-[220px] bg-gray-100 rounded-[3rem] border-8 border-gray-900 shadow-xl flex flex-col overflow-hidden relative mb-6 group-hover:-translate-y-2 transition-transform duration-300">
                <div className="absolute top-0 w-full h-6 bg-gray-900 rounded-b-xl z-20"></div>
                <div className="flex-1 bg-white p-4 flex flex-col justify-center items-center">
                   <div className="w-full space-y-3">
                      <div className="h-2 w-1/2 bg-gray-200 rounded"></div>
                      <div className="h-8 w-full bg-gray-50 rounded border border-gray-200"></div>
                      <div className="h-8 w-full bg-gray-50 rounded border border-gray-200"></div>
                      <div className="h-10 w-full bg-blue-600 rounded mt-4"></div>
                   </div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-[#0e2a47]">Easy Application</h3>
              <p className="text-gray-500 mt-2 max-w-xs">Apply right here on our website or through the Dunkuloans app—fast and easy.</p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center group">
              <div className="h-[400px] w-[220px] bg-gray-100 rounded-[3rem] border-8 border-gray-900 shadow-xl flex flex-col overflow-hidden relative mb-6 group-hover:-translate-y-2 transition-transform duration-300">
                <div className="absolute top-0 w-full h-6 bg-gray-900 rounded-b-xl z-20"></div>
                <div className="flex-1 bg-blue-600 p-4 flex flex-col justify-center items-center text-white relative">
                   <div className="absolute inset-0 bg-black/10"></div>
                   <div className="z-10 text-center space-y-2">
                      <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm shadow-sm">Flexible Plans</div>
                      <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm shadow-sm">Low Rates</div>
                   </div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-[#0e2a47]">Flexible Options</h3>
              <p className="text-gray-500 mt-2 max-w-xs">Select type of loan and choose repayment plan and rate that works for you.</p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center group">
              <div className="h-[400px] w-[220px] bg-gray-100 rounded-[3rem] border-8 border-gray-900 shadow-xl flex flex-col overflow-hidden relative mb-6 group-hover:-translate-y-2 transition-transform duration-300">
                <div className="absolute top-0 w-full h-6 bg-gray-900 rounded-b-xl z-20"></div>
                <div className="flex-1 bg-white p-4 flex flex-col items-center pt-10">
                   <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold mb-4 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Disbursed
                   </div>
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

      {/* --- LOAN OPTIONS SECTION (Blue Theme) --- */}
      <div className="py-20 px-6 bg-blue-50/50">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0e2a47] text-center mb-16">Flexible Loan Options, Made for You</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            
            {/* Personal Loans */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow border border-gray-100 flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold text-[#0e2a47] mb-2">Personal Loans</h3>
                <p className="text-gray-500 mb-6 max-w-sm">Get from ZMW 500 to ZMW 250,000 for your personal needs against collateral.</p>
                <Link to="/register" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition">Apply Now</Link>
              </div>
              <div className="hidden sm:block text-blue-600 bg-blue-50 p-4 rounded-full">
                <User className="w-12 h-12" />
              </div>
            </div>

            {/* Business Loans */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow border border-gray-100 flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold text-[#0e2a47] mb-2">Business Loans</h3>
                <p className="text-gray-500 mb-6 max-w-sm">Boost your business with loans from ZMW 500 to ZMW 1,000,000.</p>
                <Link to="/register" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition">Apply Now</Link>
              </div>
              <div className="hidden sm:block text-blue-600 bg-blue-50 p-4 rounded-full">
                <Briefcase className="w-12 h-12" />
              </div>
            </div>

            {/* Marketeer Loans */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow border border-gray-100 flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold text-[#0e2a47] mb-2">Marketeer Loans</h3>
                <p className="text-gray-500 mb-6 max-w-sm">Group loans for marketeers—fund your stall and grow together.</p>
                <Link to="/register" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition">Apply Now</Link>
              </div>
              <div className="hidden sm:block text-blue-600 bg-blue-50 p-4 rounded-full">
                <Users className="w-12 h-12" />
              </div>
            </div>

            {/* Item Credit */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow border border-gray-100 flex justify-between items-start">
              <div>
                <div className="inline-block bg-indigo-100 text-indigo-600 text-xs font-bold px-2 py-1 rounded mb-2">Popular</div>
                <h3 className="text-2xl font-bold text-[#0e2a47] mb-2">Item Credit</h3>
                <p className="text-gray-500 mb-6 max-w-sm">Get phones, TVs, solar kits, and gadgets on flexible credit.</p>
                <Link to="/register" className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-6 rounded-lg transition">Apply Now</Link>
              </div>
              <div className="hidden sm:block text-blue-600 bg-blue-50 p-4 rounded-full">
                <ShoppingBag className="w-12 h-12" />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* --- APP PROMO SECTION --- */}
      <div className="bg-[#0e2a47] text-white py-20 px-6 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#133457] rounded-l-[100px] hidden md:block"></div>

        <div className="container mx-auto relative z-10 flex flex-col md:flex-row items-center gap-12">
          
          <div className="flex-1 space-y-6">
             <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">Money when <br/> you need it</h2>
             <p className="text-lg text-gray-300 max-w-md">Manage payments, secure loans, and invest smartly with the Dunkuloans platform.</p>
             <button 
                onClick={() => navigate('/register')}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg text-lg transition"
             >
               Get the app
             </button>
          </div>

          <div className="flex-1 relative flex justify-center">
             <div className="absolute top-10 left-10 bg-blue-600 p-4 rounded-full font-bold shadow-xl animate-bounce text-sm">Invest</div>
             <div className="absolute bottom-20 right-10 bg-sky-500 p-4 rounded-full font-bold shadow-xl text-sm">Send Money</div>
             
             {/* Phone in Hand */}
             <div className="relative">
                <div className="w-[300px] h-[600px] bg-black rounded-[3rem] border-8 border-gray-800 shadow-2xl relative overflow-hidden">
                  <div className="h-full w-full bg-white text-gray-900 p-4 pt-12">
                     <div className="flex justify-between items-center mb-6">
                        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                        <div className="text-xs text-gray-500">Good evening!</div>
                     </div>
                     <div className="bg-blue-600 text-white p-6 rounded-2xl mb-4 shadow-lg">
                        <p className="text-sm opacity-90">Wallet Balance</p>
                        <p className="text-3xl font-bold">K 9,846.90</p>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-4 rounded-xl text-center">
                           <div className="font-bold text-blue-700">Borrow</div>
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
      <div className="bg-[#111827] text-white py-12 px-6">
        <div className="container mx-auto">
          <p className="text-xs text-gray-400 mb-6">Minimum Tenure: 62 days | Maximum Tenure: 60 months | Maximum APR: 40%</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 border-t border-gray-800 pt-6">
            <div><p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Interest Rate</p><p className="text-xl font-bold text-blue-500">2.5%</p></div>
            <div><p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Loan Value</p><p className="text-xl font-bold">K 1,000,000</p></div>
            <div><p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Loan Term</p><p className="text-xl font-bold">12 Months</p></div>
            <div><p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Total Amount</p><p className="text-xl font-bold">K 1,169,845.52</p></div>
            <div><p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Monthly Repayment</p><p className="text-xl font-bold">K 97,487.13</p></div>
          </div>
        </div>
      </div>

      {/* --- FAQ SECTION --- */}
      <div className="container mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-[#0e2a47] mb-4">Can I help?</h2>
        <p className="text-gray-500 mb-8 max-w-lg">Everything you need to know about our services. Please chat to our team.</p>
        
        <button onClick={() => navigate('/login')} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg mb-12 shadow-lg shadow-blue-200">
           Contact Us
        </button>

        <div className="space-y-4 max-w-3xl ml-auto">
          {["Tell me about your services", "How do I open an account?", "Can I repay my loan early?", "What are the interest rates?"].map((q, i) => (
            <div key={i} className="border-b border-gray-100 pb-4">
              <div className="flex justify-between items-center cursor-pointer group">
                <h3 className="text-lg font-medium text-gray-700 group-hover:text-blue-600 transition">{q}</h3>
                <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 group-hover:border-blue-600 group-hover:text-blue-600">+</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- FOOTER --- */}
      <footer className="bg-black text-white pt-20 pb-10 px-6 border-t border-gray-900">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-gray-800 pb-12">
            <div>
              <h2 className="text-2xl font-extrabold text-white mb-6">DUNKU<span className="text-blue-600">LOANS</span></h2>
              <p className="text-gray-400 text-sm leading-relaxed">Award-winning fintech providing seamless online loans in Zambia.</p>
              <div className="flex gap-4 mt-6">
                <Facebook className="w-5 h-5 text-gray-400 hover:text-blue-500 cursor-pointer" />
                <Linkedin className="w-5 h-5 text-gray-400 hover:text-blue-500 cursor-pointer" />
                <Instagram className="w-5 h-5 text-gray-400 hover:text-blue-500 cursor-pointer" />
                <Twitter className="w-5 h-5 text-gray-400 hover:text-blue-500 cursor-pointer" />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4 uppercase text-xs tracking-widest">Products</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#" className="hover:text-blue-500">Loans</a></li>
                <li><a href="#" className="hover:text-blue-500">Payments</a></li>
                <li><a href="#" className="hover:text-blue-500">Investments</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4 uppercase text-xs tracking-widest">Company</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#" className="hover:text-blue-500">About</a></li>
                <li><a href="#" className="hover:text-blue-500">Careers</a></li>
                <li><a href="#" className="hover:text-blue-500">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4 uppercase text-xs tracking-widest">Contact</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>Counting House, Lusaka</li>
                <li><a href="mailto:info@dunkuloans.com" className="hover:text-blue-500">info@dunkuloans.com</a></li>
                <li>+260 761 167 020</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
             <p>© 2025 Dunkuloans. All rights reserved.</p>
             <div className="flex gap-4 mt-4 md:mt-0">
                <a href="#" className="hover:text-white">Privacy</a>
                <a href="#" className="hover:text-white">Terms</a>
             </div>
          </div>
        </div>
      </footer>

    </div>
  );
}