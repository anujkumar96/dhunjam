import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './Components/Navbar'; // Assuming Navbar is in the same directory
import Login from './Components/Login';
import Dashboard from './Components/Dashboard';
import Contact from './Components/Contact';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);

  const handleLogout = () => {
    // Perform logout logic if needed
    setIsLoggedIn(false);
    setUserId(null);
  };

  return (
    <Router>
      {/* Pass the isLoggedIn, userId, and handleLogout to the Navbar */}
      {/* <Navbar isLoggedIn={isLoggedIn} userId={userId} handleLogout={handleLogout} /> */}
      <Routes>
        <Route path="/" element={<Login />} />
        {/* Adjust the Dashboard route to accept the user ID as a parameter */}
        <Route path="/dashboard/:id" element={<Dashboard />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </Router>
  );
};

export default App;
