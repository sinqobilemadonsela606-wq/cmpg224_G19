// src/hooks/useInactivityLogout.js
// FR03 - Auto-logout after 30 minutes of inactivity
//
// Listens for user activity (mouse, keyboard, touch, scroll).
// Resets a timer on every activity. When the timer reaches zero, calls logout().
// Change TIMEOUT_MS to a smaller value (e.g. 10_000 = 10 seconds) for testing.

import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];

export default function useInactivityLogout() {
  const { user, logout } = useAuth();
  const timerRef = useRef(null);

  useEffect(() => {
    // Only run when a user is logged in
    if (!user) return;

    function resetTimer() {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        console.warn('Auto-logout: 30 minutes of inactivity');
        logout();
      }, TIMEOUT_MS);
    }

    // Start the timer and attach listeners
    resetTimer();
    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, resetTimer));

    // Cleanup on unmount or logout
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, resetTimer));
    };
  }, [user, logout]);
}