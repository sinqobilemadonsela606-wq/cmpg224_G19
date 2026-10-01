import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import PatientSearch from './components/PatientSearch';

function App() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard'); // Controls view switching

  useEffect(() => {
    const fetchPatients = async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*');

      if (error) {
        console.error('Error fetching patients:', error);
        alert('Supabase connection error! Check console.');
      } else {
        setPatients(data || []);
      }
      setLoading(false);
    };

    fetchPatients();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', maxWidth: '900px', margin: '0 auto' }}>
      <h1>Clinic Appointment System (CASS)</h1>
      
      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
        <button 
          onClick={() => setActiveTab('dashboard')}
          style={{ padding: '8px 16px', background: activeTab === 'dashboard' ? '#2563eb' : '#e2e8f0', color: activeTab === 'dashboard' ? '#fff' : '#333', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Dashboard & Patients List
        </button>
        <button 
          onClick={() => setActiveTab('search')}
          style={{ padding: '8px 16px', background: activeTab === 'search' ? '#2563eb' : '#e2e8f0', color: activeTab === 'search' ? '#fff' : '#333', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Patient Search
        </button>
      </div>

      {/* Tab Content Display */}
      {activeTab === 'dashboard' && (
        <>
          <h2>Patients List</h2>
          {loading ? (
            <p>Loading patients...</p>
          ) : patients.length === 0 ? (
            <p style={{ color: '#666' }}>No patients found in the database.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {patients.map((patient) => (
                <li 
                  key={patient.id || patient.patient_id}
                  style={{ background: '#fff', padding: '12px', marginBottom: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div>
                    <strong>{patient.first_name} {patient.last_name}</strong>
                    <br />
                    <small style={{ color: '#666' }}>{patient.email || 'No email'} | {patient.phone || patient.phone_number || 'No contact'}</small>
                  </div>
                  <code style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85em' }}>
                    {patient.id || patient.patient_id}
                  </code>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {activeTab === 'search' && <PatientSearch />}
    </div>
  );
}

export default App;