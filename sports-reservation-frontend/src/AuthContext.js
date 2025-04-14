// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser)); // Retrieve and parse user data
      setIsAuthenticated(true); // Set user as authenticated
    }
    setIsLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axios.post('http://localhost:5000/login', {
        username,
        password,
      });

      if (response.status === 200) {
        const userData = response.data; // Assuming the response contains user data (like username)
        setIsAuthenticated(true);
        setUser(userData); // Save user data in context
        localStorage.setItem('user', JSON.stringify(userData)); // Store user data in localStorage
        navigate('/'); // Redirect after login
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('user'); // Remove user data from localStorage
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
