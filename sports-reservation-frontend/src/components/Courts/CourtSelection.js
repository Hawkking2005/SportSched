import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const CourtSelection = () => {
  const { facilityId } = useParams();
  const navigate = useNavigate();
  const [facility, setFacility] = useState(null);
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFacilityAndCourts = async () => {
      try {
        const [facilityResponse, courtsResponse] = await Promise.all([
          api.get(`facilities/${facilityId}/`),
          api.get(`facilities/${facilityId}/courts/`)
        ]);
        setFacility(facilityResponse.data);
        setCourts(courtsResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load facility and courts information');
        setLoading(false);
      }
    };

    fetchFacilityAndCourts();
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
          Select a Court
        </p>

        <div className="row justify-content-center mt-4">
          {courts.map((court, index) => (
            <div
              key={court.id}
              className="col-lg-4 col-md-6 mb-4"
              style={{ animation: `fadeUp 0.7s ease ${index * 0.1}s both` }}
            >
              <div
                className="card h-100 shadow-lg court-card"
                style={{
                  borderRadius: '20px',
                  background: 'rgba(255, 255, 255, 0.07)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
                  transition: 'transform 0.4s ease',
                  cursor: 'pointer',
                }}
                onClick={() => navigate(`/reserve/${facilityId}/court/${court.id}`)}
              >
                <div className="card-body d-flex flex-column justify-content-between">
                  <div>
                    <h5 className="card-title fw-bold mb-3">{court.name}</h5>
                    <p className="card-text" style={{ color: '#e0e0e0' }}>
                      {court.description || 'Standard court for your sport'}
                    </p>
                  </div>
                  <div className="mt-3">
                    <span
                      className="badge"
                      style={{
                        background: court.is_available ? '#28a745' : '#dc3545',
                        padding: '8px 15px',
                        borderRadius: '20px',
                        fontSize: '0.9rem',
                      }}
                    >
                      {court.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <Link
            to={`/facilities/${facilityId}`}
            className="btn px-4 py-2"
            style={{
              border: '1px solid rgba(255,255,255,0.4)',
              fontSize: '1rem',
              borderRadius: '10px',
              color: '#fff',
              background: 'transparent',
            }}
          >
            Back to Facility
          </Link>
        </div>
      </div>

      <style>
        {`
          @keyframes fadeUp {
            from {
              opacity: 0;
              transform: translateY(40px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .court-card:hover {
            transform: scale(1.05);
            box-shadow: 0 0 25px rgba(0, 255, 200, 0.4);
          }
        `}
      </style>
    </div>
  );
};

export default CourtSelection; 