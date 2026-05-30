/*
------------------------------------------------------------------
FILE NAME:     SpendAnalyzerPage.tsx
PROJECT:       CashflowAnalysis
Date Created:  Jan-28-2025
--------------------------------------------------------------------
DESCRIPTION:

--------------------------------------------------------------------
$HISTORY:

Jan-28-2026   Created initial file
------------------------------------------------------------------
*/


/*
Components Needed
- Pie chart depecting top spending categories
- Table showing top 10 spending categories with total amount spent in each category
- Bar graph showing spending by year-to-date, year, month, week, or day (user can select time period)
- Needs to be all accounts or account specific. Spend analyzer should only show accounts like checking, credit card
    - Or maybe users are first presented by an empty spend analyzer and should be able to build there own
    - Maybe even multiple spend analyzers with different accounts and setups (environments like personal or business)
- 
*/

import React, { useState } from "react";
import {SelectBox} from "./SelectBox";
import {FilterBox} from "./FilterBox";
import SpendAnalyzer from "../../Components/ProductTypes/SpendAnalyzer";
import styles from "./spendAnalyzerPage.module.scss";

function SpendAnalyzerPage () {

    const [topCategories, setTopCategories] = useState<{category: string, amount: number}[]>([
        {category: "Food", amount: 500},
        {category: "Transportation", amount: 300},
        {category: "Entertainment", amount: 200},
        {category: "Utilities", amount: 150},
        {category: "Health", amount: 100},
        {category: "Education", amount: 80},
        {category: "Clothing", amount: 60},
        {category: "Travel", amount: 40},
        {category: "Miscellaneous", amount: 20},
        {category: "Other", amount: 10},
    ]);

    const [topMerchants, setTopMerchants] = useState<{merchant: string, amount: number}[]>([
        {merchant: "Amazon", amount: 400},
        {merchant: "Walmart", amount: 300},
        {merchant: "Starbucks", amount: 200},
        {merchant: "Uber", amount: 150},
        {merchant: "Netflix", amount: 100},
        {merchant: "Apple", amount: 80},
        {merchant: "Target", amount: 60},
        {merchant: "Costco", amount: 40},
        {merchant: "Best Buy", amount: 20},
        {merchant: "Other", amount: 10},
        {merchant: "Other", amount: 10},
        {merchant: "Other", amount: 10},
    ]);

    const [topTransactions, setTopTransactions] = useState<{date: string, merchant: string, category: string, amount: number}[]>([
        {date: "2024-01-01", merchant: "Amazon", category: "Food", amount: 100},
        {date: "2024-01-02", merchant: "Walmart", category: "Transportation", amount: 80},
        {date: "2024-01-03", merchant: "Starbucks", category: "Entertainment", amount: 60},
        {date: "2024-01-04", merchant: "Uber", category: "Utilities", amount: 40},
        {date: "2024-01-05", merchant: "Netflix", category: "Health", amount: 20},
        {date: "2024-01-06", merchant: "Apple", category: "Education", amount: 10},
        {date: "2024-01-07", merchant: "Target", category: "Clothing", amount: 5},
        {date: "2024-01-08", merchant: "Costco", category: "Travel", amount: 2},
        {date: "2024-01-09", merchant: "Best Buy", category: "Miscellaneous", amount: 1},
        {date: "2024-01-10", merchant: "Other", category: "Other", amount: 0.5},
        {date: "2024-01-11", merchant: "Other", category: "Other", amount: 0.5},
        {date: "2024-01-12", merchant: "Other", category: "Other", amount: 0.5},
    ]);





    return (
        <>

        <div className={styles.container}>
            {/*left side bar holding environemnt select */}
            <div className={styles.sidebarContainer}>
                {/*Add a dropdown to show the different environments to choose from*/}
                <SelectBox />
                <FilterBox />
            </div>
            {/*actual bulk of the page with graphs and tables */}
            <div className={styles.mainContainer}>  
                <div>
                    <h1>Spend Analyzer</h1>
                </div>
                <div className={styles.categoryContainer}>
                    <div className={styles.categoryHeaderContainer}>

                    </div>
                    <div className={styles.categoryBodyContainer}>
`                       <div className={styles.categoryGraphContainer}>
                            <SpendAnalyzer />
                        </div>
                        <div className={styles.categoryTableContainer}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Category</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topCategories.map((cat, index) => (
                                        <tr key={index}>
                                            <td>{cat.category}</td>
                                            <td>{cat.amount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div className={styles.merchantTransactionContainer}>
                    <div className={styles.merchantContainer}>
                        <div className={styles.merchantHeaderContainer}>

                        </div>
                        <div className={styles.merchantBodyContainer}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Merchant</th>
                                            <th>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {topMerchants.map((mer, index) => (
                                            <tr key={index}>
                                                <td>{mer.merchant}</td>
                                                <td>{mer.amount}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                        </div>
                    </div>
                    <div className={styles.transactionContainer}>
                        <div className={styles.transactionHeaderContainer}>

                        </div>
                        <div className={styles.transactionBodyContainer}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Category</th>
                                            <th>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {topTransactions.map((tran, index) => (
                                            <tr key={index}>
                                                <td>{tran.merchant}</td>
                                                <td>{tran.amount}</td>
                                                <td>{tran.date}</td>
                                                <td>{tran.category}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        
        </>
    )
}

export default SpendAnalyzerPage;