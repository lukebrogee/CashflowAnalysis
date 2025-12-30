/*
------------------------------------------------------------------
FILE NAME:     index.tsx
PROJECT:       CashflowAnalysis
Date Created:  Dec-24-2025
--------------------------------------------------------------------
DESCRIPTION:
Checks user credentials against the database and provides password hashing functions.
Also serves to unauthorize a user by invalidating their session.
--------------------------------------------------------------------
$HISTORY:

Dec-24-2025   Created initial file.
Dec-30-2025   Added <BrowserRouter> tag
------------------------------------------------------------------
*/
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { QuickstartProvider } from "./Context";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter} from "react-router-dom";

import { AuthProvider } from "./Auth/AuthContext";
const container = document.getElementById("root") as HTMLElement;
if (!container) throw new Error("Root container not found");

const root = ReactDOM.createRoot(container);

root.render(
  <React.StrictMode>
    <BrowserRouter>
        <AuthProvider>
          <QuickstartProvider>
            <App />
          </QuickstartProvider>
        </AuthProvider>
    </BrowserRouter>
  </React.StrictMode> 
);


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
