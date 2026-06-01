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
May-31-2026   Added DropDownOption interface and better control for user to selecte/deselect options at load
------------------------------------------------------------------
*/

import { useEffect, useState } from "react";
import styles from "./index.module.scss";

// Props expected by the DropDown component.
type DropDownProps = {
  title: string;
  options: DropDownOption[];
  setSelected?: DropDownOption[]; //Set the initial selected options
  onSelectionChange: (selected: DropDownOption[]) => void;
};

export interface DropDownOption {
  id: string;
  name: string;
}

export const DropDown = ({
  title,
  options,
  setSelected,
  onSelectionChange,
}: DropDownProps) => {
  // Track whether the dropdown panel is visible.
  const [isOpen, setIsOpen] = useState(false);

  // Track the current checkbox selections by id so selections persist
  // even if the `options` array contains new object instances.
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    setSelectedIds((setSelected || []).map((o) => o.id));
  }, [setSelected]);

  // Toggle a single option id in the selected list when its checkbox is clicked.
  const toggleOption = (optionId: string) => {
    setSelectedIds((prev) =>
      prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId],
    );
  };


  // Confirm the current selection and close the dropdown.

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
              <label key={option.id} className={styles.optionItem}>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(option.id)}
                  onChange={() => toggleOption(option.id)}
                />
                <span>{option.name}</span>
              </label>
            ))}
          </div>

          {/* Confirm button sends the selected values back to the parent. */}
          <button
            type="button"
            className={styles.okButton}
            onClick={() => {
              const selectedOptions = options.filter((o) => selectedIds.includes(o.id));
              onSelectionChange?.(selectedOptions);
              setIsOpen(false);
            }}
          >
            OK
          </button>
        </div>
      )}
    </div>
  );
};
