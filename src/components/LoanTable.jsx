// src/components/LoanTable.jsx
import React from "react";

const formatCurrency = (value) =>
  value?.toLocaleString("en-ZM", { style: "currency", currency: "ZMW" });

export default function LoanTable({ loans, onSettle, calculateBalance, isOverdue }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-md overflow-hidden">
        <thead className="bg-gray-50 text-left">
          <tr>
            <th className="px-4 py-2">Loan ID</th>
            <th className="px-4 py-2">Amount</th>
            <th className="px-4 py-2">Balance</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Applied</th>
            <th className="px-4 py-2">Action</th>
          </tr>
        </thead>

        <tbody>
          {loans.length === 0 && (
            <tr>
              <td colSpan="6" className="px-4 py-6 text-center text-gray-500">
                No loans yet
              </td>
            </tr>
          )}

          {loans.map((loan) => {
            const bal = calculateBalance(loan);
            const overdue = isOverdue(loan);
            return (
              <tr key={loan.id} className={overdue ? "bg-red-50" : ""}>
                <td className="px-4 py-3">{loan.id}</td>
                <td className="px-4 py-3">{formatCurrency(loan.amount)}</td>
                <td className="px-4 py-3">{formatCurrency(bal)}</td>
                <td className="px-4 py-3">{loan.status}{overdue && " (Overdue)"}</td>
                <td className="px-4 py-3">{new Date(loan.created_at).toLocaleString()}</td>
                <td className="px-4 py-3">
                  {loan.status !== "Settled" && (
                    <button
                      onClick={() => onSettle(loan.id)}
                      className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Mark Settled
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
