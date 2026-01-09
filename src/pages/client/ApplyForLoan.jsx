import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/SupabaseClient";
import { useAuth } from "../../context/AuthContext";

// --- LOAN PRODUCT CONFIGURATION ---
const products = [
  {
    id: "marketeer",
    title: "Marketeer Group Loan",
    desc: "Group of 3-10. Daily repayments. 1.67% daily interest.",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    reqs: ["Valid NRC & Selfie (KYC Tier 2)", "Active Mobile Money Account", "Min 3 Group Members"]
  },
  {
    id: "business",
    title: "Business Loan",
    desc: "For registered businesses. 15% interest. 3-12 months.",
    icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    reqs: ["Valid NRC & Selfie (KYC Tier 2)", "Active Mobile Money Account", "Business Registration (PACRA)"]
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
    reqs: ["Valid NRC & Selfie (KYC Tier 2)", "Active Mobile Money Account"]
  }
];

// Mock Items for Item Loan
const gadgetItems = [
  { id: 1, name: "Samsung Galaxy A14", specs: "64GB, Black", price: 3500, img: "https://images.samsung.com/is/image/samsung/p6pim/za/a145fzkdafa/gallery/za-galaxy-a14-a145-sm-a145fzkdafa-thumb-536248906" },
  { id: 2, name: "iPhone 11 (Refurbished)", specs: "128GB, White", price: 6500, img: "https://support.apple.com/library/APPLE/APPLECARE_ALLGEOS/SP804/sp804-iphone11_2x.png" },
];

