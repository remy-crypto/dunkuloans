import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, Menu, X, Facebook, Twitter, Instagram, Linkedin, Smartphone } from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- CALCULATOR STATE ---
  const [amount, setAmount] = useState(500);
  const [months, setMonths] = useState(3);
  const [loanType, setLoanType] = useState("SME");

  // Simple Mock Calculation
  const serviceFee = 50;
  const interestRate = 0.15; // 15% flat for demo
  const totalRepayment = amount * (1 + (interestRate * months));
  const monthlyRepayment = totalRepayment / months;
  const nextPaymentDate = new Date();
  nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);

  return (
    <div className="font-sans text-gray-800 bg-white">
      
      {/* --- NAVBAR --- */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2">
           {/* Logo Placeholder */}
           <div className="text-2xl font-extrabold text-[#0e2a47] tracking-tighter">
             DUNKU<span className="text-[#84cc16]">LOANS</span>
           </div>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <a href="#" className="hover:text-[#84cc16]">Loans</a>
          <a href="#" className="hover:text-[#84cc16]">Payments</a>
          <a href="#" className="hover:text-[#84cc16]">Investments</a>
          <a href="#" className="hover:text-[#84cc16]">About</a>
        </div>

        <div className="hidden md:block">
          <Link to="/register" className="px-6 py-3 bg-[#84cc16] hover:bg-[#65a30d] text-white font-bold rounded-lg transition">
            Apply for a Loan
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t p-4 flex flex-col gap-4 shadow-lg absolute w-full z-40">
          <a href="#" className="font-medium">Loans</a>
          <a href="#" className="font-medium">Payments</a>
          <a href="#" className="font-medium">Investments</a>
          <Link to="/register" className="w-full text-center py-3 bg-[#84cc16] text-white font-bold rounded-lg">
            Apply Now
          </Link>
        </div>
      )}

      {/* --- HERO SECTION --- */}
      <div className="relative bg-[#0e2a47] min-h-[600px] overflow-hidden flex items-center">
        {/* Background Pattern Overlay (Optional) */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-10 items-center relative z-10 py-12">
          
          {/* Left: Image (Woman) */}
          <div className="hidden md:block">
             {/* Using a placeholder image that matches the vibe */}
             <img 
               src="https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?q=80&w=1000&auto=format&fit=crop" 
               alt="Happy Client" 
               className="object-cover h-[500px] w-full rounded-2xl shadow-2xl"
               style={{ maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)' }} 
             />
          </div>

          {/* Right: Calculator Card */}
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md ml-auto mr-auto md:mr-0 w-full">
            <h2 className="text-lg font-bold text-[#0e2a47] mb-4">How much would you like?</h2>
            
            <div className="mb-4">
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#84cc16] text-lg font-semibold"
              />
            </div>

            <h2 className="text-lg font-bold text-[#0e2a47] mb-4">For how many months?</h2>
            <div className="mb-4">
              <input 
                type="number" 
                value={months}
                onChange={(e) => setMonths(Number(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#84cc16] text-lg font-semibold"
              />
            </div>

            <h2 className="text-lg font-bold text--[#0e2a47] mb-4">What type of loan would you like?</h2>
            <div className="mb-6">
              <select 
                value={loanType} 
                onChange={(e) => setLoanType(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#84cc16] bg-white"
              >
                <option value="SME">SME / Business Loan</option>
                <option value="Personal">Personal Loan</option>
                <option value="Asset">Asset Financing</option>
              </select>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-6">
              <h3 className="font-bold text-gray-800 mb-3">Loan Summary</h3>
              <div className="flex justify-between text-sm mb-2 text-gray-600">
                <span>Service Fee</span>
                <span>K {serviceFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm mb-2 text-green-600 font-bold">
                <span>Amount You Receive</span>
                <span>K {(amount - serviceFee).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm mb-2 text-gray-800 font-bold">
                <span>Monthly Repayment</span>
                <span>K {monthlyRepayment.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Next Payment Date</span>
                <span>{nextPaymentDate.toLocaleDateString()}</span>
              </div>
            </div>

            <button 
              onClick={() => navigate('/register')}
              className="w-full py-4 bg-[#84cc16] hover:bg-[#65a30d] text-white font-bold text-lg rounded-lg shadow-lg transition transform hover:-translate-y-1"
            >
              Apply Now
            </button>
            
            <div className="mt-4 flex justify-end">
              <div className="text-right">
                <p className="text-[10px] text-[#84cc16] font-bold">Scan to get app</p>
                <div className="w-12 h-12 bg-gray-200 ml-auto mt-1 flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-gray-500" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* --- REPRESENTATIVE EXAMPLE STRIP (Black) --- */}
      <div className="bg-[#1a1a1a] text-white py-12 px-6">
        <div className="container mx-auto">
          <p className="text-xs text-gray-400 mb-6">Minimum Tenure: 62 days | Maximum Tenure: 60 months | Maximum APR: 40%</p>
          
          <h3 className="text-sm font-bold text-white mb-4">Representative Example of a K1,000,000 SME loan over 12 months:</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 border-t border-gray-700 pt-6">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Interest Rate</p>
              <p className="text-xl font-bold text-[#84cc16]">2.5%</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Loan Value</p>
              <p className="text-xl font-bold">K 1,000,000</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Loan Term</p>
              <p className="text-xl font-bold">12 Months</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Total Amount</p>
              <p className="text-xl font-bold">K 1,169,845.52</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Monthly Repayment</p>
              <p className="text-xl font-bold">K 97,487.13</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- FAQ / HELP SECTION --- */}
      <div className="container mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-[#0e2a47] mb-4">Can I help?</h2>
        <p className="text-gray-500 mb-8 max-w-lg">Everything you need to know about our services. Can't find the answer you're looking for? Please chat to our team.</p>
        
        <button className="px-6 py-3 bg-[#84cc16] text-white font-bold rounded-lg mb-12">Contact Us</button>

        <div className="space-y-4 max-w-3xl ml-auto">
          {[
            "Tell me about your services",
            "How do I open an account with DunkuLoans?",
            "Can I repay my loan early?",
            "What are the interest rates?",
          ].map((q, i) => (
            <div key={i} className="border-b border-gray-200 pb-4">
              <div className="flex justify-between items-center cursor-pointer group">
                <h3 className="text-lg font-medium text-gray-700 group-hover:text-[#84cc16] transition">{q}</h3>
                <div className="w-8 h-8 rounded-full border flex items-center justify-center text-gray-400 group-hover:border-[#84cc16] group-hover:text-[#84cc16]">
                  +
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- BLOG SECTION --- */}
      <div className="bg-gray-50 py-20 px-6">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-[#0e2a47] mb-12">Latest news and blog posts</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <div key={item} className="group cursor-pointer">
                <div className="overflow-hidden rounded-xl mb-4">
                  <img 
                    src={`https://source.unsplash.com/random/400x300?business&sig=${item}`} 
                    alt="Blog" 
                    className="w-full h-64 object-cover transform group-hover:scale-105 transition duration-500"
                  />
                </div>
                <p className="text-xs text-gray-500 mb-2">October 3, 2025</p>
                <h3 className="text-xl font-bold text-[#0e2a47] mb-2 group-hover:text-[#84cc16] transition">
                  How SME Financing Works for Your Business
                </h3>
                <p className="text-[#84cc16] font-medium text-sm flex items-center gap-1">
                  Read more <span className="text-lg">→</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- FOOTER --- */}
      <footer className="bg-[#1a1a1a] text-white pt-20 pb-10 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-gray-800 pb-12">
            
            {/* Column 1: Brand */}
            <div>
              <h2 className="text-2xl font-extrabold text-white mb-6">
                DUNKU<span className="text-[#84cc16]">LOANS</span>
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                DunkuLoans is an award-winning, venture-backed fintech startup that provides online loans.
              </p>
              <div className="flex gap-4 mt-6">
                <Facebook className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                <Linkedin className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                <Instagram className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                <Twitter className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
              </div>
            </div>

            {/* Column 2: Products */}
            <div>
              <h3 className="font-bold text-white mb-4 uppercase text-xs tracking-widest">Products</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#" className="hover:text-[#84cc16]">Loans</a></li>
                <li><a href="#" className="hover:text-[#84cc16]">Payments</a></li>
                <li><a href="#" className="hover:text-[#84cc16]">Investments</a></li>
              </ul>
            </div>

            {/* Column 3: Resources */}
            <div>
              <h3 className="font-bold text-white mb-4 uppercase text-xs tracking-widest">Resources</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#" className="hover:text-[#84cc16]">Blog</a></li>
                <li><a href="#" className="hover:text-[#84cc16]">Careers</a></li>
                <li><a href="#" className="hover:text-[#84cc16]">Loan Requirements</a></li>
              </ul>
            </div>

            {/* Column 4: Contact */}
            <div>
              <h3 className="font-bold text-white mb-4 uppercase text-xs tracking-widest">Contact</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>Counting House, Suite 1, Thabo Mbeki Rd, Lusaka | Zambia</li>
                <li><a href="mailto:info@dunkuloans.com" className="hover:text-[#84cc16]">info@dunkuloans.com</a></li>
                <li><a href="tel:+260761167020" className="hover:text-[#84cc16]">+260 761 167 020</a></li>
              </ul>
            </div>

          </div>

          <div className="pt-8 flex flex-col md:flex-row justify-between items-center">
             <div className="flex gap-4">
                <button className="bg-black border border-gray-700 rounded-lg px-4 py-2 flex items-center gap-2 hover:border-gray-500">
                   <div className="text-left">
                      <div className="text-[10px] text-gray-400">GET IT ON</div>
                      <div className="text-sm font-bold">Google Play</div>
                   </div>
                </button>
                <button className="bg-black border border-gray-700 rounded-lg px-4 py-2 flex items-center gap-2 hover:border-gray-500">
                   <div className="text-left">
                      <div className="text-[10px] text-gray-400">Download on the</div>
                      <div className="text-sm font-bold">App Store</div>
                   </div>
                </button>
             </div>
             <p className="text-xs text-gray-500 mt-4 md:mt-0">© 2025 Dunkuloans. All rights reserved.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}