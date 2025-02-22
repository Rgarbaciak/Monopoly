import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ConnectWallet from "./components/ConnectWallet";
import Shop from "./components/Shop";

function App() {
  const [userAddress, setUserAddress] = useState("");

  const handleWalletConnected = (address) => {
    setUserAddress(address);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<ConnectWallet onWalletConnected={handleWalletConnected} />}
        />
        <Route path="/shop" element={<Shop userAddress={userAddress} />} />
      </Routes>
    </Router>
  );
}

export default App;
