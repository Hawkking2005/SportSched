// src/components/Auth/Register.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

const Register = ({ theme, toggleTheme }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password1: '',
    password2: '',
    first_name: '',
    last_name: ''
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('auth/registration/', formData);
      alert('Registration successful! Please log in.');
      navigate('/login');
    } catch (error) {
      if (error.response && error.response.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ non_field_errors: ['Registration failed. Please try again.'] });
      }
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-200 text-black'}`}>
      <h1 className="text-4xl font-bold mb-6">Create Account</h1>
      <button onClick={toggleTheme} className="absolute top-4 right-4 p-2 bg-gray-400 rounded">
        {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
      </button>

      <form onSubmit={handleSubmit} className={`w-[90%] max-w-xl p-8 rounded-lg shadow-lg border-2 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}>
        {errors.non_field_errors && (
          <div className="text-red-500 mb-3 text-center">
            {errors.non_field_errors.map((err, i) => <p key={i}>{err}</p>)}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              name="first_name"
              placeholder="First Name"
              value={formData.first_name}
              onChange={handleChange}
              className={`w-full p-3 border rounded bg-transparent ${errors.first_name ? 'border-red-500' : ''}`}
            />
            {errors.first_name && <p className="text-red-500 text-sm">{errors.first_name}</p>}
          </div>

          <div>
            <input
              type="text"
              name="last_name"
              placeholder="Last Name"
              value={formData.last_name}
              onChange={handleChange}
              className={`w-full p-3 border rounded bg-transparent ${errors.last_name ? 'border-red-500' : ''}`}
            />
            {errors.last_name && <p className="text-red-500 text-sm">{errors.last_name}</p>}
          </div>
        </div>

        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
          className={`w-full mt-4 p-3 border rounded bg-transparent ${errors.username ? 'border-red-500' : ''}`}
        />
        {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className={`w-full mt-4 p-3 border rounded bg-transparent ${errors.email ? 'border-red-500' : ''}`}
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

        <input
          type="password"
          name="password1"
          placeholder="Password"
          value={formData.password1}
          onChange={handleChange}
          required
          className={`w-full mt-4 p-3 border rounded bg-transparent ${errors.password1 ? 'border-red-500' : ''}`}
        />
        {errors.password1 && <p className="text-red-500 text-sm">{errors.password1}</p>}

        <input
          type="password"
          name="password2"
          placeholder="Confirm Password"
          value={formData.password2}
          onChange={handleChange}
          required
          className={`w-full mt-4 p-3 border rounded bg-transparent ${errors.password2 ? 'border-red-500' : ''}`}
        />
        {errors.password2 && <p className="text-red-500 text-sm">{errors.password2}</p>}

        <button type="submit" className="mt-6 w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600">
          Register
        </button>

        <p className="mt-4 text-center">
          Already have an account? <Link to="/login" className="text-blue-500">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
