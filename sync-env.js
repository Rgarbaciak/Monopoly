const fs = require("fs");
const dotenv = require("dotenv");

const backendEnv = dotenv.parse(fs.readFileSync("./.env"));
const frontendEnv = Object.entries(backendEnv)
  .map(([key, value]) => `REACT_APP_${key}="${value}"`)
  .join("\n");

fs.writeFileSync("./frontend/.env", frontendEnv);
console.log("✅ Fichier .env synchronisé avec succès !");
