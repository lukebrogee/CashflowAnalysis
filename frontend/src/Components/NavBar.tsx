/*
------------------------------------------------------------------
FILE NAME:     NavBar.tsx
PROJECT:       CashflowAnalysis
Date Created:  Dec-24-2025
--------------------------------------------------------------------
DESCRIPTION:
Displays navigation bar to user based on user authentication
--------------------------------------------------------------------
$HISTORY:

Dec-24-2025   Created initial file.
Dec-30-2025   Added logic for logout button
Feb-24-2026   Updated path for TransactionsPage
Jun-11-2025   Updated UI Design
------------------------------------------------------------------
*/
import React, { useState } from "react";
import classNames from "classnames";
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from "../Auth/AuthContext";
import { logout } from "../Auth/logout";
import styles from "./NavBar.module.scss";
import { IoLogOutOutline } from "react-icons/io5";


function NavBar() {
  const { authorized } = useAuth();

  const { setAuthorized } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const logoutUser = () => {
    logout();
    setAuthorized(false);
    navigate("/login", { replace: true });
  }

  return (
    <>
      <nav className={`${styles.container}`}>
        <div className={styles.inner}>
          <img className={styles.brand} src={require("../images/logos/MoneyLensLogo_Long_Color.png")} alt="Logo" style={{ height: "30px" }} />
          {
/*
//For future use*: Will be used when navbar is too small to show tabs will convert to dropdown
          <button
            className={styles.toggler}
            aria-expanded={open}
            aria-label="Toggle navigation"
            onClick={() => setOpen(!open)}
          >
            <span className={styles.togglerBar}></span>
            <span className={styles.togglerBar}></span>
            <span className={styles.togglerBar}></span>
          </button>  
          */          
          }


          <div className={`${styles.collapse} ${open ? styles.show : ""}`} id="navbarSupportedContent">
            <ul className={styles.navList}>
              {authorized ? (
              <>
                <li className="nav-item">
                  <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                      classNames("nav-link", styles.navLink, {
                        [styles.activeNavLink]: isActive,
                      })
                    }
                  >
                    Dashboard
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/transactions"
                    className={({ isActive }) =>
                      classNames("nav-link", styles.navLink, {
                        [styles.activeNavLink]: isActive,
                      })
                    }
                  >
                    Transactions
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/spend-analyzer"
                    className={({ isActive }) =>
                      classNames("nav-link", styles.navLink, {
                        [styles.activeNavLink]: isActive,
                      })
                    }
                  >
                    Spend Analyzer
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/authenticate-account"
                    className={({ isActive }) =>
                      classNames("nav-link", styles.navLink, {
                        [styles.activeNavLink]: isActive,
                      })
                    }
                  >
                    Authenticate Account
                  </NavLink>
                </li>
                <li className={classNames(styles.navItem, styles.spacer)}>
                  <div
                    className={classNames(styles.navLink, styles.logoutButton)}
                    onClick={logoutUser}
                  >
                    <IoLogOutOutline size={20} />
                    <span className={styles.logoutText}>Logout</span>
                  </div>
                </li>
              </>
              ) : (
                <>
                  <li className="nav-item">
                    <NavLink
                      to="/Login"
                      className={({ isActive }) =>
                        classNames("nav-link", styles.navLink, {
                          [styles.activeNavLink]: isActive,
                        })
                      }
                    >
                      Login
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink
                      to="/SignUp"
                      className={({ isActive }) =>
                        classNames("nav-link", styles.navLink, {
                          [styles.activeNavLink]: isActive,
                        })
                      }
                    >
                      Sign Up
                    </NavLink>
                  </li>    
                  <li className="nav-item">
                    <NavLink
                      to="/about"
                      className={({ isActive }) =>
                        classNames("nav-link", styles.navLink, {
                          [styles.activeNavLink]: isActive,
                        })
                      }
                    >
                      About
                    </NavLink>
                  </li>             
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </> 
  )
}

export default NavBar;