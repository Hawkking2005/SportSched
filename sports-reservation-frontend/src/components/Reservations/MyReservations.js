// src/components/Reservations/MyReservations.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const MyReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await api.get('reservations/');
        setReservations(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching reservations:', error);
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  const handleCancelReservation = async (id) => {
    if (window.confirm('Are you sure you want to cancel this reservation?')) {
      try {
        await api.delete(`reservations/${id}/`);
        setReservations(reservations.filter(reservation => reservation.id !== id));
      } catch (error) {
        console.error('Error canceling reservation:', error);
        alert('Failed to cancel reservation. Please try again.');
      }
    }
  };

  if (loading) return <div className="text-center mt-5 text-light">Loading...</div>;

  return (
    <div
      style={{
        backgroundColor: '#001f3d',
        minHeight: '100vh',
        color: '#fff',
        fontFamily: 'Segoe UI, sans-serif',
        padding: '60px 0',
        textAlign: 'center',
        position: 'relative',
      }}
    >
      {/* Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          zIndex: -1,
        }}
      ></div>

      {/* Header */}
      <div className="container mb-4">
        <h1
          className="fw-bold"
          style={{
            fontSize: '2.5rem',
            color: '#FFDEB4',
            textShadow: '2px 2px 10px rgba(0,0,0,0.5)',
            marginBottom: '10px',
          }}
        >
          SportSched
        </h1>
        <h2
          className="fw-semibold"
          style={{
            fontSize: '1.8rem',
            textShadow: '2px 2px 8px rgba(0,0,0,0.4)',
          }}
        >
          My Reservations
        </h2>
      </div>

      {/* Reservation Table */}
      <div className="container table-responsive">
        {reservations.length === 0 ? (
          <div
            className="alert text-dark"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '12px',
              fontSize: '0.9rem',
            }}
          >
            You have no reservations yet.
          </div>
        ) : (
          <table
            className="table table-sm table-hover"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.07)',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '0.85rem',
              overflow: 'hidden',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#003366', color: '#FFDEB4' }}>
                <th>Facility</th>
                <th>Court</th>
                <th>Date</th>
                <th>Time</th>
                <th>Booked On</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((reservation) => (
                <tr key={reservation.id} style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                  <td>{reservation.facility_name}</td>
                  <td>{reservation.court_name}</td>
                  <td>{new Date(reservation.time_slot_details.date).toLocaleDateString()}</td>
                  <td>
                    {new Date(`2000-01-01T${reservation.time_slot_details.start_time}`).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    {' - '}
                    {new Date(`2000-01-01T${reservation.time_slot_details.end_time}`).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td>{new Date(reservation.created_at).toLocaleDateString()}</td>
                  <td>
                    {!reservation.is_cancelled && (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleCancelReservation(reservation.id)}
                        style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default MyReservations;

