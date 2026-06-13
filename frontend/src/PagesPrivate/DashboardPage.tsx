/*
------------------------------------------------------------------
FILE NAME:     DashboardPage.tsx
PROJECT:       CashflowAnalysis
Date Created:  Jan-28-2025
--------------------------------------------------------------------
DESCRIPTION:

--------------------------------------------------------------------
$HISTORY:

Jan-28-2026   Created initial file
Jun-13-2026   Updated import paths
------------------------------------------------------------------
*/
import {WidgetBoard} from "../Components/PageUtilities/Private/DashboardPage_Utils";
import styles from "./DashboardPage.module.scss"

function DashboardPage () {
    return (
        <>
        <div className={styles.container}>
            <div className={styles.widgetContainer}>
                <WidgetBoard />
            </div>            
        </div>

            
        </>
    )
}

export default DashboardPage;