import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/SupabaseClient";
import { useAuth } from "../../context/AuthContext";

const products = [
  {
    id: "marketeer",
    title: "Marketeer Group Loan",
    desc: "Group of 3-10. Daily repayments. 1.67% daily interest.",
    icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
    reqs: ["Active Market Stall", "Group Membership", "NRC Copy"]
  },
  {
    id: "business",
    title: "Business Loan",
    desc: "For registered businesses. 15% interest. 3-12 months.",
    icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    reqs: ["PACRA Registration", "6 Months Bank Statement", "Business Plan"]
  },
  {
    id: "personal",
    title: "Personal / Collateral",
    desc: "Quick cash against assets. 19-40% interest (1-4 weeks).",
    icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    reqs: ["Valid NRC & Selfie (KYC Tier 2)", "Collateral Item (Laptop, Car, etc)", "Proof of Ownership"]
  },
  {
    id: "item",
    title: "Item Loan",
    desc: "Get phones, TVs, and gadgets on credit.",
    icon: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z",
    reqs: ["Payslip / Income Proof", "3 Months Bank Statement", "Down Payment (20%)"]
  }
];

export default function ApplyLoan() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({ amount: "", description: "" });
  const [loading, setLoading] = useState(false);

  // --- HANDLERS ---
  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!formData.amount || Number(formData.amount) <= 0) return alert("Please enter a valid amount");
    setLoading(true);

    try {
      // 1. Create Loan
      const { data: loanData, error: loanError } = await supabase
        .from("loans")
        .insert([
          {
            borrower_id: user.id,
            amount: Number(formData.amount),
            status: "pending",
            total_repayment: Number(formData.amount) * 1.4, // Simplified interest logic
            balance: Number(formData.amount) * 1.4
          }
        ])
        .select()
        .single();

      if (loanError) throw loanError;

      // 2. If collateral description exists, add to collateral table
      if (formData.description && loanData) {
        const { error: colError } = await supabase
          .from("collateral")
          .insert([
            {
              loan_id: loanData.id,
              description: formData.description,
              status: "pending_review",
              estimated_value: 0 // To be updated by admin
            }
          ]);
        if (colError) console.error("Collateral error:", colError);
      }

      alert("Application Submitted Successfully!");
      navigate("/client"); // Changed to /client to match new route

    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      <div className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Apply for a Loan</h1>
          <p className="text-gray-400 mt-1">Choose the product that fits your needs.</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center w-full max-w-lg relative">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold z-10 ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-400'}`}>1</div>
            <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-700'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold z-10 ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-400'}`}>2</div>
            <div className={`flex-1 h-1 mx-2 ${step >= 3 ? 'bg-indigo-600' : 'bg-gray-700'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold z-10 ${step >= 3 ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-400'}`}>3</div>
          </div>
          <div className="absolute flex justify-between w-full max-w-lg pt-12 text-xs font-medium text-gray-400">
            <span className={step >= 1 ? "text-indigo-400" : ""}>Product</span>
            <span className={`pl-4 ${step >= 2 ? "text-indigo-400" : ""}`}>Details</span>
            <span className={step >= 3 ? "text-indigo-400" : ""}>Review</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Form Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* STEP 1: SELECT PRODUCT */}
            {step === 1 && (
              <div className="space-y-4">
                {products.map((p) => (
                  <div 
                    key={p.id} 
                    onClick={() => handleSelectProduct(p)}
                    className="flex items-center gap-4 p-5 bg-gray-800 border border-gray-700 rounded-xl hover:border-indigo-500 hover:bg-gray-800/80 cursor-pointer transition-all group"
                  >
                    <div className="p-3 bg-gray-900 rounded-lg group-hover:bg-indigo-900/20 transition-colors">
                      <svg className="w-6 h-6 text-gray-400 group-hover:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={p.icon}></path>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">{p.title}</h3>
                      <p className="text-sm text-gray-400">{p.desc}</p>
                    </div>
                    <div className="ml-auto text-gray-500 group-hover:text-indigo-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* STEP 2: DETAILS */}
            {step === 2 && (
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
                <h3 className="text-xl font-bold text-white mb-6">Loan Details</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">How much do you need? (ZMW)</label>
                    <input 
                      type="number" 
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 text-lg"
                      placeholder="e.g. 5000"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Collateral / Item Description</label>
                    <textarea 
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                      placeholder="Describe the item you are using as security (e.g. HP Laptop, iPhone 13)"
                      rows="3"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    ></textarea>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button onClick={() => setStep(1)} className="px-6 py-2.5 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700">Back</button>
                    <button onClick={() => setStep(3)} className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-medium flex-1">Next: Review</button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: REVIEW */}
            {step === 3 && (
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
                <h3 className="text-xl font-bold text-white mb-6">Review Application</h3>
                
                <div className="bg-gray-900 rounded-lg p-6 space-y-4 mb-6">
                  <div className="flex justify-between border-b border-gray-800 pb-4">
                    <span className="text-gray-400">Product</span>
                    <span className="font-medium text-white">{selectedProduct?.title}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-800 pb-4">
                    <span className="text-gray-400">Amount Requested</span>
                    <span className="font-medium text-indigo-400 text-lg">K {Number(formData.amount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-800 pb-4">
                    <span className="text-gray-400">Repayment Estimate</span>
                    <span className="font-medium text-white">K {(Number(formData.amount) * 1.4).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-1">Collateral</span>
                    <span className="text-white text-sm">{formData.description || "No collateral specified"}</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setStep(2)} className="px-6 py-2.5 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700">Edit</button>
                  <button 
                    onClick={handleSubmit} 
                    disabled={loading}
                    className="px-6 py-2.5 rounded-lg bg-green-600 text-white hover:bg-green-700 font-medium flex-1 shadow-lg shadow-green-900/20"
                  >
                    {loading ? "Submitting..." : "Submit Application"}
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Right Sidebar: Requirements */}
          <div>
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 sticky top-8">
              <div className="flex items-center gap-2 mb-4 text-indigo-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <h3 className="font-bold text-sm uppercase tracking-wider">Requirements</h3>
              </div>
              
              <ul className="space-y-4">
                {(selectedProduct ? selectedProduct.reqs : products[2].reqs).map((req, index) => (
                  <li key={index} className="flex gap-3 text-sm text-gray-300">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>

              {!selectedProduct && (
                <p className="text-xs text-gray-500 mt-6 pt-4 border-t border-gray-700">
                  Select a loan product to see specific requirements.
                </p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}