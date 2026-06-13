/*
------------------------------------------------------------------
FILE NAME:     WorkspaceHub_Utils.tsx
PROJECT:       MoneyLens
Date Created:  Jun-13-2026
--------------------------------------------------------------------
DESCRIPTION:

--------------------------------------------------------------------
$HISTORY:

Jun-13-2026   Created initial file.
------------------------------------------------------------------
*/

import React from 'react'
import styles from "./WorkspaceHub_Utils.module.scss";
import {LoadButton} from "../../../Components/CustomTags/Buttons/LoadButton"
import {NavigateButton} from "../../../Components/CustomTags/Buttons/NavigateButton"
import {CloseXButton} from "../../../Components/CustomTags/Buttons/CloseXButton"
import {CircleErrorX} from "../../../Components/CustomTags/Icons/CircleErrorX"
import {useState, useEffect} from "react"
import { PopupBack } from "../../../Components/CustomTags/PopupBack";


export const FilterBox = () => {
  return (
    <div>
        {/*components for filtering the transactions shown in the table and graphs on the spend analyzer page */}
    </div>
  )
}

//Props for SelectAccountScreen
interface SelectAccountScreenProps {
  workspaceHubID: number | undefined;
  onClose: () => void;
  onSuccess: () => void;
}

type ButtonState = "idle" | "loading" | "success";


//Defines which account types are allowed to be added to the workspace
const AllowedAccounts: string[] = ["depository", "credit"];


