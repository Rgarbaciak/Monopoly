import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="bg-blue-500 p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-white text-2xl font-bold">Monopoly Web3</h1>
        <div className="space-x-4">
          <Link to="/shop">
            <button className="bg-white text-blue-500 px-4 py-2 rounded-md hover:bg-gray-200">
              🏠 Shop
            </button>
          </Link>
          <Link to="/profil">
            <button className="bg-white text-blue-500 px-4 py-2 rounded-md hover:bg-gray-200">
              👤 Profil
            </button>
          </Link>
          <Link to="/exchange">
            <button className="bg-white text-blue-500 px-4 py-2 rounded-md hover:bg-gray-200">
              🔄 Échanger
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
