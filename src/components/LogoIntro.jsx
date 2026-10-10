// src/components/LogoIntro.jsx
// Displays the CASS logo as a startup screen for two seconds before the app loads

import { useEffect, useState } from 'react';
import logo from '../assets/cass-logo.png';

export default function LogoIntro({ children }) {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 5500);
    return () => clearTimeout(timer);
  }, []);

  if (showIntro) {
    return (
            <div style={{
        position: 'fixed', inset: 0, background: '#e2d8ed',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
        animation: 'fadeIn 0.6s ease-in'
      }}>
        <img
          src={logo}
          alt="CASS"
          style={{ maxWidth: '560px', width: '85%', opacity: 0.95 }}
        />
      </div>
    );
  }

  return children;
}