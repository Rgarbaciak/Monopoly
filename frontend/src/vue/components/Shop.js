import React, { useState, useEffect } from "react";
import { getProperties, buyProperty } from "../../function/blockchain";

function Shop({ userAddress }) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const props = await getProperties();
        setProperties(props);
      } catch (err) {
        console.error("Erreur lors de la récupération des propriétés :", err);
      }
    };
    fetchProperties();
  }, []);

  const handleBuy = async (property) => {
    setLoading(true);
    try {
      await buyProperty(property.name, property.type, property.value);
      alert("Propriété achetée avec succès !");
    } catch (err) {
      console.error("Erreur lors de l'achat :", err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <h1 className="text-center text-4xl font-bold py-8">
        Boutique de Propriétés
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-4">
        {properties.map((property, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg"
          >
            <h2 className="text-xl font-bold mb-2">{property.name}</h2>
            <p>Type : {property.type}</p>
            <p>Prix : {property.value} ETH</p>
            <button
              onClick={() => handleBuy(property)}
              className={`mt-4 px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              Acheter
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Shop;
