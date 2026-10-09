// src/components/admin/EditPatientModal.jsx
// FR06 - Admin updates patient records
// Validates SA ID (13 digits, unique) excluding the current patient

import { useState } from 'react';
import { supabase } from '../../supabaseClient';

export default function EditPatientModal({ patient, onClose, onSaved }) {
  const [form, setForm] = useState({
    first_name: patient.first_name || '',
    last_name: patient.last_name || '',
    id_number: patient.id_number || '',
    phone: patient.phone || '',
    email: patient.email || '',
    date_of_birth: patient.date_of_birth || '',
    address: patient.address || ''
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // Validate SA ID if provided
    if (form.id_number && !/^\d{13}$/.test(form.id_number)) {
      setError('SA ID number must be exactly 13 digits.');
      return;
    }

    setSaving(true);

    // Check SA ID uniqueness excluding this patient
    if (form.id_number) {
      const { data: existing, error: checkError } = await supabase
        .from('patients')
        .select('id')
        .eq('id_number', form.id_number)
        .neq('id', patient.id)
        .maybeSingle();

      if (checkError) {
        console.error('SA ID check failed:', checkError);
        setError('Could not verify SA ID uniqueness. Please try again.');
        setSaving(false);
        return;
      }
      if (existing) {
        setError('Another patient already has this SA ID number.');
        setSaving(false);
        return;
      }
    }

    const { error: updateError } = await supabase
      .from('patients')
      .update({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        id_number: form.id_number.trim() || null,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        date_of_birth: form.date_of_birth || null,
        address: form.address.trim() || null
      })
      .eq('id', patient.id);

    if (updateError) {
      console.error('Error updating patient:', updateError);
      setError('Failed to save changes. ' + updateError.message);
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
          maxWidth: '520px', width: '90%', maxHeight: '85vh', overflowY: 'auto',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ margin: 0 }}>Edit Patient</h3>
          <span style={{ fontSize: '0.85em', color: '#666' }}>{patient.patient_number}</span>
        </div>

        {error && (
          <p style={{ color: '#991b1b', background: '#fee2e2', padding: '8px 12px', borderRadius: '4px' }}>
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <Field label="First Name">
            <input
              type="text" name="first_name" value={form.first_name}
              onChange={handleChange} required
              style={inputStyle}
            />
          </Field>

          <Field label="Last Name">
            <input
              type="text" name="last_name" value={form.last_name}
              onChange={handleChange} required
              style={inputStyle}
            />
          </Field>

          <Field label="SA ID Number">
            <input
              type="text" name="id_number" value={form.id_number}
              onChange={handleChange} maxLength={13}
              style={inputStyle}
            />
          </Field>

          <Field label="Phone">
            <input
              type="tel" name="phone" value={form.phone}
              onChange={handleChange}
              style={inputStyle}
            />
          </Field>

          <Field label="Email">
            <input
              type="email" name="email" value={form.email}
              onChange={handleChange}
              style={inputStyle}
            />
          </Field>

          <Field label="Date of Birth">
            <input
              type="date" name="date_of_birth" value={form.date_of_birth}
              onChange={handleChange}
              style={inputStyle}
            />
          </Field>

          <Field label="Address">
            <input
              type="text" name="address" value={form.address}
              onChange={handleChange}
              style={inputStyle}
            />
          </Field>

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
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: 'block', marginBottom: '12px' }}>
      <span style={{ display: 'block', fontSize: '0.85em', color: '#475569', marginBottom: '4px' }}>{label}</span>
      {children}
    </label>
  );
}

const inputStyle = {
  display: 'block', width: '100%', padding: '8px',
  borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box'
};