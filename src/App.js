import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Components/Login';
import Dashboard from './Components/Dashboard';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);

  return (
    <Router>
      <Routes>
        {/* setting default page */}
        <Route path="/" element={<Login />} />
        {/* accepting the user ID as a parameter for dynamic routing */}
        <Route path="/dashboard/:id" element={<Dashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
