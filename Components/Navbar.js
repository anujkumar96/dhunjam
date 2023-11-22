import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ isLoggedIn, userId, handleLogout }) => {
  const navigate = useNavigate();

  return (
    <nav>
      <ul>
        {isLoggedIn ? (
          <>
            <li>
              {/* Use Link with dynamic parameter */}
              <Link to={`/dashboard/${userId}`}>Dashboard</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
            <li>
              <button onClick={handleLogout}>Logout</button>
            </li>
          </>
        ) : (
          <li>
            <Link to="/">Login</Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
