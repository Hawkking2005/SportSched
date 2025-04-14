// src/components/Facilities/FacilityDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';

const FacilityDetail = () => {
  const { facilityId } = useParams();
  const [facility, setFacility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFacility = async () => {
      try {
        const response = await api.get(`facilities/${facilityId}/`);
        setFacility(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching facility:', error);
        setError('Failed to load facility details');
        setLoading(false);
      }
    };

    fetchFacility();
  }, [facilityId]);

  if (loading) return <div className="text-center mt-5 text-white">Loading...</div>;
  if (error) return <div className="alert alert-danger mt-3">{error}</div>;
  if (!facility) return <div className="alert alert-warning mt-3">Facility not found</div>;

  const imageSrc = facility.image || '/images/default-facility.png';

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundImage: `linear-gradient(rgba(0, 0, 30, 0.4), rgba(0, 0, 40, 0.5)), url('https://t4.ftcdn.net/jpg/02/81/79/13/360_F_281791395_yMsSMTbxDZ9s7neOIln5yeIyKtSD0Tdo.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '60px 20px',
        fontFamily: 'Segoe UI, sans-serif',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          width: '100%',
          background: 'rgba(0, 0, 40, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '25px',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 0 40px rgba(65,105,225,0.25)',
          color: '#fff',
          padding: '50px 40px',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <h1 className="mb-4 fw-bold" style={{ fontSize: '3rem', letterSpacing: '2px', color: '#dce3ff' }}>
          {facility.name}
        </h1>
        <p className="text-light text-opacity-75 mb-4" style={{ fontSize: '1.25rem' }}>
          Facility Type: <strong>{facility.facility_type}</strong>
        </p>

        <div
          className="image-container mb-5"
          style={{
            overflow: 'hidden',
            borderRadius: '18px',
            maxHeight: '400px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.6)',
            transition: 'all 0.3s ease-in-out',
          }}
        >
          <img
            src={imageSrc}
            alt={facility.name}
            className="img-fluid"
            style={{
              width: '100%',
              objectFit: 'cover',
              transform: 'scale(1)',
              transition: 'transform 0.4s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          />
        </div>

        <p style={{ fontSize: '1.2rem', color: '#e0e0e0', marginBottom: '40px', lineHeight: '1.6' }}>
          {facility.description}
        </p>

        <div className="d-flex justify-content-center gap-3 flex-wrap">
          <Link
            to={`/reserve/${facility.id}`}
            className="btn px-4 py-2 glow-btn"
            style={{
              backgroundColor: '#4169e1',
              border: 'none',
              fontSize: '1rem',
              borderRadius: '10px',
              color: 'white',
            }}
          >
            Reserve This Facility
          </Link>
          <Link
            to="/facilities"
            className="btn px-4 py-2"
            style={{
              border: '1px solid rgba(255,255,255,0.4)',
              fontSize: '1rem',
              borderRadius: '10px',
              color: '#fff',
              background: 'transparent',
            }}
          >
            Back to List
          </Link>
        </div>
      </div>

      {/* Styles */}
      <style>
        {`
          .glow-btn {
            box-shadow: 0 0 12px rgba(65,105,225, 0.4);
            transition: all 0.3s ease-in-out;
          }

          .glow-btn:hover {
            box-shadow: 0 0 20px rgba(65,105,225, 0.65);
            transform: scale(1.05);
          }
        `}
      </style>
    </div>
  );
};

export default FacilityDetail;