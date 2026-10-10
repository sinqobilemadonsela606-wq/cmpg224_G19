// src/components/appointments/CancelModal.jsx
// FR12 - Receptionist cancels an appointment with a required reason

import { useState } from 'react';
import { supabase } from '../../supabaseClient';

export default function CancelModal({ appointment, onClose, onSaved }) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!reason.trim()) {
      setError('A cancellation reason is required.');
      return;
    }

    setSaving(true);

    const { error: updateError } = await supabase
      .from('appointments')
      .update({
        status: 'cancelled',
        cancellation_reason: reason.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', appointment.id);

    if (updateError) {
      console.error('Error cancelling:', updateError);
      setError('Failed to cancel. ' + updateError.message);
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
        <h3 style={{ marginTop: 0, color: '#991B1B' }}>Cancel Appointment</h3>

        <p style={{ color: '#6B6B6B', marginTop: 0 }}>
          {appointment.patients?.first_name} {appointment.patients?.last_name}
          {appointment.patients?.patient_number ? ` (${appointment.patients.patient_number})` : ''}
        </p>

        <p style={{ color: '#6B6B6B', fontSize: '0.9em', marginTop: 0 }}>
          {appointment.appointment_date} at {String(appointment.appointment_time || '').slice(0, 5)}
          {appointment.practitioners?.full_name ? ` with ${appointment.practitioners.full_name}` : ''}
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
            <span style={{ display: 'block', fontSize: '0.85em', color: '#475569', marginBottom: '4px' }}>
              Reason for cancellation
            </span>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              required
              placeholder="e.g. Patient requested, practitioner unavailable, patient no-show..."
              style={{
                display: 'block', width: '100%', padding: '8px',
                borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box',
                fontFamily: 'inherit'
              }}
            />
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
            <button
              type="button" onClick={onClose} disabled={saving}
              style={{ padding: '8px 16px', background: '#64748b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Back
            </button>
            <button
              type="submit" disabled={saving || !reason.trim()}
              style={{
                padding: '8px 16px',
                background: saving || !reason.trim() ? '#f87171' : '#dc2626',
                color: '#fff', border: 'none', borderRadius: '4px',
                cursor: saving ? 'not-allowed' : 'pointer'
              }}
            >
              {saving ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}