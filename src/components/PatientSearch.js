// src/components/PatientSearch.jsx
// FR07 - Search patients by ID, name, or date range
//
// Searches by: first name, last name, patient_number (PAT-XXXX), or SA ID number
// Optional date range filter on registration date (created_at)
// Only shows active patients (is_active = true)
// Click a result → modal with full details + appointment counts

import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function PatientSearch() {
  // ---------- STATE ----------
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search inputs
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Modal state
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [apptCounts, setApptCounts] = useState(null);
  const [loadingCounts, setLoadingCounts] = useState(false);

  // ---------- LOAD ACTIVE PATIENTS ON MOUNT ----------
  useEffect(() => {
    fetchPatients();
  }, []);

  async function fetchPatients() {
    setLoading(true);
    setError('');

    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('is_active', true)
      .order('patient_number', { ascending: true });

    if (error) {
      console.error('Error fetching patients:', error);
      setError('Failed to load patients.');
    } else {
      setPatients(data || []);
    }
    setLoading(false);
  }

  // ---------- FILTER LOCALLY ----------
  const filteredPatients = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return patients.filter((p) => {
      // 1. Text search — name, patient_number, SA ID
      const matchesText =
        term === '' ||
        (p.first_name || '').toLowerCase().includes(term) ||
        (p.last_name || '').toLowerCase().includes(term) ||
        (p.patient_number || '').toLowerCase().includes(term) ||
        (p.id_number || '').toLowerCase().includes(term);

      if (!matchesText) return false;

      // 2. Date range filter (registration date = created_at)
      if (dateFrom) {
        const created = new Date(p.created_at).setHours(0, 0, 0, 0);
        const from = new Date(dateFrom).setHours(0, 0, 0, 0);
        if (created < from) return false;
      }
      if (dateTo) {
        const created = new Date(p.created_at).setHours(0, 0, 0, 0);
        const to = new Date(dateTo).setHours(23, 59, 59, 999);
        if (created > to) return false;
      }

      return true;
    });
  }, [patients, searchTerm, dateFrom, dateTo]);

  // ---------- OPEN MODAL & LOAD APPOINTMENT COUNTS ----------
  async function openPatient(patient) {
    setSelectedPatient(patient);
    setApptCounts(null);
    setLoadingCounts(true);

    const { data, error } = await supabase
      .from('appointments')
      .select('status')
      .eq('patient_id', patient.id);

    if (error) {
      console.error('Error loading appointment counts:', error);
      setApptCounts({ scheduled: 0, completed: 0, cancelled: 0, rescheduled: 0, total: 0 });
    } else {
      const counts = { scheduled: 0, completed: 0, cancelled: 0, rescheduled: 0, total: data.length };
      data.forEach((a) => {
        const s = (a.status || 'scheduled').toLowerCase();
        if (counts[s] !== undefined) counts[s]++;
      });
      setApptCounts(counts);
    }
    setLoadingCounts(false);
  }

  // ---------- RENDER ----------
  return (
    <div style={{ padding: '20px', background: '#f9f9f9', borderRadius: '8px', border: '1px solid #ddd' }}>
      <h2>Patient Search</h2>

      {/* --- SEARCH INPUTS --- */}
      <div style={{ marginBottom: '15px' }}>
        <input
          type="text"
          placeholder="Search by name, patient number (PAT-XXXX), or SA ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            fontSize: '16px',
            marginBottom: '10px',
            boxSizing: 'border-box'
          }}
        />

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontSize: '0.9em', color: '#555' }}>
            Registered from:
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              style={{ marginLeft: '6px', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </label>

          <label style={{ fontSize: '0.9em', color: '#555' }}>
            to:
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              style={{ marginLeft: '6px', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </label>

          {(searchTerm || dateFrom || dateTo) && (
            <button
              onClick={() => { setSearchTerm(''); setDateFrom(''); setDateTo(''); }}
              style={{ padding: '6px 12px', background: '#64748b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* --- STATUS --- */}
      {loading && <p>Loading patients...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && filteredPatients.length === 0 && (
        <p style={{ color: '#888' }}>No matching patients found.</p>
      )}

      {/* --- RESULTS LIST --- */}
      {!loading && !error && filteredPatients.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, background: '#fff', borderRadius: '6px', border: '1px solid #ddd', margin: 0 }}>
          {filteredPatients.map((p) => (
            <li
              key={p.id}
              onClick={() => openPatient(p)}
              style={{
                padding: '12px',
                borderBottom: '1px solid #eee',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
            >
              <div>
                <strong>{p.first_name} {p.last_name}</strong>
                <br />
                <small style={{ color: '#666' }}>
                  {p.phone || 'No phone'} · {p.id_number || 'No SA ID'}
                </small>
              </div>
              <span style={{
                background: '#e2e8f0',
                color: '#334155',
                padding: '4px 8px',
                borderRadius: '6px',
                fontWeight: 'bold',
                fontSize: '0.85em'
              }}>
                {p.patient_number || '—'}
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* --- PATIENT DETAIL MODAL --- */}
      {selectedPatient && (
        <div
          onClick={() => setSelectedPatient(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff', padding: '24px', borderRadius: '8px',
              maxWidth: '520px', width: '90%', maxHeight: '85vh', overflowY: 'auto',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0 }}>Patient Profile</h3>
              <button
                onClick={() => setSelectedPatient(null)}
                style={{ background: '#64748b', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <Row label="Patient Number" value={selectedPatient.patient_number} />
                <Row label="Full Name" value={`${selectedPatient.first_name} ${selectedPatient.last_name}`} />
                <Row label="SA ID Number" value={selectedPatient.id_number} />
                <Row label="Date of Birth" value={selectedPatient.date_of_birth} />
                <Row label="Phone" value={selectedPatient.phone} />
                <Row label="Email" value={selectedPatient.email} />
                <Row label="Address" value={selectedPatient.address} />
                <Row
                  label="Registered"
                  value={selectedPatient.created_at ? new Date(selectedPatient.created_at).toLocaleDateString() : null}
                />
              </tbody>
            </table>

            {/* Appointment summary */}
            <h4 style={{ marginTop: '18px', marginBottom: '8px' }}>Appointments</h4>
            {loadingCounts && <p style={{ color: '#666' }}>Loading...</p>}
            {apptCounts && (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <Badge label="Total" value={apptCounts.total} color="#334155" />
                <Badge label="Scheduled" value={apptCounts.scheduled} color="#1e40af" />
                <Badge label="Completed" value={apptCounts.completed} color="#166534" />
                <Badge label="Cancelled" value={apptCounts.cancelled} color="#991b1b" />
                <Badge label="Rescheduled" value={apptCounts.rescheduled} color="#92400e" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Small helper components ----------
function Row({ label, value }) {
  return (
    <tr>
      <td style={{ padding: '6px 8px', color: '#64748b', width: '40%', verticalAlign: 'top' }}>
        <strong>{label}</strong>
      </td>
      <td style={{ padding: '6px 8px' }}>{value || '—'}</td>
    </tr>
  );
}

function Badge({ label, value, color }) {
  return (
    <span style={{
      background: color, color: '#fff', padding: '4px 10px',
      borderRadius: '12px', fontSize: '0.85em', fontWeight: 'bold'
    }}>
      {label}: {value}
    </span>
  );
}