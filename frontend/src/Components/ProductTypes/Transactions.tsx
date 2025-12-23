import React, { useContext, useEffect, useMemo, useState } from "react";
import Endpoint from "../Endpoint";
import {
  transactionsCategories,
  transformTransactionsData,
} from "../../dataUtilities";
import Context from "../../Context";

type Transaction = {
  account_id: string;
  amount: string;
  date: string;
  iso_currency_code: string;
  name: string;
  pending: boolean;
  transaction_id: string;
}

// Number of transactions to show per page
const PAGE_SIZE = 10;

function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userInput, setUserInput] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  // Fetch transactions on component mount
  useEffect(() => {
    const ac = new AbortController();
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/transactions", { signal: ac.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setTransactions(data.latest_transactions ?? []);
      } catch (e: any) {
        if (e.name !== "AbortError") setError(e.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    return () => ac.abort();
  }, []);

  // Calculate pagination details and visible transactions
  // (i.e. recalculate when transactions or userInput changes)
  const { currentPage, totalPages, startIndex, endIndex, visibleTransactions } = useMemo(() => {
    const total = Math.max(1, Math.ceil(transactions.length / PAGE_SIZE));
    const page = Math.min(Math.max(userInput, 1), total);
    const start = (page - 1) * PAGE_SIZE;
    const end = Math.min(start + PAGE_SIZE, transactions.length);
    return {
      currentPage: page,
      totalPages: total,
      startIndex: start,
      endIndex: end,
      visibleTransactions: transactions.slice(start, end),
    };
  }, [transactions, userInput]);

  if (loading) return <div>Loading...</div>;

  // Display table of transactions
  return (
<div>
  <p>Showing {startIndex + 1} to {endIndex} of {transactions.length} transactions</p>
  <table className="table">
    <thead className="sticky-top z-0">
      <tr>
        <th scope="col">#</th>
        <th scope="col">Merchant</th>
        <th scope="col">Amount</th>
        <th scope="col">Date</th>
      </tr>
    </thead>
    <tbody>
      {visibleTransactions.map((txn, index) => (
      <tr key={txn.transaction_id}>
        <th scope="row">{index}</th>
        <td>{txn.name}</td>
        <td>{txn.amount}</td>
        <td>{txn.date}</td>
      </tr>
      ))}
    </tbody>
  </table>
  <div>
    {/* Pagination Controls */}
    <button disabled={startIndex === 0} onClick={() => setUserInput(userInput - 1)}>Previous</button>
    <button disabled={endIndex >= transactions.length} onClick={() => setUserInput(userInput + 1)}>Next</button>
  </div>

</div>
);}

export default Transactions;