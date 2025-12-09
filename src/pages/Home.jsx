import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-indigo-100">
      
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="text-2xl font-black tracking-tighter text-slate-900">
          Dunku<span className="text-indigo-600">loans</span>
        </div>
        <div className="space-x-4">
          <Link to="/login" className="text-slate-600 font-bold hover:text-indigo-600 transition">
            Login
          </Link>
          <Link to="/register" className="bg-slate-900 text-white px-5 py-2.5 rounded-full font-bold shadow-lg hover:bg-slate-800 transition transform hover:-translate-y-0.5">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-16 pb-24 text-center lg:text-left lg:flex lg:items-center lg:justify-between">
        
        <div className="lg:w-1/2">
          <div className="inline-block bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-bold mb-6 tracking-wide uppercase">
            🚀 Fast & Secure Lending
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-slate-900 leading-tight mb-6">
            Financial growth <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
              made simple.
            </span>
          </h1>
          <p className="text-lg text-slate-500 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
            Access loans instantly with transparent terms. No hidden fees, just straightforward growth for your business and personal needs.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link to="/register" className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl hover:bg-indigo-700 transition flex items-center justify-center gap-2">
              Apply for Loan
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>
            <Link to="/login" className="px-8 py-4 bg-white text-slate-700 border-2 border-slate-100 font-bold rounded-2xl hover:border-slate-300 transition">
              Client Portal
            </Link>
          </div>

          <div className="mt-10 flex items-center gap-6 justify-center lg:justify-start text-sm text-slate-400 font-medium">
            <div className="flex items-center gap-2">
              <span className="bg-green-100 text-green-700 p-1 rounded-full"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></span>
              Instant Approval
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-green-100 text-green-700 p-1 rounded-full"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></span>
              Secure Data
            </div>
          </div>
        </div>

        {/* Visual / Graphic Side */}
        <div className="hidden lg:block lg:w-1/2 relative mt-12 lg:mt-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute bottom-0 left-10 w-96 h-96 bg-violet-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          
          <div className="relative bg-white/50 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl max-w-md mx-auto transform rotate-[-2deg] hover:rotate-0 transition duration-500">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl">D</div>
              <div>
                <div className="font-bold text-slate-900">Loan Approved</div>
                <div className="text-xs text-slate-500">Just now</div>
              </div>
            </div>
            <div className="text-4xl font-black text-slate-900 mb-2">K 5,000.00</div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 w-3/4"></div>
            </div>
            <div className="flex justify-between text-xs font-bold text-slate-400 mt-2">
              <span>Disbursed</span>
              <span>75% Repaid</span>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}