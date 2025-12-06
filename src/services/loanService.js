// src/services/loanService.js
import { supabase } from "../lib/SupabaseClient";

/**
 * Loans table schema assumed:
 * id (PK), user_id (uuid), amount (numeric/float), status (text), created_at (timestamp)
 */

export const fetchLoansForUser = async (userId, filter = "All") => {
  try {
    let query = supabase
      .from("loans")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (filter === "Active") query = query.eq("status", "Active");
    if (filter === "Settled") query = query.eq("status", "Settled");

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("fetchLoansForUser", err);
    throw err;
  }
};

export const applyLoanForUser = async (userId, amount) => {
  const { data, error } = await supabase.from("loans").insert([
    { user_id: userId, amount: Number(amount), status: "Active" },
  ]);
  if (error) throw error;
  return data;
};

export const settleLoan = async (loanId, userId) => {
  const { data, error } = await supabase
    .from("loans")
    .update({ status: "Settled" })
    .eq("id", loanId)
    .eq("user_id", userId);
  if (error) throw error;
  return data;
};
