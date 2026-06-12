/*
------------------------------------------------------------------
FILE NAME:     App.tsx
PROJECT:       CashflowAnalysis
Date Created:  Dec-24-2025
--------------------------------------------------------------------
DESCRIPTION:
Logic for displaying application
--------------------------------------------------------------------
$HISTORY:

Dec-24-2025   Created initial file.
Dec-30-2025   Removed <BrowserRouter> tag
Feb-24-2026   Updated path for TransactionsPage
Jun-11-2025   Added AboutPage
------------------------------------------------------------------
*/
import TransactionsPage from "./PagesPrivate/TransactionPage/TransactionsPage";

import Home from "./PagesPublic/HomePage";
// TypeScript: allow side-effect CSS import for bootstrap (no types required)
// @ts-ignore
import 'bootstrap/dist/css/bootstrap.min.css';
import { Routes, Route } from "react-router-dom";
import PublicLayout from "./Components/Layouts/PublicLayout";
import ProtectedLayout from "./Components/Layouts/ProtectedLayout";
import AuthenticateAccount from "./PagesPrivate/AuthenticateAccountPage/AuthenticateAccountPage";
import LoginPage from "./PagesPublic/LoginPage";
import SignUpPage from "./PagesPublic/SignUpPage";
import DashboardPage from "./PagesPrivate/DashboardPage";
import SpendAnalyzerPage from "./PagesPrivate/SpendAnalyzerPage/SpendAnalyzerPage";
import AboutPage from "./Components/AboutPage";

const App = () => {

  return (
    <>
      <Routes>
        {/* ---------- PUBLIC ROUTES ---------- */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Route>

        {/* ---------- AUTHENTICATED ROUTES ---------- */}
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/spend-analyzer" element={<SpendAnalyzerPage />} />
          <Route path="/authenticate-account" element={<AuthenticateAccount />} />
        </Route>
      </Routes>
      
    </>
  );
};

export default App;
