import "regenerator-runtime/runtime";
import React from "react";
import { login, logout } from "./utils";
import "./global.css";
import BN from "bn.js"

import getConfig from "./config";
const { networkId } = getConfig(process.env.NODE_ENV || "development");

export default function App() {
  const [nftData, setNftData] = React.useState();

  const [buttonDisabled, setButtonDisabled] = React.useState(false);

  const [showNotification, setShowNotification] = React.useState(false);

  React.useEffect(() => {
    // in this case, we only care to query the contract when signed in
    if (window.walletConnection.isSignedIn()) {
      // window.contract is set by initContract in index.js
      console.log(window.accountId)
      window.contract
        .nft_tokens_for_owner({ account_id: window.accountId })
        .then((response) => {
          console.log(response);
          setNftData(...response);
          if (response.length > 0) {
            setButtonDisabled(true);
            setShowNotification(true);
          }
        });
    }
  }, []);

  // if not signed in, return early with sign-in prompt
  if (!window.walletConnection.isSignedIn()) {
    return (
      <main>
        <h1>NEAR Cats</h1>
        <p>To mint your NEAR Cat please sign in using NEAR wallet first.</p>
        <p style={{ textAlign: "center", marginTop: "2.5em" }}>
          <button onClick={login}>Sign in</button>
        </p>
      </main>
    );
  }

  return (
    // use React Fragment, <>, to avoid wrapping elements in unnecessary divs
    <>
      <button className="link" style={{ float: "right" }} onClick={logout}>
        Sign out
      </button>
      <main>
        <h1>
          <svg style={{height: "1em", margin: "5%"}}class="whiteCat" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path style={{fill: "white"}} d="M290.59 192c-20.18 0-106.82 1.98-162.59 85.95V192c0-52.94-43.06-96-96-96-17.67 0-32 14.33-32 32s14.33 32 32 32c17.64 0 32 14.36 32 32v256c0 35.3 28.7 64 64 64h176c8.84 0 16-7.16 16-16v-16c0-17.67-14.33-32-32-32h-32l128-96v144c0 8.84 7.16 16 16 16h32c8.84 0 16-7.16 16-16V289.86c-10.29 2.67-20.89 4.54-32 4.54-61.81 0-113.52-44.05-125.41-102.4zM448 96h-64l-64-64v134.4c0 53.02 42.98 96 96 96s96-42.98 96-96V32l-64 64zm-72 80c-8.84 0-16-7.16-16-16s7.16-16 16-16 16 7.16 16 16-7.16 16-16 16zm80 0c-8.84 0-16-7.16-16-16s7.16-16 16-16 16 7.16 16 16-7.16 16-16 16z"/></svg>
          <label
            htmlFor="greeting"
            style={{
              color: "var(--secondary)",
              borderBottom: "2px solid var(--secondary)",
            }}
          ></label>
          {
            " " /* React trims whitespace around tags; insert literal space character when needed */
          }
          {window.accountId}!
        </h1>
        <div>
          <img src={nftData ? nftData.metadata.media : ""} />
        </div>
        <form
          onSubmit={async (event) => {
            event.preventDefault();

            fieldset.disabled = false;

            try {
              // make an update call to the smart contract
              await window.contract.nft_mint({
                token_id: `${window.accountId}-NEAR-Cat`,
                token_metadata: {
                  title: "NEAR CATS",
                  description: `Your purrfect NEAR Cat`,
                  media: "https://i.postimg.cc/bwW7zMtG/nearcat.png",
                },
                receiver_id: window.accountId,
              },
              // fails without this?
              300000000000000,
              new BN("1000000000000000000000000")
              );
            } catch (e) {
              alert(
                "Something went wrong! " +
                  "Maybe you need to sign out and back in? " +
                  "Check your browser console for more info."
              );
              throw e;
            } finally {
              // re-enable the form, whether the call succeeded or failed
              fieldset.disabled = false;
            }
            setTimeout(() => {
              setShowNotification(false);
            }, 11000);
          }}
        >
          <fieldset id="fieldset">
            {!showNotification && (
              <p
                style={{
                  display: "flex",
                  alignContent: "center",
                  justifyContent: "center",
                }}
              >
                Click "Mint" below to Mint Your NEAR Cat
              </p>
            )}
            <div
              style={{
                display: "flex",
                alignContent: "center",
                justifyContent: "center",
              }}
            >
              <button
                disabled={buttonDisabled}
                style={{ borderRadius: "0 5px 5px 0" }}
              >
                M(eow)INT
              </button>
            </div>
          </fieldset>
        </form>
      </main>
      {showNotification && <Notification />}
    </>
  );
}

// this component gets rendered by App after the form is submitted
function Notification() {
  const urlPrefix = `https://explorer.${networkId}.near.org/accounts`;
  return (
    <aside>
      <a
        target="_blank"
        rel="noreferrer"
        href={`${urlPrefix}/${window.accountId}`}
      >
        {window.accountId}
      </a>
      {
        " " /* React trims whitespace around tags; insert literal space character when needed */
      }
      called method: 'set_greeting' in contract:{" "}
      <a
        target="_blank"
        rel="noreferrer"
        href={`${urlPrefix}/${window.contract.contractId}`}
      >
        {window.contract.contractId}
      </a>
      <footer>
        <div>✔ Succeeded</div>
        <div>Just now</div>
      </footer>
    </aside>
  );
}
