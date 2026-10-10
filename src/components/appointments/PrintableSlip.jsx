// src/components/appointments/PrintableSlip.jsx
// FR12/FR09 - Confirmation popup with a printable appointment slip
// Reused after both a successful booking and a successful reschedule

import { useRef } from 'react';
import logo from '../../assets/cass-logo.png';

export default function PrintableSlip({ title, appointment, onClose }) {
  const printRef = useRef(null);

  function handlePrint() {
    const printContent = printRef.current.innerHTML;
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    printWindow.document.write(`
      <html>
        <head>
          <title>CASS Appointment Slip</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; color: #2B2B2B; }
            .slip { max-width: 560px; margin: 0 auto; border: 1px solid #DDD8E0; border-radius: 8px; padding: 32px; }
            .header { text-align: center; margin-bottom: 24px; }
            .header img { max-height: 90px; }
            .header h1 { color: #5A4A63; margin: 12px 0 4px; font-size: 1.4em; }
            .header p { color: #6B6B6B; margin: 0; font-size: 0.9em; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            td { padding: 8px 0; border-bottom: 1px solid #EEE; font-size: 0.95em; }
            td:first-child { color: #6B6B6B; width: 40%; }
            .footer { margin-top: 24px; text-align: center; font-size: 0.8em; color: #6B6B6B; }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  }

  const { patients: patient, practitioners: practitioner } = appointment;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff', padding: '24px', borderRadius: '8px',
          maxWidth: '560px', width: '92%', maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
        }}
      >
        <div ref={printRef}>
          <div className="slip">
            <div className="header" style={{ textAlign: 'center', marginBottom: '20px' }}>
              <img src={logo} alt="CASS" style={{ maxHeight: '90px' }} />
              <h1 style={{ color: '#5A4A63', margin: '12px 0 4px', fontSize: '1.4em' }}>
                {title}
              </h1>
              <p style={{ color: '#6B6B6B', margin: 0, fontSize: '0.9em' }}>
                Clinic Appointment Scheduling System
              </p>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
              <tbody>
                <SlipRow label="Patient" value={patient ? `${patient.first_name} ${patient.last_name}` : '-'} />
                <SlipRow label="Patient Number" value={patient?.patient_number || '-'} />
                <SlipRow label="SA ID" value={patient?.id_number || '-'} />
                <SlipRow label="Phone" value={patient?.phone || '-'} />
                <SlipRow label="Practitioner" value={practitioner ? `${practitioner.full_name} - ${practitioner.specialty || ''}` : '-'} />
                <SlipRow label="Date" value={appointment.appointment_date || '-'} />
                <SlipRow label="Time" value={String(appointment.appointment_time || '').slice(0, 5)} />
                <SlipRow label="Reason" value={appointment.reason || '-'} />
                <SlipRow label="Status" value={(appointment.status || 'scheduled').toUpperCase()} />
              </tbody>
            </table>

            <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.8em', color: '#6B6B6B' }}>
              Printed on {new Date().toLocaleString()}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px', background: '#64748b', color: '#fff',
              border: 'none', borderRadius: '4px', cursor: 'pointer'
            }}
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            style={{
              padding: '8px 16px', background: '#6B5876', color: '#fff',
              border: 'none', borderRadius: '4px', cursor: 'pointer'
            }}
          >
            Print Slip
          </button>
        </div>
      </div>
    </div>
  );
}

function SlipRow({ label, value }) {
  return (
    <tr>
      <td style={{ color: '#6B6B6B', padding: '8px 0', borderBottom: '1px solid #EEE', width: '40%' }}>{label}</td>
      <td style={{ padding: '8px 0', borderBottom: '1px solid #EEE', fontWeight: 500 }}>{value}</td>
    </tr>
  );
}