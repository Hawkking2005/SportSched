// src/components/Reservations/MyReservations.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const MyReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReservations = async () => {
    try {
      const response = await api.get('reservations/');
      // Filter out cancelled reservations
      const activeReservations = response.data.filter(res => !res.is_cancelled);
      setReservations(activeReservations);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleCancelReservation = async (id) => {
    if (window.confirm('Are you sure you want to cancel this reservation?')) {
      try {
        // Call the cancel endpoint
        const response = await api.delete(`reservations/${id}/`);
        
        if (response.status === 200) {
          // Remove the cancelled reservation from the state
          setReservations(prevReservations => 
            prevReservations.filter(res => res.id !== id)
          );
          
          // Show success message
          alert('Reservation cancelled successfully');
        }
      } catch (error) {
        console.error('Error canceling reservation:', error);
        alert('Failed to cancel reservation. Please try again.');
      }
    }
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="container mt-4">
      <h2>My Reservations</h2>
      {reservations.length === 0 ? (
        <div className="alert alert-info">You have no reservations yet.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>Facility</th>
                <th>Date</th>
                <th>Time</th>
                <th>Booked On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map(reservation => (
                <tr key={reservation.id}>
                  <td>{reservation.facility_name}</td>
                  <td>{new Date(reservation.time_slot_details.date).toLocaleDateString()}</td>
                  <td>
                    {new Date(`2000-01-01T${reservation.time_slot_details.start_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                    - 
                    {new Date(`2000-01-01T${reservation.time_slot_details.end_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td>{new Date(reservation.created_at).toLocaleDateString()}</td>
                  <td>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => handleCancelReservation(reservation.id)}
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyReservations;