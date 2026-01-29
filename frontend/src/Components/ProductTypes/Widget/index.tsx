/*
------------------------------------------------------------------
FILE NAME:     index.tsx
PROJECT:       CashflowAnalysis
Date Created:  Jan-28-2026
--------------------------------------------------------------------
DESCRIPTION:
    This component represents a Widget in the Widget Dashboard, allowing users to
    view, add, or delete widgets.
--------------------------------------------------------------------
$HISTORY:

Jan-28-2026   Created initial file.
------------------------------------------------------------------
*/
import styles from "./index.module.scss"
import {useState} from "react";
import {SelectAccountScreen} from "../../ProductTypes/SelectAccount/index"
import { CloseXButton } from "../../CustomTags/Buttons/CloseXButton";
import { PopupBack } from "../../CustomTags/PopupBack";

export interface WidgetData {
	WidgetID:      number,
	WidgetType:    string | null,
    RowID: number | null,
    ColumnType: string,
    SortOrder: number,
    LinkedAccounts: WidgetLinkedAccounts[]
}

interface WidgetLinkedAccounts {
    WidgetID: number,
    LinkedAccountID: number,
    CreatedAt: string
}

interface Props {
    wd: WidgetData,
    onWidgetUpdated: (updated: WidgetData) => void,
}

// Defines available widget types and their compatible account types
export const WidgetTypes: [string, string[]][] = [
  ["Spend Analyzer", ["depository", "credit"]],
  ["Investment Graph", ["investment", "depository"]],
  ["Transactions", ["depository", "credit", "investment", "loan"]],
];

export const Widget = ({
    wd,
    onWidgetUpdated}: Props) => {
    const [isSelectAccountOpen, setIsSelectAccountOpen] = useState(false);
    const [deleteWidget, setDeleteWidget] = useState(false);

    // Handles deletion of the account tied to the widget
    const handleDelete = () => {
        const deleteAccount = async () => {
            try {
            const res = await fetch("/api/DeleteWidgetAccount", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ 
                  WidgetID: wd.WidgetID
                }),
            });

            const ok = res.ok;
            const jsonData = await res.json();
            if (!ok) {
                const {Error} = jsonData;
                console.error("Error deleting widget account:", Error);
              return ok
            }
            wd.WidgetType = null;
            setDeleteWidget(false);
            onWidgetUpdated(wd);
            return ok;
            } catch (e: any) {
                console.error("Error deleting widget account:", e);
              return false;
            }
        }
        deleteAccount();
    }

    return (
        <>
            <div className={styles.container}>
                {(wd.WidgetType != null) ? (
                    <>
                        <div className={styles.DeleteWidgetButton}>
                            <CloseXButton onClose={() => setDeleteWidget(true)}/>
                        </div>
                        <div className={styles.widget}>
                            {wd.WidgetType}
                        </div>                         
                    </>
               
                ) : ( //If no widget is set, show add button
                    <div onClick={() => setIsSelectAccountOpen(true)} className={styles.button}>
                        <div className={styles[`plus${wd.ColumnType}`] ?? ""}><></></div>                
                    </div>                
                )}
            </div>
            {//Popup for confirming widget deletion
            deleteWidget && (
                <PopupBack height={"15"} width={"25"}>
                    <div className={styles.DeleteWidgetScreen}>
                        <h1>Are you sure you want to delete this widget?</h1>
                        <div className={styles.DeleteButtonDiv}>
                            <button onClick={handleDelete}>Remove</button>
                            <button onClick={() => setDeleteWidget(false)}>Cancel</button>
                        </div>                        
                    </div>
                </PopupBack>
            )}
            {//Popup for selecting account to link to widget
            isSelectAccountOpen && ( 
                <SelectAccountScreen 
                wd={wd} 
                updatedwd={(updatedwd) => {
                    onWidgetUpdated(updatedwd)
                }}
                onClose={() => setIsSelectAccountOpen(false)}/>
            )}
        </>
    )
}