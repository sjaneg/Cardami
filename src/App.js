// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Login } from './Login.js'
import { SignUp } from "./SignUp";
import '@mantine/core/styles.css';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar.js'
import Memories from './Memories.js'

function App() {

  const location = useLocation();
   // Define routes where the Navbar should be hidden
  const hideNavbarRoutes = ["/login"]; // Add any others here

  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);


  return (
    <>
    {!shouldHideNavbar ? <Navbar/> : <></>}
    <Routes>
        <Route path="/" element={<></>} />
        <Route path="/memories" element={<Memories/>} />
        <Route path="/login" element={<Login/>}/>
        <Route path="/signup" element={<SignUp/>}/>
    </Routes>
    </>
  );
}


export default App;