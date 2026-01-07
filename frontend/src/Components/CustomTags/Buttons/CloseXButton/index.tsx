/*
------------------------------------------------------------------
FILE NAME:     CloseXButton/index.tsx
PROJECT:       CashflowAnalysis
Date Created:  Jan-06-2026
--------------------------------------------------------------------
DESCRIPTION:
Component to display an X with a circular click box. Mainly used for
closing a window, component, or popup
--------------------------------------------------------------------
$HISTORY:

Jan-06-2026   Created initial file.
------------------------------------------------------------------
*/
import styles from "./index.module.scss"

interface Props {
    onClose: () => void
}

export const CloseXButton = ({onClose}: Props) => {
    return (
        <button onClick={onClose} className={styles.closexButton}></button>
    )
}