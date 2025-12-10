// src/components/LoanTable.jsx
import React from "react";
import { LoanStatus } from "../types/loanStatus";

export default function LoanTable({ loans = [], onSettle, onApprove, onRecordPayment }) {
  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
      <table className="w-full min-w-[700px] table-auto">
        <thead>
          <tr className="text-left bg-gray-50">
            <th className="px-4 py-3 text-xs text-gray-600">Loan ID</th>
            <th className="px-4 py-3 text-xs text-gray-600">Borrower</th>
            <th className="px-4 py-3 text-xs text-gray-600">Amount</th>
            <th className="px-4 py-3 text-xs text-gray-600">Balance</th>
            <th className="px-4 py-3 text-xs text-gray-600">Status</th>
            <th className="px-4 py-3 text-xs text-gray-600">Applied</th>
            <th className="px-4 py-3 text-xs text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loans.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-6 text-center text-sm text-gray-500">
                No loans to show.
              </td>
            </tr>
          )}

          {loans.map((loan) => (
            <tr key={loan.id} className="border-b last:border-b-0 even:bg-white">
              <td className="px-4 py-3 text-sm text-gray-700">{loan.id}</td>
              <td className="px-4 py-3 text-sm text-gray-700">{loan.borrower_email || loan.borrower_name || "—"}</td>
              <td className="px-4 py-3 text-sm text-gray-700">K {Number(loan.amount).toLocaleString()}</td>
              <td className="px-4 py-3 text-sm text-gray-700">K {Number(loan.balance || loan.amount).toLocaleString()}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium ${
                    loan.status === LoanStatus.ACTIVE
                      ? "bg-emerald-100 text-emerald-700"
                      : loan.status === LoanStatus.PENDING
                      ? "bg-yellow-100 text-yellow-700"
                      : loan.status === LoanStatus.DEFAULTED
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {loan.status}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">{new Date(loan.created_at).toLocaleDateString()}</td>
              <td className="px-4 py-3 text-sm">
                <div className="flex items-center gap-2">
                  {onApprove && loan.status === LoanStatus.PENDING && (
                    <button onClick={() => onApprove(loan)} className="px-3 py-1 text-xs bg-blue-600 text-white rounded">Approve</button>
                  )}
                  {onSettle && loan.status !== LoanStatus.SETTLED && (
                    <button onClick={() => onSettle(loan)} className="px-3 py-1 text-xs bg-green-600 text-white rounded">Settle</button>
                  )}
                  {onRecordPayment && (
                    <button onClick={() => onRecordPayment(loan)} className="px-3 py-1 text-xs bg-indigo-600 text-white rounded">Record</button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