export const SelectAccountScreen = ({
    workspaceHubID,
  onClose,
    onSuccess
}: SelectAccountScreenProps) => {

    //Changing screens
    const [loadingAccounts, setLoadingAccounts] = useState<boolean>(false);
    const [errorLoading, setErrorLoading] = useState<boolean>(false);

    //Adusting components
    const [btnState, setBtnState] = useState<ButtonState>("idle");
    const [errorMessage, setErrorMessage] = useState<string>();

    //Holding data
    const [accounts, setAccounts] = useState<any[]>([]);
    const [institutions, setInstitutions] = useState<any[]>([]);
    const [accInfo, setAccInfo] = useState<AccountInformation[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<string[]>([]);

    //Saves bank account to workspace hub
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
        const res = await fetch("/api/AddAccountToWorkspaceHub", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ 
                WorkspaceHubID: workspaceHubID,
                LinkedAccountID: accountID,
            }),
        });

        const ok = res.ok;
        if (!ok) {
            setBtnState("idle");
            setErrorMessage("Could not save account to widget, please try again.")
            return
        }
        onSuccess();
        setBtnState("success");
        //Leave timeout to show full animation
        setTimeout(() => {
            onClose();
        }, 2000);
        
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
                setLoadingAccounts(true)
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
            accounts.forEach(account => {

                if (!AllowedAccounts.includes(account.Type)) {
                    return; // skip this account only
                }  

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
            <PopupBack height="70" width="25">
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
            </PopupBack>
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

export interface LoadedWorkspace {
  id: number;
  name: string;
}

interface SelectBoxProps {
    workspaceList: LoadedWorkspace[];
    onWorkspaceSelect: (workspace: LoadedWorkspace) => void;
}

export const SelectBox = ({ workspaceList, onWorkspaceSelect }: SelectBoxProps) => {
  // keep local copy in state but sync with incoming prop updates
  const [loadedWorkspaces, setLoadedWorkspaces] = useState<LoadedWorkspace[]>([]);

  React.useEffect(() => {
    setLoadedWorkspaces(workspaceList || []);
  }, [workspaceList]);

  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [showAddWorkspacePopup, setShowAddWorkspacePopup] = useState(false);
  const [showRenameWorkspacePopup, setShowRenameWorkspacePopup] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState<string>("");

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState<number>();
  const [workspaceToRename, setWorkspaceToRename] = useState<number>();

  const handleAddWorkspace = (name: string) => {
    const fetchData = async () => {
        try {
            const response = await fetch("/api/SaveWorkspaceHub", {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({ Name: name }),
            });
            if (response.ok) {
              const jsonData = await response.json();
              const { WorkspaceHubID } = jsonData;
              setLoadedWorkspaces(prev => [...prev, { id: WorkspaceHubID, name: name }]);
            } else {
              console.log("Workspace added successfully");
            }
        } catch {
            console.log("Could not add workspace data");
        }
    }
    if (name.trim() === "") {
      return;
    }
    fetchData();
  };

  const handleDeleteClick = () => {
    const fetchData = async () => {
        try {
            const response = await fetch("/api/DeleteWorkspaceHub", {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({ WorkspaceHubID: workspaceToDelete }),
            });
            if (response.ok) {
                    setLoadedWorkspaces((prev) => prev.filter((workspace) => workspace.id !== workspaceToDelete));
            } else {
              console.log("Workspaces deleted successfully");
            }
        } catch {
            console.log("Could not delete workspace data");
        }
    }
    fetchData();
  };

  const handleRenameClick = () => {
    const fetchData = async () => {
        try {
            const response = await fetch("/api/RenameWorkspaceHub", {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({ WorkspaceHubID: workspaceToRename, Name: newWorkspaceName }),
            });
            if (response.ok) {
                    setLoadedWorkspaces((prev) => prev.map((workspace) => workspace.id === workspaceToRename ? { ...workspace, name: newWorkspaceName } : workspace));
                    setShowRenameWorkspacePopup(false);
            } else {
              console.log("Workspace renamed successfully");
            }
        } catch {
            console.log("Could not rename workspace");
        }
    }
    if (newWorkspaceName.trim() === "") {
      return;
    }
    fetchData();
  };

  const handleWorkspaceSelect = (workspace: LoadedWorkspace) => {
    onWorkspaceSelect(workspace);
  };

  const toggleMenu = (id: number) => {
    setActiveMenuId((current) => (current === id ? null : id));
  };

  const WorkspaceRow = ({ workspace }: { workspace: LoadedWorkspace }) => (
    <div className={styles.workspaceRow}>
      <div onClick={() => handleWorkspaceSelect(workspace)} className={styles.workspaceName}>{workspace.name}</div>
      <div className={styles.workspaceAction}>
        <button
          type="button"
          className={styles.menuButton}
          onClick={() => toggleMenu(workspace.id)}
        >
          ⋮
        </button>
        {activeMenuId === workspace.id && (
          <div className={styles.menuDropdown}>
            <button
              type="button"
              className={styles.menuItem}
              onClick={() => {setShowDeleteConfirmation(true)
                setWorkspaceToDelete(workspace.id)
              }}
            >
              Delete
            </button>
            <button
              type="button"
              className={styles.menuItem}
              onClick={() => {
                setShowRenameWorkspacePopup(true);
                setWorkspaceToRename(workspace.id);}}>
              Rename
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
        {showAddWorkspacePopup ? (
          <PopupBack height="25" width="25">
            <div className={styles.addWorkspacePopup}>
              <h2>Add a new workspace</h2>
              <input
                type="text"
                placeholder="Workspace Name"
                className={styles.input}
                value={newWorkspaceName}
                onChange={(event) => setNewWorkspaceName(event.target.value)}
              />
              <button
                className={styles.addButton}
                type="button"
                onClick={() => {
                  if (newWorkspaceName.trim() === "") {
                    return;
                  }
                  handleAddWorkspace(newWorkspaceName.trim());
                  setNewWorkspaceName("");
                  setShowAddWorkspacePopup(false);
                }}
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setNewWorkspaceName("");
                  setShowAddWorkspacePopup(false);
                }}
              >Close</button>
            </div>
          </PopupBack>
        ) : showDeleteConfirmation ? (
          <PopupBack height="25" width="25">
            <div className={styles.deleteConfirmationPopup}></div>
            <h2>Are you sure you want to delete this workspace?</h2>
            <button onClick={() => {setShowDeleteConfirmation(false)
              handleDeleteClick()}
            }>Delete</button>
            <button onClick={() => setShowDeleteConfirmation(false)}>Cancel</button>
          </PopupBack>
        ) : showRenameWorkspacePopup ? (
          <PopupBack height="25" width="25">
            <div className={styles.renameWorkspacePopup}>
              <h2>Rename workspace</h2>
              <input
                type="text"
                placeholder="New Workspace Name"
                className={styles.input}
                value={newWorkspaceName}
                onChange={(event) => setNewWorkspaceName(event.target.value)}
              />
              <button
                className={styles.addButton}
                type="button"
                onClick={() => {
                  if (newWorkspaceName.trim() === "") {
                    return;
                  }
                  handleRenameClick();
                }}>Rename</button>
              <button
                type="button"                
                onClick={() => {
                  setShowRenameWorkspacePopup(false);
                }}
              >Close</button>
            </div>
          </PopupBack>
        ) : null}
        <div className={styles.selectBoxContainer}>
        <div className={styles.title}>Workspace Selection</div>
        <div className={styles.workspaceList}>
            <button
            type="button"
            className={styles.addWorkspaceRow}
            onClick={() => setShowAddWorkspacePopup(true)}
            >
            <span className={styles.addIcon}>+</span>
            <span>Add a workspace</span>
            </button>
            {loadedWorkspaces.map((workspace) => (
            <WorkspaceRow workspace={workspace} key={workspace.id} />
            ))}
        </div>
        </div>    
    </>

  );
};
