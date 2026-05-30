import React, { useContext, useEffect, useState } from "react";
import { PieChart } from '@mui/x-charts/PieChart';  //https://mui.com/x/react-charts/pie/

interface Props {
  account_id: string;
  name: string;
  official_name: string;
  subtype: string;
  type: string;
  balances: {available: number, current: number, iso_currency:string};
}


function SpendAnalyzer() {
  const [accounts, setAccounts] = useState<Props[]>([]);

  useEffect(() => {
    setAccounts([
      {
        account_id: "123",
        name: "Chase Checking",
        official_name: "Chase Total Checking",
        subtype: "checking",
        type: "depository",
        balances: {
          available: 1000,
          current: 1000,
          iso_currency: "USD",
        },
      },
      {
        account_id: "456",
        name: "Chase Credit Card",
        official_name: "Chase Freedom Unlimited",
        subtype: "credit card",
        type: "credit",
        balances: {
          available: 5000,
          current: 2000,
          iso_currency: "USD", 
        },
      },
    ]);
  }, []);

  if (accounts === null) return <div>Loading...</div>;


  return (
<PieChart
  series={[
    {
      data: 
        accounts.map((act, index) => (
          { id: act.account_id, value: act.balances.current, label: act.name }
        ))
      ,
    },
  ]}
  width={275}
  height={275}
/>
  );
}

export default SpendAnalyzer;