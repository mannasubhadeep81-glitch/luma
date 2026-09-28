# LUMIRA Backend MVP

## Current scope
- Mobile/OTP authentication interface
- Patient and doctor roles
- Doctor verification workflow (`pending` by default)
- Doctor directory data layer
- Appointment request data layer
- SOS request data layer
- Medical department catalogue

## Important security boundary
The current service layer is a frontend development stub using browser storage. It is **not** suitable for real patient data, real OTP delivery, medical records, payments, or emergency dispatch.

## Production replacement
Connect the same service interfaces to a secure backend such as Firebase, Supabase, or a custom API. OTP verification, identity verification, authorization, encryption, audit logging, database rules, location handling, and emergency workflows must be server-side.

## Recommended production tables
- users
- patient_profiles
- doctor_profiles
- professional_verifications
- departments
- availability
- appointments
- sos_requests
- responders
- locations
- prescriptions
- lab_orders
- lab_reports
- pharmacies
- ambulances
- nursing_homes
- referrals
- ratings
- notifications
- audit_logs
