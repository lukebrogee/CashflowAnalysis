import React from "react";
import Transactions from "./ProductTypes/Transactions";
import SpendAnalyzer from "./ProductTypes/SpendAnalyzer";

interface Props {
    widgets: {
        transactions: boolean;
        spendAnalyzer: boolean;
    }
}

function WidgetBoard() {

    const widget: React.CSSProperties = {
        border: '1px solid black',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        height: "300px",
        overflowY: 'auto',
    }

    return (
<div style={{width: "1400px"}} className="grid">
  <div className="row">
    <div style={widget} className="col-8">
      <SpendAnalyzer/>
    </div>
    <div style={widget} className="col-4">
      <Transactions/>
    </div>
  </div>
  <div className="row">
    <div style={widget} className="col-4">
      <SpendAnalyzer/>
    </div>
    <div style={widget} className="col-8">
      <Transactions/>
    </div>
  </div>
</div>
    )
}


export default WidgetBoard;