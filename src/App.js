// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Login } from './pages/Login.js'
import { SignUp } from "./pages/SignUp.js";
import '@mantine/core/styles.css';
import { useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.js'
import Memories from './pages/Memories.js'
import { PrivateRoute } from './routeGuards/PrivateRoute.js';
import { PublicRoute } from './routeGuards/PublicRoute.js';
import { useAuth } from './contexts/AuthProvider.js';
import Landing from './pages/Landing.js';
import Cards from './components/Cards.js'

function App() {

  const location = useLocation();
   // Define routes where the Navbar should be hidden
  const hideNavbarRoutes = ['login','signup']; // Add any others here
  const { user } = useAuth();

  const shouldHideNavbar = hideNavbarRoutes.some(route => 
    {
      const path = location.pathname.toLowerCase();
      console.log("cur=",location.pathname);
      return path.includes(route) ||  (location.pathname === "/");
    });


  return (
        <>
        {shouldHideNavbar ?  <></> : <Navbar/>}
        <Routes>

            <Route path="/" element={<Landing/>}/>

            {/*only pages users can see when not logged in*/}
            <Route path="/login" element={<PublicRoute><Login/></PublicRoute>}/>
            <Route path="/signup" element={<PublicRoute><SignUp/></PublicRoute>}/>

            {/* Protected Routes */}
            <Route path="/home" element={<PrivateRoute><Cards/></PrivateRoute>} />
            <Route path="/memories" element={<PrivateRoute><Memories/></PrivateRoute>} />
            <Route path="/login" element={<PrivateRoute><Login/></PrivateRoute>}/>
            <Route path="/signup" element={<PrivateRoute><SignUp/></PrivateRoute>}/>
        </Routes>
        </>
  );
}


export default App;