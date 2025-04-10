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

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (error) return <div className="alert alert-danger mt-3">{error}</div>;
  if (!facility) return <div className="alert alert-warning mt-3">Facility not found</div>;

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-8">
          <h2>{facility.name}</h2>
          <p className="text-muted">Type: {facility.facility_type}</p>
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Description</h5>
              <p className="card-text">{facility.description}</p>
            </div>
          </div>
          
          <div className="d-grid gap-2">
            <Link to={`/reserve/${facility.id}`} className="btn btn-primary btn-lg">
              Make a Reservation
            </Link>
          </div>
        </div>
        
        <div className="col-md-4">
          {facility.image && (
            <img 
              src={facility.image} 
              alt={facility.name} 
              className="img-fluid rounded mb-4" 
            />
          )}
          
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Additional Information</h5>
            </div>
            <ul className="list-group list-group-flush">
              <li className="list-group-item">
                <strong>Available for:</strong> Students, Faculty, Staff
              </li>
              <li className="list-group-item">
                <strong>Equipment:</strong> Available on request
              </li>
              <li className="list-group-item">
                <strong>Max duration:</strong> 2 hours per booking
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilityDetail;