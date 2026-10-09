// src/components/admin/PatientManagement.jsx
// FR08 - Admin soft-deletes patient records
// FR06 - (hook for later) Admin updates patient records
// Shows all patients with a filter: Active | Deleted | All
// Click Delete >> confirmation modal with reason >> sets is_active=false

import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import EditPatientModal from './EditPatientModal';

export default function PatientManagement() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('active'); // 'active' | 'deleted' | 'all'
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  async function fetchPatients() {
    setLoading(true);
    setError('');

    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('patient_number', { ascending: true });

    if (error) {
      console.error('Error fetching patients:', error);
      setError('Failed to load patients.');
    } else {
      setPatients(data || []);
    }
    setLoading(false);
  }

  // Filter in memory based on selection
  const visiblePatients = patients.filter((p) => {
    if (filter === 'active') return p.is_active !== false;
    if (filter === 'deleted') return p.is_active === false;
    return true; // all
  });

  async function handleDelete(reason) {
    if (!deleteTarget) return;
    setDeleting(true);

    const { data: session } = await supabase.auth.getSession();
    const adminId = session?.session?.user?.id ?? null;

    const { error } = await supabase
      .from('patients')
      .update({
        is_active: false,
        deleted_at: new Date().toISOString(),
        deleted_reason: reason,
        deleted_by: adminId
      })
      .eq('id', deleteTarget.id);

    if (error) {
      console.error('Error deleting patient:', error);
      alert('Failed to delete patient: ' + error.message);
    } else {
      setDeleteTarget(null);
      await fetchPatients();
    }
    setDeleting(false);
  }

  async function handleRestore(patient) {
    const confirmed = window.confirm(
      `Restore ${patient.first_name} ${patient.last_name} (${patient.patient_number})?`
    );
    if (!confirmed) return;

    const { error } = await supabase
      .from('patients')
      .update({
        is_active: true,
        deleted_at: null,
        deleted_reason: null,
        deleted_by: null
      })
      .eq('id', patient.id);

    if (error) {
      console.error('Error restoring patient:', error);
      alert('Failed to restore patient: ' + error.message);
    } else {
      await fetchPatients();
    }
  }

  return (
    <div style={{ padding: '20px', background: '#f9f9f9', borderRadius: '8px', border: '1px solid #ddd' }}>
      <h2>Patient Management</h2>

      {/* Filter buttons */}
      <div style={{ marginBottom: '15px', display: 'flex', gap: '8px' }}>
        {['active', 'deleted', 'all'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 14px',
              borderRadius: '4px',
              border: '1px solid #cbd5e1',
              background: filter === f ? '#334155' : '#fff',
              color: filter === f ? '#fff' : '#334155',
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {loading && <p>Loading patients...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && visiblePatients.length === 0 && (
        <p style={{ color: '#888' }}>No patients to display for this filter.</p>
      )}

      {!loading && !error && visiblePatients.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '6px', overflow: 'hidden' }}>
          <thead>
            <tr style={{ background: '#e2e8f0', textAlign: 'left' }}>
              <th style={{ padding: '10px' }}>Patient No.</th>
              <th style={{ padding: '10px' }}>Name</th>
              <th style={{ padding: '10px' }}>SA ID</th>
              <th style={{ padding: '10px' }}>Phone</th>
              <th style={{ padding: '10px' }}>Status</th>
              <th style={{ padding: '10px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visiblePatients.map((p) => (
              <tr key={p.id} style={{ borderTop: '1px solid #eee' }}>
                <td style={{ padding: '10px' }}><strong>{p.patient_number}</strong></td>
                <td style={{ padding: '10px' }}>{p.first_name} {p.last_name}</td>
                <td style={{ padding: '10px' }}>{p.id_number || '—'}</td>
                <td style={{ padding: '10px' }}>{p.phone || '—'}</td>
                <td style={{ padding: '10px' }}>
                  {p.is_active === false ? (
                    <span style={{ color: '#991b1b', fontWeight: 'bold' }}>Deleted</span>
                  ) : (
                    <span style={{ color: '#166534', fontWeight: 'bold' }}>Active</span>
                  )}
                </td>
                <td style={{ padding: '10px' }}>
                    {p.is_active === false ? (
  <button
    onClick={() => handleRestore(p)}
    style={{ padding: '6px 12px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
  >
    Restore
  </button>
) : (
  <div style={{ display: 'flex', gap: '6px' }}>
    <button
      onClick={() => setEditTarget(p)}
      style={{ padding: '6px 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
    >
      Edit
    </button>
    <button
      onClick={() => setDeleteTarget(p)}
      style={{ padding: '6px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
    >
      Delete
    </button>
  </div>
)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          patient={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          submitting={deleting}
        />
      )} 

      {editTarget && (
  <EditPatientModal
    patient={editTarget}
    onClose={() => setEditTarget(null)}
    onSaved={async () => {
      setEditTarget(null);
      await fetchPatients();
    }}
  />
)}
    </div>
  );
}