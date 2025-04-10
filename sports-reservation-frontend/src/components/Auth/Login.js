// src/components/Auth/Login.js
import React, { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const Login = ({ theme, toggleTheme }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/facilities");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const success = await login(email, password);
      if (success) {
        navigate("/facilities");
      } else {
        setError("Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-200 text-black'}`}>
      <h1 className="text-4xl font-extrabold mb-10">SportSched</h1>
      <button onClick={toggleTheme} className="absolute top-4 right-4 p-2 bg-gray-400 rounded">
        {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
      </button>
      <form onSubmit={handleSubmit} className={`p-8 rounded-lg shadow-lg w-96 border-2 ${theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-400'}`}>
        <h2 className="text-2xl font-semibold text-center mb-4">Login</h2>
        {error && <div className="text-red-500 mb-3 text-center">{error}</div>}
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border rounded mb-4 bg-transparent"
          required
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border rounded mb-4 bg-transparent"
          required
        />
        <button 
          className="w-full bg-blue-500 text-white p-3 rounded" 
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
      <p className="mt-5">Don't have an account? <Link to="/register" className="text-blue-500">Register</Link></p>
    </div>
  );
};

export default Login;
