const fs = require("fs");
const dotenv = require("dotenv");

const backendEnv = dotenv.parse(fs.readFileSync("./.env")); // Fichier .env du backend
const frontendEnv = Object.entries(backendEnv)
  .map(([key, value]) => `REACT_APP_${key}=${value}`)
  .join("\n");

fs.writeFileSync("./frontend/.env", frontendEnv); // Écrit un fichier .env pour le frontend
console.log("✅ Fichier .env synchronisé avec succès !");
