// src/components/appointments/RescheduleModal.jsx
// FR12 - Receptionist reschedules an appointment

import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

export default function RescheduleModal({ appointment, onClose, onSaved }) {
  const [practitioners, setPractitioners] = useState([]);
  const [practitionerId, setPractitionerId] = useState(
    appointment.practitioners?.id || appointment.practitioner_id || ''
  );
  const [date, setDate] = useState(appointment.appointment_date || '');
  const [time, setTime] = useState(() => String(appointment.appointment_time || '').slice(0, 5));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPractitioners();
  }, []);

  async function loadPractitioners() {
    const { data, error } = await supabase
      .from('practitioners')
      .select('id, full_name, specialty')
      .eq('is_active', true);

    if (error) {
      console.error('Error loading practitioners:', error);
    } else {
      setPractitioners(data || []);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!date || !time) {
      setError('Please choose both a new date and a new time.');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    if (date < today) {
      setError('Please choose a date in the future.');
      return;
    }

    setSaving(true);

    const { error: updateError } = await supabase
      .from('appointments')
      .update({
        appointment_date: date,
        appointment_time: time + ':00',
        practitioner_id: practitionerId,
        status: 'rescheduled',
        updated_at: new Date().toISOString()
      })
      .eq('id', appointment.id);

    if (updateError) {
      console.error('Error rescheduling:', updateError);
      if (updateError.code === '23505') {
        setError('That practitioner already has an appointment at this date and time.');
      } else {
        setError('Failed to reschedule. ' + updateError.message);
      }
      setSaving(false);
      return;
    }

    setSaving(false);
    onSaved();
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff', padding: '24px', borderRadius: '8px',
          maxWidth: '480px', width: '90%', boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
        }}
      >
        <h3 style={{ marginTop: 0, color: '#5A4A63' }}>Reschedule Appointment</h3>

        <p style={{ color: '#6B6B6B', marginTop: 0 }}>
          {appointment.patients?.first_name} {appointment.patients?.last_name}
          {appointment.patients?.patient_number ? ` (${appointment.patients.patient_number})` : ''}
        </p>

        {error && (
          <p style={{
            color: '#991B1B', background: '#FEE2E2',
            padding: '8px 12px', borderRadius: '4px', fontSize: '0.9em'
          }}>
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', marginBottom: '12px' }}>
            <span style={{ display: 'block', fontSize: '0.85em', color: '#475569', marginBottom: '4px' }}>Practitioner</span>
            <select value={practitionerId} onChange={(e) => setPractitionerId(e.target.value)} required style={inputStyle}>
              <option value="">Select practitioner...</option>
              {practitioners.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name} - {p.specialty || 'Practitioner'}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: 'block', marginBottom: '12px' }}>
            <span style={{ display: 'block', fontSize: '0.85em', color: '#475569', marginBottom: '4px' }}>New Date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              min={new Date().toISOString().split('T')[0]}
              style={inputStyle}
            />
          </label>

          <label style={{ display: 'block', marginBottom: '12px' }}>
            <span style={{ display: 'block', fontSize: '0.85em', color: '#475569', marginBottom: '4px' }}>New Time</span>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required style={inputStyle} />
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
            <button
              type="button" onClick={onClose} disabled={saving}
              style={{ padding: '8px 16px', background: '#64748b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit" disabled={saving}
              style={{ padding: '8px 16px', background: saving ? '#94a3b8' : '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: saving ? 'not-allowed' : 'pointer' }}
            >
              {saving ? 'Saving...' : 'Save Reschedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputStyle = {
  display: 'block', width: '100%', padding: '8px',
  borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box'
};