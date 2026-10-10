// src/components/AppHeader.jsx
// Top bar with CASS branding, section navigation, and logout

import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/cass-logo.png';

export default function AppHeader() {
  const { role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  const navLinks = role === 'admin'
    ? [
        { label: 'Register Patient', anchor: 'register-patient' },
        { label: 'Patient Management', anchor: 'patient-management' },
        { label: 'Reports', anchor: 'reports' }
      ]
    : [
        { label: 'Patient Search', anchor: 'patient-search' },
        { label: 'Booking', anchor: 'booking' },
        { label: 'Appointments', anchor: 'appointments' },
        { label: 'Patient List', anchor: 'patient-list' }
      ];

  function scrollToAnchor(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 24px',
      background: '#fff',
      borderBottom: '1px solid #DDD8E0',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <span style={{ fontWeight: 'bold', color: '#5A4A63', fontSize: '1.15em' }}>CASS</span>

        <nav style={{ display: 'flex', gap: '18px' }}>
          {navLinks.map((link) => (
            <button
              key={link.anchor}
              onClick={() => scrollToAnchor(link.anchor)}
              style={{
                background: 'none',
                border: 'none',
                color: '#5A4A63',
                cursor: 'pointer',
                fontSize: '0.9em',
                fontFamily: 'inherit',
                padding: '4px 0'
              }}
            >
              {link.label}
            </button>
          ))}
        </nav>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <img src={logo} alt="CASS" style={{ height: '48px' }} />
        <button
          onClick={handleLogout}
          style={{
            padding: '6px 14px',
            background: '#6B5876',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontFamily: 'inherit'
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}