/*
- Button at the top named something like "+ Add Account"
- Maybe a line under that
- Then will show a list of accounts added for spend analyzer environment

*/

import React, { useState } from 'react';
import styles from "./SelectBox.module.scss";

interface SelectBoxProps {
    // Define any props needed for the SelectBox component
}

export const SelectBox = () => {

    const [loadedAccounts, setLoadedAccounts] = useState<string[]>([
        "Chase Checking",
        "Chase Credit Card",
        "Wells Fargo Checking",
        "Wells Fargo Credit Card",
        "Bank of America Checking",
        "Bank of America Credit Card",
    ]);

    const handleAddAccount = () => {
        // Logic to add a new account (e.g., open a modal or navigate to an account selection page)
    }

    const loadAccounts = () => {
        // Logic to load and display the list of accounts added for the spend analyzer environment
    }

    const deleteAccount = (account: string) => {
        // Logic to delete an account from the list of loaded accounts
        setLoadedAccounts(prev => prev.filter(a => a !== account));
    }

    return (
        <div>
            <div>
                <div onClick={handleAddAccount}>+ Add Account</div>
            </div>
            <line />
            <div className={styles.accountContainer}>
                {loadedAccounts.map((account, index) => (
                    <div className={styles.accountBlock} key={index}>
                        <div>{account}</div>
                        <div onClick={() => deleteAccount(account)}>Delete</div>
                    </div>
                ))}
            </div>
        </div>
    )
}
