# MonopolyToken - Web3 Monopoly Game

## Description

MonopolyToken est un smart contract Ethereum permettant la gestion d'un jeu de Monopoly décentralisé sur blockchain. Ce projet utilise **Solidity, Hardhat et IPFS** pour stocker et échanger des propriétés sous forme de NFT ERC-721.

## Fonctionnalités principales

- **Création et Mint de propriétés** en tant que NFTs
- **Achat/Vente de propriétés** entre joueurs avec vérification des règles (cooldown, possession max...)
- **Échange de propriétés entre joueurs**
- **Intégration d’IPFS** pour stocker les images des propriétés
- **Cooldown et limitation de propriétés** pour empêcher les abus

## Technologies utilisées

- **Solidity (ERC-721)** pour les smart contracts
- **Hardhat** pour le développement et les tests
- **React.js** pour l’interface utilisateur
- **Ethers.js** pour interagir avec la blockchain
- **IPFS** pour stocker les images des propriétés
- **Pinata / NFT.Storage** pour une gestion permanente des fichiers IPFS (optionnel)

## Installation et Déploiement

### 1️⃣ Installer les dépendances

Assurez-vous d’avoir **Node.js** et **Hardhat** installés.

```sh
npm install
```

### 2️⃣ Lancer un nœud local avec Hardhat

```sh
npx hardhat node
```

### 3️⃣ Déployer le smart contract

Dans un autre terminal :

```sh
npx hardhat run scripts/deploy.js --network localhost
```

### 4️⃣ Démarrer l’interface React

```sh
cd frontend
npm start
```

## Utilisation d’IPFS pour stocker des images

### 🚀 Ajouter une image à IPFS

Utilisez IPFS en local :

```sh
ipfs add monImage.png
```

Cela retournera un **CID** :

```sh
added Qm123ABC456 monImage.png
```

**Accéder à l’image :**

```sh
http://localhost:8080/ipfs/Qm123ABC456
```

### 📡 Ajouter une image via un script Node.js

```javascript
const { create } = require("ipfs-http-client");
const fs = require("fs");
const ipfs = create({ url: "http://localhost:5001" });

async function uploadImageToIPFS(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  const { cid } = await ipfs.add(imageBuffer);
  return cid.toString();
}
```

## Tests

### Exécuter les tests Hardhat

```sh
npx hardhat test
```

## À venir

- Gestion de **l'achat de maisons et d'hôtels**
- Système de **location**
- Ajout d'un **marché des propriétés**

## Contributeurs

- **Nom du Développeur 1** (@github)
- **Nom du Développeur 2** (@github)

## Licence

Ce projet est sous licence MIT.

