/*
------------------------------------------------------------------
FILE NAME:     WidgetBoard.tsx
PROJECT:       CashflowAnalysis
Date Created:  Dec-24-2025
--------------------------------------------------------------------
DESCRIPTION:
Widget Board designed to hold graphic components holding data from user accounts
--------------------------------------------------------------------
$HISTORY:

Dec-24-2025   Created initial file.
Dec-30-2025   Disabled Widget Board features do to bugs
Jan-28-2026   Created new widget board design giving users ability to add/remove rows and widgets
              with three different row types and three different widget sizes.
------------------------------------------------------------------
*/
import React, {useRef, useEffect, useState} from "react";
import styles from "./ComponentsCSS/widgetBoard.module.scss"
import { Widget, WidgetData } from "./ProductTypes/Widget";
import { CloseXButton } from "./CustomTags/Buttons/CloseXButton";


//Interface for Singular Widget Board Data
export interface WidgetBoardData {
  WidgetBoardID: number,
  UserID: number,
  WidgetBoardRows: WidgetBoardRows[]
}

//Interface for Single Row in Widget Board
interface WidgetBoardRows {
  RowID: number,
  WidgetBoardID: number,
  RowType: string,
  SortOrder: number,
  Widgets: WidgetData[]
}


function WidgetBoard() {
    //Loading state for Widget Board
    const [loading, setLoading] = useState<boolean>(true);
    //Error state for Widget Board
    const [errorLoading, setErrorLoading] = useState<string>();

    //Select row type reference (dropdown)
    const selectRef = useRef<HTMLSelectElement | null>(null);

    //Empty widget board data to prevent null errors
    const emptyBoard: WidgetBoardData = {
      WidgetBoardID: 0,
      UserID: 0,
      WidgetBoardRows: [],
    };
    //State for Widget Board Data
    const [widgetBoard, setWidgetBoard] = useState<WidgetBoardData>(emptyBoard);

    //On load fetch widget board data from backend
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("/api/retrieveWidgets/", {
                    method: "GET",
                    credentials: "include",
                });
                const jsonData = await response.json();
                if (response.ok) {
                      const { WidgetBoardData } = jsonData;
                      setWidgetBoard(WidgetBoardData);
                      //Set loading to false after data is loaded
                      setLoading(false);
                    } else {
                      const { Error } = jsonData;
                      setErrorLoading(Error);
                }
            } catch {
                setErrorLoading("Could not retrieve widget data");
            }
        }
        fetchData();
    },[])

    //Once a widget is updated, update the widget board state to reflect changes
    const updateWidget = (updatedWidget: WidgetData) => {
      setWidgetBoard(prev => {
        if (!prev) return prev;
        return {
          ...prev, //Keep all previous data
          //Change only the updated widget in the correct row
          WidgetBoardRows:         
          prev.WidgetBoardRows.map(r => ({
          ...r,
          Widgets: r.Widgets.map(w =>
            w.WidgetID === updatedWidget.WidgetID // If widget IDs match, update widget
              ? updatedWidget
              : w
          ),
          }))
        }
    });
    };

    //Function to handle adding new row to widget board
    const handleClick = () => {
      const addRowToWidget = async (newRow: WidgetBoardRows) => {
          try {
            //Send widget board interface with new row to backend
            const newWidgetBoard: WidgetBoardData = {
              WidgetBoardID: widgetBoard.WidgetBoardID,
              UserID: widgetBoard.UserID,
              WidgetBoardRows: [newRow]
            }
          const res = await fetch("/api/AddRowToWidgetBoard", {
              method: "POST",
              credentials: "include",
              headers: {
                  "Content-Type": "application/json"
              },
              body: JSON.stringify({ 
                WidgetBoard: newWidgetBoard
              }),
          });
          const jsonData = await res.json();
          const ok = res.ok;
          if (!ok) {
            const { Error } = jsonData;
            setErrorLoading(Error);
            return ok
          }
          
          const { ReturnedRow } = jsonData;
          //Update widget board state with new row
          setWidgetBoard(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              WidgetBoardRows: [...prev.WidgetBoardRows, ReturnedRow]
            };
          });
          return ok;
          } catch (e: any) {
            setErrorLoading("Could not add row to widget board.");
            return false;
          }
      }

        //Logic for handling request for row addition
        //In the future default value needs to be "Add Row" or similar
        var value = selectRef.current?.value;
        if (value == undefined) {
          value = "";
        }
        if (selectRef.current) {
          selectRef.current.value = "";
        }
        if (value != ""){ //User selected a row type
          var lastRow = widgetBoard.WidgetBoardRows[widgetBoard.WidgetBoardRows.length - 1];
          const newRow = CreateRow(lastRow.SortOrder, value, widgetBoard.WidgetBoardID)
          addRowToWidget(newRow);
        }
    }

    //Component for rendering a single row in the widget board
  const Row = ({rowType, rowID, children}: RowComponent) => {

    var widget: React.ReactNode[] = [];

    //If widget in row populated with account data deactivate delete button
    var populatedRow = false;
    
    //Check each child widget to see if populated and push each widget to array
    React.Children.forEach(children, child => {
      if (!React.isValidElement(child)) return;
      if (child.props.wd.WidgetType != null){
        populatedRow = true;
      }
      widget.push(child);
    });

    //Function to handle deleting row from widget board
    const handleDelete = () => {
        const deleteRow = async () => {
            try {
            const res = await fetch("/api/DeleteRowToWidgetBoard", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ 
                  RowID: rowID
                }),
            });
            const jsonData = await res.json();
            const ok = res.ok;
            if (!ok) {
              const { Error } = jsonData;
              setErrorLoading(Error);
              return ok
            }
            setWidgetBoard(prev => {
              if (!prev) return prev;
              return {
                ...prev, //re-render widget board without deleted row
                WidgetBoardRows: prev.WidgetBoardRows.filter(r => r.RowID !== rowID)                
              }
            });
            return ok;
            } catch (e: any) {
              setErrorLoading("Could not delete row from widget board.");
              return false;
            }
        }
        deleteRow();
    }

    //Render row based on row type
    switch(rowType){
      case "1":
        if (widget.length < 1) {
          return null
        }
        return (
          <>
          {/*If row not populated with widget account data, show delete button */}
            {!populatedRow &&
              <div className={styles.DeleteRowButton}>
                <CloseXButton onClose={handleDelete}/>
              </div>        
            }
            <div className={styles.row}>
              <div className={styles.column1}>
                {widget[0]}
              </div>
            </div>        
          </>
        )
      case "2a":
        if (widget.length < 2) {
          return null
        }
        return (
          <>
            {!populatedRow ?
              <div className={styles.DeleteRowButton}>
                <CloseXButton onClose={handleDelete}/>
              </div>  :
              <div className={styles.MoveRowButton}>
               <div className={styles.upDownArrow}>
                <span></span>
               </div>
              </div>   
            }
            <div className={styles.row}>
              <div className={styles.column2}>
                {widget[0]}
              </div>
              <div className={styles.column3}>
                {widget[1]}
              </div>
            </div>        
          </>
        )  
      case "2b":
        if (widget.length < 2) {
          return null
        }
        return (
          <>
            {!populatedRow &&
              <div className={styles.DeleteRowButton}>
                <CloseXButton onClose={handleDelete}/>
              </div>        
            }
            <div className={styles.row}>
              <div className={styles.column3}>
                {widget[0]}
              </div>
              <div className={styles.column2}>
                {widget[1]}
              </div>
            </div>        
          </>
        )      
      case "3":
        if (widget.length < 3) {
          return null
        }
        return (
          <>
            {!populatedRow &&
              <div className={styles.DeleteRowButton}>
                <CloseXButton onClose={handleDelete}/>
              </div>        
            }
            <div className={styles.row}>
              <div className={styles.column3}>
                {widget[0]}
              </div>
              <div className={styles.column3}>
                {widget[1]}
              </div>
              <div className={styles.column3}>
                {widget[2]}
              </div>
            </div>        
          </>
        )
      default:
        return (
          <div className={styles.row}>
            <div className={styles.column1}>
            </div>
          </div>
        )
    }
  }
    

    return (
      <>
      <div className={styles.container}>
        {/*Container for selecting/adding row type*/}
          <div className={styles.selectContainer}>
            <select onClick={handleClick} ref={selectRef}  name="widgetRowType">
              <option></option>
              <option value="3">3 widgets</option>
              <option value="2a">2a widgets</option>
              <option value="2b">2b widgets</option>
              <option value="1">1 widget</option>
            </select>            
          </div>
          <div className={styles.widgetContainer}>
            {/*Error state*/
            errorLoading ? (
              <div>{errorLoading}</div>
            /*Loading state*/
            ) : loading ? (
              <div>Loading...</div>
            ) : 
            /*Widget Board State*/
            (widgetBoard != null) && (
              <>
                {widgetBoard.WidgetBoardRows.map((r) => (
                  <div key={r.RowID} className={styles.rowContainer}>
                    <Row rowType={r.RowType} rowID={r.RowID}>
                      {r.Widgets.map((widget) => (
                        <Widget
                          wd={widget}
                          onWidgetUpdated={updateWidget}
                        />
                      ))}
                    </Row>
                  </div>
                ))}                 
              </>            
            )}
          </div>          
      </div>
      </>
    )
}

