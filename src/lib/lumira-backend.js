// LUMIRA MVP backend-ready service layer.
// This keeps authentication, provider verification, booking and SOS logic
// behind a small API surface so a real backend (Firebase/Supabase/custom API)
// can be connected without rewriting the UI.

const STORAGE_KEYS = {
  session: 'lumira.session',
  users: 'lumira.users',
  doctors: 'lumira.doctors',
  bookings: 'lumira.bookings',
  sos: 'lumira.sos',
};

const read = (key, fallback = []) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));

export const lumiraAuth = {
  requestOtp(mobile) {
    if (!mobile || mobile.replace(/\D/g, '').length < 10) {
      throw new Error('Enter a valid mobile number.');
    }
    // Demo only: real OTP must be generated and verified server-side.
    return { success: true, mobile, demo: true };
  },

  verifyOtp(mobile, otp, role = 'patient') {
    if (!mobile || !otp) throw new Error('Mobile number and OTP are required.');
    const users = read(STORAGE_KEYS.users);
    const user = {
      id: crypto.randomUUID(),
      mobile,
      role,
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    write(STORAGE_KEYS.users, users);
    write(STORAGE_KEYS.session, user);
    return user;
  },

  session() {
    return read(STORAGE_KEYS.session, null);
  },

  logout() {
    localStorage.removeItem(STORAGE_KEYS.session);
  },
};

export const lumiraDoctors = {
  list() {
    return read(STORAGE_KEYS.doctors);
  },

  submitVerification(profile) {
    const doctors = read(STORAGE_KEYS.doctors);
    const doctor = {
      ...profile,
      id: crypto.randomUUID(),
      verificationStatus: 'pending',
      createdAt: new Date().toISOString(),
    };
    doctors.push(doctor);
    write(STORAGE_KEYS.doctors, doctors);
    return doctor;
  },
};

export const lumiraBookings = {
  create({ patientId, doctorId, date, time, mode = 'virtual' }) {
    if (!patientId || !doctorId || !date || !time) {
      throw new Error('Patient, doctor, date and time are required.');
    }
    const bookings = read(STORAGE_KEYS.bookings);
    const booking = {
      id: crypto.randomUUID(),
      patientId,
      doctorId,
      date,
      time,
      mode,
      status: 'requested',
      createdAt: new Date().toISOString(),
    };
    bookings.push(booking);
    write(STORAGE_KEYS.bookings, bookings);
    return booking;
  },

  listForUser(userId) {
    return read(STORAGE_KEYS.bookings).filter(
      (booking) => booking.patientId === userId || booking.doctorId === userId,
    );
  },
};

export const lumiraSOS = {
  create({ patientId, latitude, longitude, service = 'doctor' }) {
    if (!patientId) throw new Error('Patient session is required.');
    const requests = read(STORAGE_KEYS.sos);
    const request = {
      id: crypto.randomUUID(),
      patientId,
      latitude,
      longitude,
      service,
      status: 'broadcasting',
      createdAt: new Date().toISOString(),
    };
    requests.push(request);
    write(STORAGE_KEYS.sos, requests);
    return request;
  },
};
