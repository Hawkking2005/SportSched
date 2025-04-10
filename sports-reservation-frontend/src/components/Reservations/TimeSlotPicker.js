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
    <div className="time-slot-picker">
      <input
        type="date"
        min={format(new Date(), 'yyyy-MM-dd')}
        value={format(selectedDate, 'yyyy-MM-dd')}
        onChange={(e) => setSelectedDate(parseISO(e.target.value))}
      />

      {loading ? (
        <p>Loading slots...</p>
      ) : (
        <div className="slots-grid">
          {slots.map((slot) => (
            <button
              key={slot.id}
              onClick={() => onSlotSelect(slot)}
              disabled={!slot.is_available}
              className={`slot-btn ${!slot.is_available ? 'booked' : ''}`}
            >
              {format(parseISO(slot.start_time), 'h:mm a')} -{' '}
              {format(parseISO(slot.end_time), 'h:mm a')}
              {!slot.is_available && <span> (Booked)</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TimeSlotPicker;