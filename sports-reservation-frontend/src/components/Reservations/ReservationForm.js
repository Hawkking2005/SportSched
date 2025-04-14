// src/components/Reservations/ReservationForm.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { getCourt, getTimeSlots, createReservation } from '../../services/api';

const ReservationForm = () => {
  const { facilityId, courtId } = useParams();
  const navigate = useNavigate();
  const [court, setCourt] = useState(null);
  const [date, setDate] = useState(new Date());
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourt = async () => {
      try {
        setLoading(true);
        const response = await getCourt(courtId);
        if (response.data) {
          setCourt(response.data);
        } else {
          setError('Court details not found');
        }
      } catch (error) {
        console.error('Error fetching court:', error);
        setError('Could not load court details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (courtId) {
      fetchCourt();
    } else {
      setError('No court ID provided');
      setLoading(false);
    }
  }, [courtId]);

  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!courtId || !date) return;
      
      try {
        setLoading(true);
        const formattedDate = date.toISOString().split('T')[0];
        const response = await getTimeSlots(courtId, formattedDate);
        if (response.data) {
          setTimeSlots(response.data);
        } else {
          setError('No time slots available');
        }
      } catch (error) {
        console.error('Error fetching time slots:', error);
        setError('Could not load available time slots');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTimeSlots();
  }, [courtId, date]);

  const handleReservation = async () => {
    if (!selectedTimeSlot) {
      setError('Please select a time slot');
      return;
    }

    try {
      setSubmitting(true);
      await createReservation(selectedTimeSlot);
      navigate('/my-reservations', { state: { success: true } });
    } catch (error) {
      console.error('Error creating reservation:', error);
      if (error.response && error.response.data) {
        if (error.response.data.detail && error.response.data.detail.includes('Maximum number of reservations')) {
          setError('You have reached the maximum number of reservations (2). Please cancel an existing reservation to make a new one.');
        } else if (error.response.data.detail && error.response.data.detail.includes('already have a reservation')) {
          setError('You already have a reservation for this time slot. Please choose a different time.');
        } else {
          setError(error.response.data.detail || 'Failed to create reservation');
        }
      } else {
        setError('An error occurred while making your reservation');
      }
      setSubmitting(false);
    }
  };

  if (loading && !court) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#001F3F',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white'
      }}>
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#001F3F',
        padding: '40px 20px',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          padding: '30px',
          borderRadius: '20px',
          boxShadow: '0 0 25px rgba(0, 0, 0, 0.3)',
        }}>
          <h2 style={{ color: '#FFD580', marginBottom: '20px' }}>Error</h2>
          <p style={{ color: 'salmon', marginBottom: '20px' }}>{error}</p>
          <button
            onClick={() => navigate(`/facilities/${facilityId}/courts`)}
            className="btn"
            style={{
              backgroundColor: '#FFB347',
              color: '#000',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 'bold',
            }}
          >
            ← Back to Courts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#001F3F', // deep dark blue
      padding: '40px 20px',
      color: 'white',
      fontFamily: 'Segoe UI, sans-serif',
    }}>
      <h1 style={{ textAlign: 'center', fontSize: '42px', fontWeight: 'bold', color: '#FFDEB4', marginBottom: '30px' }}>
        SportSched
      </h1>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: '30px',
        borderRadius: '20px',
        boxShadow: '0 0 25px rgba(0, 0, 0, 0.3)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <button
            onClick={() => navigate(`/facilities/${facilityId}/courts`)}
            className="btn"
            style={{
              backgroundColor: '#FFB347',
              color: '#000',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              boxShadow: '0 0 10px rgba(255, 179, 71, 0.3)',
            }}
          >
            ← Back to Courts
          </button>
          <h2 style={{ fontSize: '24px', color: '#FFD580', margin: '0' }}>
            Reserve {court?.name}
          </h2>
        </div>

        {error && <div style={{ color: 'salmon', marginBottom: '15px' }}>{error}</div>}

        <div style={{ marginBottom: '25px' }}>
          <label style={{ fontWeight: 'bold' }}>Select Date:</label><br />
          <DatePicker
            selected={date}
            onChange={date => {
              setDate(date);
              setSelectedTimeSlot(null);
            }}
            className="form-control"
            minDate={new Date()}
            dateFormat="MMMM d, yyyy"
          />
        </div>

        <div style={{ marginBottom: '30px' }}>
          <label style={{ fontWeight: 'bold' }}>Available Time Slots:</label>
          {loading ? (
            <div className="text-center my-3"><div className="spinner-border spinner-border-sm"></div></div>
          ) : timeSlots.length === 0 ? (
            <div style={{ color: '#ccc', marginTop: '10px' }}>No available time slots for the selected date.</div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '15px',
              marginTop: '15px'
            }}>
              {timeSlots.map(slot => {
                const isSelected = selectedTimeSlot === slot.id;
                const isAvailable = slot.is_available;
                return (
                  <div
                    key={slot.id}
                    onClick={() => isAvailable && setSelectedTimeSlot(slot.id)}
                    style={{
                      padding: '15px',
                      borderRadius: '10px',
                      backgroundColor: isAvailable ? (isSelected ? '#FFDAB9' : '#FFE5B4') : '#444',
                      color: isAvailable ? '#000' : '#bbb',
                      cursor: isAvailable ? 'pointer' : 'not-allowed',
                      textAlign: 'center',
                      boxShadow: isSelected ? '0 0 10px #FFDAB9' : 'none',
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    <strong>
                      {new Date(`2000-01-01T${slot.start_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                      {new Date(`2000-01-01T${slot.end_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </strong>
                    {!isAvailable && <div style={{ fontSize: '0.8rem', marginTop: '5px' }}>Already Booked</div>}
                    {isSelected && <div style={{ fontSize: '0.8rem', color: '#008000', marginTop: '5px' }}>Selected</div>}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <button
          className="btn btn-lg"
          onClick={handleReservation}
          disabled={!selectedTimeSlot || submitting}
          style={{
            width: '100%',
            backgroundColor: '#FFB347',
            color: '#000',
            border: 'none',
            padding: '12px',
            borderRadius: '12px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            boxShadow: '0 0 15px rgba(255, 179, 71, 0.5)',
            transition: 'transform 0.2s ease-in-out',
            transform: submitting ? 'scale(0.98)' : 'scale(1)',
          }}
        >
          {submitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Processing...
            </>
          ) : 'Confirm Reservation'}
        </button>
      </div>
    </div>
  );
};

export default ReservationForm;
