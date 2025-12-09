import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      
      {/* --- NAVIGATION BAR --- */}
      <nav className="w-full bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 text-white w-10 h-10 flex items-center justify-center rounded-xl font-bold text-xl">D</div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              Dunku<span className="text-indigo-600">loans</span>
            </span>
          </div>

          {/* Nav Buttons */}
          <div className="flex items-center gap-4">
            <Link 
              to="/login" 
              className="hidden md:inline-block text-slate-600 font-bold hover:text-indigo-600 transition"
            >
              Log in
            </Link>
            <Link 
              to="/register" 
              className="bg-slate-900 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-slate-800 hover:-translate-y-0.5 transition-all transform"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <main className="max-w-7xl mx-auto px-6 py-16 lg:py-24 flex flex-col lg:flex-row items-center justify-between gap-12">
        
        {/* Left Content */}
        <div className="lg:w-1/2 text-center lg:text-left">
          
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-bold mb-8 shadow-sm border border-indigo-100">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
            </span>
            Instant Approvals Available
          </div>

          <h1 className="text-5xl lg:text-7xl font-black text-slate-900 leading-tight mb-6">
            Fund your future <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              in minutes.
            </span>
          </h1>
          
          <p className="text-lg text-slate-500 mb-10 leading-relaxed max-w-lg mx-auto lg:mx-0">
            Dunkuloans provides fast, secure financial support for individuals and businesses in Zambia. No hidden fees, just growth.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            <Link 
              to="/register" 
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl hover:bg-indigo-700 transition flex items-center justify-center gap-2"
            >
              Apply for Loan
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>
            <Link 
              to="/login" 
              className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border-2 border-slate-100 font-bold rounded-2xl hover:border-slate-300 hover:text-slate-900 transition flex items-center justify-center"
            >
              Client Portal
            </Link>
          </div>

          <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 text-sm font-semibold text-slate-400">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              <span>Verified Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              <span>24/7 Support</span>
            </div>
          </div>
        </div>

        {/* Right Visual (The Card Graphic) */}
        <div className="lg:w-1/2 w-full relative">
          {/* Decorative Blob */}
          <div className="absolute top-10 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute -bottom-10 left-10 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse animation-delay-2000"></div>

          {/* The Card */}
          <div className="relative bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 max-w-md mx-auto transform rotate-[-2deg] hover:rotate-0 transition duration-500">
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-2xl">💰</div>
                <div>
                  <div className="font-bold text-slate-900">Loan Status</div>
                  <div className="text-xs text-green-600 font-bold uppercase tracking-wide bg-green-50 px-2 py-1 rounded-full w-fit mt-1">Active</div>
                </div>
              </div>
              <div className="text-slate-300 font-bold text-xl">...</div>
            </div>

            <div className="mb-2 text-slate-500 text-sm font-medium">Total Balance</div>
            <div className="text-4xl font-black text-slate-900 mb-8">K 5,000.00</div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Repayment</span>
                <span className="font-bold text-slate-900">75%</span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 w-3/4 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}