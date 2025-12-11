import React from "react";

export default function AdminUnderwriting() {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h1 className="text-2xl font-bold text-white">Underwriting Desk</h1>
        <p className="text-gray-400 mt-1">Manual review for loans flagged by decision engine.</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-24 h-24 rounded-full bg-green-900/20 flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">All Caught Up!</h2>
        <p className="text-gray-500 text-center max-w-md">
          Queue empty. All loans automatically processed. <br/>
          Check back later for new applications requiring manual review.
        </p>
      </div>
    </div>
  );
}