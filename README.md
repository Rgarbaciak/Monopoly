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

## Installation et Déploiement

### 1. Installer les dépendances

Assurez-vous d’avoir **Node.js** et **Hardhat** installés.

```sh
npm install
```

### 2. Lancer un nœud local avec Hardhat

```sh
npx hardhat node
```

### 3. Déployer le smart contract

Dans un autre terminal :

```sh
npx hardhat run scripts/deploy.js --network localhost
```

Copier **Adresse du contrat** dans le .env.example dans **CONTRACT_ADDRESS**

Copier son adresse MetaMask dans **OWNER_ADDRESS**

Enlever le **.example**

### 4. Syncroniser les .env

Dans un autre terminal :

```sh
node sync-env.js
```

Vérifier que le .env du frontend est bien à jour.

### 5. Se donner des fonds

```sh
npx hardhat run scripts/sendETH.js --network localhost
```

### 6. Initier les données des propriétés

```sh
npx hardhat run scripts/init.js --network localhost
```

### 7. Installation d'IPFS

Téléchargez [Kubo](https://docs.ipfs.tech/install/command-line/#install-kubo-windows) (IPFS CLI) depuis Kubo.

Décompressez et ajoutez l'exécutable ipfs à votre PATH.

Initialisez IPFS avec :

```sh
ipfs init
```
Démarrez le daemon IPFS :

```sh
ipfs daemon
```

Ajoutez une image à IPFS avec :

```sh
ipfs add mon_image.jpg
```

Vous obtiendrez un CID (Content Identifier), exemple :

```sh
added Qm123abc456def mon_image.jpg
```

Consultation de l’image sur IPFS :

```sh
http://127.0.0.1:8080/ipfs/Qm123abc456def
```

### 8. Démarrer l’interface React

```sh
cd frontend
npm install
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

