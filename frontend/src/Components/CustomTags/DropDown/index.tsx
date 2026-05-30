/*
------------------------------------------------------------------
FILE NAME:     DropDown/index.tsx
PROJECT:       CashflowAnalysis
Date Created:  May-29-2026
--------------------------------------------------------------------
DESCRIPTION:
Component to display a dropdown menu. Gives the user the ability to
select multiple options from the dropdown, and then click "OK" to confirm their selection.
--------------------------------------------------------------------
$HISTORY:

May-29-2026   Created initial file.
------------------------------------------------------------------
*/

import { useState } from "react";
import styles from "./index.module.scss";

// Props expected by the DropDown component.
type DropDownProps = {
  title: string;
  options: string[];
  selectedValues: (columns: string[]) => void;
  onSelectionChange: (selected: string[]) => void;
};

export const DropDown = ({
  title,
  options,
  selectedValues,
  onSelectionChange,
}: DropDownProps) => {
  // Track whether the dropdown panel is visible.
  const [isOpen, setIsOpen] = useState(false);

  // Track the current checkbox selections in the dropdown.
  const [selected, setSelected] = useState<string[]>([]);

  // Toggle a single option in the selected list when its checkbox is clicked.
  const toggleOption = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id],
    );
  };

  // Confirm the current selection and close the dropdown.
  const handleOk = () => {
    onSelectionChange?.(selected);
    selectedValues?.(selected);
    setIsOpen(false);
  };

  return (
    <div className={styles.wrapper}>
      {/* Button that opens or closes the dropdown panel. */}
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {title}
      </button>

      {/* The dropdown panel only renders when open. */}
      {isOpen && (
        <div className={styles.dropdownMenu}>
          <div className={styles.optionList}>
            {options.map((option) => (
              <label key={option} className={styles.optionItem}>
                <input
                  type="checkbox"
                  checked={selected.includes(option)}
                  onChange={() => toggleOption(option)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>

          {/* Confirm button sends the selected values back to the parent. */}
          <button type="button" className={styles.okButton} onClick={handleOk}>
            OK
          </button>
        </div>
      )}
    </div>
  );
};
