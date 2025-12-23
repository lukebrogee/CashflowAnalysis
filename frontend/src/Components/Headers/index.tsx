import React, { useContext, useEffect, useRef } from "react";
import Callout from "plaid-threads/Callout";
import Button from "plaid-threads/Button";
import InlineLink from "plaid-threads/InlineLink";

import Link from "../Link";
import Context from "../../Context";

import styles from "./index.module.scss";

interface Props {
  onVerificationComplete: () => void;
}

const Header = ({ onVerificationComplete }: Props) => {
  const {
    itemId,
    accessToken,
    userToken,
    linkToken,
    linkSuccess,
    isItemAccess,
    backend,
    linkTokenError,
    isPaymentInitiation,
  } = useContext(Context);

  // ensure we call onVerificationComplete only once when verification state becomes true
  const calledRef = useRef(false);
  useEffect(() => {
    // Only invoke the parent callback after a successful Link flow (linkSuccess)
    // and when the item/user token state indicates verification.
    if (
      !calledRef.current &&
      linkSuccess &&
      (isItemAccess || userToken) &&
      typeof onVerificationComplete === "function"
    ) {
      calledRef.current = true;
      onVerificationComplete();
    }
    // If linkSuccess becomes false (e.g., user wants to verify another account), allow callback to fire again later
    if (!linkSuccess) {
      calledRef.current = false;
    }
  }, [isItemAccess, userToken, onVerificationComplete, linkSuccess]);

  return (
    <div className={styles.grid}>
      <h3 className={styles.title}>Plaid Quickstart</h3>

      {!linkSuccess ? (
        <>
          {/* message if backend is not running and there is no link token */}
          {!backend ? (
            <Callout warning>
              Unable to fetch link_token: please make sure your backend server
              is running and that your .env file has been configured with your
              <code>PLAID_CLIENT_ID</code> and <code>PLAID_SECRET</code>.
            </Callout>
          ) : /* message if backend is running and there is no link token */
          linkToken == null && backend ? (
            <Callout warning>
              <div>
                Unable to fetch link_token: please make sure your backend server
                is running and that your .env file has been configured
                correctly.
              </div>
              <div>
                If you are on a Windows machine, please ensure that you have
                cloned the repo with{" "}
                <InlineLink
                  href="https://github.com/plaid/quickstart#special-instructions-for-windows"
                  target="_blank"
                >
                  symlinks turned on.
                </InlineLink>{" "}
                You can also try checking your{" "}
                <InlineLink
                  href="https://dashboard.plaid.com/activity/logs"
                  target="_blank"
                >
                  activity log
                </InlineLink>{" "}
                on your Plaid dashboard.
              </div>
              <div>
                Error Code: <code>{linkTokenError.error_code}</code>
              </div>
              <div>
                Error Type: <code>{linkTokenError.error_type}</code>{" "}
              </div>
              <div>Error Message: {linkTokenError.error_message}</div>
            </Callout>
          ) : linkToken === "" ? (
            <div className={styles.linkButton}>
              <Button large disabled>
                Loading...
              </Button>
            </div>
          ) : (
            <div className={styles.linkButton}>
              <Link />
            </div>
          )}
        </>
      ) : (
        <>
          {isPaymentInitiation ? (
            <>
              <h4 className={styles.subtitle}>
                Congrats! Your payment is now confirmed.
                <p />
                <Callout>
                  You can see information of all your payments in the{" "}
                  <InlineLink
                    href="https://dashboard.plaid.com/activity/payments"
                    target="_blank"
                  >
                    Payments Dashboard
                  </InlineLink>
                  .
                </Callout>
              </h4>
              <p className={styles.requests}>
                Now that the 'payment_id' stored in your server, you can use it
                to access the payment information:
              </p>
            </>
          ) : (
            /* If not using the payment_initiation product, show the item_id and access_token information */ <>
              {isItemAccess ? (
                <h4 className={styles.subtitle}>
                  Congrats! By linking an account, you have created an{" "}
                  <InlineLink
                    href="http://plaid.com/docs/quickstart/glossary/#item"
                    target="_blank"
                  >
                    Item
                  </InlineLink>
                  .
                </h4>
              ) : userToken ? (
                <h4 className={styles.subtitle}>
                  Congrats! You have successfully linked data to a User.
                </h4>
              ) : (
                <h4 className={styles.subtitle}>
                  <Callout warning>
                    Unable to create an item. Please check your backend server
                  </Callout>
                </h4>
              )}
              <div className={styles.itemAccessContainer}>
                {itemId && (
                  <p className={styles.itemAccessRow}>
                    <span className={styles.idName}>item_id</span>
                    <span className={styles.tokenText}>{itemId}</span>
                  </p>
                )}

                {accessToken && (
                  <p className={styles.itemAccessRow}>
                    <span className={styles.idName}>access_token</span>
                    <span className={styles.tokenText}>{accessToken}</span>
                  </p>
                )}

                {userToken && (
                  <p className={styles.itemAccessRow}>
                    <span className={styles.idName}>user_token</span>
                    <span className={styles.tokenText}>{userToken}</span>
                  </p>
                )}
              </div>
              {(isItemAccess || userToken) && <></>}
            </>
          )}
        </>
      )}
    </div>
  );
};

Header.displayName = "Header";

export default Header;
