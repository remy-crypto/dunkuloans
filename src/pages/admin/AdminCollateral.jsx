import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/SupabaseClient";

export default function AdminCollateral() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("review"); // 'review' or 'logistics'

  useEffect(() => {
    fetchCollateral();
  }, [activeTab]);

  const fetchCollateral = async () => {
    setLoading(true);
    let query = supabase
      .from("collateral")
      .select("*, loans(id, status, amount, profiles(full_name, email))")
      .order("created_at", { ascending: false });

    // Filter based on tab
    if (activeTab === "review") {
      query = query.in("status", ["pending_review", "held"]); // Show pending stuff
    } else {
      query = query.in("status", ["approved", "active", "returned", "seized"]); // Show processed stuff
    }

    const { data, error } = await query;
    if (!error) setItems(data);
    setLoading(false);
  };

  const handleAction = async (itemId, loanId, action) => {
    if (!confirm(`Are you sure you want to ${action.toUpperCase()} this item?`)) return;

    let collateralStatus = "";
    let loanStatus = "";

    if (action === "approve") {
      collateralStatus = "approved";
      loanStatus = "active"; // Activate the loan
    } else if (action === "reject") {
      collateralStatus = "rejected";
      loanStatus = "rejected"; // Kill the loan
    }

    // Update Collateral
    const { error: colError } = await supabase
      .from("collateral")
      .update({ status: collateralStatus })
      .eq("id", itemId);

    // Update Linked Loan
    if (!colError && loanId) {
      await supabase
        .from("loans")
        .update({ status: loanStatus })
        .eq("id", loanId);
    }

    if (colError) alert("Error: " + colError.message);
    else {
      alert(`Collateral ${action}d successfully.`);
      fetchCollateral(); // Refresh list
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Collateral Management</h1>
          <p className="text-gray-400 mt-1">Review submissions and manage asset logistics.</p>
        </div>
        <input type="text" placeholder="Search items..." className="bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded text-sm w-64" />
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-800">
        <button 
          onClick={() => setActiveTab("review")}
          className={`pb-3 font-medium text-sm transition ${activeTab === "review" ? "text-indigo-400 border-b-2 border-indigo-500" : "text-gray-500 hover:text-gray-300"}`}
        >
          Underwriting & Review 
          <span className="ml-2 bg-indigo-900 text-indigo-300 px-1.5 py-0.5 rounded text-xs">
            {items.filter(i => i.status === 'pending_review').length}
          </span>
        </button>
        <button 
          onClick={() => setActiveTab("logistics")}
          className={`pb-3 font-medium text-sm transition ${activeTab === "logistics" ? "text-indigo-400 border-b-2 border-indigo-500" : "text-gray-500 hover:text-gray-300"}`}
        >
          Logistics & Retrieval
        </button>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="text-white text-center py-10">Loading items...</div>
      ) : items.length === 0 ? (
        <div className="text-gray-500 text-center py-10 bg-gray-800 rounded-xl border border-gray-700">
          No collateral items found in this queue.
        </div>
      ) : (
        <div className="space-y-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl overflow-hidden flex flex-col md:flex-row shadow-lg animate-in fade-in slide-in-from-bottom-2">
              
              {/* Image Section */}
              <div className="w-full md:w-1/3 h-64 md:h-auto bg-gray-100 relative flex items-center justify-center">
                {item.image_url ? (
                  <img src={item.image_url} alt="Item" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                )}
                <div className="absolute top-4 left-4 bg-black/70 text-white px-2 py-1 text-xs font-bold rounded uppercase">
                  {item.status.replace('_', ' ')}
                </div>
              </div>

              {/* Details Section */}
              <div className="flex-1 p-8 flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{item.description}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xs font-bold">
                        {item.loans?.profiles?.full_name?.[0] || "U"}
                      </div>
                      <span className="text-sm text-gray-500">
                        {item.loans?.profiles?.full_name || "Unknown User"} (View Profile)
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Submitted {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Loan Amount</p>
                    <p className="text-xl font-bold text-gray-900">
                      K {item.loans?.amount?.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Item Specifics</h3>
                    <p className="text-sm text-gray-600 italic">"{item.description}"</p>
                    <div className="mt-2 text-sm text-gray-500">
                      Loan ID: #{item.loan_id?.slice(0, 8)}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex items-center justify-center text-center">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase mb-2">Valuation</p>
                      <p className="text-sm text-gray-500">
                        Est. Value: K {item.estimated_value?.toLocaleString() || "0.00"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Buttons only show for Pending Review items */}
                {activeTab === "review" && (
                  <div className="mt-auto flex justify-end gap-3 pt-6 border-t border-gray-100">
                    <button 
                      onClick={() => handleAction(item.id, item.loan_id, "reject")}
                      className="px-5 py-2.5 text-red-600 hover:bg-red-50 rounded font-medium transition"
                    >
                      × Reject
                    </button>
                    <button 
                      onClick={() => handleAction(item.id, item.loan_id, "approve")}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold shadow-lg shadow-indigo-200 transition"
                    >
                      ✓ Approve & Offer Loan
                    </button>
                  </div>
                )}
                
                {/* Logistics Buttons */}
                {activeTab === "logistics" && (
                   <div className="mt-auto flex justify-end gap-3 pt-6 border-t border-gray-100">
                      <button className="px-5 py-2.5 border border-gray-300 text-gray-600 rounded font-medium text-sm">
                        Print Label
                      </button>
                      <button className="px-5 py-2.5 bg-gray-900 text-white rounded font-medium text-sm">
                        Mark Retrieved
                      </button>
                   </div>
                )}

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}