import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Menu, X, Facebook, Twitter, Instagram, Linkedin, Smartphone, 
  Phone, Mail, Globe
} from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- LIVE CALCULATOR STATE ---
  const [amount, setAmount] = useState(500);
  const [months, setMonths] = useState(3);
  
  const serviceFee = 50;
  const interestRate = 0.15; 
  const totalRepayment = amount * (1 + (interestRate * months));
  const monthlyRepayment = totalRepayment / months;

  // --- PRODUCT DATA (ZAMBIAN CONTEXT IMAGES) ---
  const products = [
    {
      title: "COLLATERAL BASED LOANS",
      // Image: Handshake/Deal over assets
      image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=800&auto=format&fit=crop", 
      desc: "Secure funding against your valuable assets with speed."
    },
    {
      title: "MARKETEERS LOANS",
      // Image: Woman in African market with produce (Authentic Zambian context)
      image: "https://images.unsplash.com/photo-1607083206968-13611e3d76db?q=80&w=800&auto=format&fit=crop", 
      desc: "Empowering small scale traders to grow their stock daily."
    },
    {
      title: "ITEM LOANS",
      // Image: Happy person with gadget/phone
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop", 
      desc: "Get the latest gadgets and appliances on flexible credit."
    },
    {
      title: "BUSINESS LOANS",
      // Image: Local entrepreneurs discussing plans
      image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=800&auto=format&fit=crop", 
      desc: "Scalable capital for registered business entities."
    }
  ];

  return (
    <div className="font-sans text-gray-800 bg-white">
      
      {/* --- TOP CONTACT BAR --- */}
      <div className="bg-[#0e2a47] text-white px-6 py-2 flex justify-end items-center gap-6 text-[11px] md:text-xs font-bold border-b border-white/10">
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-[#b8860b]" />
            <span>0776430780 | 0778289080</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-[#b8860b]" />
            <span>dunkubusinesssolutionsltd@gmail.com</span>
          </div>
      </div>

      {/* --- NAVBAR --- */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2">
           <div className="flex flex-col">
             <div className="text-xl md:text-2xl font-black text-[#0e2a47] leading-none tracking-tight">
               DUNKU BUSINESS
             </div>
             <div className="text-[10px] md:text-xs font-bold text-gray-500 tracking-[0.25em] mt-0.5">
               SOLUTIONS LTD
             </div>
             <div className="text-[9px] md:text-[10px] font-medium text-[#b8860b] italic mt-1">
               your ideal home filled with Hope
             </div>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-8 text-xs font-black text-gray-700 uppercase tracking-widest">
          <a href="#" className="hover:text-blue-600 transition-colors">Loans</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Payments</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Investments</a>
          <a href="#" className="hover:text-blue-600 transition-colors">About</a>
        </div>

        <div className="flex items-center gap-4">
          <Link 
            to="/register" 
            className="hidden sm:block px-6 py-2.5 bg-[#15803d] hover:bg-[#166534] text-white font-black rounded uppercase text-[11px] tracking-widest transition shadow-md"
          >
            Apply Now
          </Link>
          <button className="lg:hidden text-gray-700" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t p-6 flex flex-col gap-4 shadow-2xl absolute w-full z-40 animate-in slide-in-from-top">
          <a href="#" className="font-bold text-gray-800 uppercase text-sm">Loans</a>
          <a href="#" className="font-bold text-gray-800 uppercase text-sm">Payments</a>
          <a href="#" className="font-bold text-gray-800 uppercase text-sm">Investments</a>
          <hr />
          <Link to="/register" className="w-full text-center py-3 bg-[#15803d] text-white font-bold rounded uppercase text-sm">Apply Now</Link>
        </div>
      )}

      {/* --- HERO / CALCULATOR SECTION --- */}
      <div className="relative bg-[#0e2a47] min-h-[550px] flex items-center py-12 px-6">
        <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        
        <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
          
          {/* Hero Image - Transaction/Loan Handover Context */}
          <div className="hidden lg:block relative">
             <div className="absolute -inset-2 bg-[#b8860b] rounded-lg opacity-20 blur-lg"></div>
             <div className="border-4 border-white rounded-lg shadow-2xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000&auto=format&fit=crop" 
                  alt="Loan Disbursement" 
                  className="w-full h-[450px] object-cover"
                />
             </div>
          </div>

          {/* Live Calculator */}
          <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full ml-auto border-t-8 border-[#b8860b]">
            <h2 className="text-xl font-black text-[#0e2a47] mb-6 uppercase tracking-tight border-b pb-2">Loan Calculator</h2>
            
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">How much do you need?</label>
                <div className="relative">
                  <span className="absolute left-3 top-3.5 font-bold text-gray-400">K</span>
                  <input 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(Number(e.target.value))} 
                    className="w-full p-4 pl-8 border-2 border-gray-100 rounded bg-gray-50 focus:border-[#15803d] text-2xl font-black text-[#0e2a47] outline-none transition-all" 
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Duration (Months)</label>
                <input 
                  type="number" 
                  value={months} 
                  onChange={(e) => setMonths(Number(e.target.value))} 
                  className="w-full p-4 border-2 border-gray-100 rounded bg-gray-50 focus:border-[#15803d] text-2xl font-black text-[#0e2a47] outline-none transition-all" 
                />
              </div>

              <div className="bg-[#f0fdf4] p-5 rounded-lg border border-green-100 space-y-3">
                <div className="flex justify-between text-xs font-bold text-gray-500 uppercase">
                  <span>Service Fee</span>
                  <span>K {serviceFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-[#15803d] uppercase">
                  <span>You Receive</span>
                  <span>K {(amount - serviceFee).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-gray-900 border-t border-green-200 pt-3">
                  <span className="text-sm font-black uppercase">Monthly Pay</span>
                  <span className="text-2xl font-black text-[#15803d]">K {monthlyRepayment.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                </div>
              </div>

              <button 
                onClick={() => navigate('/register')} 
                className="w-full py-5 bg-[#15803d] hover:bg-[#115e2b] text-white font-black text-sm uppercase tracking-[0.2em] rounded shadow-xl transition transform hover:scale-[1.02] active:scale-95"
              >
                Get This Loan
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- PRODUCT GRID (ZAMBIAN CONTEXT) --- */}
      <div className="py-20 px-6 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-[#0e2a47] uppercase tracking-tighter">Our Products</h2>
            <div className="h-1.5 w-24 bg-[#b8860b] mx-auto mt-4 rounded-full"></div>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, idx) => (
              <div key={idx} className="bg-[#064e3b] rounded-lg shadow-xl overflow-hidden flex flex-col group h-full border-2 border-[#b8860b]/20">
                <div className="h-64 overflow-hidden border-b-4 border-[#b8860b]">
                   <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                </div>
                <div className="p-6 text-center flex-1 flex flex-col justify-between bg-[#064e3b]">
                   <div>
                     <h3 className="text-white font-black text-sm md:text-base leading-tight uppercase mb-3 tracking-wide">
                        {product.title}
                     </h3>
                     <p className="text-white/60 text-[11px] mb-6 leading-relaxed">
                        {product.desc}
                     </p>
                   </div>
                   <button 
                    onClick={() => navigate('/register')}
                    className="w-full py-2 border-2 border-[#b8860b] text-[#b8860b] hover:bg-[#b8860b] hover:text-white font-bold text-[10px] uppercase tracking-[0.2em] transition"
                   >
                     Apply Now
                   </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- EASY STEPS --- */}
      <div className="py-20 px-6 bg-white text-center border-t border-gray-100">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0e2a47] mb-16">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 bg-[#b8860b] text-white rounded-full flex items-center justify-center mb-4 font-bold text-2xl shadow-lg">1</div>
              <h3 className="text-xl font-bold text-[#0e2a47]">Easy Application</h3>
              <p className="text-gray-500 mt-2 max-w-xs">Apply right here on our website or visit our offices.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 bg-[#b8860b] text-white rounded-full flex items-center justify-center mb-4 font-bold text-2xl shadow-lg">2</div>
              <h3 className="text-xl font-bold text-[#0e2a47]">Flexible Options</h3>
              <p className="text-gray-500 mt-2 max-w-xs">Select type of loan and choose a plan that works for you.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 bg-[#b8860b] text-white rounded-full flex items-center justify-center mb-4 font-bold text-2xl shadow-lg">3</div>
              <h3 className="text-xl font-bold text-[#0e2a47]">Smooth Disbursement</h3>
              <p className="text-gray-500 mt-2 max-w-xs">Once approved, funds are sent to your mobile money or account.</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- FOOTER (EXACT CONTACT MATCH) --- */}
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
             <div className="hidden md:block text-[#b8860b]">|</div>
             <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#b8860b]" />
                <span className="font-bold tracking-wide">0776430780 | 0778289080</span>
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