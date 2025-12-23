import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { QuickstartProvider } from "./Context";
import reportWebVitals from "./reportWebVitals";

import { AuthProvider } from "./Auth/AuthContext";
const container = document.getElementById("root") as HTMLElement;
if (!container) throw new Error("Root container not found");

const root = ReactDOM.createRoot(container);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <QuickstartProvider>
        <App />
      </QuickstartProvider>
    </AuthProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