export default function ApplyLoan() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form States
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  
  // Marketeer State
  const [groupMembers, setGroupMembers] = useState([]);
  
  // Item Loan State
  const [selectedItem, setSelectedItem] = useState(null);
  const [months, setMonths] = useState(3);

  // Personal Loan State
  const [weeks, setWeeks] = useState(4); 

  // File Uploads State
  const [files, setFiles] = useState({}); 
  const [uploadingDoc, setUploadingDoc] = useState(null); 
  
  const fileInputRef = useRef(null);
  const [currentDocType, setCurrentDocType] = useState(null); 

  // --- HANDLERS ---
  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setStep(2);
    setAmount("");
    setGroupMembers([]);
    setSelectedItem(null);
    setFiles({});
    setWeeks(4);
  };

  const handleUploadClick = (docType) => {
    setCurrentDocType(docType);
    if(fileInputRef.current) fileInputRef.current.click();
  };

  const handleRemoveFile = (docType, e) => {
    e.stopPropagation();
    const newFiles = { ...files };
    delete newFiles[docType];
    setFiles(newFiles);
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file || !currentDocType) return;

    setUploadingDoc(currentDocType);

    try {
      // 1. Sanitize file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}_${currentDocType.replace(/\s/g, '_')}.${fileExt}`;

      // 2. Upload
      const { error } = await supabase.storage.from("loan_docs").upload(fileName, file);
      if (error) throw error;

      // 3. Get URL
      const { data: urlData } = supabase.storage.from("loan_docs").getPublicUrl(fileName);
      
      setFiles(prev => ({
        ...prev,
        [currentDocType]: urlData.publicUrl
      }));

    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploadingDoc(null);
      if(fileInputRef.current) fileInputRef.current.value = ""; 
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    let finalAmount = amount;
    let finalDescription = description;
    let calculatedRepayment = 0;
    let collateralImages = []; // Array to store image URLs for DB

    // --- LOGIC PER PRODUCT ---
    if (selectedProduct.id === "item") {
      if (!selectedItem) { setLoading(false); return alert("Please select an item"); }
      finalAmount = selectedItem.price;
      finalDescription = `Item Loan: ${selectedItem.name} (${selectedItem.specs})`;
      calculatedRepayment = Number(finalAmount) * 1.4;

    } else if (selectedProduct.id === "marketeer") {
      finalDescription = `Group Loan (${groupMembers.length} members)`;
      calculatedRepayment = Number(finalAmount) * 1.4; 

    } else if (selectedProduct.id === "business") {
      // Collect business files
      collateralImages = Object.values(files); 
      finalDescription = `Business Loan.`;
      calculatedRepayment = Number(finalAmount) * 1.15;

    } else if (selectedProduct.id === "personal") {
      // Collateral Logic
      const rates = { 1: 0.19, 2: 0.26, 3: 0.33, 4: 0.40 };
      const rate = rates[weeks] || 0.40;
      calculatedRepayment = Number(finalAmount) * (1 + rate);
      
      collateralImages = Object.values(files); // Extract just URLs
      finalDescription = `Personal Loan (${weeks} Weeks).\nCollateral Desc: ${description}`;
    }

    if (!finalAmount || Number(finalAmount) <= 0) {
      setLoading(false);
      return alert("Please enter a valid amount");
    }

    try {
      // 1. Create Loan Record
      const { data: loanData, error: loanError } = await supabase
        .from("loans")
        .insert([
          {
            borrower_id: user.id,
            amount: Number(finalAmount),
            status: "pending",
            type: selectedProduct.id, // Good to track type
            total_repayment: calculatedRepayment,
            balance: calculatedRepayment
          }
        ])
        .select()
        .single();

      if (loanError) throw loanError;

      // 2. Create Collateral Record
      // Note: Ensure your 'collateral' table has a 'images' column (jsonb) 
      // or simply store them in description if you prefer.
      if (selectedProduct.id === 'personal' || Object.keys(files).length > 0) {
        await supabase.from("collateral").insert([{
            loan_id: loanData.id,
            description: finalDescription,
            status: "pending_review",
            estimated_value: 0, 
            attachments: collateralImages // Requires 'attachments' column in DB (type: jsonb or text[])
        }]);
      }

      alert("Application Submitted Successfully!");
      navigate("/client");

    } catch (err) {
      alert("Error: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">
            {step === 1 ? "Apply for a Loan" : selectedProduct?.title}
          </h1>
          <p className="text-gray-400 mt-1">
            {step === 1 ? "Choose the product that fits your needs." : "Provide the required details below."}
          </p>
        </div>

        {/* Stepper UI */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center w-full max-w-lg relative">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold z-10 ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-400'}`}>1</div>
            <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-700'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold z-10 ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-400'}`}>2</div>
            <div className={`flex-1 h-1 mx-2 ${step >= 3 ? 'bg-indigo-600' : 'bg-gray-700'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold z-10 ${step >= 3 ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-400'}`}>3</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            
            {/* STEP 1: PRODUCT SELECTION */}
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
                  </div>
                ))}
              </div>
            )}

            {/* STEP 2: DETAILS */}
            {step === 2 && (
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 md:p-8">
                
                {/* --- PERSONAL LOAN FORM (COLLATERAL FEATURE) --- */}
                {selectedProduct.id === 'personal' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Requested Amount (ZMW)</label>
                      <input 
                        type="number" 
                        className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-indigo-500 outline-none"
                        value={amount} 
                        onChange={(e) => setAmount(e.target.value)} 
                        placeholder="0.00"
                      />
                    </div>

                    {/* DURATION SLIDER */}
                    <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
                      <div className="flex justify-between text-sm text-gray-300 mb-2">
                          <span className="font-bold">Duration</span>
                          <span className="text-indigo-400 font-bold">{weeks} Weeks</span>
                      </div>
                      <input 
                        type="range" min="1" max="4" step="1" 
                        value={weeks} 
                        onChange={(e) => setWeeks(Number(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                          <span>1 Week (19%)</span>
                          <span>4 Weeks (40%)</span>
                      </div>
                      
                      {amount && (
                          <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between items-center">
                            <span className="text-gray-400 text-sm">Total Repayment:</span>
                            <span className="text-xl font-bold text-green-400">
                              K {(Number(amount) * (1 + ({1: 0.19, 2: 0.26, 3: 0.33, 4: 0.40}[weeks] || 0.40))).toLocaleString(undefined, {maximumFractionDigits: 2})}
                            </span>
                          </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Collateral Description</label>
                      <textarea 
                        className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-indigo-500 outline-none" 
                        rows="3" 
                        value={description} 
                        onChange={e=>setDescription(e.target.value)}
                        placeholder="E.g., 2021 HP Spectre Laptop, Silver, Serial #12345"
                      ></textarea>
                    </div>

                    {/* IMPROVED UPLOAD GRID */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-3">Upload Collateral Evidence</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {["Collateral Front", "Collateral Back", "Proof of Ownership"].map(doc => (
                          <div 
                            key={doc} 
                            onClick={() => !files[doc] && handleUploadClick(doc)}
                            className={`relative border-2 border-dashed rounded-lg h-32 flex flex-col items-center justify-center text-center transition overflow-hidden group
                              ${files[doc] ? 'border-green-500/50 bg-gray-900' : 'border-gray-700 hover:bg-gray-700/50 cursor-pointer'}
                            `}
                          >
                            {uploadingDoc === doc ? (
                              <span className="text-xs text-yellow-500 animate-pulse">Uploading...</span>
                            ) : files[doc] ? (
                              <>
                                <img src={files[doc]} alt="Uploaded" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition" />
                                <div className="z-10 flex flex-col items-center">
                                  <span className="text-xs text-green-400 font-bold bg-black/50 px-2 py-1 rounded mb-2">✓ Uploaded</span>
                                  {/* Delete Button */}
                                  <button 
                                    onClick={(e) => handleRemoveFile(doc, e)}
                                    className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded shadow"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </>
                            ) : (
                              <>
                                <span className="text-2xl text-gray-500 mb-1">+</span>
                                <span className="text-gray-400 text-xs font-medium">{doc}</span>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* --- ITEM LOAN FORM --- */}
                {selectedProduct.id === 'item' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      {gadgetItems.map(item => (
                        <div key={item.id} onClick={() => setSelectedItem(item)} className={`cursor-pointer bg-white rounded-xl overflow-hidden border-2 ${selectedItem?.id === item.id ? 'border-indigo-500 shadow-lg' : 'border-transparent opacity-80 hover:opacity-100'}`}>
                          <div className="h-32 bg-gray-100 flex items-center justify-center"><img src={item.img} alt={item.name} className="h-full object-contain" /></div>
                          <div className="p-3"><h4 className="font-bold text-gray-900 text-sm">{item.name}</h4><p className="text-indigo-600 font-bold mt-1">K {item.price.toLocaleString()}</p></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                 {/* --- BUSINESS FORM --- */}
                 {selectedProduct.id === 'business' && (
                    <div className="space-y-6">
                      <input type="number" placeholder="Requested Capital" className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white" value={amount} onChange={(e) => setAmount(e.target.value)} />
                      <div className="grid grid-cols-2 gap-4">
                          {["Business Reg", "Financials"].map(doc => (
                              <button key={doc} onClick={()=>handleUploadClick(doc)} className="border border-gray-700 border-dashed p-4 text-gray-400 rounded hover:bg-gray-700">
                                {files[doc] ? "✓ Uploaded " + doc : "Upload " + doc}
                              </button>
                          ))}
                      </div>
                    </div>
                 )}


                <div className="flex gap-4 pt-8">
                  <button onClick={() => setStep(1)} className="px-6 py-2.5 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700">Back</button>
                  <button onClick={() => setStep(3)} className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-medium flex-1">Next Step →</button>
                </div>
              </div>
            )}

            {/* STEP 3: REVIEW */}
            {step === 3 && (
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
                <h3 className="text-xl font-bold text-white mb-6">Review Application</h3>
                <div className="bg-gray-900 rounded-lg p-6 space-y-4 mb-6">
                  <div className="flex justify-between border-b border-gray-800 pb-4"><span className="text-gray-400">Product</span><span className="font-medium text-white">{selectedProduct?.title}</span></div>
                  {selectedProduct.id !== 'item' && <div className="flex justify-between border-b border-gray-800 pb-4"><span className="text-gray-400">Amount</span><span className="font-medium text-white">K {Number(amount).toLocaleString()}</span></div>}
                  
                  {/* Show Uploaded Files Count */}
                  {Object.keys(files).length > 0 && (
                     <div className="flex justify-between border-b border-gray-800 pb-4"><span className="text-gray-400">Files Attached</span><span className="font-medium text-green-400">{Object.keys(files).length} Files</span></div>
                  )}
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setStep(2)} className="px-6 py-2.5 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700">Edit</button>
                  <button onClick={handleSubmit} disabled={loading} className="px-6 py-2.5 rounded-lg bg-green-600 text-white hover:bg-green-700 font-medium flex-1 shadow-lg shadow-green-900/20">{loading ? "Submitting..." : "Confirm & Submit"}</button>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div>
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 sticky top-8">
              <h3 className="font-bold text-sm uppercase tracking-wider text-indigo-400 mb-4">Requirements</h3>
              <ul className="space-y-4">
                {(selectedProduct ? selectedProduct.reqs : products[0].reqs).map((req, index) => (
                  <li key={index} className="flex gap-3 text-sm text-gray-300">
                    <span className="text-green-500">✓</span> {req}
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </div>
      
      {/* File Input (Hidden) */}
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,.pdf" />
    </div>
  );
}