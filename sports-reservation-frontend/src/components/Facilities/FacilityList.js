import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const FacilityList = () => {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const response = await api.get('facilities/');
        setFacilities(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching facilities:', error);
        setLoading(false);
      }
    };

    fetchFacilities();
  }, []);

  const getLabelStyle = (type) => {
    const colors = {
      basketball: '#ff6b6b',
      football: '#5eead4',
      swimming: '#38bdf8',
      tennis: '#facc15',
    };

    return {
      background: `linear-gradient(45deg, ${colors[type.toLowerCase()] || '#ccc'}, #fff)`,
      color: '#000',
      padding: '6px 20px',
      borderRadius: '30px',
      fontSize: '0.9rem',
      fontWeight: '600',
      textTransform: 'capitalize',
      display: 'inline-block',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    };
  };

  if (loading) return <div className="text-center text-white mt-5">Loading...</div>;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url("https://img.freepik.com/premium-photo/sports-background-advertising-sport-life-concept-generative-ai_1002555-984.jpg?w=2000")`,
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '60px 15px',
        fontFamily: 'Segoe UI, sans-serif',
      }}
    >
      <div className="container text-white text-center">
        <h1
          className="mb-4 fw-bold"
          style={{
            fontSize: '3rem',
            letterSpacing: '2px',
            textShadow: '0 0 25px rgba(0,255,200,0.4)',
            background: 'linear-gradient(90deg, #38f9d7, #43e97b)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'fadeSlide 2s ease-out',
            textAlign: 'center', // Ensuring heading is centered
          }}
        >
          SportSched
        </h1>

        <p
          className="lead text-light mb-5"
          style={{
            maxWidth: '750px',
            margin: '0 auto',
            fontWeight: 300,
            fontSize: '1.1rem',
            opacity: 0.95,
            textAlign: 'center', // Ensuring paragraph is centered
          }}
        >
          Discover your favorite sports zones, elevate your energy, and book the best slots with ease.
        </p>

        <div className="row justify-content-center">
          {facilities.map((facility, index) => (
            <div
              key={facility.id}
              className="col-lg-4 col-md-6 mb-5 d-flex align-items-stretch"
              style={{ animation: `fadeUp 0.7s ease ${index * 0.1}s both` }}
            >
              <div
                className="card w-100 shadow-lg facility-card"
                style={{
                  borderRadius: '20px',
                  background: 'rgba(255, 255, 255, 0.07)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
                  transition: 'transform 0.4s ease',
                  display: 'flex', // To ensure all elements are centered
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                {facility.image && (
                  <img
                    src={facility.image}
                    className="card-img-top"
                    alt={facility.name}
                    style={{
                      height: '220px',
                      objectFit: 'cover',
                      borderTopLeftRadius: '20px',
                      borderTopRightRadius: '20px',
                    }}
                  />
                )}

                <div className="card-body text-white px-4 pb-4" style={{ textAlign: 'center' }}>
                  <div className="mb-2">
                    <h5 className="fw-bold mb-0">{facility.name}</h5>
                  </div>

                  {/* Color-coded, pill-shaped sport label */}
                  <span style={getLabelStyle(facility.facility_type)}>
                    {facility.facility_type}
                  </span>

                  <p
                    className="card-text mt-2"
                    style={{
                      maxHeight: '4.5em',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      fontSize: '0.95rem',
                    }}
                    title={facility.description}
                  >
                    {facility.description}
                  </p>

                  <Link
                    to={`/facilities/${facility.id}`}
                    className="btn btn-success mt-3 w-100 glow-btn"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
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

          @keyframes fadeSlide {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .facility-card:hover {
            transform: scale(1.045) rotateX(1deg) rotateY(1deg);
            box-shadow: 0 0 25px rgba(0, 255, 200, 0.4);
          }

          .glow-btn {
            transition: all 0.3s ease-in-out;
            box-shadow: 0 0 15px rgba(40, 167, 69, 0.5);
            font-weight: 600;
            border-radius: 50px;
          }

          .glow-btn:hover {
            background-color: #1e7e34;
            transform: scale(1.05);
            box-shadow: 0 0 22px rgba(72, 255, 160, 0.8);
          }
        `}
      </style>
    </div>
  );
};

export default FacilityList;
