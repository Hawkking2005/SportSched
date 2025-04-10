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

  if (loading) return <div className="text-center">Loading...</div>;

  return (
    <div className="container mt-4">
      <h2>Sports Facilities</h2>
      <div className="row">
        {facilities.map(facility => (
          <div key={facility.id} className="col-md-4 mb-4">
            <div className="card">
              {facility.image && (
                <img 
                  src={facility.image} 
                  className="card-img-top" 
                  alt={facility.name} 
                  style={{ height: '200px', objectFit: 'cover' }}
                />
              )}
              <div className="card-body">
                <h5 className="card-title">{facility.name}</h5>
                <p className="card-text">{facility.facility_type}</p>
                <p className="card-text text-truncate">{facility.description}</p>
                <Link to={`/facilities/${facility.id}`} className="btn btn-primary">
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FacilityList;