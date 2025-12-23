import React, { useEffect, useContext, useCallback, useState } from "react";

import TransactionsPage from "./PagesPrivate/TransactionsPage";

import Home from "./PagesPublic/HomePage";
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import PublicLayout from "./Components/Layouts/PublicLayout";
import ProtectedLayout from "./Components/Layouts/ProtectedLayout";
import AuthenticateAccount from "./PagesPrivate/AuthenticateAccountPage";
import LoginPage from "./PagesPublic/LoginPage";
import SignUpPage from "./PagesPublic/SignUpPage";
import DashboardPage from "./PagesPrivate/DashboardPage";
import SpendAnalyzerPage from "./PagesPrivate/SpendAnalyzerPage";

const App = () => {

  return (
    <>
    <BrowserRouter>
      <Routes>
        {/* ---------- PUBLIC ROUTES ---------- */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          {/* <Route path="/nav" element={<NavPage />} /> */}
        </Route>

        {/* ---------- AUTHENTICATED ROUTES ---------- */}
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/spend-analyzer" element={<SpendAnalyzerPage />} />
          <Route path="/authenticate-account" element={<AuthenticateAccount />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </>
  );
};

export default App;
