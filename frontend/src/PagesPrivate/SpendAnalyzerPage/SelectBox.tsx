/*
------------------------------------------------------------------
FILE NAME:     SelectBox.tsx
PROJECT:       CashflowAnalysis
Date Created:  May-31-2026
--------------------------------------------------------------------
DESCRIPTION:
Component to display a list of workspaces for the user to select from.
User can view existing workspaces, create new workspaces, delete workspaces, and rename workspaces.
When a workspace is selected, the onWorkspaceSelect callback is called with the selected workspace.
--------------------------------------------------------------------
$HISTORY:

May-31-2026   Initial file created.
------------------------------------------------------------------
*/

import React, { useState } from 'react';
import styles from "./SelectBox.module.scss";
import {PopupBack} from "../../Components/CustomTags/PopupBack/index";

/*
- Finish delete and add popups
- Add a rename flow (either popup or inline) for the workspaces
- Add backend fetch for retrieving list of workspaces, and for deleting/adding/renaming workspaces
- Add loading states for when workspaces are being fetched, added, deleted, or renamed
- Add error handling for when workspace fetch/add/delete/rename fails
- General css fixing and styling improvements
*/





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
