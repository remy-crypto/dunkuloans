import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Menu, X, Facebook, Twitter, Instagram, Linkedin, Smartphone, 
  Phone, Mail, Globe, Check, Clock, Calendar, Percent, Handshake, Users, Home, HelpCircle, User, Briefcase, ShoppingBag
} from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- LIVE CALCULATOR STATE ---
  // Fix: Default is 500, but logic handles empty string so '0' doesn't get stuck
  const [amount, setAmount] = useState(500);
  const [weeks, setWeeks] = useState(4); 
  
  const serviceFee = 50;
  
  // Specific Interest Rates based on Weeks
  const rates = {
    1: 0.19, // 19%
    2: 0.26, // 26%
    3: 0.33, // 33%
    4: 0.40  // 40%
  };

  const currentRate = rates[weeks];
  
  // Fix: Handle empty string state for calculation to avoid NaN
  const numericAmount = amount === "" ? 0 : Number(amount);
  const totalRepayment = numericAmount * (1 + currentRate);
  
  // Calculate Due Date based on weeks selected
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + (weeks * 7));

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
      // Image: African market woman with produce
      image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?q=80&w=800&auto=format&fit=crop", 
      desc: "Empowering small scale traders to grow their stock daily."
    },
    {
      title: "ITEM LOANS",
      // Image: Black individual using technology
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop", 
      desc: "Get the latest gadgets and appliances on flexible credit."
    },
    {
      title: "BUSINESS LOANS",
      // Image: Black entrepreneurs
      image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=800&auto=format&fit=crop", 
      desc: "Scalable capital for registered business entities."
    }
  ];

  // --- FAQ DATA ---
  const faqs = [
    { q: "What types of loans do you offer?", a: "We offer Collateral Loans, Item Loans, Marketeer (Group Loans), and Business Loans." },
    { q: "What can I use as collateral for a Collateral Loan?", a: "You can use various items like phones, laptops, cars, stoves, fridges, and more as collateral." },
    { q: "What are the interest rates for Collateral Loans?", a: "Our interest rates for Collateral Loans are: 1 week: 19%, 2 weeks: 26%, 3 weeks: 33%, 4 weeks: 40%." },
    { q: "How does Item Loan work?", a: "With Item Loan, you get an item like a phone, laptop, or vehicle on loan and repay us on a monthly basis." },
    { q: "What is Marketeer (Group Loan)?", a: "Marketeer is a group loan where a minimum of 3 people can apply together. The daily interest rate is 1.667% for 30 days." },
    { q: "Do you offer loans for businesses?", a: "Yes, we offer Business Loans to support your business needs. Please contact us for more information." },
    { q: "Do I need to send money to agents to get a loan?", a: "No, you don't need to send money to agents. We have our own official payment numbers, no middlemen." },
    { q: "How quickly are loans disbursed?", a: "We disburse all loan amounts within 24 hours, Monday to Saturday." },
    { q: "What are your working hours and days?", a: "Our working hours are Monday to Saturday, 09:00hrs to 17:00hrs." },
    { q: "How do I apply for a loan?", a: "A: You can visit our office for a Physical application. B: You can apply online using our Website or contact us to discuss your loan options and apply." },
    { q: "What are the repayment terms?", a: "Repayment terms vary depending on the loan type. Please check with us for specific details." },
    { q: "Is there any penalty for late repayment?", a: "Yes, late repayment may incur additional charges. Please contact us to discuss your situation." },
  ];

  // Helper to scroll to section
  const scrollToSection = (id) => {
    setMobileMenuOpen(false); 
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
      <nav className="flex items-center justify-between px-6 py-4 bg-white sticky top-0 z-50 shadow-sm border-b border-gray-100">
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

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-8 text-xs font-black text-gray-700 uppercase tracking-widest">
          <button onClick={() => scrollToSection('products')} className="hover:text-blue-600 transition-colors">Loans</button>
          <button onClick={() => scrollToSection('steps')} className="hover:text-blue-600 transition-colors">Payments</button>
          <button onClick={() => scrollToSection('invest-promo')} className="hover:text-blue-600 transition-colors">Investments</button>
          <button onClick={() => scrollToSection('about-us')} className="hover:text-blue-600 transition-colors">About</button>
          <button onClick={() => scrollToSection('faqs')} className="hover:text-blue-600 transition-colors">FAQs</button>
          <Link to="/login" className="text-blue-600 hover:text-blue-800 transition-colors">Login</Link>
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
          <button onClick={() => scrollToSection('products')} className="text-left font-bold text-gray-800 uppercase text-sm">Loans</button>
          <button onClick={() => scrollToSection('steps')} className="text-left font-bold text-gray-800 uppercase text-sm">Payments</button>
          <button onClick={() => scrollToSection('invest-promo')} className="text-left font-bold text-gray-800 uppercase text-sm">Investments</button>
          <button onClick={() => scrollToSection('about-us')} className="text-left font-bold text-gray-800 uppercase text-sm">About Us</button>
          <button onClick={() => scrollToSection('faqs')} className="text-left font-bold text-gray-800 uppercase text-sm">FAQs</button>
          <Link to="/login" className="text-left font-bold text-blue-600 uppercase text-sm">Sign In</Link>
          <hr />
          <Link to="/register" className="w-full text-center py-3 bg-[#15803d] text-white font-bold rounded uppercase text-sm">Apply Now</Link>
        </div>
      )}

      {/* --- HERO / CALCULATOR SECTION --- */}
      <div className="relative bg-[#0e2a47] min-h-[550px] flex items-center py-12 px-6">
        <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        
        <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
          
          {/* Hero Image - UPDATED: Pointing to local file 'zambian-deal.jpg' in public folder */}
          <div className="hidden lg:block relative">
             <div className="absolute -inset-2 bg-[#b8860b] rounded-lg opacity-20 blur-lg"></div>
             <div className="border-4 border-white rounded-lg shadow-2xl overflow-hidden">
                <img 
                  src="/zambian-deal.jpg" 
                  alt="Zambian Business Transaction" 
                  className="w-full h-[450px] object-cover"
                />
             </div>
          </div>

          {/* Live Calculator (FIXED ZERO ISSUE) */}
          <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full ml-auto border-t-8 border-[#b8860b]">
            <h2 className="text-xl font-black text-[#0e2a47] mb-6 uppercase tracking-tight border-b pb-2">Loan Calculator</h2>
            
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">How much do you need?</label>
                <div className="relative">
                  <span className="absolute left-3 top-3.5 font-bold text-gray-400">K</span>
                  {/* FIX: Input now allows empty string to avoid '0' sticking */}
                  <input 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))} 
                    className="w-full p-4 pl-8 border-2 border-gray-100 rounded bg-gray-50 focus:border-[#15803d] text-2xl font-black text-[#0e2a47] outline-none transition-all" 
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Duration</label>
                  <span className="text-sm font-bold text-[#0e2a47]">{weeks} {weeks === 1 ? 'Week' : 'Weeks'}</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="4" 
                  step="1"
                  value={weeks} 
                  onChange={(e) => setWeeks(Number(e.target.value))} 
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#b8860b]"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1 uppercase font-bold">
                   <span>1 Wk (19%)</span>
                   <span>4 Wks (40%)</span>
                </div>
              </div>

              <div className="bg-[#f0fdf4] p-5 rounded-lg border border-green-100 space-y-3">
                <div className="flex justify-between text-xs font-bold text-gray-500 uppercase">
                  <span>Interest Rate</span>
                  <span>{(currentRate * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-[#15803d] uppercase">
                  <span>You Receive</span>
                  <span>K {(numericAmount - serviceFee).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-gray-900 border-t border-green-200 pt-3">
                  <span className="text-sm font-black uppercase">Total Repayment</span>
                  <span className="text-2xl font-black text-[#15803d]">K {totalRepayment.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                </div>
                <div className="text-[10px] text-center text-gray-500 font-medium">
                   Due Date: {dueDate.toLocaleDateString()}
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

      {/* --- PRODUCT GRID --- */}
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

      {/* --- APP PROMO --- */}
      <div id="invest-promo" className="bg-[#0e2a47] text-white py-20 px-6 relative overflow-hidden scroll-mt-20">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#133457] rounded-l-[100px] hidden md:block"></div>
        <div className="container mx-auto relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
             <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">Money when <br/> you need it</h2>
             <p className="text-lg text-gray-300 max-w-md">Manage payments, secure loans, and invest smartly with the Dunkuloans platform.</p>
             <button onClick={() => navigate('/register')} className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg text-lg transition">Get the app</button>
          </div>
          <div className="flex-1 relative flex justify-center">
             <div className="w-[300px] h-[600px] bg-black rounded-[3rem] border-8 border-gray-800 shadow-2xl relative overflow-hidden bg-white">
                <div className="h-full w-full bg-white text-gray-900 p-4 pt-12">
                   <div className="bg-blue-600 text-white p-6 rounded-2xl mb-4 shadow-lg"><p className="text-sm opacity-90">Wallet Balance</p><p className="text-3xl font-bold">K 9,846.90</p></div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* --- ABOUT US SECTION --- */}
      <div id="about-us" className="py-20 px-6 bg-gray-50 scroll-mt-20">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-black text-[#0e2a47] uppercase tracking-tighter">About Us</h2>
            <div className="h-1.5 w-24 bg-[#b8860b] mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl border-t-8 border-[#0e2a47] mb-12">
            <p className="text-gray-600 leading-relaxed mb-6 text-lg">
              <strong className="text-[#0e2a47]">Dunku Business Solutions Ltd</strong> is a leading financial services provider in Zambia, offering a range of loan products to individuals and businesses. Our mission is to provide quick, flexible, and affordable financial solutions to our customers.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              With a team of experienced professionals, we are committed to delivering excellent customer service and support. We understand that every customer's financial situation is unique, and we strive to provide personalized solutions to meet their needs.
            </p>
            <p className="text-gray-600 leading-relaxed mb-10">
              Our loan products include Collateral Loans, Item Loans, Marketeer (Group Loans), and Business Loans, designed to help you achieve your financial goals. We are committed to transparency, integrity, and fairness in all our dealings, and we aim to build long-term relationships with our customers.
            </p>

            <h3 className="text-2xl font-bold text-[#0e2a47] mb-6">Our Values</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {["Customer-centric approach", "Transparency and integrity", "Flexibility and adaptability", "Excellence in service delivery"].map((val, i) => (
                <div key={i} className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div className="bg-[#b8860b] rounded-full p-1 text-white"><Check className="w-4 h-4"/></div>
                  <span className="font-bold text-gray-700">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* --- FAQs SECTION --- */}
      <div id="faqs" className="py-20 px-6 bg-white border-t border-gray-100 scroll-mt-20">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-black text-[#0e2a47] uppercase tracking-tighter">FAQs</h2>
            <p className="text-gray-500 mt-4">Common questions about our services.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-gray-50 p-6 rounded-xl border border-gray-100 hover:border-blue-100 transition shadow-sm">
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-6 h-6 text-[#b8860b] flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-[#0e2a47] mb-2">{faq.q}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#f0f9ff] p-6 rounded-xl border border-blue-100 mt-12 text-center">
            <h3 className="text-xl font-bold text-[#0e2a47] mb-2">Still have questions?</h3>
            <p className="text-gray-600 mb-6">If you have any questions or would like to learn more about our services, please don't hesitate to contact us.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
                <div className="flex items-center justify-center gap-2 font-bold text-blue-800"><Phone className="w-5 h-5"/> 0776430780 | 0778289080</div>
                <div className="flex items-center justify-center gap-2 font-bold text-blue-800"><Mail className="w-5 h-5"/> dunkubusinesssolutionsltd@gmail.com</div>
            </div>
          </div>
        </div>
      </div>

      {/* --- ADVANTAGES SECTION --- */}
      <div className="py-20 px-6 bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
             <h2 className="text-3xl md:text-5xl font-black text-[#0e2a47] uppercase tracking-tighter">Advantages of Choosing Us</h2>
             <p className="text-gray-600 font-medium mt-2">Fast, Flexible, and Transparent Financial Solutions.</p>
             <div className="h-1.5 w-24 bg-[#b8860b] mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { title: "Quick Disbursement", desc: "We disburse loans within 24 hours, Monday to Saturday.", icon: <Clock className="w-8 h-8 text-[#0e2a47]"/> },
              { title: "Flexible Repayment Terms", desc: "Choose a repayment plan that suits your financial situation.", icon: <Calendar className="w-8 h-8 text-[#0e2a47]"/> },
              { title: "Competitive Interest Rates", desc: "Our rates are designed to be affordable and transparent.", icon: <Percent className="w-8 h-8 text-[#0e2a47]"/> },
              { title: "No Agent Payments", desc: "Make payments directly to our official payment numbers, no middlemen.", icon: <Handshake className="w-8 h-8 text-[#0e2a47]"/> },
              { title: "Personalized Service", desc: "Our experienced team provides tailored solutions to meet your needs.", icon: <Users className="w-8 h-8 text-[#0e2a47]"/> },
              { title: "Convenient Working Hours", desc: "We're open Monday to Saturday, 09:00hrs to 17:00hrs.", icon: <Clock className="w-8 h-8 text-[#0e2a47]"/> },
              { title: "Variety of Loan Products", desc: "Choose from Collateral Loans, Item Loans, Marketeer (Group Loans), and Business Loans.", icon: <Home className="w-8 h-8 text-[#0e2a47]"/> },
            ].map((adv, i) => (
              <div key={i} className="bg-white p-6 rounded-xl border-2 border-[#b8860b] shadow-sm hover:shadow-lg transition text-center flex flex-col items-center">
                 <div className="mb-4">{adv.icon}</div>
                 <h3 className="font-bold text-[#0e2a47] mb-2">{adv.title}</h3>
                 <p className="text-xs text-gray-600 leading-relaxed">{adv.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- FOOTER --- */}
      <footer className="bg-[#0e2a47] text-white pt-12 pb-6 px-6 border-t-8 border-[#b8860b]">
        <div className="container mx-auto text-center">
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-8 text-sm md:text-base">
             <div className="flex items-center gap-3"><Globe className="w-5 h-5 text-[#b8860b]" /><span className="font-bold tracking-wide">www.dunkufunds.com</span></div>
             <div className="hidden md:block text-[#b8860b]">|</div>
             <div className="flex items-center gap-3"><Mail className="w-5 h-5 text-[#b8860b]" /><span className="font-bold tracking-wide">dunkubusinesssolutionsltd@gmail.com</span></div>
             <div className="hidden md:block text-[#b8860b]">|</div>
             <div className="flex items-center gap-3"><Phone className="w-5 h-5 text-[#b8860b]" /><span className="font-bold tracking-wide">0776430780 | 0778289080</span></div>
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