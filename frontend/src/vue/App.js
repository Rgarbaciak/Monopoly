import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ConnectWallet from "./components/ConnectWallet";
import Shop from "./components/Shop";
import Profil from "./components/profil";
import Exchange from "./components/exchange";
import Navbar from "./container/NavBar";

function App() {
  const [userAddress, setUserAddress] = useState("");

  const handleWalletConnected = (address) => {
    setUserAddress(address);
  };

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={<ConnectWallet onWalletConnected={handleWalletConnected} />}
        />
        <Route path="/shop" element={<Shop userAddress={userAddress} />} />
        <Route path="/profil" element={<Profil userAddress={userAddress} />} />
        <Route path="/exchange" element={<Exchange />} />
      </Routes>
    </Router>
  );
}

export default App;
