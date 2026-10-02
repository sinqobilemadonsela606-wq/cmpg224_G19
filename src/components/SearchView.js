import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

export default function ScheduleView() {
  const [schedules, setSchedules] = useState([]);
  const [practitioners, setPractitioners] = useState([]);
  const [selectedPractitioner, setSelectedPractitioner] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  // Fetch practitioners for filtering dropdown
  useEffect(() => {
    const fetchPractitioners = async () => {
      const { data, error } = await supabase.from('practitioners').select('*');
      if (error) {
        console.error('Error fetching practitioners:', error);
      } else {
        setPractitioners(data || []);
      }
    };
    fetchPractitioners();
  }, []);

  // Fetch schedule / availability based on date and practitioner
  const fetchSchedule = async () => {
    setLoading(true);
    let query = supabase
      .from('appointments') // or your dedicated 'schedules' table depending on schema
      .select('*, patients(first_name, last_name, email, phone)')
      .ilike('appointment_date', `${selectedDate}%`);

    if (selectedPractitioner) {
      query = query.eq('practitioner_id', selectedPractitioner);
    }

    const { data, error } = await query.order('appointment_date', { ascending: true });

    if (error) {
      console.error('Error fetching schedule:', error);
    } else {
      setSchedules(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSchedule();
  }, [selectedDate, selectedPractitioner]);

  return (
    <div style={{ padding: '20px', background: '#f9f9f9', borderRadius: '8px', border: '1px solid #ddd' }}>
      <h2>Practitioner Schedule View</h2>

      {/* Control Panel: Date Picker & Practitioner Dropdown */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85em', color: '#64748b', marginBottom: '5px' }}>Date</label>
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '15px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85em', color: '#64748b', marginBottom: '5px' }}>Practitioner</label>
          <select 
            value={selectedPractitioner} 
            onChange={(e) => setSelectedPractitioner(e.target.value)}
            style={{ padding: '9px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '15px', background: '#fff' }}
          >
            <option value="">All Practitioners</option>
            {practitioners.map((doc) => (
              <option key={doc.id || doc.practitioner_id} value={doc.id || doc.practitioner_id}>
                {doc.name || `${doc.first_name} ${doc.last_name}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Schedule List */}
      {loading ? (
        <p>Loading schedule slots...</p>
      ) : schedules.length === 0 ? (
        <p style={{ color: '#666' }}>No scheduled appointments found for this selection.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {schedules.map((slot) => (
            <li 
              key={slot.id} 
              style={{ 
                background: '#fff', 
                padding: '15px', 
                marginBottom: '10px', 
                borderRadius: '6px', 
                border: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <strong>
                  {new Date(slot.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </strong>
                <div style={{ marginTop: '4px' }}>
                  <span style={{ color: '#1e293b', fontWeight: '500' }}>
                    Patient: {slot.patients ? `${slot.patients.first_name} ${slot.patients.last_name}` : 'Assigned Patient'}
                  </span>
                </div>
                <small style={{ color: '#64748b', fontFamily: 'monospace' }}>
                  Patient ID: {slot.patient_id}
                </small>
              </div>

              <span style={{ 
                padding: '4px 10px', 
                borderRadius: '6px', 
                fontWeight: 'bold', 
                fontSize: '0.85em',
                background: slot.status?.toLowerCase() === 'cancelled' ? '#fee2e2' : '#e0f2fe',
                color: slot.status?.toLowerCase() === 'cancelled' ? '#991b1b' : '#0369a1'
              }}>
                {slot.status ? slot.status.charAt(0).toUpperCase() + slot.status.slice(1) : 'Booked'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}