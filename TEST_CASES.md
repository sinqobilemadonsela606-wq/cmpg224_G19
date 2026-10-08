# CASS — Test Cases

Ruhiiga, Basiji (50776606)
Madonsela, Sinqobile (53335449)
Molekwa, Nomathemba (46534989)


October 2026

===========================================
TEST CASES TABLE
===========================================

Written by: Afrika
Run by: Nomathemba
Date: 2026-10-05
Feature: F1 — User Authentication
TCID: TCID1.1
Test Description: Empty form submission
Input Data: Leave email and password blank, click Sign In
Expected Output: "Please fill out this field"
Actual Output: "Please fill out this field"
Pass/Fail: PASS 

Written by: Afrika
Run by: Nomathemba
Date: 2026-10-05
Feature: F1 — User Authentication
TCID: TCID1.2
Test Description: Invalid credentials
Input Data: admin@cass.local / wrongpassword
Expected Output: "Invalid email or password"
Actual Output: "Invalid email or password"
Pass/Fail: PASS 
Written by: Afrika
Run by: Nomathemba
Date: 2026-10-05
Feature: F1 — User Authentication
TCID: TCID1.3
Test Description: Valid Admin login
Input Data: admin@cass.local / Test1234!
Expected Output: Dashboard opens
Actual Output: Dashboard opened
Pass/Fail: PASS 

Written by: Afrika
Run by: Nomathemba
Date: 2026-10-05
Feature: F1 — User Authentication
TCID: TCID1.4
Test Description: Valid Receptionist login
Input Data: reception@cass.local / Test1234!
Expected Output: Dashboard opens
Actual Output: Dashboard opened
Pass/Fail: PASS 

Written by: Afrika
Run by: Nomathemba
Date: 2026-10-05
Feature: F1 — User Authentication
TCID: TCID1.5
Test Description: Receptionist blocked from /admin
Input Data: Logged in as receptionist, visited localhost:3000/admin
Expected Output: Bounced back to /
Actual Output: Bounced back to /
Pass/Fail: PASS 

-------------------------------------------

Written by: Afrika
Run by: Nomathemba
Date: 2026-10-05
Feature: F2 — Patient Registration
TCID: TCID2.1
Test Description: Valid patient registration
Input Data: Test Patient / 9001015009087 / 0821234567 / test@test.com / valid date
Expected Output: "Patient registered successfully!"
Actual Output: Registered successfully
Pass/Fail: PASS 

Written by: Afrika
Run by: Nomathemba
Date: 2026-10-05
Feature: F2 — Patient Registration
TCID: TCID2.2
Test Description: Invalid SA ID (letters allowed)
Input Data: SA ID = 84NGFFY125655
Expected Output: Reject — must be exactly 13 digits
Actual Output: Accepted invalid ID
Pass/Fail: FAIL 

Written by: Afrika
Run by: Nomathemba
Date: 2026-10-05
Feature: F2 — Patient Registration
TCID: TCID2.3
Test Description: Invalid birth year
Input Data: Birth year = 0000
Expected Output: Reject unrealistic date
Actual Output: Accepted
Pass/Fail: FAIL 
-------------------------------------------

Written by: Sinqobile
Run by: Nomathemba
Date: 2026-10-05
Feature: F3 — Patient Search
TCID: TCID3.1
Test Description: Search by name (live filter)
Input Data: Type "Ruhiiga" in search box
Expected Output: Show matching patient only
Actual Output: Showed "Basiji Ruhiiga"
Pass/Fail: PASS 

Written by: Sinqobile
Run by: Nomathemba
Date: 2026-10-05
Feature: F3 — Patient Search
TCID: TCID3.2
Test Description: No results handling
Input Data: Type "xyzxyzxyz"
Expected Output: "No matching patient found"
Actual Output: "No matching patient found"
Pass/Fail: PASS 

-------------------------------------------

Written by: Sinqobile
Run by: Nomathemba
Date: 2026-10-05
Feature: F4 — Appointment Booking
TCID: TCID4.1
Test Description: Book valid appointment
Input Data: Registered patient + doctor + future date + time
Expected Output: "Appointment booked successfully"
Actual Output: Booked successfully
Pass/Fail: PASS 

Written by: Sinqobile
Run by: Nomathemba
Date: 2026-10-05
Feature: F4 — Appointment Booking
TCID: TCID4.2
Test Description: Book with past date
Input Data: Date = last year (e.g. 2024/09/14)
Expected Output: Reject past dates
Actual Output: Accepted as "Appointment booked successfully"
Pass/Fail: FAIL 

Written by: Sinqobile
Run by: Nomathemba
Date: 2026-10-05
Feature: F4 — Appointment Booking
TCID: TCID4.3
Test Description: Double-booking same doctor and time
Input Data: Patient A + Patient B, same doctor, same time
Expected Output: Reject 2nd booking (NFR08)
Actual Output: Both bookings succeeded
Pass/Fail: FAIL  (CRITICAL)

-------------------------------------------

Written by: Sinqobile
Run by: Nomathemba
Date: 2026-10-05
Feature: F5 — Appointment Management
TCID: TCID5.1
Test Description: Booked appointment appears in list
Input Data: Book appointment, open Appointment Management
Expected Output: Appointment visible in list
Actual Output: Missing from list
Pass/Fail: FAIL 

Written by: Sinqobile
Run by: Nomathemba
Date: 2026-10-05
Feature: F5 — Appointment Management
TCID: TCID5.2
Test Description: Cancel appointment requires reason
Input Data: Click Cancel without entering reason
Expected Output: Block submission, require reason
Actual Output: NOT TESTED
Pass/Fail: NOT TESTED


===========================================
TEST SUMMARY
===========================================

Total test cases run: 15
Passed: 9
Failed: 5
Not tested: 1


===========================================
BUGS FOUND
===========================================

BUG #1 (HIGH) — Booked appointment not appearing in Appointment Management list.
BUG #2 (HIGH) — Past dates accepted for appointments and reschedules.
BUG #3 (CRITICAL) — Double-booking allowed (violates NFR08).
BUG #4 (MEDIUM) — Invalid SA ID accepted (letters allowed).
BUG #5 (MEDIUM) — Invalid birth year accepted (0000).