import React, { useState, useEffect } from "react";
import {
  connectWallet,
  getUserProperties,
  getUserTransactions,
} from "../../function/blockchain";

function Profil() {
  const [properties, setProperties] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("properties");
  const [userAddress, setUserAddress] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const address = await connectWallet();
        setUserAddress(address);

        const fetchedProperties = await getUserProperties();
        const fetchedTransactions = await getUserTransactions();
        setProperties(fetchedProperties);
        setTransactions(fetchedTransactions);
      } catch (err) {
        console.error("Erreur lors de la récupération des données :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="text-center text-xl">Chargement de vos biens...</div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <h1 className="text-center text-4xl font-bold py-8">Vos Biens</h1>

      <div className="flex justify-center space-x-4">
        <button
          className={`px-4 py-2 ${
            view === "properties" ? "bg-blue-500" : "bg-gray-400"
          } text-white font-semibold rounded-lg shadow-md`}
          onClick={() => setView("properties")}
        >
          Mes Propriétés
        </button>
        <button
          className={`px-4 py-2 ${
            view === "transactions" ? "bg-blue-500" : "bg-gray-400"
          } text-white font-semibold rounded-lg shadow-md`}
          onClick={() => setView("transactions")}
        >
          Historique des Transactions
        </button>
      </div>

      {view === "properties" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-4 mt-6">
          {properties.length > 0 ? (
            properties.map((property) => (
              <div
                key={property.id}
                className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg"
              >
                <h2 className="text-xl font-bold mb-2">{property.name}</h2>
                <p>Type : {property.type}</p>
                <p>Localisation : {property.location}</p>
                <p>Valeur : {property.value} ETH</p>
                <p>Surface : {property.surface} m²</p>
                <p>Dernier transfert : {property.lastTransferAt}</p>
                <p
                  className={
                    property.forSale ? "text-green-500" : "text-red-500"
                  }
                >
                  {property.forSale
                    ? "Disponible à la vente"
                    : "Non disponible à la vente"}
                </p>
              </div>
            ))
          ) : (
            <p className="text-center text-lg mt-4">
              Aucune propriété possédée.
            </p>
          )}
        </div>
      ) : (
        <div className="mt-6 px-4">
          {transactions.length > 0 ? (
            <ul className="bg-white p-4 rounded-lg shadow-md">
              {transactions.map((tx, index) => {
                const isGain =
                  tx.to.toLowerCase() === String(userAddress).toLowerCase();

                const transactionSign = isGain ? "+" : "-";
                const transactionColor = isGain
                  ? "text-green-500"
                  : "text-red-500";

                return (
                  <li key={index} className="border-b py-2">
                    <p>
                      <strong>Propriété :</strong> {tx.tokenId}
                    </p>
                    <p>
                      <strong>De :</strong> {tx.from}
                    </p>
                    <p>
                      <strong>À :</strong> {tx.to}
                    </p>
                    <p className={`font-bold ${transactionColor}`}>
                      <strong>Transaction :</strong> {transactionSign}{" "}
                      {tx.value} ETH
                    </p>
                    <p>
                      <strong>Date :</strong> {tx.date}
                    </p>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-center text-lg mt-4">
              Aucune transaction enregistrée.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default Profil;
