// src/App.js
// Root of the CASS app.
// - Wraps everything in AuthProvider (FR01/FR02)
// - Sets up routing with /login and protected routes
// - Calls useInactivityLogout for 30-min auto-logout (FR03)

import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { exportDailyAppointmentsPDF } from './utils/exportPDF'; //for pdfs
import { supabase } from './supabaseClient';
import { AuthProvider } from './context/AuthContext';
import useInactivityLogout from './hooks/useInactivityLogout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './components/auth/Login'; 
import PatientManagement from './components/admin/PatientManagement';

// Existing feature components
import PatientRegistration from './components/PatientRegistration';
import PatientSearch from './components/PatientSearch';
import BookingForm from './components/appointments/BookingForm';


// ---------- Dashboard (any logged-in user) ----------
// Receptionist dashboard
function Dashboard() {
  useInactivityLogout();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching patients:', error);
      } else {
        setPatients(data);
      }
      setLoading(false);
    };
    fetchPatients();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', maxWidth: '900px', margin: '0 auto' }}>
      <h1>Clinic Appointment System (CASS)</h1>

      <PatientSearch />

      <hr style={{ margin: '40px 0' }} />

      <BookingForm />

      <hr style={{ margin: '40px 0' }} />

      <h2>All Patients List</h2>
      {loading ? (
        <p>Loading patients...</p>
      ) : (
        <ul>
          {patients.map((patient) => (
            <li key={patient.id}>
              {patient.patient_number} - {patient.first_name} {patient.last_name} - {patient.phone || 'No phone'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Admin dashboard
function AdminDashboard() {
  useInactivityLogout();

  function handleTestPDF() {
    exportDailyAppointmentsPDF('2026-10-09', [
      { time: '08:00', patientNumber: 'PAT-0001', patient: 'Basiji Ruhiiga', practitioner: 'Dr. A. Mokoena', reason: 'Checkup', status: 'Scheduled' },
      { time: '09:30', patientNumber: 'PAT-0002', patient: 'Lopez Pitch', practitioner: 'Dr. T. Nkosi', reason: 'Follow-up', status: 'Completed' }
    ]);
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Admin Dashboard</h1>

      <button
        onClick={handleTestPDF}
        style={{ marginBottom: '20px', padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        Export Sample PDF
      </button>

      <PatientRegistration />

      <hr style={{ margin: '40px 0' }} />

      <PatientManagement />
    </div>
  );
}

// ---------- Root ----------
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;