import React from 'react'
import { Link, useLocation } from "react-router-dom";

export default function NavBar() {
  const location = useLocation();
  const currentPath = location.pathname;
  return (

    <nav class="flex items-center justify-between p-6">
        <div class="w-full flex items-center gap-6 text-sm">
            <Link to="/" className={`hover:text-gray-400 font-audiowide px-4 py-2 text-xl ${currentPath === "/" ? "underline underline-offset-4" : ""}`}>
              Home
            </Link>
            <Link to="/memories" className={`hover:text-gray-400 font-audiowide px-4 py-2 text-xl ${currentPath === "/memories" ? "underline underline-offset-4" : ""}`}>
              My Memories
            </Link>
            <Link to="/logout" className={`ml-auto hover:text-gray-400 font-audiowide px-4 py-2 text-xl ${currentPath === "/logout" ? "underline underline-offset-4" : ""}`}>
              Logout
            </Link>
        </div>
    </nav>
  )
}
