/*
------------------------------------------------------------------
FILE NAME:     Transactions.tsx
PROJECT:       CashflowAnalysis
Date Created:  Dec-24-2025
--------------------------------------------------------------------
DESCRIPTION:
Displays all transactions from all users registered account
--------------------------------------------------------------------
$HISTORY:

Dec-24-2025   Created initial file.
Dec-30-2025   Switched api call from /api/transactions to /api/all-transactions
Feb-24-2026   Complete rewrite of component. Added css styling, updated pagination, added account tabs, updated columns
------------------------------------------------------------------
*/

/*
Drop down for categories and merchants are coming from the previous account load
sync transactions and initial load needs an icon for loading
sync transactions seems to always load all transactions even with the cursor (May be normal in sandbox)
Add filter to make columns visible/hidden
All transactions need the green border on page load
Next and Previous buttons need to be enable/disabled dependant on if at the starting page or end page
Add a sort option to add/remove columns, on page load transactions should be sorted by date
Loading screen needs to be updated to display circular loading icon
*/

import { useEffect, useMemo, useState } from "react";
import { TransactionFilterOptions } from "./FilterBox";
import styles from "./transactions.module.scss";

interface Props {
  filterOptions: TransactionFilterOptions;
  setFilterDrowdowns: (category: string[], merchant: string[]) => void;
}

type Transaction = {
  TransactionID: string;
  AccountID: string;
  Date: string;
  MerchantName: string | null;
  Name: string;
  Amount: number;
  IsoCurrencyCode: string | null;
  AuthorizedDate: string | null;
  Pending: boolean;
  PaymentChannel: string;
  Category: string | null;
  LastSyncedAt: string;
  IsRemoved: boolean;
};

type Account = {
  AccountID: string;
  LinkedInstitutionID: number;
  Mask: string | null;
  Name: string;
  OfficialName: string | null;
  Subtype: string | null;
  Type: string;
  VerificationStatus: string | null;
  HolderCategory: string | null;
  CreatedAt: string;
  UpdatedAt: string;
  PlaidAccountID: string;
};

// Number of transactions to show per page
const PAGE_SIZE = 25;

