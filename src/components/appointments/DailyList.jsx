import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

export default function DailyList() {
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const fetchDailyAppointments = async (date) => {
    setLoading(true);
    // Adjust column name ('appointment_date' or 'date') depending on your database schema
    const { data, error } = await supabase
      .from('appointments')
      .select('*, patients(first_name, last_name, email)')
      .eq('appointment_date', date);

    if (error) {
      console.error('Error fetching daily appointments:', error);
    } else {
      setAppointments(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (selectedDate) {
      fetchDailyAppointments(selectedDate);
    }
  }, [selectedDate]);

  // CSV Export Utility function inline or imported
  const exportToCSV = () => {
    if (appointments.length === 0) {
      alert('No appointments to export for this date.');
      return;
    }

    const headers = ['Appointment ID', 'Patient Name', 'Date', 'Time', 'Status'];
    const rows = appointments.map(app => [
      app.id || app.appointment_id,
      app.patients ? `${app.patients.first_name} ${app.patients.last_name}` : 'Unknown',
      app.appointment_date,
      app.appointment_time || app.time || 'N/A',
      app.status || 'Scheduled'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `appointments_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
      <h2>Daily Appointment Schedule</h2>
      
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'center' }}>
        <label>
          <strong>Select Date: </strong>
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
          />
        </label>

        <button 
          onClick={exportToCSV}
          style={{ padding: '8px 14px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Export CSV
        </button>
      </div>

      {loading ? (
        <p>Loading schedule...</p>
      ) : appointments.length === 0 ? (
        <p style={{ color: '#666' }}>No appointments scheduled for {selectedDate}.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {appointments.map((app) => (
            <li 
              key={app.id || app.appointment_id}
              style={{ background: '#fff', padding: '12px', marginBottom: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between' }}
            >
              <div>
                <strong>Time: {app.appointment_time || app.time}</strong>
                <br />
                <span>Patient: {app.patients ? `${app.patients.first_name} ${app.patients.last_name}` : 'N/A'}</span>
              </div>
              <code style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85em', alignSelf: 'center' }}>
                ID: {app.id || app.appointment_id}
              </code>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}