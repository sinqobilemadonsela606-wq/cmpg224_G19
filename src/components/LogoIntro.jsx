// src/components/LogoIntro.jsx
// Displays the CASS logo as a startup screen for two seconds before the app loads

import { useEffect, useState } from 'react';
import logo from '../assets/cass-logo.png';

export default function LogoIntro({ children }) {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  if (showIntro) {
    return (
      <div style={{
        position: 'fixed', inset: 0, background: '#F5F3F7',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
      }}>
        <img
          src={logo}
          alt="CASS"
          style={{ maxWidth: '320px', width: '70%', opacity: 0.95 }}
        />
      </div>
    );
  }

  return children;
}