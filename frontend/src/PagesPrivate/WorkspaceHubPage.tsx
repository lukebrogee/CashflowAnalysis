/*
------------------------------------------------------------------
FILE NAME:     WorkspaceHubPage.tsx
PROJECT:       MoneyLens
Date Created:  Jun-13-2026
--------------------------------------------------------------------
DESCRIPTION:

--------------------------------------------------------------------
$HISTORY:

Jun-13-2026   Created initial file.
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
- Tables need to have a minimum row count
- Need to add fetch commands for accounts, transactions, and categories to populate the graphs and tables


Dining & Restaurants: Includes fast food, coffee shops, fine dining, and delivery apps.
Groceries & 
Supermarkets: Excludes large retailers like Target or Walmart.Gas & 
Transit: Includes fuel, tolls, ride-sharing (Uber/Lyft), and public transportation.
Travel: Includes flights, hotels, car rentals, and travel agencies.
Retail & Online Shopping: Encompasses e-commerce, department stores, and apparel.
Entertainment Covers ticketing, concerts,
Streaming:  and services like Netflix or Spotify.
Utilities: Electric, water, and telecom bills.
Drugstores: Pharmacies and personal care items.
Home Improvement: Hardware and gardening stores.
Business Expenses: Shipping, advertising, and computer softwar
*/

import React, { useState, useEffect } from "react";
import {SelectBox,LoadedWorkspace, FilterBox, SelectAccountScreen } from "../Components/PageUtilities/Private/WorkspaceHub_Utils";
import SpendAnalyzer from "../Components/ProductTypes/SpendAnalyzer";
import styles from "./WorkspaceHubPage.module.scss";
import {DropDown, DropDownOption} from "../Components/CustomTags/DropDown";

interface CategoryData {
    category: string;
    amount: number;
}

interface MerchantData {
    merchant: string;
    amount: number;
}

interface TransactionData {
    name: string;
    amount: number;
    date: string;
}


