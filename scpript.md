CASS — LIVE DEMO PREP SCRIPT
Group 19: Afrika, Sinqobile, Nomathemba

BEFORE THE DEMO

What to bring:
- Laptop (fully charged) + charger
- Printed Test Cases (3 copies)
- This prep script (3 copies)
- Sample test data (at the bottom of this doc)

Before you open the app:
- Internet working (Supabase needs it)
- Open VS Code → run “npm start” in the terminal
- Open a browser → go to http://localhost:3000
- Confirm test accounts work
- Confirm who clicks what

1.	OPENING

Do:
-	Show the laptop screen with the app open.

Say:
“Good morning. We’re presenting our Clinic Appointment
Scheduling System — CASS. We’ll show you the implemented
Features directly in the app and test them live.”


2.	AUTHENTICATION

Do:
- Show the login page.
- Log in with valid admin account:
     Email: admin@cass.local
     Password: Test1234!
- Show the dashboard that opens.
- If asked, log out and try an invalid password —
  Show that it’s rejected.

Say:
“This is our login page. We use Supabase for authentication.
We’ll show a valid login and how invalid credentials are rejected.”

IMPORTANT:
If the lecturer gives us an email to test with, it must
Already be registered. Say:
“That account would need to be created first —
Only registered users can log in.”


3.	ROLE-BASED ACCESS

Do:
-	Log out of admin
  (F12 → Application → Local Storage → Clear → Refresh)
-	Log in as receptionist:
     Email: reception@cass.local
     Password: Test1234!
- Show the receptionist dashboard.
- Type “localhost:3000/admin” in the URL bar.
- Show that it bounces back to “/”.

Say:
“Our system has two roles — Admin and Receptionist.
Role-based access is enforced. A receptionist cannot
Access admin pages — the app redirects them.”

 This works — tested.


4.	PATIENT REGISTRATION

Do:
- Log back in as admin.
- Open the Register New Patient section.
- Fill in:
     First Name: Test
     Last Name: Demo
     SA ID: 9001015009087
     Phone: 0821234567
     Email: demo@test.com
     Date of Birth: 1990-01-01
     Address: 123 Test Street
- Click Register Patient.
- Show the success message.

Say:
“Admins can register new patients. The system stores
Them in Supabase and generates a patient number.”

AVOID:
- Do NOT type letters in the SA ID field.
- Do NOT enter birth year “0000”.


5.	PATIENT SEARCH

Do:
- Open Patient Search.
- Search by name: type “Ruhiiga”.
- Show it filters live.
- Type “xyzxyz” — show “No matching patient found”.

Say:
“We can search patients by name, patient number, or SA ID.
Results filter live.”

 This works — tested.


6.	APPOINTMENT BOOKING

Do:
- Open Book Appointment.
- Select a practitioner.
- Pick a FUTURE date and time.
- Select a registered patient.
- Click Book Appointment.
- Show the success message.

Say:
“This books an appointment for a registered patient
With a selected doctor.”

AVOID:
- Do NOT book a past date.
- Do NOT book the same doctor + same time twice.
- Don’t rely on the appointment showing in the list
  Immediately after booking.


7.	SESSION SECURITY

Do:
-	Explain only — no live demo (would take 30 min).

Say:
“The system has a 30-minute inactivity timeout.
We have a test case prepared for this — it requires
Waiting 30 minutes, so we won’t demo it live.”


8.	QUESTIONS FROM LECTURERS

Do:
-	Whatever they ask — test it live, honestly.

Say:
“We’ll test that now and show you the actual result.”

If they trigger a bug (like double-booking), say:
“We identified this in testing. It’s documented in
Our Test Cases report. The double-booking prevention
Is our top priority fix.”


9.	CLOSING

Say:
“That concludes our live demo. We’ve shown authentication,
Role-based access, patient registration, search, and booking.
Our printed Test Cases document summarises what passed and
What’s still being fixed. Thank you — we’re ready for questions.”


PRIVATE — TEAM ONLY — BUG AVOIDANCE
DO NOT SHOW TO LECTURERS

Avoid triggering these during the demo:

1.	Double-booking (CRITICAL)
   Don’t book same doctor + same time twice.

2.	Past dates accepted (HIGH)
   Don’t book or reschedule with a past date.

3.	Booked appointment missing from list (HIGH)
   Don’t rely on the appointment appearing in the
   List immediately after booking.

4.	Invalid SA ID accepted (MEDIUM)
   Don’t type letters in the SA ID field.

5.	Birth year “0000” accepted (MEDIUM)
   Don’t enter “0000” as a birth year.

If the lecturers test one of these on purpose:
- Stay calm.
- Say what we found.
- Point to the printed Test Cases report.
- Say: “This is a known issue — we’re fixing it next sprint.”


FINAL PREP CHECKLIST

Day before:
[ ] Laptop charged + charger packed
[ ] Test accounts work on laptop
[ ] Sample data ready
[ ] Test Cases document printed (x3)
[ ] This script printed (x3)
[ ] Practice run completed
[ ] Team knows who clicks what

On the day:
-Internet working
-App running (npm start)
-Browser open at localhost:3000
-Test Cases + script in hand


SAMPLE DATA — HAVE READY

TEST ACCOUNTS:
Admin:        admin@cass.local / Test1234!
Receptionist: reception@cass.local / Test1234!

SAMPLE PATIENT:
First Name:    Test
Last Name:     Demo
SA ID:         9001015009087
Phone:         0821234567
Email:         demo@test.com
Date of Birth: 1990-01-01
Address:       123 Test Street