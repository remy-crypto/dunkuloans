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

    // Logic per loan type
    if (selectedProduct.id === "item") {
      if (!selectedItem) return alert("Please select an item");
      finalAmount = selectedItem.price;
      finalDescription = `Item Loan: ${selectedItem.name} (${selectedItem.specs})`;
      calculatedRepayment = Number(finalAmount) * 1.4; // 40% Interest

    } else if (selectedProduct.id === "marketeer") {
      finalDescription = `Group Loan (${groupMembers.length} members): ` + JSON.stringify(groupMembers.map(m=>m.name));
      calculatedRepayment = Number(finalAmount) * 1.4; 

    } else if (selectedProduct.id === "business") {
      const fileSummary = Object.entries(files).map(([key, url]) => `${key}: ${url}`).join("\n");
      finalDescription = `Business Loan.\nDocs:\n${fileSummary}`;
      calculatedRepayment = Number(finalAmount) * 1.15; // 15% Interest

    } else if (selectedProduct.id === "personal") {
      // Personal Loan Logic
      const rates = { 1: 0.19, 2: 0.26, 3: 0.33, 4: 0.40 };
      const rate = rates[weeks] || 0.40;
      calculatedRepayment = Number(finalAmount) * (1 + rate);
      
      const fileSummary = Object.entries(files).map(([key, url]) => `${key}: ${url}`).join("\n");
      finalDescription = `Personal Loan (${weeks} Weeks).\nCollateral: ${description}\nFiles: ${fileSummary}`;
    }

    if (!finalAmount || Number(finalAmount) <= 0) {
      setLoading(false);
      return alert("Please enter a valid amount");
    }

    try {
      // Create Loan
      const { data: loanData, error: loanError } = await supabase
        .from("loans")
        .insert([
          {
            borrower_id: user.id,
            amount: Number(finalAmount),
            status: "pending",
            total_repayment: calculatedRepayment,
            balance: calculatedRepayment
          }
        ])
        .select()
        .single();

      if (loanError) throw loanError;

      // Add Collateral Entry
      await supabase
        .from("collateral")
        .insert([{
            loan_id: loanData.id,
            description: finalDescription,
            status: "pending_review",
            estimated_value: 0
        }]);

      alert("Application Submitted Successfully!");
      navigate("/client");

    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER FORMS ---
  const renderBusinessForm = () => (
    <div className="space-y-6">
       <div>
        <label className="block text-sm text-gray-400 mb-2">Requested Capital (ZMW)</label>
        <input type="number" className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white focus:border-indigo-500"
          value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {["Registration", "Business Plan", "Financial Statements", "Tax Compliance", "Collateral Docs", "Personal Ids", "Bank Statements", "Project Proposal"].map(doc => (
          <div key={doc} className="bg-gray-800 border border-gray-700 border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-center hover:bg-gray-750 transition">
            <p className="text-gray-300 text-sm font-medium mb-2">{doc}</p>
            {files[doc] ? (
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs text-green-500 font-bold">✓ Uploaded</span>
                <a href={files[doc]} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 underline hover:text-indigo-300">View File</a>
              </div>
            ) : (
              <button onClick={() => handleUploadClick(doc)} disabled={uploadingDoc === doc} className={`px-4 py-1.5 rounded text-xs font-bold transition flex items-center gap-2 ${uploadingDoc === doc ? 'bg-yellow-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}>
                {uploadingDoc === doc ? "Uploading..." : "↑ UPLOAD FILE"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderMarketeerForm = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm text-gray-400 mb-2">Total Group Amount (ZMW)</label>
        <input type="number" className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white focus:border-indigo-500"
          value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
      </div>
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h4 className="font-bold text-white mb-4 border-b border-gray-700 pb-2">ADD NEW MEMBER</h4>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <input className="bg-gray-900 border border-gray-600 rounded p-2 text-white text-sm" placeholder="Full Name" value={newMember.name} onChange={e=>setNewMember({...newMember, name: e.target.value})} />
          <input className="bg-gray-900 border border-gray-600 rounded p-2 text-white text-sm" placeholder="NRC Number" value={newMember.nrc} onChange={e=>setNewMember({...newMember, nrc: e.target.value})} />
          <input className="bg-gray-900 border border-gray-600 rounded p-2 text-white text-sm" placeholder="Phone Number" value={newMember.phone} onChange={e=>setNewMember({...newMember, phone: e.target.value})} />
          <input className="bg-gray-900 border border-gray-600 rounded p-2 text-white text-sm" placeholder="Monthly Income" value={newMember.income} onChange={e=>setNewMember({...newMember, income: e.target.value})} />
          <input className="bg-gray-900 border border-gray-600 rounded p-2 text-white text-sm" placeholder="Market Name" value={newMember.market} onChange={e=>setNewMember({...newMember, market: e.target.value})} />
          <input className="bg-gray-900 border border-gray-600 rounded p-2 text-white text-sm" placeholder="Loan Reason" value={newMember.reason} onChange={e=>setNewMember({...newMember, reason: e.target.value})} />
          <input className="col-span-2 bg-gray-900 border border-gray-600 rounded p-2 text-white text-sm" placeholder="Residential Address" value={newMember.address} onChange={e=>setNewMember({...newMember, address: e.target.value})} />
        </div>
        <button onClick={handleAddMember} className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-medium">+ Add Member</button>
        {groupMembers.length > 0 && (
          <div className="mt-4 space-y-2">
            {groupMembers.map((m, i) => (
              <div key={i} className="flex justify-between bg-gray-900 p-2 rounded text-sm text-gray-300">
                <span>{m.name} ({m.nrc})</span>
                <span>Market: {m.market}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderItemForm = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {gadgetItems.map(item => (
          <div 
            key={item.id} 
            onClick={() => setSelectedItem(item)}
            className={`cursor-pointer bg-white rounded-xl overflow-hidden border-2 transition-all ${selectedItem?.id === item.id ? 'border-indigo-500 shadow-lg shadow-indigo-500/20' : 'border-transparent opacity-80 hover:opacity-100'}`}
          >
            <div className="h-32 bg-gray-100 flex items-center justify-center">
                <img src={item.img} alt={item.name} className="h-full object-contain" />
            </div>
            <div className="p-3">
              <h4 className="font-bold text-gray-900 text-sm">{item.name}</h4>
              <p className="text-xs text-gray-500">{item.specs}</p>
              <p className="text-indigo-600 font-bold mt-1">K {item.price.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      {selectedItem && (
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <div className="flex justify-between text-sm text-gray-300 mb-2">
            <span>Repayment Plan</span>
            <span>{months} Months</span>
          </div>
          <input 
            type="range" min="1" max="12" value={months} onChange={e=>setMonths(e.target.value)}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <div className="flex justify-between mt-4 pt-4 border-t border-gray-700">
             <div>
                <p className="text-xs text-gray-500">Monthly Payment</p>
                <p className="text-xl font-bold text-white">K {((selectedItem.price * 1.4)/months).toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
             </div>
             <div className="text-right">
                <p className="text-xs text-gray-500">Total Cost</p>
                <p className="text-sm font-bold text-gray-300">K {(selectedItem.price * 1.4).toLocaleString()}</p>
             </div>
          </div>
        </div>
      )}
    </div>
  );

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
                    <div className="ml-auto text-gray-500 group-hover:text-indigo-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {step === 2 && (
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
                {selectedProduct.id === 'marketeer' && renderMarketeerForm()}
                {selectedProduct.id === 'business' && renderBusinessForm()}
                {selectedProduct.id === 'item' && renderItemForm()}
                
                {/* --- PERSONAL LOAN FORM --- */}
                {selectedProduct.id === 'personal' && (
                  <div className="space-y-6">
                    {/* Amount */}
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

                    {/* Weeks Slider */}
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

                    {/* Description */}
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

                    {/* Uploads */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {["Collateral Image 1", "Collateral Image 2", "Proof of Ownership"].map(doc => (
                        <div key={doc} className="bg-gray-800 border border-gray-700 border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-center hover:bg-gray-750 transition">
                          <p className="text-gray-300 text-sm font-medium mb-2">{doc}</p>
                          {files[doc] ? (
                            <div className="flex flex-col items-center gap-2">
                              <span className="text-xs text-green-500 font-bold">✓ Uploaded</span>
                              <a href={files[doc]} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 underline hover:text-indigo-300">View</a>
                            </div>
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

                <div className="flex gap-4 pt-8">
                  <button onClick={() => setStep(1)} className="px-6 py-2.5 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700">Back</button>
                  <button onClick={() => setStep(3)} className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-medium flex-1">Next Step →</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
                <h3 className="text-xl font-bold text-white mb-6">Review Application</h3>
                <div className="bg-gray-900 rounded-lg p-6 space-y-4 mb-6">
                  <div className="flex justify-between border-b border-gray-800 pb-4">
                    <span className="text-gray-400">Product</span>
                    <span className="font-medium text-white">{selectedProduct?.title}</span>
                  </div>
                  {selectedProduct.id === 'item' ? (
                     <div className="flex justify-between border-b border-gray-800 pb-4">
                        <span className="text-gray-400">Item Selected</span>
                        <span className="font-medium text-white">{selectedItem?.name}</span>
                     </div>
                  ) : (
                    <div className="flex justify-between border-b border-gray-800 pb-4">
                        <span className="text-gray-400">Amount</span>
                        <span className="font-medium text-white">K {Number(amount).toLocaleString()}</span>
                     </div>
                  )}
                  {selectedProduct.id === 'personal' && (
                     <div className="flex justify-between border-b border-gray-800 pb-4">
                        <span className="text-gray-400">Duration</span>
                        <span className="font-medium text-white">{weeks} Weeks (Rate: {({1:19,2:26,3:33,4:40}[weeks])}%)</span>
                     </div>
                  )}
                  {selectedProduct.id === 'marketeer' && (
                     <div className="flex justify-between border-b border-gray-800 pb-4">
                        <span className="text-gray-400">Group Size</span>
                        <span className="font-medium text-white">{groupMembers.length} Members</span>
                     </div>
                  )}
                  {selectedProduct.id === 'business' && (
                     <div className="flex justify-between border-b border-gray-800 pb-4">
                        <span className="text-gray-400">Documents Attached</span>
                        <span className="font-medium text-green-400">{Object.keys(files).length} Files</span>
                     </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setStep(2)} className="px-6 py-2.5 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700">Edit</button>
                  <button onClick={handleSubmit} disabled={loading} className="px-6 py-2.5 rounded-lg bg-green-600 text-white hover:bg-green-700 font-medium flex-1 shadow-lg shadow-green-900/20">
                    {loading ? "Submitting..." : "Confirm & Submit"}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 sticky top-8">
              <div className="flex items-center gap-2 mb-4 text-indigo-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <h3 className="font-bold text-sm uppercase tracking-wider">Requirements</h3>
              </div>
              <ul className="space-y-4">
                {(selectedProduct ? selectedProduct.reqs : products[0].reqs).map((req, index) => (
                  <li key={index} className="flex gap-3 text-sm text-gray-300">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </div>
      
      {/* File Input (Hidden) */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
      />
    </div>
  );
}