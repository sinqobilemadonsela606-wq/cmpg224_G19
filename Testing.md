# CASS App - Testing Report

Tester: Nomathemba Molekwa (noma-gif)d
Student Number: 46534989
Date: 2026-10-02
Branch tested: main
Build tested: After pulling latest main

===========================================
FR01 - User Authentication
===========================================

T1.1 - Empty form submission
Steps: Leave email and password blank. Click Sign In.
Expected: Form blocks submission.
Actual: Shows "Please fill out this field."
Result: PASS

T1.2 - Invalid credentials
Steps: Enter wrong email and password. Click Sign In.
Expected: Error message shown, no crash.
Actual: Shows "Invalid email or password."
Result: PASS

T1.3 - Valid Admin login
Steps: Enter admin@cass.local / Test1234!. Click Sign In.
Expected: Admin dashboard opens.
Actual: Dashboard with Patient Registration and Search displayed.
Result: PASS

T1.4 - Valid Receptionist login
Steps: Enter reception@cass.local / Test1234!. Click Sign In.
Expected: Dashboard opens.
Actual: Login works, same dashboard shown (per team note - all views on one page for now).
Result: PASS

===========================================
FR02 - Role-Based Access Control
===========================================

T2.1 - Receptionist login works
Result: PASS

T2.2 - Receptionist blocked from /admin
Steps: Logged in as receptionist. Visit localhost:3000/admin.
Expected: Bounced back to / (per team instructions).
Actual: Bounced back to /.
Result: PASS

===========================================
FR03 - Auto Logout (30 min inactivity)
===========================================

Status: NOT TESTED
Reason: Requires 30 minutes idle time - cannot test in current session.
Recommendation: Test separately by logging in and waiting 30 minutes.

===========================================
FR04 - User Management (Admin)
===========================================

Status: NOT FOUND / NOT VISIBLE
Notes: No "Users", "User Management", or "Admin" link visible on the dashboard.
This feature may be unbuilt or pending.

===========================================
FR05 - Patient Registration
===========================================

T5.1 - Register valid patient
Steps: Fill all fields with valid data. Click Register.
Actual: "Patient registered successfully!"
Result: PASS

T5.2 - Missing fields
Status: NOT TESTED

T5.3 - Invalid SA ID (letters accepted)
Steps: Enter SA ID "84NGFFY125655". Submit.
Expected: Reject - must be exactly 13 digits.
Actual: Accepted invalid ID.
Result: FAIL - BUG

T5.4 - Invalid birth year (0000)
Steps: Enter birth year "0000". Submit.
Expected: Reject invalid date.
Actual: Accepted.
Result: FAIL - BUG

T5.5 - Duplicate SA ID
Status: NOT TESTED
Observation: In Patient List, PAT-0003 and PAT-0004 share the same phone number (0639870792). Possible data-integrity issue.

===========================================
FR07 - Patient Search
===========================================

T7.1 - Live filter by name
Steps: Type "Ruhiiga" in search box.
Actual: Filters live - shows only "Basiji Ruhiiga".
Result: PASS

T7.2 - No results handling
Steps: Type "xyzxyzxyz".
Actual: Shows "No matching patient found."
Result: PASS

===========================================
FR09 / FR12 - Appointment Booking & Management
===========================================

T9.1 - Book an appointment
Steps: Fill practitioner, date, time, patient. Click Book.
Actual: "Appointment booked successfully."
Result: PARTIAL

T9.2 - Booked appointment does not appear in Appointment Management
Steps: Book appointment - no error. Check Appointment Management.
Actual: Appointment missing from list.
Result: FAIL - BUG

T9.3 - Reschedule to a past date
Steps: Reschedule appointment to a date last year.
Actual: "Appointment booked successfully."
Expected: Reject past dates with error.
Result: FAIL - BUG

T9.4 - Double-booking same practitioner and time
Steps: Book two patients with same doctor at same time.
Actual: Both bookings succeed.
Expected: NFR08 - 0 double-booking conflicts allowed.
Result: FAIL - CRITICAL BUG

===========================================
BUGS FOUND
===========================================

BUG #1 - Booked appointment not appearing in Appointment Management (HIGH)
Steps: Book appointment - no error shown - appointment missing from list.
Expected: Booked appointment appears immediately.
Priority: HIGH

BUG #2 - Past dates accepted for appointments and reschedules (HIGH)
Steps: Reschedule to a past date - "Appointment booked successfully."
Expected: Reject past dates.
Priority: HIGH

BUG #3 - Double-booking allowed (CRITICAL)
Steps: Book two patients with same doctor, same time - both succeed.
Expected (NFR08): 0 double-booking conflicts allowed.
Priority: CRITICAL

BUG #4 - Invalid SA ID accepted (MEDIUM)
Steps: Enter SA ID with letters "84NGFFY125655". Accepted.
Expected: Reject non-13-digit IDs.
Priority: MEDIUM

BUG #5 - Invalid birth year accepted (MEDIUM)
Steps: Birth year 0000 accepted.
Expected: Reject unrealistic dates.
Priority: MEDIUM

===========================================
SUMMARY
===========================================

FR01 - Authentication: 4/4 PASS
FR02 - Role-Based Access: 2/2 PASS
FR03 - Auto-Logout: NOT TESTED
FR04 - User Management: NOT BUILT
FR05 - Patient Registration: 1 PASS, 2 FAIL
FR07 - Patient Search: 2/2 PASS
FR09/FR12 - Appointments: 3 FAIL

Critical finding: NFR08 (prevent double-booking) is not implemented.