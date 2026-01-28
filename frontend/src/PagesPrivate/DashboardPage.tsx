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
------------------------------------------------------------------
*/
import WidgetBoard from "../Components/WidgetBoard";
import styles from "../PagesPrivate/PageCSS/dashboard.module.scss"

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