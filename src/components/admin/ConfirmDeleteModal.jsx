// src/components/admin/ConfirmDeleteModal.jsx
// FR08 - Confirm soft-delete of a patient with reason

import { useState } from 'react';

export default function ConfirmDeleteModal({ patient, onClose, onConfirm, submitting }) {
  const [reason, setReason] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!reason.trim()) return;
    onConfirm(reason.trim());
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
        <h3 style={{ marginTop: 0 }}>Delete Patient</h3>

        <p style={{ color: '#555' }}>
          Are you sure you want to delete{' '}
          <strong>{patient.first_name} {patient.last_name}</strong>
          {' '}({patient.patient_number})?
        </p>

        <p style={{ color: '#991b1b', fontSize: '0.9em' }}>
          This will remove them from all lists. Their appointment history is preserved.
        </p>

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', marginBottom: '12px' }}>
            Reason for deletion <span style={{ color: 'red' }}>*</span>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              rows={3}
              style={{
                display: 'block', width: '100%', padding: '8px', marginTop: '4px',
                borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box'
              }}
              placeholder="e.g. Duplicate record, patient request, moved away..."
            />
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              style={{ padding: '8px 16px', background: '#64748b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !reason.trim()}
              style={{
                padding: '8px 16px',
                background: submitting || !reason.trim() ? '#f87171' : '#dc2626',
                color: '#fff', border: 'none', borderRadius: '4px',
                cursor: submitting ? 'not-allowed' : 'pointer'
              }}
            >
              {submitting ? 'Deleting...' : 'Confirm Delete'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}