function WorkspaceHubPage () {

    const [topCategories, setTopCategories] = useState<CategoryData[]>([]);
    const [topMerchants, setTopMerchants] = useState<MerchantData[]>([]);
    const [topTransactions, setTopTransactions] = useState<TransactionData[]>([]);
    const [accountData, setAccountData] = useState<DropDownOption[]>([]);

    const [workspaceList, setWorkspaceList] = useState<LoadedWorkspace[]>([]);
    const [visibleWorkspace, setVisibleWorkspace] = useState<LoadedWorkspace>();
    const [reloadWorkspace, setReloadWorkspace] = useState(0);

    const [isSelectAccountOpen, setIsSelectAccountOpen] = useState(false);

    //On page load, fetch the list of workspaces and the first workspace data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("/api/RetrieveWorkspaceList", {
                    method: "GET",
                    credentials: "include",

                });
                if (response.ok) {
                        console.log("Loaded workspaces successfully");
                        const jsonData = await response.json();
                        const { workspaceList } = jsonData;
                        console.log("Workspaces: %s", workspaceList);
                        const workspaceListData: LoadedWorkspace[] = workspaceList.map((workspaceList: {WorkspaceHubID: number, Name: string}) => ({
                            id: workspaceList.WorkspaceHubID,
                            name: workspaceList.Name
                        }));
                        setWorkspaceList(workspaceListData);
                        setVisibleWorkspace(workspaceListData[0]);
                    } else {
                        console.log("Workspaces not loaded successfully");
                }
            } catch {
                console.log("Could not retrieve workspace data");
            }
        }
        fetchData();
    }, []);

    //Fetch selected workspace data when selected workspace changes
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("/api/RetrieveWorkspaceHub", {
                    method: "POST",
                    credentials: "include",
                    body: JSON.stringify({WorkspaceHubID: visibleWorkspace?.id}),
                });
                if (response.ok) {
                        console.log("Loaded workspaces successfully");
                        const jsonData = await response.json();
                        const { topMerchants, topCategories, topTransactions, accountData } = jsonData;
                        // input may be string[][] where [0]=label, [1]=amount, [2]=date(optional)
                        const topMerchantsData: MerchantData[] = (topMerchants || []).map((merch: any) => {
                            const name = Array.isArray(merch) ? merch[0] : merch?.Merchant ?? "";
                            const amountRaw = Array.isArray(merch) ? merch[1] : merch?.Amount ?? 0;
                            const amount = typeof amountRaw === "string" ? parseFloat(amountRaw) || 0 : Number(amountRaw) || 0;
                            return { merchant: name, amount };
                        });

                        const topCategoriesData: CategoryData[] = (topCategories || []).map((cat: any) => {
                            const name = Array.isArray(cat) ? cat[0] : cat?.Category ?? "";
                            const amountRaw = Array.isArray(cat) ? cat[1] : cat?.Amount ?? 0;
                            const amount = typeof amountRaw === "string" ? parseFloat(amountRaw) || 0 : Number(amountRaw) || 0;
                            return { category: name, amount };
                        });

                        const topTransactionsData: TransactionData[] = (topTransactions || []).map((tran: any) => {
                            const name = Array.isArray(tran) ? tran[0] : tran?.Name ?? "";
                            const amountRaw = Array.isArray(tran) ? tran[1] : tran?.Amount ?? 0;
                            const date = Array.isArray(tran) ? (tran[2] || "") : tran?.Date ?? "";
                            const amount = typeof amountRaw === "string" ? parseFloat(amountRaw) || 0 : Number(amountRaw) || 0;
                            return { name, amount, date };
                        });

                        const accountDataParsed: DropDownOption[] = (accountData || []).map((acc: any) => {
                            const id = Array.isArray(acc) ? acc[0] : acc?.AccountID ?? "";
                            const name = Array.isArray(acc) ? acc[1] : acc?.Name ?? "";
                            return { id, name };
                        });
                        setAccountData(accountDataParsed);
                        setTopMerchants(topMerchantsData);
                        setTopCategories(topCategoriesData);
                        setTopTransactions(topTransactionsData);
                    } else {
                        console.log("Workspaces not loaded successfully");
                }
            } catch {
                console.log("Could not retrieve workspace data");
            }
        }

        fetchData();
    }, [visibleWorkspace, reloadWorkspace]);


    const DeleteAccount = (accounts: DropDownOption[]) => {
        const fetchData = async () => {
            try {
                const response = await fetch("/api/RemoveAccountsFromWorkspaceHub", {
                    method: "POST",
                    credentials: "include",
                    body: JSON.stringify({ WorkspaceHubID: visibleWorkspace?.id, LinkedAccountIDs: accounts.map(acc => parseInt(acc.id)) }),
                });
                if (response.ok) {

                        console.log("Deleted accounts successfully");
                        setReloadWorkspace((prev) => prev + 1);
                    } else {
                        console.log("Accounts not deleted successfully");
                }
            } catch {
                console.log("Could not delete accounts");
            }
        }
        fetchData();
    }

    const padRows = <T,>(rows: T[], emptyRowFactory: () => T): T[] => {
        const padded = rows.slice(0, 10);
        while (padded.length < 10) {
            padded.push(emptyRowFactory());
        }
        return padded;
    };

    const displayCategories = padRows(topCategories, () => ({ category: "", amount: 0 } as CategoryData));
    const displayMerchants = padRows(topMerchants, () => ({ merchant: "", amount: 0 } as MerchantData));
    const displayTransactions = padRows(topTransactions, () => ({ name: "", amount: 0, date: "" } as TransactionData));

    return (
        <>

        <div className={styles.container}>
            {/*left side bar holding environemnt select */}
            <div className={styles.sidebarContainer}>
                {/*Add a dropdown to show the different environments to choose from*/}
                <SelectBox workspaceList={workspaceList} onWorkspaceSelect={(workspace: LoadedWorkspace) => setVisibleWorkspace(workspace)} />
                <FilterBox />
            </div>
            {/*actual bulk of the page with graphs and tables */}
            <div className={styles.mainContainer}>  
                <div>
                    <h1>Workspace Hub</h1>
                </div>
                <div>
                    <h2>{visibleWorkspace?.name}</h2>
                    <button onClick={() => setIsSelectAccountOpen(true)} className={styles.addAccountButton}>+ Add Account</button>
                    <DropDown
                        title="Remove Accounts" 
                        options={accountData}
                        onSelectionChange={(selectedOptions) => {
                            DeleteAccount(selectedOptions);
                        }}
                    />
                </div>
                <div className={styles.categoryContainer}>
                    <div className={styles.categoryHeaderContainer}>
                        
                    </div>
                    <div className={styles.categoryBodyContainer}>
                        <div className={styles.categoryGraphContainer}>
                            <SpendAnalyzer accounts={topCategories.map((cat) => ({ name: cat.category, value: cat.amount }))} />
                        </div>
                            <div className={styles.categoryTableContainer}>
                                <div className={styles.panelHeader}>Top Category</div>
                                <table className={styles.panelTable}>
                                    <thead>
                                        <tr>
                                            <th>Category</th>
                                            <th>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {displayCategories.map((cat, index) => (
                                            <tr key={index}>
                                                <td>{cat.category}</td>
                                                <td>
                                                    <div style={{ color: cat.amount == 0 ? "transparent" : "black" }}>
                                                        {cat.amount.toFixed(2)}
                                                    </div>
                                                </td>
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
                                    <div className={styles.panelHeader}>Top Merchant</div>
                                    <table className={styles.panelTable}>
                                        <thead>
                                            <tr>
                                                <th>Merchant</th>
                                                <th>Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {displayMerchants.map((mer, index) => (
                                                <tr key={index}>
                                                    <td>{mer.merchant}</td>
                                                    <td>
                                                        <div style={{ color: mer.amount == 0 ? "transparent" : "black" }}>
                                                            {mer.amount.toFixed(2)}
                                                        </div>
                                                    </td>
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
                                <div className={styles.panelHeader}>Top Transactions</div>
                                <table className={styles.panelTable}>
                                    <thead>
                                        <tr>
                                            <th>Transaction</th>
                                            <th>Amount</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {displayTransactions.map((tran, index) => (
                                            <tr key={index}>
                                                <td>{tran.name}</td>
                                                <td>
                                                    <div style={{ color: tran.amount == 0 ? "transparent" : "black" }}>
                                                        {tran.amount.toFixed(2)}
                                                    </div>
                                                </td>
                                                <td>{tran.date}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                        </div>
                    </div>
                </div>
            </div>
            {isSelectAccountOpen && (
                <SelectAccountScreen 
                    workspaceHubID={visibleWorkspace?.id} 
                    onClose={() => setIsSelectAccountOpen(false)}
                    onSuccess={() => setReloadWorkspace((prev) => prev + 1)}
                />
            )}
        </div>

        
        </>
    )
}

export default WorkspaceHubPage;