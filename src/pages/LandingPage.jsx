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

  // --- PRODUCT DATA (AUTHENTIC ZAMBIAN/AFRICAN CONTEXT) ---
  const products = [
    {
      title: "COLLATERAL BASED LOANS",
      // Image: Black hands shaking / business deal
      image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=800&auto=format&fit=crop", 
      desc: "Secure funding against your valuable assets with speed."
    },
    {
      title: "MARKETEERS LOANS",
      // Image: African market woman with produce (Authentic context)
      image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?q=80&w=800&auto=format&fit=crop", 
      desc: "Empowering small scale traders to grow their stock daily."
    },
    {
      title: "ITEM LOANS",
      // Image: Black individual using technology/laptop
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop", 
      desc: "Get the latest gadgets and appliances on flexible credit."
    },
    {
      title: "BUSINESS LOANS",
      // Image: Black entrepreneurs discussing business
      image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=800&auto=format&fit=crop", 
      desc: "Scalable capital for registered business entities."
    }
  ];

  // Helper to scroll to section
  const scrollToSection = (id) => {
    setMobileMenuOpen(false); // Close mobile menu if open
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

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

        {/* Desktop Menu - UPGRADED LINKS */}
        <div className="hidden lg:flex items-center gap-8 text-xs font-black text-gray-700 uppercase tracking-widest">
          <button onClick={() => scrollToSection('products')} className="hover:text-blue-600 transition-colors">Loans</button>
          <button onClick={() => scrollToSection('steps')} className="hover:text-blue-600 transition-colors">Payments</button>
          <button onClick={() => scrollToSection('invest-promo')} className="hover:text-blue-600 transition-colors">Investments</button>
          <button onClick={() => scrollToSection('about-footer')} className="hover:text-blue-600 transition-colors">About</button>
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

      {/* Mobile Menu - UPGRADED LINKS */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t p-6 flex flex-col gap-4 shadow-2xl absolute w-full z-40 animate-in slide-in-from-top">
          <button onClick={() => scrollToSection('products')} className="text-left font-bold text-gray-800 uppercase text-sm">Loans</button>
          <button onClick={() => scrollToSection('steps')} className="text-left font-bold text-gray-800 uppercase text-sm">Payments</button>
          <button onClick={() => scrollToSection('invest-promo')} className="text-left font-bold text-gray-800 uppercase text-sm">Investments</button>
          <button onClick={() => scrollToSection('about-footer')} className="text-left font-bold text-gray-800 uppercase text-sm">About</button>
          <hr />
          <Link to="/register" className="w-full text-center py-3 bg-[#15803d] text-white font-bold rounded uppercase text-sm">Apply Now</Link>
        </div>
      )}

      {/* --- HERO / CALCULATOR SECTION --- */}
      <div className="relative bg-[#0e2a47] min-h-[550px] flex items-center py-12 px-6">
        <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        
        <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
          
          {/* Hero Image - Authentic African Professional Context */}
          <div className="hidden lg:block relative">
             <div className="absolute -inset-2 bg-[#b8860b] rounded-lg opacity-20 blur-lg"></div>
             <div className="border-4 border-white rounded-lg shadow-2xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=1000&auto=format&fit=crop" 
                  alt="Zambian Professional" 
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

      {/* --- PRODUCT GRID (TARGET FOR 'LOANS' LINK) --- */}
      <div id="products" className="py-20 px-6 bg-gray-50 scroll-mt-20">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-[#0e2a47] uppercase tracking-tighter">Our Products</h2>
            <div className="h-1.5 w-24 bg-[#b8860b] mx-auto mt-4 rounded-full"></div>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, idx) => (
              <div key={idx} className="bg-[#064e3b] rounded-lg shadow-xl overflow-hidden flex flex-col group h-full border-2 border-[#b8860b]/20">
                <div className="h-64 overflow-hidden border-b-4 border-[#b8860b]">
                   {/* Images are now verified black subjects / African context */}
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

      {/* --- EASY STEPS (TARGET FOR 'PAYMENTS' LINK) --- */}
      <div id="steps" className="py-20 px-6 bg-white text-center border-t border-gray-100 scroll-mt-20">
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

      {/* --- APP PROMO (TARGET FOR 'INVESTMENTS' LINK) --- */}
      <div id="invest-promo" className="bg-[#0e2a47] text-white py-20 px-6 relative overflow-hidden scroll-mt-20">
        {/* Background elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#133457] rounded-l-[100px] hidden md:block"></div>

        <div className="container mx-auto relative z-10 flex flex-col md:flex-row items-center gap-12">
          
          <div className="flex-1 space-y-6">
             <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">Money when <br/> you need it</h2>
             <p className="text-lg text-gray-300 max-w-md">Manage payments, secure loans, and <strong>invest smartly</strong> with the Dunkuloans platform.</p>
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

      {/* --- FOOTER (TARGET FOR 'ABOUT' LINK) --- */}
      <footer id="about-footer" className="bg-[#0e2a47] text-white pt-12 pb-6 px-6 border-t-8 border-[#b8860b] scroll-mt-10">
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