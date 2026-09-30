import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function PatientSearch() {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Fetch all patients once when the component mounts
  useEffect(() => {
    const fetchPatients = async () => {
      const { data, error } = await supabase.from('patients').select('*');
      if (error) {
        console.error('Error fetching patients:', error);
      } else {
        setPatients(data || []);
      }
    };
    fetchPatients();
  }, []);

  // Filter patients locally as you type (matches first name, last name, or email)
  const filteredPatients = patients.filter((patient) => {
    const term = searchTerm.toLowerCase();
    const fullName = `${patient.first_name || ''} ${patient.last_name || ''}`.toLowerCase();
    const email = (patient.email || '').toLowerCase();
    return fullName.includes(term) || email.includes(term);
  });

  // Clean ID helper (keeps it under 12 characters: # + 8 chars = 9 characters)
  const formatCuteId = (id) => {
    if (!id) return 'No ID';
    return `#${String(id).substring(0, 8).toUpperCase()}`;
  };

  return (
    <div style={{ padding: '20px', background: '#f9f9f9', borderRadius: '8px', border: '1px solid #ddd' }}>
      <h2>Patient Search</h2>
      
      <input 
        type="text" 
        placeholder="Type to filter patients..." 
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setSelectedPatient(null); // Reset view when typing a new search
        }}
        style={{ 
          width: '100%', 
          padding: '10px', 
          borderRadius: '6px', 
          border: '1px solid #ccc',
          fontSize: '16px',
          marginBottom: '15px'
        }}
      />

      {/* Show search results list only when typing and no patient is selected */}
      {searchTerm.trim() !== '' && !selectedPatient && (
        <ul style={{ listStyle: 'none', padding: 0, background: '#fff', borderRadius: '6px', border: '1px solid #ddd' }}>
          {filteredPatients.length > 0 ? (
            filteredPatients.map((patient) => (
              <li 
                key={patient.id || patient.patient_id} 
                onClick={() => setSelectedPatient(patient)}
                style={{ 
                  padding: '12px', 
                  borderBottom: '1px solid #eee', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
              >
                <div>
                  <strong>{patient.first_name} {patient.last_name}</strong>
                  <br />
                  <small style={{ color: '#666' }}>{patient.email || 'No email'}</small>
                </div>
                
                {/* Cute ID Tag */}
                <span style={{ 
                  background: '#e2e8f0', 
                  color: '#334155', 
                  padding: '4px 8px', 
                  borderRadius: '6px', 
                  fontWeight: 'bold',
                  fontSize: '0.85em'
                }}>
                  {formatCuteId(patient.id || patient.patient_id)}
                </span>
              </li>
            ))
          ) : (
            <li style={{ padding: '12px', color: '#888' }}>No matching patients found.</li>
          )}
        </ul>
      )}

      {/* Selected Patient Detailed View Card */}
      {selectedPatient && (
        <div style={{ marginTop: '15px', padding: '15px', background: '#fff', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ margin: 0, color: '#1e293b' }}>Patient Profile</h3>
            <button 
              onClick={() => setSelectedPatient(null)}
              style={{ background: '#64748b', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
            >
              Back to Search
            </button>
          </div>
          <p><strong>Name:</strong> {selectedPatient.first_name} {selectedPatient.last_name}</p>
          <p><strong>Email:</strong> {selectedPatient.email || 'N/A'}</p>
          <p><strong>Phone:</strong> {selectedPatient.phone || selectedPatient.phone_number || 'N/A'}</p>
          <p><strong>Patient ID:</strong> {formatCuteId(selectedPatient.id || selectedPatient.patient_id)}</p>
        </div>
      )}
    </div>
  );
}