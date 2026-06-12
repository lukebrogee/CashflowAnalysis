/*
------------------------------------------------------------------
FILE NAME:     AuthenticateAccountPage.tsx
PROJECT:       CashflowAnalysis
Date Created:  Dec-24-2025
--------------------------------------------------------------------
DESCRIPTION:

--------------------------------------------------------------------
$HISTORY:

Dec-24-2025   Created initial file.
Jun-11-2025   Updated UI of page. Moved to own folder AuthenticateAccountPage
------------------------------------------------------------------
*/
import React, { useEffect, useContext, useCallback, useState } from "react";

import Header from "../../Components/Headers";
import Products from "../../Components/ProductTypes/Products";
import Items from "../../Components/ProductTypes/Items";
import Context from "../../Context";
import {BsCreditCard, BsLightningCharge } from "react-icons/bs";
import {FaUniversity, FaChartLine, FaLock, FaShieldAlt} from "react-icons/fa";
import logoImage from "../../images/logos/MoneyLensLogo_Long_Color.png";
import styles from "./AuthenticateAccountPage.module.scss";
import { Products as PlaidProducts } from "plaid";

const App = () => {
  const { linkSuccess, isPaymentInitiation, itemId, dispatch } =
    useContext(Context);

  const getInfo = useCallback(async () => {
    const response = await fetch("/api/info", { method: "POST" });
    if (!response.ok) {
      dispatch({ type: "SET_STATE", state: { backend: false } });
      return { paymentInitiation: false };
    }
    const data = await response.json();
    const paymentInitiation: boolean =
      data.products.includes("payment_initiation");

    // CRA products are those that start with "cra_"
    const craProducts = data.products.filter((product: string) =>
      product.startsWith("cra_")
    );
    const isUserTokenFlow: boolean = craProducts.length > 0;
    const isCraProductsExclusively: boolean =
      craProducts.length > 0 && craProducts.length === data.products.length;

    dispatch({
      type: "SET_STATE",
      state: {
        products: data.products,
        isPaymentInitiation: paymentInitiation,
        isCraProductsExclusively: isCraProductsExclusively,
        isUserTokenFlow: isUserTokenFlow,
      },
    });
    return { paymentInitiation, isUserTokenFlow };
  }, [dispatch]);

  const generateUserToken = useCallback(async () => {
    const response = await fetch("api/create_user_token", { method: "POST" });
    if (!response.ok) {
      dispatch({ type: "SET_STATE", state: { userToken: null } });
      return;
    }
    const data = await response.json();
    if (data) {
      if (data.error != null) {
        dispatch({
          type: "SET_STATE",
          state: {
            linkToken: null,
            linkTokenError: data.error,
          },
        });
        return;
      }
      dispatch({ type: "SET_STATE", state: { userToken: data.user_token } });
      return data.user_token;
    }
  }, [dispatch]);

  const generateToken = useCallback(
    async (isPaymentInitiation: boolean) => {
      // Link tokens for 'payment_initiation' use a different creation flow in your backend.
      const path = isPaymentInitiation
        ? "/api/create_link_token_for_payment"
        : "/api/create_link_token";
      const response = await fetch(path, {
        method: "POST",
      });
      if (!response.ok) {
        dispatch({ type: "SET_STATE", state: { linkToken: null } });
        return;
      }
      const data = await response.json();
      if (data) {
        if (data.error != null) {
          dispatch({
            type: "SET_STATE",
            state: {
              linkToken: null,
              linkTokenError: data.error,
            },
          });
          return;
        }
        dispatch({ type: "SET_STATE", state: { linkToken: data.link_token } });
      }
      // Save the link_token to be used later in the Oauth flow.
      localStorage.setItem("link_token", data.link_token);
    },
    [dispatch]
  );

  useEffect(() => {
    const init = async () => {
      const { paymentInitiation, isUserTokenFlow } = await getInfo(); // used to determine which path to take when generating token
      // do not generate a new token for OAuth redirect; instead
      // setLinkToken from localStorage
      if (window.location.href.includes("?oauth_state_id=")) {
        dispatch({
          type: "SET_STATE",
          state: {
            linkToken: localStorage.getItem("link_token"),
          },
        });
        return;
      }

      if (isUserTokenFlow) {
        await generateUserToken();
      }
      generateToken(paymentInitiation);
    };
    init();
  }, [dispatch, generateToken, generateUserToken, getInfo]);

    const [isVerified, setIsVerified] = useState(false);

    const VerificationComplete = () => {
      const renewTokens = async () => {
        // reset global link state
        dispatch({
          type: "SET_STATE",
          state: {
            linkSuccess: false,
            accessToken: null,
            itemId: null,
            userToken: null,
            linkToken: "", // set empty string to avoid brief error UI
          },
        });
        localStorage.removeItem("link_token");

        // regenerate tokens so Header/Link has a link_token to use
        const { paymentInitiation, isUserTokenFlow } = await getInfo();
        if (isUserTokenFlow) {
          await generateUserToken();
        }
        await generateToken(paymentInitiation);
      };
      setIsVerified(true);
      renewTokens();
    }


  return (
    <>
      <div className={styles.contentWrapper}>
        <div className={styles.headerContainer}>
          <img src={logoImage} style={{ width: '300px', height: 'auto' }} alt="MoneyLens Logo" />
          <p>Connect your financial accounts to start analyzing your cash flow.</p>
          <div className={styles.plaidButtonContainer}>
            {!isVerified && (
              <>
                <Header onVerificationComplete={VerificationComplete} />
              </>
            )}
          </div>
        </div>

        <div className={styles.explanationContainer}>
          <div>
            <p>Securely link your bank, credit, or investment accounts using Plaid.</p>
          </div>
          <div className={styles.accountTypeContainer}>
            <div className={styles.accountBox}>
              <div className={styles.accountHeader}>
                <div className={styles.accountImage}><FaUniversity size={36} /></div>
                <h1 className={styles.accountTitle}>Bank Account</h1>
              </div>
              <p>Connect checking or savings accounts</p>
            </div>

            <div className={styles.accountBox}>
              <div className={styles.accountHeader}>
                <div className={styles.accountImage}><BsCreditCard size={36} /></div>
                <h1 className={styles.accountTitle}>Credit Account</h1>
              </div>
              <p>Connect credit cards and lines of credit</p>
            </div>

            <div className={styles.accountBox}>
              <div className={styles.accountHeader}>
                <div className={styles.accountImage}><FaChartLine size={36} /></div>
                <h1 className={styles.accountTitle}>Investment Account</h1>
              </div>
              <p>Connect brokerage and investment accounts</p>
            </div>
          </div>
        </div>

        <div className={styles.howItWorksContainer}>
          <h2 className={styles.howItWorksTitle}>How it works</h2>
          <div className={styles.howItWorksGrid}>
            <div className={styles.howItem}>
              <div className={styles.howItemImage}><FaLock size={24} /></div>
              <div className={styles.howItemContent}>
                <h2 className={styles.howItemTitle}>Secure</h2>
                <p className={styles.howItemText}>Your data is encrypted and secure with bank-level security.</p>
              </div>
            </div>
            <div className={styles.howItem}>
              <div className={styles.howItemImage}><FaShieldAlt size={24} /></div>
              <div className={styles.howItemContent}>
                <h2 className={styles.howItemTitle}>Private</h2>
                <p className={styles.howItemText}>We never store your login credentials.</p>
              </div>
            </div>
            <div className={styles.howItem}>
              <div className={styles.howItemImage}><BsLightningCharge size={24} /></div>
              <div className={styles.howItemContent}>
                <h2 className={styles.howItemTitle}>Fast</h2>
                <p className={styles.howItemText}>Connect your accounts in seconds.</p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.plaidInfoContainer}>
          <div><FaLock size={10} /></div>
          <p>Powered by Plaid. Your data is never sold. Read Plaid's <a href="https://plaid.com/privacy/" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.</p>
        </div>
      </div>
    </>
  );
};

export default App;