// src/components/Auth/Register.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password1: '',
    password2: '',
    first_name: '',
    last_name: ''
  });
  const [showPassword, setShowPassword] = useState(false);
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
    <div
      style={{
        minHeight: '100vh',
        backgroundImage: 'url("https://img.freepik.com/premium-photo/sports-background-advertising-sport-life-concept-generative-ai_1002555-984.jpg?w=2000")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '30px'
      }}
    >
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        padding: '30px',
        borderRadius: '10px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
      }}>
        <h2 className="text-center mb-4">Register</h2>

        {errors.non_field_errors && (
          <div className="alert alert-danger">
            {errors.non_field_errors.map((error, index) => (
              <p key={index} className="mb-0">{error}</p>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="text"
              name="first_name"
              placeholder="First Name"
              className={`form-control ${errors.first_name ? 'is-invalid' : ''}`}
              value={formData.first_name}
              onChange={handleChange}
            />
            {errors.first_name && <div className="invalid-feedback">{errors.first_name}</div>}
          </div>

          <div className="mb-3">
            <input
              type="text"
              name="last_name"
              placeholder="Last Name"
              className={`form-control ${errors.last_name ? 'is-invalid' : ''}`}
              value={formData.last_name}
              onChange={handleChange}
            />
            {errors.last_name && <div className="invalid-feedback">{errors.last_name}</div>}
          </div>

          <div className="mb-3">
            <input
              type="text"
              name="username"
              placeholder="Username"
              className={`form-control ${errors.username ? 'is-invalid' : ''}`}
              value={formData.username}
              onChange={handleChange}
              required
            />
            {errors.username && <div className="invalid-feedback">{errors.username}</div>}
          </div>

          <div className="mb-3">
            <input
              type="email"
              name="email"
              placeholder="Email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>

          <div className="mb-3">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password1"
              placeholder="Password"
              className={`form-control ${errors.password1 ? 'is-invalid' : ''}`}
              value={formData.password1}
              onChange={handleChange}
              required
            />
            {errors.password1 && <div className="invalid-feedback">{errors.password1}</div>}
          </div>

          <div className="mb-3">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password2"
              placeholder="Confirm Password"
              className={`form-control ${errors.password2 ? 'is-invalid' : ''}`}
              value={formData.password2}
              onChange={handleChange}
              required
            />
            {errors.password2 && <div className="invalid-feedback">{errors.password2}</div>}
          </div>

          <div className="form-check mb-3">
            <input
              type="checkbox"
              className="form-check-input"
              id="togglePassword"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
            />
            <label className="form-check-label" htmlFor="togglePassword">
              Show Password
            </label>
          </div>

          <button type="submit" className="btn btn-success w-100 mb-3">
            Register
          </button>

          <p className="text-center">
            Already have an account?{' '}
            <Link to="/login" style={{ textDecoration: 'none' }}>
              Log In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
