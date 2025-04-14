// src/components/Reservations/TimeSlotPicker.js
import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import axios from 'axios';

const TimeSlotPicker = ({ facilityId, onSlotSelect }) => {
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSlots = async () => {
      setLoading(true);
      try {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const response = await axios.get(
          `/api/timeslots/?facility_id=${facilityId}&date=${dateStr}`
        );
        setSlots(response.data);
      } catch (error) {
        console.error('Error fetching slots:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSlots();
  }, [facilityId, selectedDate]);

  return (
    <div
      style={{
        backgroundImage: "url('https://t4.ftcdn.net/jpg/02/81/79/13/360_F_281791395_yMsSMTbxDZ9s7neOIln5yeIyKtSD0Tdo.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        color: '#fff',
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center',
        padding: '60px 0',
      }}
    >
      {/* SportSched Branding */}
      <div className="container mb-5">
        <h1
          style={{
            color: 'royalblue',
            fontSize: '3rem',
            fontWeight: 'bold',
            textShadow: '4px 4px 10px rgba(0, 0, 0, 0.7)',
          }}
        >
          SportSched
        </h1>
      </div>

      <div className="container" style={{ maxWidth: '800px' }}>
        <h2 className="mb-4" style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>Select a Time Slot</h2>

        {/* Date Picker */}
        <div className="mb-4">
          <input
            type="date"
            min={format(new Date(), 'yyyy-MM-dd')}
            value={format(selectedDate, 'yyyy-MM-dd')}
            onChange={(e) => setSelectedDate(parseISO(e.target.value))}
            style={{
              padding: '15px',
              fontSize: '1.2rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#fff',
              color: '#333',
              boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
              cursor: 'pointer',
            }}
          />
        </div>

        {/* Slot Picker */}
        {loading ? (
          <p>Loading slots...</p>
        ) : (
          <div
            className="slots-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: '20px',
              justifyItems: 'center',
              marginTop: '30px',
            }}
          >
            {slots.map((slot) => (
              <button
                key={slot.id}
                onClick={() => onSlotSelect(slot)}
                disabled={!slot.is_available}
                className="slot-btn"
                style={{
                  backgroundColor: slot.is_available ? '#28a745' : '#dc3545',
                  padding: '20px 30px',
                  fontSize: '1.2rem',
                  borderRadius: '8px',
                  border: 'none',
                  color: '#fff',
                  cursor: slot.is_available ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
                  transform: 'scale(1)',
                }}
                onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                {format(parseISO(slot.start_time), 'h:mm a')} -{' '}
                {format(parseISO(slot.end_time), 'h:mm a')}
                {!slot.is_available && <span> (Booked)</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeSlotPicker;
