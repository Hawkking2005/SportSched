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

    if (facilityId && date) {
      fetchTimeSlots();
    }
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
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-8 mx-auto">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">Reserve {facility?.name}</h4>
            </div>
            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}
              
              <div className="mb-4">
                <label className="form-label fw-bold">Select Date:</label>
                <DatePicker
                  selected={date}
                  onChange={date => {
                    setDate(date);
                    setSelectedTimeSlot(null); // Reset selection when date changes
                  }}
                  className="form-control"
                  minDate={new Date()}
                  dateFormat="MMMM d, yyyy"
                />
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold">Available Time Slots:</label>
                {loading ? (
                  <div className="text-center my-3"><div className="spinner-border spinner-border-sm"></div></div>
                ) : timeSlots.length === 0 ? (
                  <div className="alert alert-info">No available time slots for the selected date.</div>
                ) : (
                  <div className="row row-cols-1 row-cols-md-3 g-3 mt-2">
                    {timeSlots.map(slot => (
                      <div className="col" key={slot.id}>
                        <div 
                          className={`card h-100 ${selectedTimeSlot === slot.id ? 'border-primary' : ''} ${!slot.is_available ? 'bg-light' : ''}`}
                          style={{ cursor: slot.is_available ? 'pointer' : 'not-allowed' }}
                          onClick={() => slot.is_available && setSelectedTimeSlot(slot.id)}
                        >
                          <div className="card-body text-center">
                            <h5 className="card-title">
                              {new Date(`2000-01-01T${slot.start_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                              {' - '}
                              {new Date(`2000-01-01T${slot.end_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </h5>
                            {!slot.is_available && (
                              <span className="badge bg-secondary">Already Booked</span>
                            )}
                            {selectedTimeSlot === slot.id && (
                              <span className="badge bg-success mt-2">Selected</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="d-grid">
                <button 
                  className="btn btn-primary btn-lg" 
                  onClick={handleReservation}
                  disabled={!selectedTimeSlot || submitting}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationForm;