
/*
------------------------------------------------------------------
FILE NAME:     LoadButton/index.tsx
PROJECT:       CashflowAnalysis
Date Created:  Jan-06-2026
--------------------------------------------------------------------
DESCRIPTION:
Component to display a button, with a circular loading animation,
and a checkmark wants the process is finished
--------------------------------------------------------------------
$HISTORY:

Jan-06-2026   Created initial file.
------------------------------------------------------------------
*/
import { useEffect } from "react";

import styles from "./index.module.scss"

type ButtonState = "idle" | "loading" | "success";

//Example usage for adding the <Button/> to the Component
/*
//Outside of the components function
type ButtonState = "idle" | "loading" | "success";

//Inside the components function
    const [btnState, setBtnState] = useState<ButtonState>("idle");

    const handleClick = async () => {
        setBtnState("loading");

        try {
        // do your async actions here
        // e.g. await fetch("/api/something", { method: "POST", credentials: "include" });
        await new Promise((r) => setTimeout(r, 2000)); // demo
        setBtnState("success");
        } catch (e) {
        setBtnState("idle");
        }
    }

    return (
        <LoadButton 
            state={btnState}
            onClick={handleClick}
            onSuccessDone={() => setBtnState("idle")}
        />
    )
*/

type Props = {
  state: ButtonState;
  onClick: () => void;
  onSuccessDone?: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
};

export const LoadButton = ({
  state,
  onClick,
  onSuccessDone,
  disabled,
  children = "Submit",
}: Props) => {


  useEffect(() => {
    if (state !== "success") return;

    const t = setTimeout(() => {
      onSuccessDone?.();
    }, 1250);

    return () => clearTimeout(t);
  }, [state, onSuccessDone]);

  const isBusy = state === "loading" || state === "success";

    return (
        <>
        <div className={styles.container}>
            <button
            className={ `${styles.CustomButton}
                ${state === "loading"
                ? styles.onclic
                : state === "success"
                ? styles.validate
                : ""
                }`}
              onClick={() => {
            if (isBusy || disabled) return;
            onClick();
            }}
            disabled={isBusy || disabled}
            aria-busy={state === "loading"}
            >
            </button>
        </div>
        <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
        />
        </>
    )
}