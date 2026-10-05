import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import PatientRegistration from './components/PatientRegistration';
import BookingForm from './components/appointments/BookingForm';
import PatientSearch from './components/PatientSearch';
import AppointmentList from './components/appointments/AppointmentList';
import DailyList from './components/appointments/DailyList'; // Added DailyList import

function App() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard'); // Tab switcher state

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
      <div style={{ display: 'flex', gap: '8px', marginBottom: '25px', borderBottom: '1px solid #ddd', paddingBottom: '10px', flexWrap: 'wrap' }}>
        <button 
          onClick={() => setActiveTab('dashboard')}
          style={{ padding: '8px 14px', background: activeTab === 'dashboard' ? '#2563eb' : '#e2e8f0', color: activeTab === 'dashboard' ? '#fff' : '#333', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Dashboard & Patients
        </button>

        <button 
          onClick={() => setActiveTab('register')}
          style={{ padding: '8px 14px', background: activeTab === 'register' ? '#2563eb' : '#e2e8f0', color: activeTab === 'register' ? '#fff' : '#333', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Register Patient
        </button>

        <button 
          onClick={() => setActiveTab('search')}
          style={{ padding: '8px 14px', background: activeTab === 'search' ? '#2563eb' : '#e2e8f0', color: activeTab === 'search' ? '#fff' : '#333', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Patient Search
        </button>

        <button 
          onClick={() => setActiveTab('booking')}
          style={{ padding: '8px 14px', background: activeTab === 'booking' ? '#2563eb' : '#e2e8f0', color: activeTab === 'booking' ? '#fff' : '#333', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Book Appointment
        </button>

        <button 
          onClick={() => setActiveTab('dailylist')}
          style={{ padding: '8px 14px', background: activeTab === 'dailylist' ? '#2563eb' : '#e2e8f0', color: activeTab === 'dailylist' ? '#fff' : '#333', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Daily Schedule & Export
        </button>

        <button 
          onClick={() => setActiveTab('appointments')}
          style={{ padding: '8px 14px', background: activeTab === 'appointments' ? '#2563eb' : '#e2e8f0', color: activeTab === 'appointments' ? '#fff' : '#333', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Manage Appointments
        </button>
      </div>

      {/* Tab Views Content */}
      {activeTab === 'dashboard' && (
        <div>
          <h2>All Patients List</h2>
          {loading ? (
            <p>Loading patients...</p>
          ) : patients.length === 0 ? (
            <p style={{ color: '#666' }}>No patients found.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {patients.map((patient) => (
                <li key={patient.id || patient.patient_id} style={{ background: '#fff', padding: '12px', marginBottom: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{patient.first_name} {patient.last_name}</strong>
                    <br />
                    <small style={{ color: '#666' }}>{patient.email || 'No email'}</small>
                  </div>
                  <code style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85em' }}>
                    {patient.id || patient.patient_id}
                  </code>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {activeTab === 'register' && <PatientRegistration />}

      {activeTab === 'search' && <PatientSearch />}

      {activeTab === 'booking' && <BookingForm />}

      {activeTab === 'dailylist' && <DailyList />}

      {activeTab === 'appointments' && <AppointmentList />}
    </div>
  );
}

export default App;