import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import PatientRegistration from './components/PatientRegistration';
import BookingForm from './components/appointments/BookingForm';
import PatientSearch from './components/PatientSearch';

function App() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*');

      if (error) {
        console.error('Error fetching patients:', error);
        alert('Supabase connection error! Check console.');
      } else {
        setPatients(data);
      }
      setLoading(false);
    };

    fetchPatients();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Clinic Appointment System (CASS)</h1>

      {/* Patient Registration Form */}
      <PatientRegistration />

      <hr style={{ margin: '40px 0' }} />

      {/* Patient Search Component (FR07) */}
      <PatientSearch />

      <hr style={{ margin: '40px 0' }} />

      {/* All Patients List */}
      <h2>All Patients List</h2>
      {loading ? (
        <p>Loading patients...</p>
      ) : (
        <ul>
          {patients.map((patient) => (
            <li key={patient.id || patient.patient_id}>
              {patient.first_name} {patient.last_name} – {patient.email || 'No email'}
            </li>
          ))}
        </ul>
      )}

      <hr style={{ margin: '40px 0' }} />

      {/* Booking Form (FR09) */}
      <BookingForm />
    </div>
  );
}

export default App;