//Interface for Adding Row Component props
interface RowComponent {
  rowType: string,
  rowID: number,
  children: React.ReactNode
}

//Function to create new row based on row type selected
const CreateRow = (sortOrder: number, rowType: string, wbID: number) => {

  var newRow: WidgetBoardRows;

    switch(rowType){
      case "1":
        newRow = {
          RowID: 0,
          RowType: rowType,
          WidgetBoardID: wbID,
          SortOrder: sortOrder + 1,
          Widgets: [
            {WidgetID: 0, RowID: null, WidgetType: null, ColumnType: "1", SortOrder: 1,
              LinkedAccounts: []
            },
          ]
        }
        break;
      case "2a":
        newRow = {
          RowID: 0,
          RowType: rowType,
          WidgetBoardID: wbID,
          SortOrder: sortOrder + 1,
          Widgets: [
            {WidgetID: 0, RowID: null, WidgetType: null, ColumnType: "2", SortOrder: 1,
              LinkedAccounts: []
            },
            {WidgetID: 0, RowID: null, WidgetType: null, ColumnType: "3", SortOrder: 2,
              LinkedAccounts: []
            },
          ]
        }
        break;
      case "2b":
        newRow = {
          RowID: 0,
          RowType: rowType,
          WidgetBoardID: wbID,
          SortOrder: sortOrder + 1,
          Widgets: [
            {WidgetID: 0, RowID: null, WidgetType: null, ColumnType: "3", SortOrder: 1,
              LinkedAccounts: []
            },
            {WidgetID: 0, RowID: null, WidgetType: null, ColumnType: "2", SortOrder: 2,
              LinkedAccounts: []
            },
          ]
        }
        break;
      case "3":
        newRow = {
          RowID: 0,
          RowType: rowType,
          WidgetBoardID: wbID,
          SortOrder: sortOrder + 1,
          Widgets: [
            {WidgetID: 0, RowID: null, WidgetType: null, ColumnType: "3", SortOrder: 1,
              LinkedAccounts: []
            },
            {WidgetID: 0, RowID: null, WidgetType: null, ColumnType: "3", SortOrder: 2,
              LinkedAccounts: []
            },
            {WidgetID: 0, RowID: null, WidgetType: null, ColumnType: "3", SortOrder: 3,
              LinkedAccounts: []
            },
          ]
        }
        break;
      default:
        newRow = {
          RowID: 0,
          RowType: "",
          WidgetBoardID: 0,
          SortOrder: 0,
          Widgets: []
        };
    }

    return newRow
}

export default WidgetBoard;