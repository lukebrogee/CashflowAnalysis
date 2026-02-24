/*
------------------------------------------------------------------
FILE NAME:     TransactionsPage.tsx
PROJECT:       CashflowAnalysis
Date Created:  Jan-28-2025
--------------------------------------------------------------------
DESCRIPTION:

--------------------------------------------------------------------
$HISTORY:

Jan-28-2026   Created initial file
Feb-24-2026   Connected Filterbox to Transactions to send filter options selected
------------------------------------------------------------------
*/
import React, { useState } from "react";
import Transactions from "./Transactions";
import { TransactionFilterOptions, FilterBox } from "./FilterBox";

/*
Components Needed
- Transactions Table
- Filter Options
    - Date, Amount, Merchant, Category
- Sort Options
    - Ascending/Descending for Date, Amount
- Pagination Controls (Pages of transactions)

Layout
- There will be a title at the top "Transactions"
- There will be the filter option on the left side as a sidebar
- The transactions table will be on the right side, taking up most of the space (80%)
- Pagination controls will be at the bottom of the transactions table
- Sort options will be above the transactions table
- Responsive design for different screen sizes

*/

function TransactionsPage() {
  const emptyFilterOptions: TransactionFilterOptions = {
    minDate: "",
    maxDate: "",
    minAmount: 0,
    maxAmount: 0,
    merchant: "",
    category: "",
  };
  const [filterOptions, setFilterOptions] =
    useState<TransactionFilterOptions>(emptyFilterOptions);

    
  const [filterDropdowns, setFilterDropdowns] = useState<{
    categories: string[];
    merchants: string[];
  }>({
    categories: [],
    merchants: [],
  });

  return (
    <>
      <h1>Transactions</h1>
      <div style={{ display: "flex" }}>
        <div style={{ width: "20%" }}>
          <FilterBox
            merchantList={filterDropdowns.merchants}
            categoryList={filterDropdowns.categories}
            onSubmit={(f) => {
              setFilterOptions(f);
            }}
          />
        </div>
        <div style={{ width: "80%" }}>
          <Transactions
            setFilterDrowdowns={(c, m) => {
              setFilterDropdowns((prev) => ({
                categories: c,
                merchants: m,
              }));
            }}
            filterOptions={filterOptions}
          />
        </div>
      </div>
    </>
  );
}

export default TransactionsPage;
