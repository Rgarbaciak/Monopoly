import React, { useState, useEffect } from "react";
import { getAllProperties, testContract } from "../../function/blockchain";

function Shop() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    testContract();
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const props = await getAllProperties();
        setProperties(props);
      } catch (err) {
        console.error("Erreur lors de la récupération des propriétés :", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <h1 className="text-center text-4xl font-bold py-8">
        Boutique de Propriétés
      </h1>
      {loading ? (
        <p className="text-center text-gray-500">
          Chargement des propriétés...
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-4">
          {/* {properties.map((property, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg"
            >
              <h2 className="text-xl font-bold mb-2">{property.name}</h2>
              <p>Type : {property.type}</p>
              <p>Localisation : {property.location}</p>
              <p>Surface : {property.surface} m²</p>
              <p>
                Prix :{" "}
                {property.forSale
                  ? `${property.salePrice} ETH`
                  : "Non en vente"}
              </p>
              <p>Créé le : {property.createdAt}</p>
              <p>Dernière transaction : {property.lastTransferAt}</p>
              {property.forSale && (
                <button className="mt-4 px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-700">
                  Acheter
                </button>
              )}
            </div>
          ))} */}
        </div>
      )}
    </div>
  );
}

export default Shop;
