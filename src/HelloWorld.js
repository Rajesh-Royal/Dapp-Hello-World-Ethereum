import { useEffect, useState } from "react";
import {
  connectWallet, getCurrentWalletConnected, helloWorldContract, loadCurrentMessage, updateMessage
} from "./util/interact.js";

import Ethereumlogo from "./asset/ethereum.png";

const HelloWorld = () => {
  //state variables
  const [loading, setLoading] = useState(false);
  const [walletAddress, setWallet] = useState("");
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("No connection to the network."); //default message
  const [newMessage, setNewMessage] = useState("");

  //called only once
  useEffect(() => {
    (async () => {
      setLoading(true);
      const message = await loadCurrentMessage();
      setMessage(message);
      addSmartContractListener();

      const { address, status } = await getCurrentWalletConnected();

      setWallet(address);
      setStatus(status);

      addWalletListener();
      setLoading(false);
    })();

  }, []);

  function addSmartContractListener() {
    helloWorldContract.events.UpdatedMessages({}, (error, data) => {
      if (error) {
        setStatus("😥 " + error.message);
      } else {
        setMessage(data.returnValues[1]);
        setNewMessage("");
        setStatus("🎉 Your message has been updated!");
      }
    });
  }

  function addWalletListener() {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setWallet(accounts[0]);
          setStatus("👆🏽 Write a message in the text-field above.");
        } else {
          setWallet("");
          setStatus("🦊 Connect to Metamask using the top right button.");
        }
      });
    } else {
      setStatus(
        <p>
          {" "}
          🦊{" "}
          <a target="_blank" href={`https://metamask.io/download.html`} rel="noreferrer">
            You must install Metamask, a virtual Ethereum wallet, in your
            browser.
          </a>
        </p>
      );
    }
  }

  const connectWalletPressed = async () => {
    const walletResponse = await connectWallet();
    setStatus(walletResponse.status);
    setWallet(walletResponse.address);
  };

  const onUpdatePressed = async () => {
    setLoading(true);
    const { status } = await updateMessage(walletAddress, newMessage);
    setStatus(status);
    setLoading(false);
  };

  //the UI of our component
  return (
    <div id="container">
      <img id="logo" src={Ethereumlogo} alt="logo" style={{ width: 30 }}></img>
      <button id="walletButton" onClick={connectWalletPressed}>
        {walletAddress.length > 0 ? (
          "Connected: " +
          String(walletAddress).substring(0, 6) +
          "..." +
          String(walletAddress).substring(38)
        ) : (
          <span>Connect Wallet</span>
        )}
      </button>

      <h2 style={{ paddingTop: "50px" }}>Current Message:</h2>
      <p>{message}</p>

      <h2 style={{ paddingTop: "18px" }}>New Message:</h2>

      <div>
        <input
          type="text"
          placeholder="Update the message in your smart contract."
          onChange={(e) => setNewMessage(e.target.value)}
          value={newMessage}
        />
        <p id="status">{status}</p>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button id="publish" onClick={onUpdatePressed}>
            Update
          </button>
          {loading && <p>Loading..............</p>}
        </div>
      </div>
    </div>
  );
};

export default HelloWorld;
