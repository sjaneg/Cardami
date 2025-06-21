// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Login } from './login';
import { SignUp } from "./SignUp";
import '@mantine/core/styles.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        {/* Add other routes here */}
      </Routes>
    </Router>
  );
}

export default App;