import React, { useState, useEffect } from "react";
import {
  connectWallet,
  getUserProperties,
  getUserPropertiesByAddress,
  proposeTradeWithMetaMask,
  acceptTradeWithMetaMask,
} from "../../function/blockchain";

function Exchange() {
  const [userProperties, setUserProperties] = useState([]);
  const [user2Properties, setUser2Properties] = useState([]);
  const [selectedUser1, setSelectedUser1] = useState([]);
  const [selectedUser2, setSelectedUser2] = useState([]);
  const [user2Address, setUser2Address] = useState("");
  const [pendingTrades, setPendingTrades] = useState([]); // Liste des échanges en attente
  const [loading, setLoading] = useState(false);

  // 🔄 Récupérer les propriétés de l'utilisateur connecté
  useEffect(() => {
    const fetchProperties = async () => {
      await connectWallet();
      const properties = await getUserProperties();
      setUserProperties(properties);
    };
    fetchProperties();
  }, []);

  // 🔎 Récupérer les propriétés de l'autre utilisateur
  const fetchUser2Properties = async () => {
    if (user2Address.trim() !== "") {
      try {
        const properties = await getUserPropertiesByAddress(user2Address);
        setUser2Properties(properties);
      } catch (error) {
        console.error("🚨 Erreur récupération des propriétés :", error);
        alert("Impossible de récupérer les propriétés de cet utilisateur.");
      }
    }
  };

  // 📌 Proposer un échange en signant avec MetaMask
  const handleProposeTrade = async () => {
    if (selectedUser1.length === 0 || selectedUser2.length === 0) {
      alert("Sélectionnez au moins une propriété pour chaque utilisateur !");
      return;
    }

    setLoading(true);
    try {
      const trade = await proposeTradeWithMetaMask(
        selectedUser1,
        selectedUser2,
        user2Address
      );
      if (trade) {
        alert("Échange signé ! Demandez à l'autre utilisateur de l'accepter.");
        setPendingTrades([...pendingTrades, trade]); // Ajouter à la liste des échanges en attente
      }
    } catch (err) {
      console.error("🚨 Erreur lors de la proposition :", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Accepter un échange via MetaMask
  const handleAcceptTrade = async (trade) => {
    console.log("🕵️‍♂️ Vérification de l'échange :", trade);
    if (!trade) {
      console.error("🚨 Aucune donnée d'échange trouvée !");
      return;
    }
    await acceptTradeWithMetaMask(trade.tradeData, trade.signature);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <h1 className="text-center text-3xl font-bold py-8">
        Échange de Propriétés
      </h1>

      <div className="p-4">
        {/* 🏠 Entrée pour saisir l'adresse de l'autre utilisateur */}
        <label className="block font-bold">
          Adresse Ethereum de l'autre utilisateur :
        </label>
        <input
          type="text"
          value={user2Address}
          onChange={(e) => setUser2Address(e.target.value)}
          className="w-full p-2 border rounded-md mt-2"
          placeholder="Adresse Ethereum du destinataire"
        />
        <button
          className="mt-2 px-4 py-2 bg-gray-500 text-white rounded-lg"
          onClick={fetchUser2Properties}
        >
          Vérifier les biens
        </button>

        {/* 🏠 Liste des propriétés de l'utilisateur connecté */}
        <h2 className="text-xl font-bold mt-4">Vos Propriétés :</h2>
        {userProperties.length > 0 ? (
          userProperties.map((property) => (
            <div key={property.id} className="border p-3 my-2 rounded-lg">
              <p>
                <strong>{property.name}</strong> - {property.type} (
                {property.location})
              </p>
              <input
                type="checkbox"
                onChange={(e) => {
                  const selected = e.target.checked
                    ? [...selectedUser1, property.id]
                    : selectedUser1.filter((id) => id !== property.id);
                  setSelectedUser1(selected);
                }}
              />
              <label className="ml-2">Échanger cette propriété</label>
            </div>
          ))
        ) : (
          <p>Aucune propriété trouvée.</p>
        )}

        {/* 🏠 Liste des propriétés de l'autre utilisateur */}
        <h2 className="text-xl font-bold mt-4">
          Propriétés de l'autre utilisateur :
        </h2>
        {user2Properties.length > 0 ? (
          user2Properties.map((property) => (
            <div key={property.id} className="border p-3 my-2 rounded-lg">
              <p>
                <strong>{property.name}</strong> - {property.type} (
                {property.location})
              </p>
              <input
                type="checkbox"
                onChange={(e) => {
                  const selected = e.target.checked
                    ? [...selectedUser2, property.id]
                    : selectedUser2.filter((id) => id !== property.id);
                  setSelectedUser2(selected);
                }}
              />
              <label className="ml-2">Échanger cette propriété</label>
            </div>
          ))
        ) : (
          <p>Aucune propriété trouvée pour cet utilisateur.</p>
        )}

        {/* 🔄 Bouton pour proposer un échange */}
        <button
          className="mt-6 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700"
          onClick={handleProposeTrade}
          disabled={loading}
        >
          {loading ? "Proposition en cours..." : "Proposer un échange"}
        </button>

        {/* ✅ Liste des échanges en attente */}
        <h2 className="text-xl font-bold mt-6">Échanges en attente</h2>
        {pendingTrades.length > 0 ? (
          <ul>
            {pendingTrades.map((trade, index) => (
              <li key={index} className="border p-3 my-2 rounded-lg">
                <p>Proposé par : {trade.tradeData.user1}</p>
                <p>À accepter par : {trade.tradeData.user2}</p>
                <button
                  className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg"
                  onClick={() => handleAcceptTrade(trade)}
                >
                  Accepter l'échange via MetaMask
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>Aucun échange en attente.</p>
        )}
      </div>
    </div>
  );
}

export default Exchange;
