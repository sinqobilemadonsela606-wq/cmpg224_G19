// src/components/appointments/AppointmentList.jsx
// FR12 - Receptionist views, reschedules, and cancels appointments

import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import RescheduleModal from './RescheduleModal';
import CancelModal from './CancelModal';

export default function AppointmentList() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  async function fetchAppointments() {
    setLoading(true);
    setError('');

    const { data, error } = await supabase
      .from('appointments')
      .select(`
        id,
        appointment_date,
        appointment_time,
        reason,
        status,
        cancellation_reason,
        created_at,
        patients ( id, first_name, last_name, patient_number, phone ),
        practitioners ( id, full_name, specialty )
      `)
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true });

    if (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to load appointments.');
    } else {
      setAppointments(data || []);
    }
    setLoading(false);
  }

  const visibleAppointments = appointments.filter((a) => {
    if (filter === 'all') return true;
    return (a.status || 'scheduled').toLowerCase() === filter;
  });

  return (
    <div style={{ padding: '20px', background: '#fff', borderRadius: '8px', border: '1px solid #DDD8E0' }}>
      <h2 style={{ marginTop: 0 }}>Appointment Management</h2>

      <div style={{ marginBottom: '15px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {['all', 'scheduled', 'completed', 'cancelled', 'rescheduled'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 14px',
              borderRadius: '4px',
              border: '1px solid #DDD8E0',
              background: filter === f ? '#6B5876' : '#fff',
              color: filter === f ? '#fff' : '#6B5876',
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {loading && <p>Loading appointments...</p>}
      {error && <p style={{ color: '#991B1B' }}>{error}</p>}

      {!loading && !error && visibleAppointments.length === 0 && (
        <p style={{ color: '#6B6B6B' }}>No appointments to display for this filter.</p>
      )}

      {!loading && !error && visibleAppointments.map((appt) => (
        <AppointmentCard
          key={appt.id}
          appointment={appt}
          onReschedule={() => setRescheduleTarget(appt)}
          onCancel={() => setCancelTarget(appt)}
        />
      ))}

      {rescheduleTarget && (
        <RescheduleModal
          appointment={rescheduleTarget}
          onClose={() => setRescheduleTarget(null)}
          onSaved={async () => {
            setRescheduleTarget(null);
            await fetchAppointments();
          }}
        />
      )}

      {cancelTarget && (
        <CancelModal
          appointment={cancelTarget}
          onClose={() => setCancelTarget(null)}
          onSaved={async () => {
            setCancelTarget(null);
            await fetchAppointments();
          }}
        />
      )}
    </div>
  );
}

function AppointmentCard({ appointment, onReschedule, onCancel }) {
  const { patients: patient, practitioners: practitioner } = appointment;
  const status = (appointment.status || 'scheduled').toLowerCase();
  const isCancelled = status === 'cancelled';

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #DDD8E0',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '12px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: '16px',
      flexWrap: 'wrap'
    }}>
      <div style={{ flex: '1 1 320px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <strong style={{ fontSize: '1.05em' }}>
            {patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown patient'}
          </strong>
          <span style={{
            background: '#E8E4EC', color: '#5A4A63',
            padding: '2px 8px', borderRadius: '12px', fontSize: '0.8em', fontWeight: 'bold'
          }}>
            {patient?.patient_number || '-'}
          </span>
        </div>

        <div style={{ color: '#6B6B6B', fontSize: '0.9em', marginBottom: '4px' }}>
          {practitioner ? `${practitioner.full_name} - ${practitioner.specialty || 'Practitioner'}` : 'Unassigned practitioner'}
        </div>

        <div style={{ color: '#2B2B2B', fontSize: '0.95em' }}>
          {appointment.appointment_date} at {formatTime(appointment.appointment_time)}
        </div>

        {appointment.reason && (
          <div style={{ color: '#6B6B6B', fontSize: '0.9em', marginTop: '4px' }}>
            Reason: {appointment.reason}
          </div>
        )}

        {appointment.cancellation_reason && (
          <div style={{ color: '#991B1B', fontSize: '0.9em', marginTop: '4px' }}>
            Cancelled: {appointment.cancellation_reason}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
        <span style={{
          background: statusColor(status).bg,
          color: statusColor(status).fg,
          padding: '3px 10px',
          borderRadius: '12px',
          fontSize: '0.8em',
          fontWeight: 'bold',
          textTransform: 'capitalize'
        }}>
          {status}
        </span>

        {!isCancelled && (
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={onReschedule}
              style={{
                padding: '6px 12px', background: '#2563eb', color: '#fff',
                border: 'none', borderRadius: '4px', cursor: 'pointer'
              }}
            >
              Reschedule
            </button>
            <button
              onClick={onCancel}
              style={{
                padding: '6px 12px', background: '#dc2626', color: '#fff',
                border: 'none', borderRadius: '4px', cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function statusColor(status) {
  if (status === 'completed') return { bg: '#DCFCE7', fg: '#166534' };
  if (status === 'cancelled') return { bg: '#FEE2E2', fg: '#991B1B' };
  if (status === 'rescheduled') return { bg: '#FEF3C7', fg: '#92400E' };
  return { bg: '#DBEAFE', fg: '#1E40AF' };
}

function formatTime(time) {
  if (!time) return '-';
  return String(time).slice(0, 5);
}