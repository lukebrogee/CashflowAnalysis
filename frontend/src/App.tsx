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
Jun-11-2026   Added AboutPage
Jun-13-2026   Updated paths and WorkspaceHubPage name
------------------------------------------------------------------
*/
import TransactionsPage from "./PagesPrivate/TransactionsPage";

import Home from "./PagesPublic/HomePage";
// TypeScript: allow side-effect CSS import for bootstrap (no types required)
// @ts-ignore
import 'bootstrap/dist/css/bootstrap.min.css';
import { Routes, Route } from "react-router-dom";
import PublicLayout from "./Components/Layouts/PublicLayout";
import ProtectedLayout from "./Components/Layouts/ProtectedLayout";
import AuthenticateAccount from "./PagesPrivate/AuthenticateAccountPage";
import LoginPage from "./PagesPublic/LoginPage";
import SignUpPage from "./PagesPublic/SignUpPage";
import DashboardPage from "./PagesPrivate/DashboardPage";
import WorkspaceHubPage from "./PagesPrivate/WorkspaceHubPage";

const App = () => {

  return (
    <>
      <Routes>
        {/* ---------- PUBLIC ROUTES ---------- */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
        </Route>

        {/* ---------- AUTHENTICATED ROUTES ---------- */}
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/spend-analyzer" element={<WorkspaceHubPage />} />
          <Route path="/authenticate-account" element={<AuthenticateAccount />} />
        </Route>
      </Routes>
      
    </>
  );
};

export default App;
