import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Menu, X, Facebook, Twitter, Instagram, Linkedin, Smartphone, 
  CheckCircle, Briefcase, ShoppingBag, Users, User, Phone, Mail, Globe
} from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- CALCULATOR STATE ---
  const [amount, setAmount] = useState(500);
  const [months, setMonths] = useState(3);
  
  // Mock Calculation Logic (Live Updates)
  const serviceFee = 50;
  const interestRate = 0.15; // 15% flat
  const totalRepayment = amount * (1 + (interestRate * months));
  const monthlyRepayment = totalRepayment / months;
  const nextPaymentDate = new Date();
  nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);

  return (
    <div className="font-sans text-gray-800 bg-white">
      
      {/* --- HEADER / NAVBAR --- */}
      <nav className="bg-white sticky top-0 z-50 shadow-md border-b-4 border-[#b8860b]">
        {/* Top Contact Bar (Desktop) */}
        <div className="hidden md:flex justify-end bg-black text-white px-6 py-2 text-sm font-bold tracking-wide gap-6">
           <div className="flex items-center gap-2">
             <Phone className="w-4 h-4 text-[#b8860b]" />
             <span>0776430780 | 0778289080</span>
           </div>
           <div className="flex items-center gap-2">
             <Mail className="w-4 h-4 text-[#b8860b]" />
             <span>dunkubusinesssolutionsltd@gmail.com</span>
           </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4">
          {/* Logo Section */}
          <div className="flex flex-col">
             <div className="text-2xl font-extrabold text-[#0e2a47] leading-none tracking-tight">
               DUNKU BUSINESS
             </div>
             <div className="text-xs font-bold text-gray-600 tracking-[0.2em] mt-0.5">
               SOLUTIONS LTD
             </div>
             <div className="text-[10px] font-script text-[#b8860b] mt-1 italic font-medium">
               your ideal home filled with Hope
             </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-700 uppercase tracking-tight">
            <a href="#" className="hover:text-[#b8860b] transition-colors">Loans</a>
            <a href="#" className="hover:text-[#b8860b] transition-colors">Payments</a>
            <a href="#" className="hover:text-[#b8860b] transition-colors">Investments</a>
            <a href="#" className="hover:text-[#b8860b] transition-colors">About</a>
          </div>

          <div className="hidden md:block">
            <Link 
              to="/register" 
              className="px-6 py-3 bg-[#15803d] hover:bg-[#166534] text-white font-bold rounded shadow-lg shadow-green-900/20 transition uppercase text-sm tracking-wider"
            >
              Apply Now
            </Link>
          </div>

          <button className="md:hidden text-gray-700" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t p-4 flex flex-col gap-4 shadow-lg absolute w-full z-40">
          <Link to="/register" className="font-bold text-gray-800">Loans</Link>
          <Link to="/register" className="font-bold text-gray-800">Payments</Link>
          <Link to="/register" className="font-bold text-gray-800">Investments</Link>
          <div className="border-t pt-4">
             <p className="font-bold text-[#b8860b] mb-1">Contacts:</p>
             <p className="text-sm font-bold">0776430780 | 0778289080</p>
          </div>
          <Link to="/register" className="w-full text-center py-3 bg-[#15803d] text-white font-bold rounded">
            Apply Now
          </Link>
        </div>
      )}

      {/* --- HERO SECTION --- */}
      <div className="relative bg-[#0e2a47] min-h-[600px] overflow-hidden flex items-center">
        {/* Background Texture */}
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-10 items-center relative z-10 py-12">
          
          {/* Hero Image */}
          <div className="hidden md:block relative">
             <div className="absolute -inset-4 bg-[#b8860b] rounded-2xl opacity-20 blur-xl"></div>
             <img 
               src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1000&auto=format&fit=crop" 
               alt="Happy Business Owner" 
               className="object-cover h-[500px] w-full rounded-2xl shadow-2xl relative z-10 border-4 border-white"
             />
          </div>

          {/* Calculator Card */}
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md ml-auto mr-auto md:mr-0 w-full border-t-8 border-[#b8860b]">
            <h2 className="text-lg font-bold text-[#0e2a47] mb-4 uppercase tracking-wide">Loan Calculator</h2>
            
            <div className="mb-4">
              <label className="text-xs font-bold text-gray-500 uppercase">How much do you need?</label>
              <input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(Number(e.target.value))} 
                className="w-full p-3 border-2 border-gray-200 rounded focus:outline-none focus:border-[#b8860b] text-xl font-bold text-[#0e2a47] mt-1" 
              />
            </div>

            <div className="mb-6">
              <label className="text-xs font-bold text-gray-500 uppercase">Duration (Months)</label>
              <input 
                type="number" 
                value={months} 
                onChange={(e) => setMonths(Number(e.target.value))} 
                className="w-full p-3 border-2 border-gray-200 rounded focus:outline-none focus:border-[#b8860b] text-xl font-bold text-[#0e2a47] mt-1" 
              />
            </div>

            <div className="bg-[#f0fdf4] p-4 rounded border border-green-200 mb-6">
              <div className="flex justify-between text-sm mb-2 text-gray-600"><span>Service Fee</span><span>K {serviceFee.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm mb-2 text-[#15803d] font-bold"><span>You Receive</span><span>K {(amount - serviceFee).toFixed(2)}</span></div>
              <div className="flex justify-between text-lg mb-1 text-gray-900 font-extrabold border-t border-green-200 pt-2"><span>Monthly Pay</span><span>K {monthlyRepayment.toLocaleString(undefined, {maximumFractionDigits: 2})}</span></div>
            </div>

            <button 
              onClick={() => navigate('/register')} 
              className="w-full py-4 bg-[#15803d] hover:bg-[#166534] text-white font-bold text-lg rounded shadow-lg transition uppercase tracking-wide"
            >
              Get This Loan
            </button>
          </div>
        </div>
      </div>

      {/* --- LOAN CATEGORIES (Matches Flyer) --- */}
      <div className="py-20 px-6 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0e2a47] text-center mb-16 uppercase">Our Loan Products</h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            
            {/* 1. COLLATERAL BASED LOANS */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition border-b-8 border-[#15803d] group">
              <div className="h-48 bg-gray-200 relative overflow-hidden">
                <img src="https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&w=600&q=80" alt="Collateral" className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition"></div>
              </div>
              <div className="p-6 text-center">
                <h3 className="text-lg font-extrabold text-[#0e2a47] uppercase leading-tight mb-4">Collateral <br/> Based Loans</h3>
                <Link to="/register" className="inline-block px-6 py-2 bg-[#b8860b] text-white text-xs font-bold uppercase tracking-wider rounded hover:bg-[#9a7009] transition">
                  Apply Now
                </Link>
              </div>
            </div>

            {/* 2. MARKETEERS LOANS */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition border-b-8 border-[#15803d] group">
              <div className="h-48 bg-gray-200 relative overflow-hidden">
                <img src="https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&w=600&q=80" alt="Marketeer" className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition"></div>
              </div>
              <div className="p-6 text-center">
                <h3 className="text-lg font-extrabold text-[#0e2a47] uppercase leading-tight mb-4">Marketeers <br/> Loans</h3>
                <Link to="/register" className="inline-block px-6 py-2 bg-[#b8860b] text-white text-xs font-bold uppercase tracking-wider rounded hover:bg-[#9a7009] transition">
                  Apply Now
                </Link>
              </div>
            </div>

            {/* 3. ITEM LOANS */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition border-b-8 border-[#15803d] group">
              <div className="h-48 bg-gray-200 relative overflow-hidden">
                <img src="https://images.unsplash.com/photo-1542393545-facac70508bc?auto=format&fit=crop&w=600&q=80" alt="Items" className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition"></div>
              </div>
              <div className="p-6 text-center">
                <h3 className="text-lg font-extrabold text-[#0e2a47] uppercase leading-tight mb-4">Item <br/> Loans</h3>
                <Link to="/register" className="inline-block px-6 py-2 bg-[#b8860b] text-white text-xs font-bold uppercase tracking-wider rounded hover:bg-[#9a7009] transition">
                  Apply Now
                </Link>
              </div>
            </div>

            {/* 4. BUSINESS LOANS */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition border-b-8 border-[#15803d] group">
              <div className="h-48 bg-gray-200 relative overflow-hidden">
                <img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=600&q=80" alt="Business" className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition"></div>
              </div>
              <div className="p-6 text-center">
                <h3 className="text-lg font-extrabold text-[#0e2a47] uppercase leading-tight mb-4">Business <br/> Loans</h3>
                <Link to="/register" className="inline-block px-6 py-2 bg-[#b8860b] text-white text-xs font-bold uppercase tracking-wider rounded hover:bg-[#9a7009] transition">
                  Apply Now
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* --- EASY STEPS --- */}
      <div className="py-20 px-6 bg-white text-center border-t border-gray-100">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0e2a47] mb-16">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 bg-blue-50 text-[#0e2a47] rounded-full flex items-center justify-center mb-4 border-2 border-[#0e2a47] font-bold text-2xl">1</div>
              <h3 className="text-xl font-bold text-[#0e2a47]">Easy Application</h3>
              <p className="text-gray-500 mt-2 max-w-xs">Apply right here on our website or visit our offices.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 bg-blue-50 text-[#0e2a47] rounded-full flex items-center justify-center mb-4 border-2 border-[#0e2a47] font-bold text-2xl">2</div>
              <h3 className="text-xl font-bold text-[#0e2a47]">Flexible Options</h3>
              <p className="text-gray-500 mt-2 max-w-xs">Select type of loan and choose a plan that works for you.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 bg-blue-50 text-[#0e2a47] rounded-full flex items-center justify-center mb-4 border-2 border-[#0e2a47] font-bold text-2xl">3</div>
              <h3 className="text-xl font-bold text-[#0e2a47]">Smooth Disbursement</h3>
              <p className="text-gray-500 mt-2 max-w-xs">Once approved, funds are sent to your mobile money or account.</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- FOOTER (Matches Flyer Contacts) --- */}
      <footer className="bg-[#0e2a47] text-white pt-12 pb-6 px-6 border-t-8 border-[#b8860b]">
        <div className="container mx-auto text-center">
          
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-8 text-sm md:text-base">
             <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-[#b8860b]" />
                <span className="font-bold tracking-wide">www.dunkufunds.com</span>
             </div>
             <div className="hidden md:block text-[#b8860b]">|</div>
             <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#b8860b]" />
                <span className="font-bold tracking-wide">dunkubusinesssolutionsltd@gmail.com</span>
             </div>
          </div>

          <div className="flex justify-center gap-6 mb-8">
            <Facebook className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
            <Linkedin className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
            <Instagram className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
            <Twitter className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
          </div>

          <p className="text-xs text-gray-500">© 2025 Dunkuloans. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}