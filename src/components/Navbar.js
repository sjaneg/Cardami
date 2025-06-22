import React from 'react'
import { Link, useLocation } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

export default function NavBar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/"); // Redirect to login after logout
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (

    <nav class="flex items-center justify-between p-6">
        <div className="w-full flex items-center gap-6 text-sm">
            <Link to="/home" className={`hover:text-gray-400 font-audiowide px-4 py-2 text-xl ${currentPath === "/home" ? "underline underline-offset-4" : ""}`}>
              Home
            </Link>
            <Link to="/memories" className={`hover:text-gray-400 font-audiowide px-4 py-2 text-xl ${currentPath === "/memories" ? "underline underline-offset-4" : ""}`}>
              My Memories
            </Link>
            <Link to="/imageupload" className={`hover:text-gray-400 font-audiowide px-4 py-2 text-xl ${currentPath === "/memories" ? "underline underline-offset-4" : ""}`}>
              My Memories
            </Link>
            <span
              onClick={handleLogout}
              className={'ml-auto cursor-pointer hover:text-gray-400 font-audiowide px-4 py-2 text-xl'}
            >
              Logout
            </span>
        </div>
    </nav>
  )
}
