// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {Login} from './login';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar.js'

function AppWrapper() {
  const location = useLocation();

  // Define routes where the Navbar should be hidden
  const hideNavbarRoutes = ["/login"]; // Add any others here

  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {!shouldHideNavbar && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* Add other routes here */}
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;