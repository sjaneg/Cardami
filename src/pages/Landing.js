// src/Landing.js
import React from "react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col justify-center items-center h-screen text-center bg-black text-white px-4">
      <h1 className="text-6xl font-extrabold font-audiowide tracking-wide mb-6">
        Cardami
      </h1>
      <p className="text-xl italic mb-4 max-w-lg">
        “Capture the moment. Share the memory.”
      </p>
      <p className="text-sm text-gray-400 mb-8">SpurHacks 2025</p>

      <button
        onClick={() => navigate("/signup")}
        className="bg-white text-black font-semibold px-6 py-3 rounded-full hover:bg-gray-200 transition-all duration-200"
      >
        Get Started
      </button>
    </div>
  );
}
