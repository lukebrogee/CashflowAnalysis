/*
------------------------------------------------------------------
FILE NAME:     SelectAccount/index.tsx
PROJECT:       CashflowAnalysis
Date Created:  Jan-06-2026
--------------------------------------------------------------------
DESCRIPTION:
Component to select bank account for visual components
--------------------------------------------------------------------
$HISTORY:

Jan-06-2026   Created initial file.
------------------------------------------------------------------
*/
import styles from "./index.module.scss";
import {LoadButton} from "../../CustomTags/Buttons/LoadButton"
import {NavigateButton} from "../../CustomTags/Buttons/NavigateButton"
import {CloseXButton} from "../../CustomTags/Buttons/CloseXButton"
import {CircleErrorX} from "../../CustomTags/Icons/CircleErrorX"
import {useState, useEffect} from "react"

export interface WidgetData {
    widgetID: string,
    widgetTypes: string[]
}

interface SelectAccountScreenProps {
  wd: WidgetData;
  onClose: () => void;
}

type ButtonState = "idle" | "loading" | "success";

export const SelectAccountScreen = ({
  wd,
  onClose,
}: SelectAccountScreenProps) => {

    //Changing screens
    const [loadingAccounts, setLoadingAccounts] = useState<boolean>(true);
    const [errorLoading, setErrorLoading] = useState<boolean>(false);

    //Adusting components
    const [btnState, setBtnState] = useState<ButtonState>("idle");
    const [errorMessage, setErrorMessage] = useState<string>();

    //Holding data
    const [accounts, setAccounts] = useState<any[]>([]);
    const [institutions, setInstitutions] = useState<any[]>([]);
    const [accInfo, setAccInfo] = useState<AccountInformation[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<string[]>([]);

    //Saves bank account to widget
    const handleClick = async () => {
        if (!(selectedAccount.length > 0)) {
            setErrorMessage("Please select an account to add.");
            return
        }
        setErrorMessage("");
        setBtnState("loading");

        var institutionID = selectedAccount[0]
        var accountID = selectedAccount[1]

        try {
        const res = await fetch("/api/SaveWidgetAccount", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ 
                userWidgetID: wd.widgetID,
                institutionID: institutionID,
                accountID: accountID,
            }),
        });

        const ok = res.ok;
        if (!ok) {
            setBtnState("idle");
            setErrorMessage("Could not save account to widget, please try again.")
            return
        }
        setBtnState("success");
        //Leave timeout to show full animation
        setTimeout(() => {
            onClose();
        }, 1000);
        return ok;
        } catch (e: any) {
            setBtnState("idle");
            setErrorMessage("Could not save account to widget, please try again.")
            return false;
        }
    }

    //Gets called when the screen activates to load all accounts
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("/api/retrieve_user_account/", {
                    method: "GET",
                    credentials: "include",
                });
                if (response.ok) {
                        console.log("Loaded accounts successfully");
                        const jsonData = await response.json();
                        const { accounts, institutions } = jsonData;

                        setAccounts([...accounts]);
                        setInstitutions([...institutions]);
                        setLoadingAccounts(false);
                    } else {
                        setLoadingAccounts(false);
                        setErrorLoading(true);
                        console.log("Accounts not loaded successfully");
                }
            } catch {
                setErrorLoading(true);
                console.log("Could not retreive account data");
            }
        }
        fetchData();
    },[])

    //Wants accounts have been loaded format data
    useEffect(() => {
        function createAccountInformation() {
            var createAccounts: AccountInformation[] = [];
            accounts.forEach((account) => {
                if (!wd.widgetTypes.includes(account.Type)) return;

                var insName = "";
                institutions.forEach((ins) => {
                    if (account.LinkedInstitutionID === ins.LinkedInstitutionID) {
                        insName = ins.InstitutionName;
                    }
                })
                const updatedAt = new Date(account.CreatedAt)
                .toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                });
                const acc: AccountInformation = {
                    institutionName: insName,
                    institutionID: account.LinkedInstitutionID,
                    AccountName: account.Name,
                    AccountID: account.AccountID,
                    Mask: account.Mask,
                    AddedAt: updatedAt
                };
                createAccounts.push(acc);
            }) 
            setAccInfo(createAccounts);
        }

        createAccountInformation();
    },[accounts])


    return (
        <>
            <div className={styles.popupPositioning}>
                <div className={styles.container}>
                    <div className={styles.closexButtonDiv}>
                        <CloseXButton onClose={onClose} />
                    </div>
                    
                    {(loadingAccounts) ? (
                        <>
                            <div className={styles.loadingScreen}>
                                <div className={styles.loader}></div>
                            </div>
                            
                        </>
                    ) : (errorLoading) ? (
                        <>
                            <div className={styles.errorScreen}>
                                <CircleErrorX/>
                                <h1>Error loading account data</h1>
                            </div>
                        </>
                    ) : (accInfo.length === 0) ? (
                        <>
                            <div className={styles.noAccountsScreen}>
                                <h1>No bank accounts to add to widget</h1>
                                <br/>
                                <h1>Add accounts here</h1>
                                <NavigateButton navigateTo="/authenticate-account" name="Authenticate Account"/>
                            </div>                
                        </>
                    ) : (
                        <>
                            <div className={styles.AccountScreenTop}>
                                <h1>Select Account</h1>
                                <hr/>
                            </div>
                            <div className={styles.AccountScrollBox}>
                                {accInfo.map(acc => {
                                    const isSelected = acc.AccountID === selectedAccount[1];
                                    const accData: AccountInformation = {
                                        institutionName: acc.institutionName,
                                        institutionID: acc.institutionID,
                                        AccountName: acc.AccountName,
                                        AccountID: acc.AccountID,
                                        Mask: acc.Mask,
                                        AddedAt: acc.AddedAt,
                                    };

                                return (
                                    <AccountButton key={acc.AccountID} selected={isSelected} acc={accData}  onClick={() =>setSelectedAccount([acc.institutionID, acc.AccountID])}/>
                                );
                                })}
                            </div>
                            <div className={styles.SubmitBox}>
                                {errorMessage && 
                                    <div className={styles.errorMessageBox}>
                                        {errorMessage}
                                    </div> 
                                }
                                <LoadButton 
                                    state={btnState}
                                    onClick={handleClick}
                                    onSuccessDone={() => {setBtnState("idle");}}
                                />
                            </div>                        
                        </>    
                    )}
                </div>
            </div>
        </>
    )
}

interface AccountInformation {
    institutionName: string,
    institutionID: string,
    AccountName: string,
    AccountID: string,
    Mask: string,
    AddedAt: string,
}

interface AccountButtonInfo {
    acc: AccountInformation,
    onClick: () => void;
    selected: boolean;
}

//Displays account information on button
export const AccountButton = ({acc, onClick, selected}: AccountButtonInfo) => {
    return (
        <>
        <div onClick={onClick} className={ !selected
                                                ? styles.AccountButton
                                                : styles.AccountButtonClicked}>
            <h1 className={styles.AccountName}>{acc.institutionName + " " + acc.AccountName}</h1>
            <h3 className={styles.MaskID}>{"••••" + acc.Mask}</h3>
            <h3 className={styles.AddedAt}>{"Added: " + acc.AddedAt}</h3>
            <input type="hidden" value={acc.AccountID} name="SelectedAccountID"/>
            <input type="hidden" value={acc.institutionID} name="SelectedInstitutionID"/>
        </div>
        </>
    )
}