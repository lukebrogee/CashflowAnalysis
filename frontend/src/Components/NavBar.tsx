import React from "react";
import Transactions from "./ProductTypes/Transactions";
import { Link } from 'react-router-dom';
import { useAuth } from "../Auth/AuthContext";

function NavBar() {
  const { user, logout} = useAuth();

  if (!user) {
    return (
<nav className="navbar navbar-expand-lg bg-body-tertiary sticky-top z-1">
  <div className="container-fluid">
    <a className="navbar-brand" href="#">Cashflow Analysis</a>
    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span className="navbar-toggler-icon"></span>
    </button>
    <div className="collapse navbar-collapse" id="navbarSupportedContent">
      <ul className="navbar-nav me-auto mb-2 mb-lg-0">
        <li className="nav-item">
          <Link to="/Login">Login</Link>
        </li>
        <li className="nav-item">
          <Link to="/SignUp">Sign Up</Link>
        </li>
      </ul>
    </div>
  </div>
</nav>
    )
  }
  else {
    return (
      <nav className="navbar navbar-expand-lg bg-body-tertiary sticky-top z-1">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">Cashflow Analysis</a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link to="/dashboard">Dashboard</Link>
              </li>
              <li className="nav-item">
                <Link to="/transactions">Transactions</Link>
              </li>
              <li className="nav-item">
                <Link to="/spend-analyzer">Spend Analyzer</Link>
              </li>
              <li className="nav-item">
                <Link to="/authenticate-account">Authenticate Account</Link>
              </li>
              <li className="nav-item">
                <button onClick={logout}>Logout</button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    )
  }
}

export default NavBar;