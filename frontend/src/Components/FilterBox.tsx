import React from "react";

const FilterBox = () => {
    return (
        <div>
            <h2>Filter Options</h2>
            <label>
                Date:
                <input type="date" />
            </label>
            <label>
                Amount:
                <input type="number" />
            </label>
            <label>
                Merchant:
                <input type="text" />
            </label>
            <label>
                Category:
                <input type="text" />
            </label>
        </div>
    );
};

export default FilterBox;
