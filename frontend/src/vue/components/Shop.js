import React, { useState, useEffect } from "react";
import {
  connectWallet,
  getProperties,
  buyProperty,
  updateProperty,
  getCooldownAndOwnershipInfo,
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
  const [cooldownEnd, setCooldownEnd] = useState(0);
  const [lockEnd, setLockEnd] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [lockTimeLeft, setLockTimeLeft] = useState(0);
  const [canBuy, setCanBuy] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCooldownInfo = async () => {
      try {
        await connectWallet(); // Connexion au wallet
        const fetchedProperties = await getProperties();
        setProperties(fetchedProperties);

        const cooldownInfo = await getCooldownAndOwnershipInfo(
          window.ethereum.selectedAddress
        );

        if (cooldownInfo) {
          setCooldownEnd(cooldownInfo.nextAllowedTx);
          setLockEnd(cooldownInfo.purchaseLockTime);
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des propriétés :", err);
      }
    };

    fetchCooldownInfo();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000); // Timestamp actuel en secondes

      setTimeLeft(cooldownEnd > now ? cooldownEnd - now : 0);
      setLockTimeLeft(lockEnd > now ? lockEnd - now : 0);

      // Désactiver l'achat si le cooldown ou le lock sont actifs
      setCanBuy(cooldownEnd <= now && lockEnd <= now);
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldownEnd, lockEnd]);

  const handleBuy = async (propertyId, salePrice) => {
    if (!canBuy) {
      alert("Vous devez attendre avant d'acheter une nouvelle propriété !");
      return;
    }

    setBuying(propertyId);
    try {
      await buyProperty(propertyId, salePrice);
      alert(`Propriété ${propertyId} achetée avec succès !`);

      const updatedProperties = await getProperties();
      setProperties(updatedProperties);

      const cooldownInfo = await getCooldownAndOwnershipInfo(
        window.ethereum.selectedAddress
      );

      if (cooldownInfo) {
        setCooldownEnd(cooldownInfo.nextAllowedTx);
        setLockEnd(cooldownInfo.purchaseLockTime);
      }
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
      const updatedProperties = await getProperties();
      setProperties(updatedProperties);
    } catch (err) {
      alert("Erreur lors de la mise à jour :" + err.message);
    }
    setEditingProperty(null);
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
      <div className="mt-4 p-4 bg-gray-200 text-center rounded-lg">
        {timeLeft > 0 ? (
          <p className="text-red-500 font-bold">
            ⏳ Prochain achat possible dans {timeLeft} secondes
          </p>
        ) : lockTimeLeft > 0 ? (
          <p className="text-orange-500 font-bold">
            🔒 Achat verrouillé encore {lockTimeLeft} secondes
          </p>
        ) : (
          <p className="text-green-500 font-bold">
            ✅ Vous pouvez acheter une nouvelle propriété
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-4">
        {properties.map((property) => (
          <div
            key={property.id}
            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg"
          >
            <img
              src={`http://127.0.0.1:8080/ipfs/${property.imageHash}`}
              height="200"
              width="200"
              alt={property.name}
            />
            <h2 className="text-xl font-bold mb-2">{property.name}</h2>
            <p>Type : {property.type}</p>
            <p>Localisation : {property.location}</p>
            <p>Prix : {property.salePrice} ETH</p>
            <p>Surface : {property.surface} m²</p>
            <p>Propriétaire : {property.owner}</p>
            <button
              className="mt-2 px-4 py-2 bg-gray-500 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700"
              onClick={() =>
                window.open(
                  `http://127.0.0.1:8080/ipfs/${property.documentHash}`,
                  "_blank"
                )
              }
            >
              Voir le document
            </button>
            <div />

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
