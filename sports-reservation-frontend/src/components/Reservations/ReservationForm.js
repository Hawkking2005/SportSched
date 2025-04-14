// src/components/Reservations/ReservationForm.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { getFacility, getTimeSlots, createReservation } from '../../services/api';

const ReservationForm = () => {
  const { facilityId } = useParams();
  const navigate = useNavigate();
  const [facility, setFacility] = useState(null);
  const [date, setDate] = useState(new Date());
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFacility = async () => {
      try {
        const response = await getFacility(facilityId);
        setFacility(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching facility:', error);
        setError('Could not load facility details');
        setLoading(false);
      }
    };
    fetchFacility();
  }, [facilityId]);

  useEffect(() => {
    const fetchTimeSlots = async () => {
      try {
        setLoading(true);
        const formattedDate = date.toISOString().split('T')[0];
        const response = await getTimeSlots(facilityId, formattedDate);
        setTimeSlots(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching time slots:', error);
        setError('Could not load available time slots');
        setLoading(false);
      }
    };
    if (facilityId && date) fetchTimeSlots();
  }, [facilityId, date]);

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
        setError(error.response.data.detail || 'Failed to create reservation');
      } else {
        setError('An error occurred while making your reservation');
      }
      setSubmitting(false);
    }
  };

  if (loading && !facility) return <div className="text-center my-5"><div className="spinner-border"></div></div>;

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
        <h2 style={{ fontSize: '24px', color: '#FFD580', marginBottom: '20px' }}>
          Reserve {facility?.name}
        </h2>

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
