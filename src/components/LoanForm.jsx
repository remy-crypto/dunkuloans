// src/components/LoanForm.jsx
import React, { useState } from "react";

export default function LoanForm({ onApply }) {
  const [amount, setAmount] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      alert("Enter a valid amount");
      return;
    }
    onApply(amount);
  };

  return (
    <form onSubmit={submit} className="flex gap-2 items-center">
      <input
        type="number"
        step="1"
        min="1"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter amount"
        className="px-3 py-2 border rounded-md w-44"
      />
      <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
        Apply
      </button>
    </form>
  );
}
