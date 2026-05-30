/*
------------------------------------------------------------------
FILE NAME:     LoadingCircle/index.tsx
PROJECT:       CashflowAnalysis
Date Created:  -2026
--------------------------------------------------------------------
DESCRIPTION:
Component to display the loading circle animation. 
Can be used in any component to indicate a loading state.
--------------------------------------------------------------------
$HISTORY:

May-29-2026   Created initial file.
------------------------------------------------------------------
*/
import styles from "./index.module.scss"

type ButtonState = "idle" | "loading" | "success";

type Props = {
  size?: number | string;
  borderSize?: number | string;
};

export const LoadingCircle = ({
  size = 40,
  borderSize = 20,
}: Props) => {
  const normalizedSize = typeof size === "number" ? `${size}px` : size;
  const normalizedBorderSize =
    typeof borderSize === "number" ? `${borderSize}px` : borderSize;

  return (
    <div
      className={styles.container}
      style={{ width: normalizedSize, height: normalizedSize }}
    >
      <div
        className={styles.CustomButton}
        style={{
          width: normalizedSize,
          height: normalizedSize,
          borderWidth: normalizedBorderSize,
          borderRadius: normalizedSize,
        }}
      />
    </div>
  );
}