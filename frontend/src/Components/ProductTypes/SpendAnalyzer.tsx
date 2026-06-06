/*
------------------------------------------------------------------
FILE NAME:     SpendAnalyzer.tsx
PROJECT:       CashflowAnalysis
Date Created:  May-31-2026
--------------------------------------------------------------------
DESCRIPTION:
Component to analyze spending patterns and display them in a pie chart.
--------------------------------------------------------------------
$HISTORY:

May-31-2026   Created initial file.
------------------------------------------------------------------
*/


import React, { useContext, useEffect, useState } from "react";
import { PieChart } from '@mui/x-charts/PieChart';  //https://mui.com/x/react-charts/pie/
import { labelMarkClasses } from '@mui/x-charts/ChartsLabel'

interface Props {
  accounts: {
    name: string;
    value: number;
  }[];
};



function SpendAnalyzer({ accounts }: Props) {

  return (
<PieChart
  series={[
    {
      data: 
        accounts.map((act, index) => (
          { value: act.value, label: act.name }
        ))
      ,
    },
  ]}
  width={400}
  height={400}
  slotProps={{
        legend: {
          position: {
            vertical: 'middle',
            horizontal: 'center',
          },
          sx: {
            fontSize: 14,
            color: '#ffffff',
          },
        },
      }}
/>
  );
}

export default SpendAnalyzer;