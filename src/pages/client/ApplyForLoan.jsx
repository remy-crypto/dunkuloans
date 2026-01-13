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

// Mock Items
const gadgetItems = [
  { id: 1, name: "Samsung Galaxy A14", specs: "64GB, Black", price: 3500, img: "https://images.samsung.com/is/image/samsung/p6pim/za/a145fzkdafa/gallery/za-galaxy-a14-a145-sm-a145fzkdafa-thumb-536248906" },
  { id: 2, name: "iPhone 11 (Refurbished)", specs: "128GB, White", price: 6500, img: "https://support.apple.com/library/APPLE/APPLECARE_ALLGEOS/SP804/sp804-iphone11_2x.png" },
  { id: 3, name: "Hisense 32\" Smart TV", specs: "HD, Netflix Ready", price: 2800, img: "https://m.media-amazon.com/images/I/71L-l+4-eHL._AC_SL1500_.jpg" },
  { id: 4, name: "HP Laptop 15\"", specs: "Core i3, 8GB RAM", price: 8000, img: "https://ssl-product-images.www8-hp.com/digmedialib/prodimg/lowres/c06746864.png" }
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
  const [newMember, setNewMember] = useState({ name: "", nrc: "", phone: "", income: "", market: "", reason: "", address: "" });

  // Item Loan State
  const [selectedItem, setSelectedItem] = useState(null);
  const [months, setMonths] = useState(3);

  // Personal Loan State (New)
  const [weeks, setWeeks] = useState(4); // Default 4 weeks

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

  const handleAddMember = () => {
    if(!newMember.name || !newMember.nrc) return alert("Name and NRC required");
    setGroupMembers([...groupMembers, newMember]);
    setNewMember({ name: "", nrc: "", phone: "", income: "", market: "", reason: "", address: "" });
  };

  const handleUploadClick = (docType) => {
    setCurrentDocType(docType);
    fileInputRef.current.click();
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
      const fileName = `${user.id}/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage.from("loan_docs").upload(fileName, file);

      if (error) throw error;

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
    let collateralImages = []; 

    // --- LOGIC PER PRODUCT ---
    if (selectedProduct.id === "item") {
      if (!selectedItem) { setLoading(false); return alert("Please select an item"); }
      finalAmount = selectedItem.price;
      finalDescription = `Item Loan: ${selectedItem.name} (${selectedItem.specs})`;
      calculatedRepayment = Number(finalAmount) * 1.4;

    } else if (selectedProduct.id === "marketeer") {
      finalDescription = `Group Loan (${groupMembers.length} members): ` + JSON.stringify(groupMembers.map(m=>m.name));
      calculatedRepayment = Number(finalAmount) * 1.4; 

    } else if (selectedProduct.id === "business") {
      const fileSummary = Object.entries(files).map(([key, url]) => `${key}: ${url}`).join("\n");
      finalDescription = `Business Loan.\nDocs:\n${fileSummary}`;
      calculatedRepayment = Number(finalAmount) * 1.15; 

    } else if (selectedProduct.id === "personal") {
      // Personal Loan Logic
      const rates = { 1: 0.19, 2: 0.26, 3: 0.33, 4: 0.40 };
      const rate = rates[weeks] || 0.40;
      calculatedRepayment = Number(finalAmount) * (1 + rate);
      
      // Collect image URLs
      collateralImages = Object.values(files);
      const fileSummary = Object.entries(files).map(([key, url]) => `${key}: ${url}`).join("\n");
      finalDescription = `Personal Loan (${weeks} Weeks).\nCollateral: ${description}\nFiles: ${fileSummary}`;
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
            type: selectedProduct.id, 
            total_repayment: calculatedRepayment,
            balance: calculatedRepayment
          }
        ])
        .select()
        .single();

      if (loanError) throw loanError;

      // 2. Create Collateral Record (Use First Image as main URL)
      const mainImageUrl = collateralImages.length > 0 ? collateralImages[0] : null;

      await supabase
        .from("collateral")
        .insert([{
            loan_id: loanData.id,
            description: finalDescription,
            status: "pending_review",
            estimated_value: 0,
            image_url: mainImageUrl // Save the image link so Admin can see it
        }]);

      alert("Application Submitted Successfully!");
      navigate("/client");

    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">
            {step === 1 ? "Apply for a Loan" : selectedProduct?.title}
          </h1>
          <p className="text-gray-400 mt-1">
            {step === 1 ? "Choose the product that fits your needs." : "Provide the required details below."}
          </p>
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
          
          <div className="lg:col-span-2">
            
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

            {step === 2 && (
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
                
                {/* --- PERSONAL LOAN FORM (INLINE & FORCED) --- */}
                {selectedProduct.id === 'personal' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Requested Amount (ZMW)</label>
                      <input 
                        type="number" 
                        className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white focus:border-indigo-500"
                        value={amount} 
                        onChange={(e) => setAmount(e.target.value)} 
                        placeholder="0.00"
                      />
                    </div>

                    {/* DURATION SLIDER */}
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
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
                        className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white focus:border-indigo-500" 
                        rows="3" 
                        value={description} 
                        onChange={e=>setDescription(e.target.value)}
                        placeholder="Describe the item you are securing this loan with..."
                      ></textarea>
                    </div>

                    {/* COLLATERAL UPLOADS - WITH PREVIEW */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {["Collateral Image 1", "Collateral Image 2", "Proof of Ownership"].map(doc => (
                        <div key={doc} className="bg-gray-800 border border-gray-700 border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-center hover:bg-gray-750 transition relative overflow-hidden group">
                          {files[doc] ? (
                            <>
                              <img src={files[doc]} alt="Uploaded" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition" />
                              <div className="z-10 flex flex-col items-center">
                                <span className="text-xs text-green-400 font-bold bg-black/50 px-2 py-1 rounded mb-2">✓ Uploaded</span>
                                <button onClick={(e) => handleRemoveFile(doc, e)} className="text-xs bg-red-600 px-2 py-1 rounded text-white">Remove</button>
                              </div>
                            </>
                          ) : (
                            <button 
                              onClick={() => handleUploadClick(doc)}
                              disabled={uploadingDoc === doc}
                              className={`px-4 py-1.5 rounded text-xs font-bold transition flex items-center gap-2 ${uploadingDoc === doc ? 'bg-yellow-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                            >
                              {uploadingDoc === doc ? "Uploading..." : "↑ UPLOAD"}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* --- END PERSONAL LOAN FORM --- */}

                {/* --- OTHER FORMS --- */}
                {selectedProduct.id === 'business' && (
                   <div className="space-y-6">
                      <div><label className="block text-sm text-gray-400 mb-2">Requested Capital</label><input type="number" className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white" value={amount} onChange={e => setAmount(e.target.value)} /></div>
                      <div className="grid grid-cols-2 gap-4">
                         {["Registration", "Business Plan"].map(doc => (
                            <button key={doc} onClick={()=>handleUploadClick(doc)} className="border border-gray-700 border-dashed p-4 text-gray-400 rounded hover:bg-gray-700">
                               {files[doc] ? "✓ Uploaded" : "Upload " + doc}
                            </button>
                         ))}
                      </div>
                   </div>
                )}
                
                {selectedProduct.id === 'marketeer' && renderMarketeerForm()}
                {selectedProduct.id === 'item' && renderItemForm()}

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
                  {/* Dynamic Summary */}
                  {selectedProduct.id === 'personal' && (
                     <div className="flex justify-between border-b border-gray-800 pb-4"><span className="text-gray-400">Duration</span><span className="font-medium text-white">{weeks} Weeks</span></div>
                  )}
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