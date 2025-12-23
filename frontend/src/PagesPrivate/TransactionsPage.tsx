import React from "react";
import Transactions from "../Components/ProductTypes/Transactions";
import FilterBox from "../Components/FilterBox";

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
    return (
        <>
            <h1>Transactions</h1>
            <div style={{ display: "flex" }}>
                <div style={{ flex: "1" }}>
                    <FilterBox />
                </div>
                <div style={{ flex: "4" }}>
                    <Transactions />
                </div>
            </div>
        </>
    )
}

export default TransactionsPage;