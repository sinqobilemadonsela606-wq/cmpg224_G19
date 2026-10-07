import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

export default function AppointmentList() {
  const [appointments, setAppointments] = useState([]);
  const [practitioners, setPractitioners] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Reschedule & Cancel state management
  const [reschedulingId, setReschedulingId] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newPractitionerId, setNewPractitionerId] = useState('');

  const [cancellingId, setCancellingId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  // Fetch appointments and practitioners from Supabase
  const fetchData = async () => {
    setLoading(true);
    
    // Fetch practitioners
    const { data: pracData, error: pracError } = await supabase
      .from('practitioners')
      .select('id, full_name, specialty')
      .eq('is_active', true);
    
    if (pracError) console.error('Error fetching practitioners:', pracError);
    setPractitioners(pracData || []);

    // Fetch appointments with patient details and joined practitioner details
    const { data, error } = await supabase
      .from('appointments')
      .select('*, patients(first_name, last_name, email, phone), practitioners(id, full_name, specialty)')
      .order('appointment_date', { ascending: true });

    if (error) {
      console.error('Error fetching appointments:', error);
      alert('Failed to load appointments: ' + error.message);
    } else {
      setAppointments(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Reschedule with Double-Booking Prevention & Practitioner Selection
  const handleReschedule = async (appointmentRecord) => {
    const recordId = appointmentRecord.id;

    if (!newDate || !newTime || !newPractitionerId) {
      alert('Please select a date, time, and practitioner.');
      return;
    }

    // 1. Check if practitioner is already booked at this slot (using 'id' only)
    const { data: existingBookings, error: checkError } = await supabase
      .from('appointments')
      .select('*')
      .eq('appointment_date', newDate)
      .eq('appointment_time', newTime)
      .eq('practitioner_id', newPractitionerId)
      .neq('id', recordId);

    if (checkError) {
      console.error('Error checking availability:', checkError);
      alert('Could not verify practitioner availability: ' + checkError.message);
      return;
    }

    const activeConflicts = existingBookings?.filter(app => app.status !== 'Cancelled' && app.status !== 'cancelled') || [];
    if (activeConflicts.length > 0) {
      alert('⚠️ Double Booking Prevention: Selected practitioner is already booked at this time slot.');
      return;
    }

    // 2. Update appointment date, time, and practitioner (preserving constraint-compliant status)
    const updatePayload = { 
      appointment_date: newDate, 
      appointment_time: newTime, 
      practitioner_id: newPractitionerId
    };

    const { error: updateError } = await supabase
      .from('appointments')
      .update(updatePayload)
      .eq('id', recordId);

    if (updateError) {
      console.error('Error updating appointment:', updateError);
      alert('Failed to update appointment: ' + updateError.message);
    } else {
      alert('Appointment successfully updated / rescheduled!');
      setReschedulingId(null);
      setNewDate('');
      setNewTime('');
      setNewPractitionerId('');
      fetchData();
    }
  };

  // Handle Cancellation with Reason
  const handleCancel = async (appointmentRecord) => {
    const recordId = appointmentRecord.id;

    if (!cancelReason.trim()) {
      alert('Please provide a reason for cancellation.');
      return;
    }

    const cancelPayload = { status: 'Cancelled', cancellation_reason: cancelReason };
    const { error: cancelError } = await supabase
      .from('appointments')
      .update(cancelPayload)
      .eq('id', recordId);

    if (cancelError) {
      console.error('Error cancelling appointment:', cancelError);
      alert('Failed to cancel appointment: ' + cancelError.message);
    } else {
      alert('Appointment cancelled successfully.');
      setCancellingId(null);
      setCancelReason('');
      fetchData();
    }
  };

  return (
    <div>
      <h2>Manage Appointments</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>View scheduled appointments, check practitioner assignments, and reschedule with double-booking prevention.</p>

      {loading ? (
        <p>Loading appointments...</p>
      ) : appointments.length === 0 ? (
        <p style={{ color: '#666' }}>No appointments found in the system.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {appointments.map((app) => {
            const recordId = app.id;
            const isCancelled = app.status === 'Cancelled' || app.status === 'cancelled';
            const patientName = app.patients ? `${app.patients.first_name} ${app.patients.last_name}` : 'Unknown Patient';
            const practitionerName = app.practitioners ? `${app.practitioners.full_name} (${app.practitioners.specialty})` : null;
            const isUnassigned = !app.practitioner_id || !practitionerName;

            return (
              <li 
                key={recordId} 
                style={{ 
                  background: isCancelled ? '#f8fafc' : '#fff', 
                  opacity: isCancelled ? 0.7 : 1,
                  padding: '16px', 
                  marginBottom: '12px', 
                  borderRadius: '8px', 
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <strong style={{ fontSize: '1.1em' }}>{patientName}</strong>
                    <br />
                    <span style={{ color: '#2563eb', fontWeight: 'bold' }}>
                      📅 {app.appointment_date} at ⏰ {app.appointment_time || 'N/A'}
                    </span>
                    <br />
                    <span style={{ color: isUnassigned ? '#dc2626' : '#059669', fontSize: '0.95em', fontWeight: '500' }}>
                      🩺 Practitioner: {isUnassigned ? '⚠️ Not Assigned' : practitionerName}
                    </span>
                    <br />
                    <small style={{ color: '#666' }}>
                      Email: {app.patients?.email || 'N/A'} | Phone: {app.patients?.phone || 'N/A'}
                    </small>
                  </div>

                  <div>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: '4px', 
                      fontSize: '0.85em', 
                      fontWeight: 'bold',
                      background: isCancelled ? '#fee2e2' : '#e0f2fe',
                      color: isCancelled ? '#991b1b' : '#0369a1'
                    }}>
                      {app.status || 'Confirmed'}
                    </span>
                  </div>
                </div>

                {isCancelled && app.cancellation_reason && (
                  <div style={{ marginTop: '10px', padding: '8px', background: '#fee2e2', borderRadius: '4px', color: '#991b1b', fontSize: '0.9em' }}>
                    <strong>Cancellation Reason:</strong> {app.cancellation_reason}
                  </div>
                )}

                {!isCancelled && (
                  <div style={{ marginTop: '15px', display: 'flex', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                    <button 
                      onClick={() => { 
                        setReschedulingId(recordId); 
                        setNewDate(app.appointment_date || ''); 
                        setNewTime(app.appointment_time || ''); 
                        setNewPractitionerId(app.practitioner_id || '');
                        setCancellingId(null); 
                      }}
                      style={{ padding: '6px 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9em' }}
                    >
                      {isUnassigned ? 'Assign Practitioner & Reschedule' : 'Reschedule / Check Slot'}
                    </button>
                    <button 
                      onClick={() => { setCancellingId(recordId); setReschedulingId(null); }}
                      style={{ padding: '6px 12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9em' }}
                    >
                      Cancel Appointment
                    </button>
                  </div>
                )}

                {reschedulingId === recordId && (
                  <div style={{ marginTop: '12px', padding: '12px', background: '#f1f5f9', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    <h4>{isUnassigned ? 'Assign Practitioner & Update Details' : 'Reschedule & Verify Availability'}</h4>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8em', marginBottom: '4px' }}>Date:</label>
                        <input 
                          type="date" 
                          value={newDate} 
                          onChange={(e) => setNewDate(e.target.value)}
                          style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8em', marginBottom: '4px' }}>Time:</label>
                        <input 
                          type="time" 
                          value={newTime} 
                          onChange={(e) => setNewTime(e.target.value)}
                          style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8em', marginBottom: '4px' }}>Practitioner:</label>
                        <select
                          value={newPractitionerId}
                          onChange={(e) => setNewPractitionerId(e.target.value)}
                          style={{ padding: '7px', borderRadius: '4px', border: '1px solid #ccc', background: '#fff', minWidth: '200px' }}
                        >
                          <option value="">-- Select Practitioner --</option>
                          {practitioners.map((doc) => (
                            <option key={doc.id} value={doc.id}>
                              {doc.full_name} — {doc.specialty}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => handleReschedule(app)}
                        style={{ padding: '6px 12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Verify & Save Changes
                      </button>
                      <button 
                        onClick={() => setReschedulingId(null)}
                        style={{ padding: '6px 12px', background: '#64748b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}

                {cancellingId === recordId && (
                  <div style={{ marginTop: '12px', padding: '12px', background: '#fef2f2', borderRadius: '6px', border: '1px solid #fecaca' }}>
                    <h4>Cancel Appointment</h4>
                    <div style={{ marginBottom: '10px' }}>
                      <textarea 
                        placeholder="Enter reason for cancellation..."
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '60px' }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => handleCancel(app)}
                        style={{ padding: '6px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Confirm Cancellation
                      </button>
                      <button 
                        onClick={() => setCancellingId(null)}
                        style={{ padding: '6px 12px', background: '#64748b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}