// src/components/appointments/BookingForm.jsx
// FR09 - Receptionist books appointments for all patients (new or existing)
//
// Structure is intentionally unstyled. Pitch (designer) will style
// the classNames below when the design system is ready.

import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

function BookingForm() {
  // ---------- STATE ----------
  const [practitioners, setPractitioners] = useState([]);
  const [existingPatients, setExistingPatients] = useState([]);

  const [form, setForm] = useState({
    practitioner_id: "",
    appointment_date: "",
    appointment_time: "",
    reason: "",
    patient_mode: "existing", // "existing" | "new"
    patient_id: "",
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    date_of_birth: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ---------- LOAD DATA ON MOUNT ----------
  useEffect(() => {
    loadPractitioners();
    loadPatients();
  }, []);

  async function loadPractitioners() {
    const { data, error } = await supabase
      .from("practitioners")
      .select("id, full_name, specialty")
      .eq("is_active", true);
    if (error) setError(error.message);
    else setPractitioners(data);
  }

  async function loadPatients() {
    const { data, error } = await supabase
      .from("patients")
      .select("id, first_name, last_name");
    if (error) setError(error.message);
    else setExistingPatients(data);
  }

  // ---------- HANDLERS ----------
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);

    try {
      let patientId = form.patient_id;

      // If receptionist selected "New patient", create the patient first
      if (form.patient_mode === "new") {
        const { data: newPatient, error: patientErr } = await supabase
          .from("patients")
          .insert({
            first_name: form.first_name,
            last_name: form.last_name,
            phone: form.phone,
            email: form.email,
            date_of_birth: form.date_of_birth || null,
          })
          .select()
          .single();

        if (patientErr) throw patientErr;
        patientId = newPatient.id;
      }

      // Insert the appointment
      const { error: apptErr } = await supabase.from("appointments").insert({
        patient_id: patientId,
        practitioner_id: form.practitioner_id,
        appointment_date: form.appointment_date,
        appointment_time: form.appointment_time,
        reason: form.reason,
        status: "scheduled",
      });

      if (apptErr) throw apptErr;

      setMessage("Appointment booked successfully.");
      // Reset only the appointment-related fields
      setForm({
        ...form,
        practitioner_id: "",
        appointment_date: "",
        appointment_time: "",
        reason: "",
        patient_id: "",
        first_name: "",
        last_name: "",
        phone: "",
        email: "",
        date_of_birth: "",
      });
      loadPatients();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  // ---------- UI ----------
  return (
    <div className="booking-form">
      <h2>Book Appointment</h2>

      {error && <p className="form-error">{error}</p>}
      {message && <p className="form-success">{message}</p>}

      <form onSubmit={handleSubmit}>
        {/* Practitioner */}
        <label>
          Practitioner
          <select
            name="practitioner_id"
            value={form.practitioner_id}
            onChange={handleChange}
            required
          >
            <option value="">Select practitioner...</option>
            {practitioners.map((p) => (
              <option key={p.id} value={p.id}>
                {p.full_name} — {p.specialty}
              </option>
            ))}
          </select>
        </label>

        {/* Date + Time */}
        <label>
          Date
          <input
            type="date"
            name="appointment_date"
            value={form.appointment_date}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Time
          <input
            type="time"
            name="appointment_time"
            value={form.appointment_time}
            onChange={handleChange}
            required
          />
        </label>

        {/* Reason */}
        <label>
          Reason for visit
          <input
            type="text"
            name="reason"
            value={form.reason}
            onChange={handleChange}
          />
        </label>

        {/* Patient mode */}
        <fieldset className="patient-mode">
          <legend>Patient</legend>
          <label>
            <input
              type="radio"
              name="patient_mode"
              value="existing"
              checked={form.patient_mode === "existing"}
              onChange={handleChange}
            />
            Existing patient
          </label>
          <label>
            <input
              type="radio"
              name="patient_mode"
              value="new"
              checked={form.patient_mode === "new"}
              onChange={handleChange}
            />
            New patient
          </label>
        </fieldset>

        {/* Existing patient selector */}
        {form.patient_mode === "existing" && (
          <label>
            Select patient
            <select
              name="patient_id"
              value={form.patient_id}
              onChange={handleChange}
              required
            >
              <option value="">Choose...</option>
              {existingPatients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.first_name} {p.last_name}
                </option>
              ))}
            </select>
          </label>
        )}

        {/* New patient inline form */}
        {form.patient_mode === "new" && (
          <fieldset className="new-patient">
            <legend>New Patient Details</legend>

            <label>
              First name
              <input
                type="text"
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Last name
              <input
                type="text"
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Phone
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />
            </label>

            <label>
              Email
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
              />
            </label>

            <label>
              Date of birth
              <input
                type="date"
                name="date_of_birth"
                value={form.date_of_birth}
                onChange={handleChange}
              />
            </label>
          </fieldset>
        )}

        <button type="submit" disabled={submitting}>
          {submitting ? "Booking..." : "Book Appointment"}
        </button>
      </form>
    </div>
  );
}

export default BookingForm;
