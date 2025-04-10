// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { login, logout, register } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }, []);

  const loginUser = async (username, password) => {
    try {
      await login(username, password);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const registerUser = async (userData) => {
    try {
      await register(userData);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logoutUser = async () => {
    try {
      await logout();
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      // Still remove token and update state even if API call fails
      localStorage.removeItem('token');
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isLoading,
      login: loginUser,
      register: registerUser,
      logout: logoutUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};