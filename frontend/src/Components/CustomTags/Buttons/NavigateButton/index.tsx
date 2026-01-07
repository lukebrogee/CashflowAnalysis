/*
------------------------------------------------------------------
FILE NAME:     NavigateButton/index.tsx
PROJECT:       CashflowAnalysis
Date Created:  Jan-06-2026
--------------------------------------------------------------------
DESCRIPTION:
Component to display a button to navigate to another page
--------------------------------------------------------------------
$HISTORY:

Jan-06-2026   Created initial file.
------------------------------------------------------------------
*/
import styles from "./index.module.scss"
import { useNavigate } from "react-router-dom"

interface Props {
    name: string,
    navigateTo: string,
}

export const NavigateButton = ({name, navigateTo}:Props) => {
    const navigate = useNavigate();
    const handleClick = () => {
        navigate(navigateTo);
    }

    return (
        <>
            <div onClick={handleClick} className={styles.container}>
                <h1 className={styles.button}>{name}</h1>
            </div>  
        </>
    )
}