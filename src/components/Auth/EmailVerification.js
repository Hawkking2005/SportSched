import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const EmailVerification = () => {
  const { key } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Verifying...');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        await api.post('auth/registration/verify-email/', { key });
        setStatus('Email verified successfully! Redirecting to login...');
        setTimeout(() => navigate('/login'), 3000);
      } catch (error) {
        setStatus('Email verification failed. Please try again.');
      }
    };

    if (key) {
      verifyEmail();
    }
  }, [key, navigate]);

  return (
    <div className="container mt-5">
      <div className="alert alert-info">{status}</div>
    </div>
  );
};

export default EmailVerification; 