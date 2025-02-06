import React, { useState, useEffect } from "react";
import {
  connectWallet,
  getProperties,
  buyProperty,
} from "../../function/blockchain";

function Shop() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [buying, setBuying] = useState(null); // Indique quelle propriété est en cours d'achat

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        await connectWallet(); // Connectez le portefeuille
        const fetchedProperties = await getProperties(); // Récupérez les propriétés
        setProperties(fetchedProperties);
      } catch (err) {
        console.error("Erreur lors de la récupération des propriétés :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const handleBuy = async (propertyId, salePrice) => {
    setBuying(propertyId);
    try {
      await buyProperty(propertyId, salePrice); // Appelle la fonction buyProperty
      alert(`Propriété ${propertyId} achetée avec succès !`);
      // Recharge la liste des propriétés après l'achat
      const updatedProperties = await getProperties();
      setProperties(updatedProperties);
    } catch (err) {
      alert(
        `Erreur lors de l'achat de la propriété ${propertyId} : ${err.message}`
      );
    } finally {
      setBuying(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center text-xl">Chargement des propriétés...</div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <h1 className="text-center text-4xl font-bold py-8">
        Boutique de Propriétés
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-4">
        {properties.map((property) => (
          <div
            key={property.id}
            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg"
          >
            <h2 className="text-xl font-bold mb-2">{property.name}</h2>
            <p>Type : {property.type}</p>
            <p>Localisation : {property.location}</p>
            <p>Prix : {property.salePrice} ETH</p>
            <p>Surface : {property.surface} m²</p>
            <p>Propriétaire : {property.owner}</p>
            {property.forSale ? (
              <button
                className={`mt-4 px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 ${
                  buying === property.id ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={() => handleBuy(property.id, property.salePrice)}
                disabled={buying === property.id}
              >
                {buying === property.id ? "Achat en cours..." : "Acheter"}
              </button>
            ) : (
              <p className="mt-4 text-red-500 font-semibold">
                Non disponible à la vente
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Shop;
