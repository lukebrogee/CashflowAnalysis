import React, { useContext, useEffect, useState } from "react";
import { PieChart } from '@mui/x-charts/PieChart';  //https://mui.com/x/react-charts/pie/

interface Props {
  account_id: string;
  name: string;
  official_name: string;
  subtype: string;
  type: string;
  balances: {avaialable: number, current: number, iso_currency:string};
}


function SpendAnalyzer() {
  const [accounts, setAccounts] = useState<Props[]>([]);

  useEffect(() => {
    fetch("/api/accounts")
      .then(res => res.json())
      .then(data => {
        console.log(data);
        setAccounts(data.accounts);
      })
      .catch(err => console.error(err));
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