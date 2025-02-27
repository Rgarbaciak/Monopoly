import React, { useState, useEffect } from "react";
import {
  connectWallet,
  getProperties,
  buyProperty,
  updateProperty,
} from "../../function/blockchain";
import { useNavigate } from "react-router-dom";

function Shop() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [buying, setBuying] = useState(null); // Suivi de l'achat
  const [editingProperty, setEditingProperty] = useState(null); // ID de la propriété en édition
  const [newValue, setNewValue] = useState("");
  const [newSurface, setNewSurface] = useState("");
  const [newForSale, setNewForSale] = useState(false);
  const [newSalePrice, setNewSalePrice] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        await connectWallet(); // Connexion au wallet
        const fetchedProperties = await getProperties(); // Récupération des propriétés
        setProperties(fetchedProperties);
      } catch (err) {
        console.error("Erreur lors de la récupération des propriétés :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // ✅ Fonction d'achat
  const handleBuy = async (propertyId, salePrice) => {
    setBuying(propertyId);
    try {
      await buyProperty(propertyId, salePrice);
      alert(`Propriété ${propertyId} achetée avec succès !`);
      const updatedProperties = await getProperties(); // Recharger les propriétés
      setProperties(updatedProperties);
    } catch (err) {
      alert(`Erreur lors de l'achat : ${err.message}`);
    } finally {
      setBuying(null);
    }
  };

  // ✅ Fonction de mise à jour
  const handleUpdate = async (tokenId) => {
    try {
      await updateProperty(
        tokenId,
        newValue,
        newSurface,
        newForSale,
        newSalePrice
      );
      alert("Propriété mise à jour !");
      const updatedProperties = await getProperties(); // Recharger les propriétés
      setProperties(updatedProperties);
    } catch (err) {
      alert("Erreur lors de la mise à jour :" + err.message);
    }
    setEditingProperty(null); // Ferme le formulaire après modification
  };
  const _handleProfil = async () => {
    navigate("/profil");
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

            {/* Bouton d'achat si la propriété est en vente */}
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

            {/* Bouton Modifier (seulement si l'utilisateur est le propriétaire) */}
            {property.owner.toLowerCase() ===
              window.ethereum.selectedAddress && (
              <>
                <button
                  className="mt-4 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700"
                  onClick={() => setEditingProperty(property.id)}
                >
                  Modifier
                </button>

                {editingProperty === property.id && (
                  <div className="mt-4 bg-gray-200 p-4 rounded-lg">
                    <input
                      type="text"
                      placeholder="Nouvelle Valeur (ETH)"
                      className="border p-2 w-full"
                      onChange={(e) => setNewValue(e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Nouvelle Surface"
                      className="border p-2 w-full mt-2"
                      onChange={(e) => setNewSurface(e.target.value)}
                    />
                    <label className="mt-2 flex items-center">
                      <input
                        type="checkbox"
                        checked={newForSale}
                        onChange={() => setNewForSale(!newForSale)}
                        className="mr-2"
                      />
                      Mettre en vente
                    </label>
                    <input
                      type="text"
                      placeholder="Prix de vente (ETH)"
                      className="border p-2 w-full mt-2"
                      onChange={(e) => setNewSalePrice(e.target.value)}
                    />
                    <button
                      className="mt-4 px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-700"
                      onClick={() => handleUpdate(property.id)}
                    >
                      Valider
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Shop;
