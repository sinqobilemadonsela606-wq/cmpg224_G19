import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

function PatientRegistration() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    date_of_birth: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await supabase
      .from('patients')
      .insert([formData]);

    if (error) {
      setMessage('❌ Error: ' + error.message);
    } else {
      setMessage('✅ Patient registered successfully!');
      setFormData({
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        date_of_birth: '',
        address: ''
      });
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '500px', margin: '20px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Register New Patient</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="first_name" placeholder="First Name" value={formData.first_name} onChange={handleChange} required />
        <input type="text" name="last_name" placeholder="Last Name" value={formData.last_name} onChange={handleChange} required />
        <input type="text" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} />
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
        <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} />
        <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} />
        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register Patient'}
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default PatientRegistration;