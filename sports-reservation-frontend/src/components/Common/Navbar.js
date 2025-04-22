// src/components/Common/Navbar.js
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark" style={navbarStyle}>
      <div className="container">
        <Link className="navbar-brand" to="/" style={brandStyle}>
          College Sports Reservation
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/facilities" style={linkStyle}>
                Facilities
              </Link>
            </li>
            {isAuthenticated && (
              <li className="nav-item">
                <Link className="nav-link" to="/my-reservations" style={linkStyle}>
                  My Reservations
                </Link>
              </li>
            )}
          </ul>
          <div className="d-flex ms-auto">
            {isAuthenticated ? (
              <div className="d-flex align-items-center">
                <span style={usernameStyle}>{user?.username}</span>
                <button
                  className="btn btn-light ms-3"
                  onClick={handleLogout}
                  style={buttonStyle}
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link className="btn btn-outline-light me-2" to="/login" style={buttonStyle}>
                  Login
                </Link>
                <Link className="btn btn-light" to="/register" style={buttonStyle}>
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

// Navbar styles
const navbarStyle = {
  background: 'linear-gradient(135deg, #333, #1a1a1a)', // Deep gradient for a modern look
  padding: '1rem 2rem',
  fontSize: '1.1rem',
  fontFamily: "'Roboto', sans-serif", // Smooth, modern font
  letterSpacing: '1.5px',
  boxShadow: '0 6px 15px rgba(0, 0, 0, 0.2)', // Stronger shadow for a floating effect
  zIndex: '1000',
};

// Brand style
const brandStyle = {
  fontSize: '2rem',
  fontWeight: '700',
  color: '#ff6347', // Vibrant accent for the brand name
  textTransform: 'uppercase',
  letterSpacing: '3px',
  textShadow: '3px 3px 15px rgba(0, 0, 0, 0.4)', // Intense shadow effect for depth
  transition: 'color 0.3s ease, transform 0.3s ease',
  ':hover': {
    color: '#ff4500', // Brighter color on hover for emphasis
    transform: 'scale(1.1)', // Subtle zoom effect
  },
};

// Link styles
const linkStyle = {
  color: '#eaeaea', // Softer color for links
  textTransform: 'uppercase',
  fontWeight: '600',
  padding: '8px 15px',
  textDecoration: 'none',
  letterSpacing: '1px',
  transition: 'color 0.3s ease, transform 0.3s ease',
  ':hover': {
    color: '#ff6347', // Accent color on hover
    transform: 'scale(1.05)', // Slight zoom effect
  },
};

// Button styles
const buttonStyle = {
  padding: '10px 25px',
  fontSize: '1rem',
  fontWeight: '600',
  borderRadius: '35px',
  marginLeft: '15px',
  backgroundColor: '#ff6347', // Accent button color
  color: '#fff',
  border: 'none',
  transition: 'background-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease',
  ':hover': {
    backgroundColor: '#ff4500', // Darker hover color for buttons
    transform: 'scale(1.1)', // Slight zoom effect on hover
    boxShadow: '0 6px 15px rgba(0, 0, 0, 0.2)', // Shadow effect for hover
  },
};

// Username style
const usernameStyle = {
  color: '#fff',
  fontWeight: '600',
  fontSize: '1.1rem',
  marginRight: '15px',
};

export default Navbar;
