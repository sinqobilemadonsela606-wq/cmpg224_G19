// src/components/AppHeader.jsx
// Top bar with the CASS logo, shown on every authenticated page

import logo from '../assets/cass-logo.png';

export default function AppHeader() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 24px',
      background: '#F5F3F7',
      borderBottom: '1px solid #DDD8E0'
    }}>
      <span style={{ fontWeight: 'bold', color: '#5A4A63', fontSize: '1.1em' }}>
        CASS
      </span>
      <img src={logo} alt="CASS" style={{ height: '40px' }} />
    </div>
  );
}