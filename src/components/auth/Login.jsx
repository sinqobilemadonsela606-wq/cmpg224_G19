// src/components/auth/Login.jsx
// FR01 - User login with username/password
//
// Uses AuthContext.login() which calls Supabase signInWithPassword.
// On success, the app redirects automatically (handled in App.js).

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabaseClient';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email.trim(), password);

      
      // Look up the user's role, then send them to the right dashboard
const { data: userData } = await supabase.auth.getUser();
const userId = userData?.user?.id;

const { data: roleRow } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', userId)
  .single();

const destination = roleRow?.role === 'admin' ? '/admin' : '/';
navigate(destination, { replace: true });
    } catch (err) {
      setError('Invalid email or password.');
      console.error('Login error:', err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page" style={{ maxWidth: 400, margin: '80px auto', padding: 24 }}>
      <h1>CASS Login</h1>
      <p>Sign in to continue</p>

      {error && (
        <p className="form-error" style={{ color: 'red' }}>
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <label style={{ display: 'block', marginBottom: 12 }}>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            style={{ display: 'block', width: '100%', padding: 6, marginTop: 4 }}
          />
        </label>

        <label style={{ display: 'block', marginBottom: 12 }}>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            style={{ display: 'block', width: '100%', padding: 6, marginTop: 4 }}
          />
        </label>

        <button type="submit" disabled={submitting} style={{ padding: '8px 16px' }}>
          {submitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}

export default Login;