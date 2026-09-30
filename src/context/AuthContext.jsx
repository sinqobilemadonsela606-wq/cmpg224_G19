// src/context/AuthContext.jsx
// FR01 - User login with username/password (Supabase Auth)
// FR02 - Role-based access control
//
// Provides app-wide auth state. Wrap <App /> in <AuthProvider>.

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // Supabase auth user
  const [role, setRole] = useState(null);       // 'admin' | 'receptionist' | null
  const [loading, setLoading] = useState(true); // true while we check the session

  // Load role for a given user
  async function loadRole(userId) {
    if (!userId) {
      setRole(null);
      return;
    }
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error loading role:', error.message);
      setRole(null);
    } else {
      setRole(data?.role ?? null);
    }
  }

  // On mount: check existing session 
  useEffect(() => {
    let mounted = true;

    async function init() {
      const { data } = await supabase.auth.getSession();
      const sessionUser = data?.session?.user ?? null;
      if (mounted) {
        setUser(sessionUser);
        await loadRole(sessionUser?.id);
        setLoading(false);
      }
    }

    init();

    //React to login / logout 
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const sessionUser = session?.user ?? null;
        setUser(sessionUser);
        await loadRole(sessionUser?.id);
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  //Actions 
  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
  }

  const value = { user, role, loading, login, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook for easy access
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}