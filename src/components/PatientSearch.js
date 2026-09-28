import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

function PatientSearch() {
  const [searchType, setSearchType] = useState('name'); // 'name' or 'id'
  const [queryTerm, setQueryTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [executionTime, setExecutionTime] = useState(null);
  const [message, setMessage] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!queryTerm.trim()) {
      setMessage('⚠️ Please enter a search query.');
      return;
    }

    setMessage('');
    setLoading(true);
    const startTime = performance.now();

    try {
      // EDITED: Select 'id' instead of 'patient_id' to match the database migration schema
      let query = supabase
        .from('patients')
        .select('id, first_name, last_name, phone, email, created_at');

      if (searchType === 'name') {
        // Partial search across last name or first name
        query = query.or(`last_name.ilike.%${queryTerm}%,first_name.ilike.%${queryTerm}%`);
      } else if (searchType === 'id') {
        // Exact match for patient UUID (`id`)
        query = query.eq('id', queryTerm.trim());
      }

      const { data, error } = await query;

      if (error) throw error;

      const endTime = performance.now();
      setExecutionTime(((endTime - startTime) / 1000).toFixed(2)); // seconds
      setResults(data || []);
      
      if (data.length === 0) {
        setMessage('ℹ️ No patient records found.');
      }
    } catch (err) {
      console.error('Error searching patients:', err.message);
      setMessage('❌ Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '650px', margin: '20px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', fontFamily: 'sans-serif' }}>
      <h2>Search Patients</h2>
      
      <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Search By:</label>
          <select value={searchType} onChange={(e) => setSearchType(e.target.value)} style={{ padding: '5px' }}>
            <option value="name">Patient Name</option>
            <option value="id">Patient UUID</option>
          </select>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            value={queryTerm}
            onChange={(e) => setQueryTerm(e.target.value)}
            placeholder={searchType === 'name' ? "Enter name (e.g. Mokoena)..." : "Enter Patient UUID..."}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <button type="submit" disabled={loading} style={{ padding: '8px 15px', background: '#007BFF', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {loading ? 'Searching...' : 'Search Patient'}
        </button>
      </form>

      {message && <p>{message}</p>}
      {executionTime && <p style={{ fontSize: '12px', color: '#666' }}>Query Execution Time: {executionTime}s</p>}

      {/* Results Table */}
      <div style={{ marginTop: '20px' }}>
        <h3>Search Results</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ background: '#f4f4f4', textAlign: 'left' }}>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>UUID (ID)</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Full Name</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Contact</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {results.length > 0 ? (
              results.map((patient) => (
                <tr key={patient.id}>
                  <td style={{ border: '1px solid #ddd', padding: '8px', fontFamily: 'monospace', fontSize: '11px' }}>{patient.id}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{patient.last_name}, {patient.first_name}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', fontSize: '12px' }}>{patient.phone || patient.email || 'None'}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    <button onClick={() => alert(`View details for ID: ${patient.id}`)} style={{ marginRight: '5px' }}>[View]</button>
                    <button onClick={() => alert(`Edit record for ID: ${patient.id}`)}>[Edit]</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center', color: '#666' }}>
                  {loading ? 'Querying database...' : 'No results to display.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PatientSearch;