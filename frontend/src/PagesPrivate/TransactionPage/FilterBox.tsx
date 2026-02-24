/*
------------------------------------------------------------------
FILE NAME:     FilterBox.tsx
PROJECT:       CashflowAnalysis
Date Created:  Feb-24-2025
--------------------------------------------------------------------
DESCRIPTION:
Displays filter options for transactions
--------------------------------------------------------------------
$HISTORY:

Feb-24-2026   Created initial file.
------------------------------------------------------------------
*/

import React, { useState } from "react";
import styles from "./filterBox.module.scss";

export interface TransactionFilterOptions {
  minDate: string;
  maxDate: string;
  minAmount: number;
  maxAmount: number;
  merchant: string;
  category: string;
}

interface Props {
  onSubmit: (filterOptions: TransactionFilterOptions) => void;
  merchantList: string[];
  categoryList: string[];
  initial?: TransactionFilterOptions;
}

export const FilterBox = ({
  onSubmit,
  merchantList,
  categoryList,
  initial,
}: Props) => {
  //Define state and set values to empty or initial values.
  const [f, setF] = useState<TransactionFilterOptions>(
    initial || {
      minDate: "",
      maxDate: "",
      minAmount: Number.NaN,
      maxAmount: Number.NaN,
      merchant: "",
      category: "",
    },
  );

  const [category, setCategory] = useState<string>("");
  const [merchant, setMerchant] = useState<string>("");

  //Sets the fields of the filter options.
  //If the user is changing minimum or maximum amount, convert string to number
  //and handle empty string case by setting to 0. For other fields, just update the string value.
  const change = (k: keyof TransactionFilterOptions, v: string) => {
    if (k === "minAmount" || k === "maxAmount") {
      const n = v === "" ? Number.NaN : Number(v);
      setF((prev) => ({ ...prev, [k]: isFinite(n) ? n : Number.NaN }));
      return;
    }
    setF((prev) => ({ ...prev, [k]: v }));
  };

  //Once user clicks submit call the onSubmit function and
  //return the filter options (f)
  const handleSubmit = (e?: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    onSubmit(f);
  };

  //Reset values of filter options to empty on the screen and also returns the value to Transaction component
  const handleReset = () => {
    setF({
      minDate: "",
      maxDate: "",
      minAmount: Number.NaN,
      maxAmount: Number.NaN,
      merchant: "",
      category: "",
    });
    setCategory("");
    setMerchant("");
    onSubmit({
      minDate: "",
      maxDate: "",
      minAmount: Number.NaN,
      maxAmount: Number.NaN,
      merchant: "",
      category: "",
    });
  };

  return (
    <div className={styles.filterBox}>
      <form onSubmit={handleSubmit}>
        <h3>Filter Options</h3>
        <div className={styles.options}>
          <div className={styles.row}>
            <label>
              <div>Start Date</div>
              <input
                name="minDate"
                value={f.minDate}
                type="date"
                onChange={(e) => change("minDate", e.target.value)}
              />
            </label>
          </div>
          <div className={styles.row}>
            <label>
              <div>End Date</div>
              <input
                name="maxDate"
                value={f.maxDate}
                type="date"
                onChange={(e) => change("maxDate", e.target.value)}
              />
            </label>
          </div>
          <div className={styles.row}>
            <label>
              <div>Min Amount</div>
              <input
                name="minAmount"
                value={f.minAmount}
                type="number"
                onChange={(e) => change("minAmount", e.target.value)}
              />
            </label>
          </div>
          <div className={styles.row}>
            <label>
              <div>Max Amount</div>
              <input
                name="maxAmount"
                value={f.maxAmount}
                type="number"
                onChange={(e) => change("maxAmount", e.target.value)}
              />
            </label>
          </div>
          <div className={styles.row}>
            <div>Merchant</div>
            <select
              id="merchants"
              onChange={(e) => {
                change("merchant", e.target.value);
                setMerchant(e.target.value);
              }}
              value={merchant}
            >
              <option value="" />
              {merchantList.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.row}>
            <div>Category</div>
            <select
              id="categories"
              onChange={(e) => {
                change("category", e.target.value);
                setCategory(e.target.value);
              }}
              value={category}
            >
              <option value="" />
              {categoryList.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <div className={styles.filterButtons}>
            <button
              className={styles.resetButton}
              type="button"
              onClick={() => {
                handleReset();
              }}
            >
              Reset
            </button>
            <button className={styles.applyButton} type="submit">
              Apply Filters
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
