import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { connectWallet } from "../../function/blockchain";

function ConnectWallet({ onWalletConnected }) {
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleConnect = async () => {
    try {
      const signer = await connectWallet();
      const address = await signer.getAddress();
      onWalletConnected(address);
      navigate("/shop");
    } catch (err) {
      setError("Erreur lors de la connexion au wallet. Veuillez réessayer.");
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Connectez votre Wallet</h1>
      <button
        onClick={handleConnect}
        className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700"
      >
        Connecter mon wallet
      </button>
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
}

export default ConnectWallet;
