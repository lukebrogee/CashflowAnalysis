/*
------------------------------------------------------------------
FILE NAME:     index.tsx
PROJECT:       CashflowAnalysis
Date Created:  Jan-28-2025
--------------------------------------------------------------------
DESCRIPTION:
    This is a popup background component that centers its children with the
    specified design of the website
--------------------------------------------------------------------
$HISTORY:

Jan-28-2026   Created initial file
------------------------------------------------------------------
*/
import styles from "./index.module.scss"

interface Props {
  height: string,
  width: string,
  children: React.ReactNode
}

export const PopupBack = ({height, width, children}: Props) => {
    return (
        <div className={styles.popupPositioning}>
            <div style={{height: `${height}%`, width: `${width}%`}} className={styles.container}>
                {children}
            </div>            
        </div>
    )
}