function Transactions(p: Props) {


  //Transaction Data
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [reloadTransactions, setReloadTransactions] = useState<boolean>(false);
  const [accounts, setAccounts] = useState<Account[]>([]);

  //Filter Dropdowns, Active Account Display, User Input for Pagination
  const [categoryDropdown, setCategoryDropdown] = useState<string[]>([]);
  const [merchantDropdown, setMerchantDropdown] = useState<string[]>([]);
  const [activeAccountDisplay, setActiveAccountDisplay] = useState<string>("");
  const [userInput, setUserInput] = useState(1);

  //Loading and Error States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  //Load the latest transactions from Plaid that have not been synced to the database yet.
  const syncTransactions = () => {
    const ac = new AbortController();
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/syncTransactions", { signal: ac.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
      } catch (e: any) {
        if (e.name !== "AbortError") setError(e.message || "Failed to load");
      } finally {
        //Retrieve all transactions from database again
        setReloadTransactions(true);
      }
    };
    fetchData();
    return () => ac.abort();
  };

  //Filtering transactions based on filter options and selected account by user.
  useEffect(() => {
    const { maxDate, minDate, maxAmount, minAmount, merchant, category } =
      p.filterOptions;
    //Normalize function to handle case-insensitive and whitespace-trimmed comparisons for merchants and categories
    const normalize = (s: string | null | undefined) =>
      (s || "").toLowerCase().trim();

    let categories: string[] = [];
    let merchants: string[] = [];

    setFilteredTransactions(
      allTransactions
        .filter((txn) => {
          //Account filter
          if (activeAccountDisplay && activeAccountDisplay !== txn.AccountID)
            if (activeAccountDisplay != "0") return false; //If on all transactions dont filter by account

          // Date comparisons (assumes ISO-like date strings). Exclude when outside range.
          if (maxDate && maxDate !== "") {
            const txDate = new Date(txn.Date);
            const mDate = new Date(maxDate);
            if (isFinite(txDate.getTime()) && txDate > mDate) return false;
          }
          if (minDate && minDate !== "") {
            const txDate = new Date(txn.Date);
            const miDate = new Date(minDate);
            if (isFinite(txDate.getTime()) && txDate < miDate) return false;
          }

          // Amount comparisons
          if (maxAmount && maxAmount > 0) {
            if (txn.Amount > maxAmount) return false;
          }
          if (minAmount && minAmount > 0) {
            if (txn.Amount < minAmount) return false;
          }

          // Merchant - partial, case-insensitive match
          if (merchant && merchant !== "") {
            if (!normalize(txn.MerchantName).includes(normalize(merchant)))
              return false;
          }

          // Category - exact, case-insensitive
          if (category && category !== "") {
            if (normalize(txn.Category) !== normalize(category)) return false;
          }

          //Push values of category and merchant for filter box dropdown options
          if (txn.Category && !categories.includes(txn.Category))
            categories.push(txn.Category);
          if (txn.MerchantName && !merchants.includes(txn.MerchantName))
            merchants.push(txn.MerchantName);

          return true;
        })
        .sort( //Sort by date descending by default
          (a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime(),
        ),
    );
    setCategoryDropdown(categories);
    setMerchantDropdown(merchants);
  }, [p.filterOptions, allTransactions, activeAccountDisplay]);

  //Set the dropdowns for the filter box based on the transactions from the active account display
  //Right now does not work on first page load and loads dropdown data from previous account display
  useEffect(() => {
    p.setFilterDrowdowns(categoryDropdown, merchantDropdown);
  }, [activeAccountDisplay]);

  //Retrieves all transactions from the database associated with the user. Does not access Plaid API
  useEffect(() => {
    const loadTransactions = async () => {
      const res = await fetch("/api/retrieveAllTransactions");
      const jsonData = await res.json();
      const { Transactions, Accounts, Error } = jsonData;
      const ok = res.ok;
      if (!ok) {
        setError(Error || "Failed to load transactions");
        setLoading(false);
        return;
      }
      setAllTransactions(Transactions);
      setFilteredTransactions(Transactions);
      setAccounts(Accounts);
      setLoading(false);
      setReloadTransactions(false);
    };
    loadTransactions();
  }, [reloadTransactions]);

  // Calculate pagination details and visible transactions
  // (i.e. recalculate when transactions or userInput changes)
  const { currentPage, totalPages, startIndex, endIndex, visibleTransactions } =
    useMemo(() => {
      const total = Math.max(
        1,
        Math.ceil(filteredTransactions.length / PAGE_SIZE),
      );
      const page = Math.min(Math.max(userInput, 1), total);
      const start = (page - 1) * PAGE_SIZE;
      const end = Math.min(start + PAGE_SIZE, filteredTransactions.length);
      return {
        currentPage: page,
        totalPages: total,
        startIndex: start,
        endIndex: end,
        visibleTransactions: filteredTransactions.slice(start, end),
      };
    }, [filteredTransactions, userInput]);

  //Need to update loading screen to display circular loading icon
  if (loading) return <div>Loading...</div>;

  // Display table of transactions
  return (
    <div className={styles.container}>
      <div className={styles.accountTabs}>
        {/* Account Tabs - "All Transactions" + each individual account */}
        <div
          className={`${activeAccountDisplay === "0" && styles.accountTabActive}`}
          onClick={() => setActiveAccountDisplay("0")}
        >
          All Transactions
        </div>
        {accounts.map((id) => (
          <div
            key={id.PlaidAccountID}
            className={`${activeAccountDisplay === id.PlaidAccountID && styles.accountTabActive}`}
            onClick={() => setActiveAccountDisplay(id.PlaidAccountID)}
          >
            {id.Name}
          </div>
        ))}
      </div>
      <div className={styles.transactionsContainer}>
        <p>
          Showing {startIndex + 1} to {endIndex} of{" "}
          {filteredTransactions.length} transactions
        </p>
        <table className="table">
          <thead className="sticky-top z-0">
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Description</th>
              <th scope="col">Amount</th>
              <th scope="col">Merchant</th>
              <th scope="col">Category</th>
            </tr>
          </thead>
          <tbody>
            {visibleTransactions.map((txn, index) => (
              <tr key={txn.TransactionID}>
                <td>
                  {" "}
                  {new Date(txn.Date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td>{txn.Name}</td>
                <td>{"$" + txn.Amount.toFixed(2)}</td>
                <td>{txn.MerchantName}</td>
                <td>
                  <div className={styles.categoryCell}>{txn.Category}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className={styles.tableControlsContainer}>
          {/* Pagination Controls */}
          <button
            className={styles.previousButton}
            disabled={startIndex === 0}
            onClick={() => setUserInput(userInput - 1)}
          >
            Previous
          </button>
          <div className={styles.currentPageCounter}>{currentPage}</div>
          <button
            className={styles.nextButton}
            disabled={endIndex >= filteredTransactions.length}
            onClick={() => setUserInput(userInput + 1)}
          >
            Next
          </button>
          <button className={styles.syncButton} onClick={syncTransactions}>
            Sync Latest Transactions
          </button>
        </div>
      </div>
    </div>
  );
}

export default Transactions;
