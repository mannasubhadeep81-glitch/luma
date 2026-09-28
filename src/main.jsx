import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Ambulance, CalendarDays, ChevronRight, FlaskConical, HeartPulse, MapPin, Pill, ShieldPlus, Stethoscope, UserRound, LogIn, X } from 'lucide-react';
import './styles.css';
import { lumiraAuth, lumiraBookings, lumiraDoctors, lumiraSOS } from './lib/lumira-backend';

const departments = ['General Medicine','Cardiology','Neurology','Orthopaedics','Paediatrics','Gynaecology & Obstetrics','Dermatology','ENT','Ophthalmology','Psychiatry','Nephrology','Gastroenterology'];

function App() {
  const [mode, setMode] = useState('patient');
  const [active, setActive] = useState('home');
  const [sos, setSos] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [session, setSession] = useState(() => lumiraAuth.session());
  const [notice, setNotice] = useState('');

  const providers = [
    { id: 'doctor-ananya', name: 'Dr. Ananya Sen', dept: 'General Medicine', rating: '4.9', online: true },
    { id: 'doctor-arjun', name: 'Dr. Arjun Roy', dept: 'Cardiology', rating: '4.8', online: true },
    { id: 'doctor-meera', name: 'Dr. Meera Das', dept: 'Paediatrics', rating: '4.9', online: false }
  ];

  const requestOtp = () => {
    try { lumiraAuth.requestOtp(mobile); setOtpSent(true); setNotice('Demo OTP step ready. Enter any non-empty OTP for the MVP demo.'); }
    catch (e) { setNotice(e.message); }
  };

  const verifyOtp = () => {
    try {
      const user = lumiraAuth.verifyOtp(mobile, otp, mode);
      setSession(user); setLoginOpen(false); setOtpSent(false); setOtp(''); setNotice('Signed in to LUMIRA.');
    } catch (e) { setNotice(e.message); }
  };

  const sendSOS = () => {
    try {
      const user = session || lumiraAuth.verifyOtp('demo-patient', 'demo', 'patient');
      if (!session) setSession(user);
      lumiraSOS.create({ patientId: user.id, service: 'doctor' });
      setSos(false); setNotice('SOS request created in the MVP demo. Production dispatch requires a secure backend.');
    } catch (e) { setNotice(e.message); }
  };

  const bookDoctor = (doctor) => {
    try {
      const user = session || lumiraAuth.verifyOtp('demo-patient', 'demo', 'patient');
      if (!session) setSession(user);
      const booking = lumiraBookings.create({ patientId: user.id, doctorId: doctor.id, date: new Date().toISOString().slice(0, 10), time: '10:00', mode: 'virtual' });
      setNotice(`Booking request created for ${doctor.name}. ID: ${booking.id.slice(0, 8)}`);
    } catch (e) { setNotice(e.message); }
  };

  return (
    <div className="app">
      <div className="watermark">LUMIRA</div>
      <header className="topbar">
        <div className="brand"><div className="brand-mark">L</div><div><strong>LUMIRA</strong><span>Healthcare Door to Door</span></div></div>
        <div className="role-switch">
          <button className={mode === 'patient' ? 'active' : ''} onClick={() => setMode('patient')}><UserRound size={16}/> Patient</button>
          <button className={mode === 'doctor' ? 'active' : ''} onClick={() => setMode('doctor')}><Stethoscope size={16}/> Doctor</button>
        </div>
        <button className="login-btn" onClick={() => setLoginOpen(true)}><LogIn size={16}/> {session ? 'Account' : 'Login'}</button>
      </header>

      {notice && <div className="notice">{notice}<button onClick={() => setNotice('')}><X size={15}/></button></div>}

      <main>
        {active === 'home' && (
          <>
            <section className="hero">
              <div>
                <p className="eyebrow">ONE STEP TOWARDS HUMANITY</p>
                <h1>{mode === 'patient' ? 'Care that comes closer.' : 'Your healthcare command centre.'}</h1>
                <p className="hero-copy">{mode === 'patient' ? 'Find trusted healthcare, emergency help, diagnostics and medicines from one calm, connected place.' : 'Manage availability, consultations, home visits and patient requests from one connected workspace.'}</p>
              </div>
              <div className="location"><MapPin size={17}/> Kolkata region <span className="pulse"/></div>
            </section>

            <section className="mode-grid">
              <button className="care-card sos" onClick={() => setSos(true)}><div className="icon"><ShieldPlus/></div><div><h2>SOS Pulse</h2><p>Emergency help nearby</p></div><ChevronRight/></button>
              <button className="care-card virtual"><div className="icon"><HeartPulse/></div><div><h2>Virtual Care</h2><p>Consult online</p></div><ChevronRight/></button>
              <button className="care-card doorstep"><div className="icon"><MapPin/></div><div><h2>Doorstep Care</h2><p>Healthcare at home</p></div><ChevronRight/></button>
            </section>

            {mode === 'patient' ? <>
              <section className="section-head"><div><p className="eyebrow">HEALERS' ATLAS</p><h2>Find a specialist</h2></div><button className="text-btn">View all</button></section>
              <div className="departments">{departments.map(d => <button key={d}>{d}</button>)}</div>
              <section className="section-head"><div><p className="eyebrow">NEARBY CARE</p><h2>Available doctors</h2></div></section>
              <div className="provider-list">{providers.map(p => <article className="provider" key={p.id}><div className="avatar">{p.name.split(' ').slice(-1)[0][0]}</div><div className="provider-info"><strong>{p.name}</strong><span>{p.dept}</span><small>★ {p.rating} · {p.online ? 'Online now' : 'Offline'}</small></div><button className="book" onClick={() => bookDoctor(p)}>Book</button></article>)}</div>
              <div className="quick-services"><div><Pill/><span>Pharmacy</span></div><div><FlaskConical/><span>Lab & Diagnostics</span></div><div><Ambulance/><span>Ambulance</span></div><div><CalendarDays/><span>Appointments</span></div></div>
            </> : <DoctorDashboard />}
          </>
        )}

        {active !== 'home' && <div className="placeholder"><h2>{active === 'about' ? 'About LUMIRA' : 'Profile'}</h2><p>One Step Towards Humanity. This section is part of the LUMIRA foundation and will be expanded in the next build phase.</p></div>}
      </main>

      <nav className="bottom-nav"><button className={active==='home'?'selected':''} onClick={() => setActive('home')}><HeartPulse/><span>Home</span></button><button onClick={() => setActive('profile')}><UserRound/><span>Profile</span></button><button onClick={() => setActive('about')}><ShieldPlus/><span>About</span></button></nav>

      {sos && <div className="modal-backdrop"><div className="sos-modal"><div className="sos-symbol"><ShieldPlus/></div><h2>Emergency help</h2><p>Your SOS request is ready to connect you with nearby emergency services.</p><button className="confirm-sos" onClick={sendSOS}>Request nearby help</button><button className="cancel" onClick={() => setSos(false)}>Cancel</button></div></div>}

      {loginOpen && <div className="modal-backdrop"><div className="login-modal"><button className="close-modal" onClick={() => setLoginOpen(false)}><X/></button><p className="eyebrow">LUMIRA ACCESS</p><h2>Sign in securely</h2><p>Mobile number + OTP</p><input inputMode="tel" placeholder="Mobile number" value={mobile} onChange={e => setMobile(e.target.value)} />{otpSent && <input inputMode="numeric" placeholder="OTP" value={otp} onChange={e => setOtp(e.target.value)} />}<button className="confirm-sos" onClick={otpSent ? verifyOtp : requestOtp}>{otpSent ? 'Verify OTP' : 'Send OTP'}</button><small>Demo mode: real OTP delivery will be connected through the production authentication provider.</small></div></div>}
    </div>
  );
}

function DoctorDashboard() {
  return <>
    <section className="section-head"><div><p className="eyebrow">HEALERS' COMMAND</p><h2>Today's overview</h2></div></section>
    <div className="stats"><div><strong>08</strong><span>Appointments</span></div><div><strong>03</strong><span>Home visits</span></div><div><strong>02</strong><span>Pending requests</span></div></div>
    <div className="doctor-panel"><h3>Availability</h3><div className="availability"><span className="status-dot"/> Available for virtual consultation <button>Manage</button></div><div className="availability"><span className="status-dot green"/> Doorstep service active <button>Manage</button></div></div>
  </>;
}

createRoot(document.getElementById('root')).render(<App />);
