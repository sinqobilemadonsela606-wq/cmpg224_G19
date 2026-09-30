import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

export default function AppointmentList() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // States for handling actions
  const [reschedulingId, setReschedulingId] = useState(null);
  const [newDate, setNewDate] = useState('');
  
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  // Fetch all appointments from Supabase on load
  const fetchAppointments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('appointment_date', { ascending: true });

    if (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to load appointments.');
    } else {
      setAppointments(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Handle Reschedule
  const handleReschedule = async (id) => {
    if (!newDate) {
      alert('Please select a new date and time.');
      return;
    }

    const { error } = await supabase
      .from('appointments')
      .update({ appointment_date: newDate })
      .eq('id', id);

    if (error) {
      console.error('Error rescheduling:', error);
      alert('Failed to reschedule appointment.');
    } else {
      alert('Appointment rescheduled successfully!');
      setReschedulingId(null);
      setNewDate('');
      fetchAppointments();
    }
  };

  // Handle Cancel with Reason
  const handleCancel = async (id) => {
    if (!cancelReason.trim()) {
      alert('A cancellation reason is required.');
      return;
    }

    const { error } = await supabase
      .from('appointments')
      .update({ 
        status: 'cancelled', 
        cancellation_reason: cancelReason 
      })
      .eq('id', id);

    if (error) {
      console.error('Error cancelling appointment:', error);
      alert('Failed to cancel appointment.');
    } else {
      alert('Appointment cancelled successfully.');
      setCancellingId(null);
      setCancelReason('');
      fetchAppointments();
    }
  };

  if (loading) return <p>Loading appointments...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ padding: '20px', background: '#f9f9f9', borderRadius: '8px', border: '1px solid #ddd' }}>
      <h2>Appointment Management</h2>
      
      {appointments.length === 0 ? (
        <p>No appointments found in the system.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {appointments.map((appt) => (
            <li 
              key={appt.id} 
              style={{
                background: '#fff', 
                marginBottom: '15px', 
                padding: '15px', 
                borderRadius: '6px', 
                border: '1px solid #ccc' 
              }}
            >
              <p>
                <strong>Patient ID:</strong>{' '}
                <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                  {appt.patient_id}
                </code>
              </p>
              <p><strong>Date & Time:</strong> {new Date(appt.appointment_date).toLocaleString()}</p>
              <p>
                <strong>Status:</strong>{' '}
                <span style={{ color: appt.status?.toLowerCase() === 'cancelled' ? 'red' : 'green', fontWeight: 'bold' }}>
                  {appt.status ? appt.status.charAt(0).toUpperCase() + appt.status.slice(1) : 'Scheduled'}
                </span>
              </p>
              
              {appt.cancellation_reason && (
                <p style={{ color: '#666' }}><strong>Reason for Cancellation:</strong> {appt.cancellation_reason}</p>
              )}

              {/* Action Buttons (Hidden if cancelled) */}
              {appt.status?.toLowerCase() !== 'cancelled' && (
                <div style={{ marginTop: '10px' }}>
                  {/* Reschedule Section */}
                  {reschedulingId === appt.id ? (
                    <div style={{ margin: '10px 0', padding: '10px', background: '#eee', borderRadius: '4px' }}>
                      <input 
                        type="datetime-local" 
                        value={newDate} 
                        onChange={(e) => setNewDate(e.target.value)}
                        style={{ marginRight: '10px', padding: '5px' }}
                      />
                      <button 
                        onClick={() => handleReschedule(appt.id)}
                        style={{ background: '#28a745', color: '#fff', border: 'none', padding: '6px 12px', marginRight: '5px', cursor: 'pointer' }}
                      >
                        Save
                      </button>
                      <button 
                        onClick={() => setReschedulingId(null)}
                        style={{ background: '#6c757d', color: '#fff', border: 'none', padding: '6px 12px', cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setReschedulingId(appt.id)}
                      style={{ background: '#007bff', color: '#fff', border: 'none', padding: '6px 12px', marginRight: '10px', cursor: 'pointer', borderRadius: '4px' }}
                    >
                      Reschedule
                    </button>
                  )}

                  {/* Cancel Section */}
                  {cancellingId === appt.id ? (
                    <div style={{ margin: '10px 0', padding: '10px', background: '#ffebee', borderRadius: '4px' }}>
                      <input 
                        type="text" 
                        placeholder="Enter reason for cancellation..." 
                        value={cancelReason} 
                        onChange={(e) => setCancelReason(e.target.value)}
                        style={{ width: '100%', marginBottom: '8px', padding: '5px' }}
                      />
                      <button 
                        onClick={() => handleCancel(appt.id)}
                        style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '6px 12px', marginRight: '5px', cursor: 'pointer' }}
                      >
                        Confirm Cancellation
                      </button>
                      <button 
                        onClick={() => setCancellingId(null)}
                        style={{ background: '#6c757d', color: '#fff', border: 'none', padding: '6px 12px', cursor: 'pointer' }}
                      >
                        Back
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setCancellingId(appt.id)}
                      style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '6px 12px', cursor: 'pointer', borderRadius: '4px' }}
                    >
                      Cancel Appointment
                    </button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}