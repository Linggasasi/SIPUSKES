import { useEffect, useRef, useState } from 'react'
import {
  Activity, ArrowRight, BedDouble, Bell, CalendarDays, Check, CheckCircle2, CreditCard,
  ChevronDown, ChevronRight, Clock3, FileText, HeartPulse, Hospital, LayoutDashboard,
  LockKeyhole, MapPin, Menu, MessageCircle, Pill, Plus, Search, Settings,
  ShieldCheck, Siren, Stethoscope, Ticket, UserRound, UsersRound, Video, X, Eye, EyeOff,
} from 'lucide-react'
import './App.css'
import './PatientDashboard.css'
import './AuthLanding.css'
import { FacilitiesScreen, PharmacyScreen, ReferralScreen } from './ServicePages.jsx'

const KEY = 'sipuskes-demo-v2'
const LEGACY_KEY = 'sipuskes-demo-v1'
const DEMO_DOCTOR_EMAIL = 'dokter@puskesmas.local'
const makeRoomName = (memberId) => `SIPUSKES-Konsultasi-${String(memberId || '').replace(/\s/g, '') || 'DemoPasien'}`
const GENDERS = ['Perempuan', 'Laki-laki']
const clinics = [
  ['Poli Umum', Stethoscope, 'Pemeriksaan umum'],
  ['Poli Lansia & Disabilitas', HeartPulse, 'Layanan prioritas'],
  ['Poli KB (Keluarga Berencana)', UsersRound, 'Konsultasi keluarga berencana'],
  ['Poli Gigi dan Mulut', Activity, 'Pemeriksaan gigi'],
  ['Poli Anak / MTBS', HeartPulse, 'Manajemen terpadu balita sakit'],
  ['Poli KIA', Plus, 'Kesehatan ibu dan anak'], ['Poli Gizi', Activity, 'Konsultasi gizi'],
  ['Poli Konseling', MessageCircle, 'Kesehatan mental'],
]
const doctors = [
  ['dr. Aditya Pratama', 'Poli Umum', '08.00–12.00', 'Berpraktik'],
  ['drg. Nabila Putri', 'Poli Gigi dan Mulut', '09.00–13.00', 'Berpraktik'],
  ['dr. Ratih Kusuma', 'Poli KIA', '08.00–11.00', 'Berpraktik'],
  ['Ns. Maya Sari', 'Poli Lansia & Disabilitas', '10.00–14.00', 'Segera'],
]
const medicines = [['Paracetamol 500 mg', 128, 'Analgesik'], ['Amoxicillin 500 mg', 64, 'Antibiotik'], ['Oralit', 18, 'Rehidrasi'], ['Vitamin C 500 mg', 7, 'Suplemen']]
const hospitals = ['Rumah Sakit Universitas Indonesia (RSUI)', 'RS Puri Cinere', 'RS Primaya Depok', 'RS Permata Depok', 'RSU Bunda Margonda', 'RSUD Khidmat Sehat Afiat (KiSA)', 'RSU Bhakti Yudha', 'RS Bhayangkara Brimob', 'Brawijaya Hospital Depok']
const seed = {
  role: 'patient',
  profile: { name: 'Siti Nurbaya', phone: '0812 3456 7890', address: 'Jl. Margonda Raya, Beji, Depok', birthDate: '1994-06-18', gender: 'Perempuan', blood: 'O+', emergency: '0813 9988 7766', economy: 'subsidi', memberId: '00020268492', uniqueKey: 'KEY-9F8A-7C2B', pinHash: 'ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f' },
  ticket: { clinic: 'Poli Umum', unit: 'Pemeriksaan umum', number: 'A-018', ahead: 2, wait: 20, arrival: '09:30', day: 'today', doctor: 'dr. Aditya Pratama', complaint: 'Batuk dan pilek' },
  availability: {
    today: { 'dr. Aditya Pratama': true, 'drg. Nabila Putri': true, 'dr. Ratih Kusuma': true, 'Ns. Maya Sari': false },
    tomorrow: { 'dr. Aditya Pratama': true, 'drg. Nabila Putri': false, 'dr. Ratih Kusuma': true, 'Ns. Maya Sari': true },
  },
  appointments: [{ number: 'A-018', patient: 'Siti Nurbaya', memberId: '00020268492', clinic: 'Poli Umum', doctor: 'dr. Aditya Pratama', day: 'today', arrival: '09:30', complaint: 'Batuk dan pilek', status: 'Menunggu' }],
  virtualConsultations: [],
  visits: [{ date: '12 Okt 2026', clinic: 'Poli Umum', diagnosis: 'ISPA ringan', doctor: 'dr. Aditya Pratama' }, { date: '04 Agu 2026', clinic: 'Poli Umum', diagnosis: 'Pemeriksaan rutin', doctor: 'dr. Aditya Pratama' }, { date: '19 Mei 2026', clinic: 'Poli Gizi', diagnosis: 'Konsultasi gizi', doctor: 'Ns. Maya Sari' }],
  screening: { complaint: 'Batuk dan pilek sejak kemarin', history: 'Tidak ada alergi yang diketahui', submitted: true },
}
const emptyProfile = {
  name: '', phone: '', address: '', birthDate: '', gender: '', blood: '', emergency: '',
  economy: 'subsidi', memberId: '', uniqueKey: '', pinHash: '',
}
const normalizeAccount = (account = {}) => {
  const profile = { ...emptyProfile, ...account.profile }
  const memberId = String(profile.memberId || account.id || '')
  return {
    id: String(account.id || memberId),
    profile: { ...profile, memberId },
    ticket: account.ticket ? { ...account.ticket, memberId: account.ticket.memberId || memberId } : null,
    appointments: (Array.isArray(account.appointments) ? account.appointments : []).map((item) => ({ ...item, memberId: item.memberId || memberId })),
    virtualConsultations: (Array.isArray(account.virtualConsultations) ? account.virtualConsultations : []).map((item) => ({ ...item, accountId: item.accountId || String(account.id || memberId), memberId: item.memberId || memberId })),
    visits: (Array.isArray(account.visits) ? account.visits : []).map((item) => ({ ...item, memberId: item.memberId || memberId })),
    screening: { ...(account.screening || { complaint: '', history: '', submitted: false }), memberId },
  }
}
const makeDemoAccount = () => normalizeAccount({
  id: seed.profile.memberId,
  profile: seed.profile,
  ticket: seed.ticket,
  appointments: seed.appointments,
  virtualConsultations: seed.virtualConsultations,
  visits: seed.visits,
  screening: seed.screening,
})
const signedOutSession = () => ({ loggedIn: false, role: null, accountId: null })
const readData = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY) || 'null')
    if (stored && Array.isArray(stored.accounts)) {
      const accounts = stored.accounts.map(normalizeAccount).filter((account) => account.id)
      const candidateSession = stored.session || signedOutSession()
      const validRole = ['patient', 'admin', 'doctor'].includes(candidateSession.role)
      const patientSessionValid = candidateSession.role !== 'patient' || accounts.some((account) => account.id === candidateSession.accountId)
      const session = candidateSession.loggedIn && validRole && patientSessionValid
        ? candidateSession
        : signedOutSession()
      return { accounts: accounts.length ? accounts : [makeDemoAccount()], session, availability: stored.availability || seed.availability }
    }

    const legacy = JSON.parse(localStorage.getItem(LEGACY_KEY) || 'null')
    const legacyAccount = legacy?.profile
      ? normalizeAccount({
        id: legacy.profile.memberId,
        profile: { ...seed.profile, ...legacy.profile },
        ticket: legacy.ticket || seed.ticket,
        appointments: legacy.appointments || seed.appointments,
        virtualConsultations: legacy.virtualConsultations || [],
        visits: legacy.visits || seed.visits,
        screening: legacy.screening || seed.screening,
      })
      : makeDemoAccount()
    return { accounts: [legacyAccount], session: signedOutSession(), availability: legacy?.availability || seed.availability }
  } catch {
    return { accounts: [makeDemoAccount()], session: signedOutSession(), availability: seed.availability }
  }
}
const hashPin = async (pin) => { const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pin)); return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, '0')).join('') }
const randomInt = (max) => crypto.getRandomValues(new Uint32Array(1))[0] % max
const dateText = () => new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())
const greeting = () => {
  const hour = new Date().getHours()
  if (hour >= 4 && hour < 11) return 'Pagi'
  if (hour < 15 && hour >= 11) return 'Siang'
  if (hour < 18 && hour >= 15) return 'Sore'
  return 'Malam'
}
const honorific = (gender) => gender === 'Laki-laki' ? 'Bapak' : gender === 'Perempuan' ? 'Ibu' : ''

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'
const WS_BASE = import.meta.env.VITE_WS_BASE_URL || (window.location.protocol === 'https:' ? 'wss:' : 'ws:') + '//' + window.location.host

async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, options)
  let payload
  try { payload = await response.json() } catch { payload = null }
  if (!response.ok) throw new Error(payload && payload.error ? payload.error : `HTTP ${response.status}`)
  return payload
}

function Modal({ title, close, children, wide = false }) {
  useEffect(() => { const keydown = (event) => event.key === 'Escape' && close(); window.addEventListener('keydown', keydown); return () => window.removeEventListener('keydown', keydown) }, [close])
  return <div className="backdrop" onMouseDown={(event) => event.target === event.currentTarget && close()}><section className={`modal ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}><header className="modal-head"><div><small>SIPUSKES DEPOK</small><h2>{title}</h2></div><button className="icon-button" aria-label="Tutup" onClick={close}><X size={18} /></button></header>{children}</section></div>
}
function PinField({ label, name, visible, toggle, required = true }) {
  return <label className="pin-field">{label}<span><input aria-label={label} name={name} type={visible ? 'text' : 'password'} inputMode="numeric" pattern="[0-9]{8}" minLength="8" maxLength="8" autoComplete="new-password" placeholder="8 digit angka" required={required} /><button type="button" onClick={toggle} aria-label={visible ? 'Sembunyikan PIN' : 'Tampilkan PIN'}>{visible ? <EyeOff size={15} /> : <Eye size={15} />}</button></span></label>
}
function LoginForm({ authRole, setAuthRole, authMode, setAuthMode, showPin, setShowPin, authError, onSubmit, showRoleSelect = false }) {
  return <form className="form-stack auth-form" onSubmit={onSubmit}>
    {showRoleSelect && <label>Jenis akun<select value={authRole} onChange={(event) => { setAuthRole(event.target.value); }}><option value="admin">Admin Puskesmas</option><option value="doctor">Dokter</option></select></label>}
    {authRole === 'patient' ? <>
      <label>Nomor telepon / nomor peserta<input name="identifier" required autoComplete="username" placeholder="0812… atau 00020268492" /></label>
      <label>{authMode === 'key' ? 'Kunci unik pasien' : 'PIN keamanan'}<span className="login-pin"><input aria-label={authMode === 'key' ? 'Kunci unik pasien' : 'PIN keamanan'} name="secret" type={authMode === 'key' || showPin ? 'text' : 'password'} required inputMode="numeric" autoComplete="current-password" /><button type="button" onClick={() => setShowPin(!showPin)} aria-label={showPin ? 'Sembunyikan PIN' : 'Tampilkan PIN'}>{showPin ? <EyeOff size={15} /> : <Eye size={15} />}</button></span></label>
      <button type="button" className="text-link auth-link" onClick={() => setAuthMode(authMode === 'key' ? 'pin' : 'key')}>{authMode === 'key' ? 'Kembali masuk dengan PIN' : 'Lupa PIN? Gunakan kunci unik'}</button>
    </> : <>
      <label>Email akun<input name="identifier" type="email" required autoComplete="username" placeholder={authRole === 'admin' ? 'admin@puskesmas.local' : 'dokter@puskesmas.local'} /></label>
      <PinField label="PIN petugas" name="secret" visible={showPin} toggle={() => setShowPin(!showPin)} />
    </>}
    {authError && <p className="form-error" role="alert">{authError}</p>}
    <button className="button primary full-button">Masuk</button>
  </form>
}
function RegisterForm({ showPin, setShowPin, pinStatus, onSubmit }) {
  return <form className="form-stack auth-form" onSubmit={onSubmit}>
    <div className="form-grid"><label>Nama lengkap<input name="name" required autoComplete="name" /></label><label>Nomor telepon<input name="phone" required inputMode="tel" autoComplete="tel" placeholder="08xxxxxxxxxx" /></label><label className="span-two">Alamat<input name="address" required autoComplete="street-address" /></label><label>Tanggal lahir<input name="birthDate" type="date" required /></label><label>Jenis kelamin<select name="gender" required defaultValue=""><option value="">Pilih</option>{GENDERS.map((gender) => <option key={gender} value={gender}>{gender}</option>)}</select></label><label>Golongan darah<select name="blood" required defaultValue=""><option value="">Pilih</option>{['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Tidak tahu'].map((value) => <option key={value} value={value}>{value}</option>)}</select></label><label>Kontak darurat<input name="emergency" required inputMode="tel" /></label></div>
    <fieldset className="economy-choice"><legend>Pilih skema layanan</legend><label><input type="radio" name="economy" value="subsidi" defaultChecked /><span><b>Subsidi penuh</b><small>Dukungan layanan tanpa iuran bulanan, biaya berobat Rp 0.</small></span><i /></label><label><input type="radio" name="economy" value="mandiri" /><span><b>Layanan mandiri / reguler</b><small>Pembayaran transparan langsung di loket saat menerima layanan.</small></span><i /></label></fieldset>
    <div className="pin-fields"><PinField label="PIN keamanan (8 angka)" name="pin" visible={showPin} toggle={() => setShowPin(!showPin)} /><PinField label="Ulangi PIN keamanan" name="pinConfirmation" visible={showPin} toggle={() => setShowPin(!showPin)} /></div>
    {pinStatus && <p className={pinStatus.startsWith('Akun siap') ? 'form-success' : 'form-error'} role="status">{pinStatus}</p>}
    <button className="button primary full-button">Buat akun & kartu pasien</button>
    <p className="privacy-note"><LockKeyhole size={12} /> Tidak meminta NIK. Data demo disimpan pada browser ini.</p>
  </form>
}
function AuthLanding({ tab, setTab, authRole, setAuthRole, authMode, setAuthMode, showPin, setShowPin, authError, setAuthError, pinStatus, setPinStatus, onLogin, onRegister }) {
  const selectTab = (nextTab) => {
    setTab(nextTab); setAuthError(''); setPinStatus(''); setAuthMode('pin')
    if (nextTab === 'patient') setAuthRole('patient')
    if (nextTab === 'staff') setAuthRole('admin')
  }
  return <div className="auth-screen">
    <header className="auth-brand"><span className="brand-logo"><Hospital size={20} /></span><span><b>SIPUSKES Depok</b><small>UPTD PKM BEJI · KOTA DEPOK</small></span><span className="open-badge"><i /> Siaga 24 Jam</span></header>
    <main className="auth-layout"><section className="auth-intro"><span className="auth-accreditation"><ShieldCheck size={14} /> Puskesmas Terakreditasi Paripurna</span><h1>Layanan kesehatan<br />Depok, lebih dekat.</h1><p>Akses antrean, rekam medis, resep, dan layanan Puskesmas Beji dalam satu portal.</p><div className="auth-service-hours"><Clock3 size={15} /><span><b>Layanan gawat darurat 119</b><small>Siaga 24 jam untuk kondisi darurat medis.</small></span></div></section>
      <section className="auth-panel"><div className="auth-tabs" role="tablist" aria-label="Jenis akses"><button role="tab" aria-selected={tab === 'patient'} className={tab === 'patient' ? 'active' : ''} onClick={() => selectTab('patient')}>Masuk Pasien</button><button role="tab" aria-selected={tab === 'staff'} className={tab === 'staff' ? 'active' : ''} onClick={() => selectTab('staff')}>Masuk Petugas</button><button role="tab" aria-selected={tab === 'register'} className={tab === 'register' ? 'active' : ''} onClick={() => selectTab('register')}>Daftar Akun Baru</button></div>
        {tab === 'register' ? <><header className="auth-panel-title"><h2>Daftar akun pasien</h2><p>Isi data dasar untuk membuat kartu pasien digital.</p></header><RegisterForm showPin={showPin} setShowPin={setShowPin} pinStatus={pinStatus} onSubmit={onRegister} /></> : <><header className="auth-panel-title"><h2>{tab === 'staff' ? 'Masuk portal petugas' : `Selamat ${greeting()}, silakan masuk`}</h2><p>{tab === 'staff' ? 'Pilih jenis akun admin atau dokter.' : 'Masuk dengan nomor telepon dan PIN pasien.'}</p></header><LoginForm authRole={authRole} setAuthRole={setAuthRole} authMode={authMode} setAuthMode={setAuthMode} showPin={showPin} setShowPin={setShowPin} authError={authError} onSubmit={onLogin} showRoleSelect={tab === 'staff'} /></>}
      </section></main>
    <footer className="auth-footer">SIPUSKES Depok · Data demo tersimpan lokal pada perangkat ini.</footer>
  </div>
}
function PatientCard({ profile, compact = true }) {
  const memberNumber = profile.memberId.replace(/(\d{4})(\d{4})(\d{3})/, '$1 $2 $3')
  return <article className={`patient-card ${compact ? 'patient-card-compact' : ''}`}><Plus className="card-watermark" size={155} strokeWidth={8} aria-hidden="true" /><header><span className="card-logo"><Hospital size={18} /></span><span><b>{compact ? 'KOTA DEPOK · PUSKESMAS DIGITAL' : 'PUSKESMAS KOTA DEPOK'}</b><small>{compact ? 'KARTU IDENTITAS PASIEN' : 'KARTU PASIEN DIGITAL'}</small></span><ShieldCheck size={19} /></header>{compact ? <><div className="compact-card-name"><small>NAMA PASIEN</small><b>{profile.name.toUpperCase()}</b></div><div className="card-member compact-card-member"><small>NOMOR REKAM MEDIS (ID PESERTA)</small><strong>{memberNumber}</strong></div><footer><span><small>SECURITY KEY</small><b>{profile.uniqueKey}</b></span><i>{profile.economy === 'subsidi' ? 'Subsidi Penuh · Bebas Biaya Rp 0' : 'Mandiri · Reguler'}</i></footer></> : <><div className="card-member"><small>NOMOR PESERTA</small><strong>{profile.memberId}</strong></div><div className="card-person"><span><small>NAMA PASIEN</small><b>{profile.name}</b></span><span><small>TANGGAL LAHIR</small><b>{profile.birthDate ? new Date(`${profile.birthDate}T00:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</b></span></div><div className="card-address"><small>ALAMAT</small><b>{profile.address}</b></div><footer><span>{profile.economy === 'subsidi' ? 'SUBSIDI PENUH · BEBAS BIAYA' : 'MANDIRI · REGULER'}</span><span>{profile.uniqueKey}</span></footer></>}</article>
}
function JitsiRoom({ room, name }) {
  const target = useRef(null); const [failed, setFailed] = useState(false)
  useEffect(() => {
    let api; let active = true
    const timeout = window.setTimeout(() => setFailed(true), 12000)
    const start = () => {
      if (!active || !target.current) return
      if (!window.JitsiMeetExternalAPI) { setFailed(true); return }
      const rect = target.current.getBoundingClientRect()
      if (rect.width <= 0 || rect.height <= 0) { setFailed(true); return }
      api = new window.JitsiMeetExternalAPI('meet.jit.si', { roomName: room, parentNode: target.current, width: '100%', height: '100%', userInfo: { displayName: name }, configOverwrite: { prejoinPageEnabled: true, startWithAudioMuted: true }, interfaceConfigOverwrite: { SHOW_JITSI_WATERMARK: false, MOBILE_APP_PROMO: false } })
      api.addListener?.('videoConferenceJoined', () => { if (active) { window.clearTimeout(timeout); setFailed(false) } })
      api.addListener?.('errorOccurred', () => { if (active) setFailed(true) })
    }
    if (window.JitsiMeetExternalAPI) { start() }
    else {
      const script = document.querySelector('script[src="https://meet.jit.si/external_api.js"]')
      if (script && script.readyState === 'loaded') { start() }
      else { script?.addEventListener('load', start, { once: true }); script?.addEventListener('error', () => setFailed(true), { once: true }) }
    }
    return () => { active = false; window.clearTimeout(timeout); api?.dispose() }
  }, [room, name])
  return <div className="jitsi-room" ref={target} style={{ position: 'relative' }}>{failed && <div className="jitsi-error"><Video size={27} /><b>Jitsi belum terhubung</b><span>Jika layar tetap kosong, browser atau jaringan mungkin memblokir iframe.</span><a href={`https://meet.jit.si/${room}`} target="_blank" rel="noreferrer">Buka ruang di tab baru <ArrowRight size={13} /></a></div>}</div>
}

function App() {
  const [store, setStore] = useState(readData); const [page, setPage] = useState(() => store.session.loggedIn ? (store.session.role === 'admin' ? 'Dasbor admin' : store.session.role === 'doctor' ? 'Dasbor dokter' : 'Beranda') : 'Beranda'); const [modal, setModal] = useState('')
  const [notice, setNotice] = useState(''); const [notifications, setNotifications] = useState(false); const [mobileNav, setMobileNav] = useState(false)
  const [query, setQuery] = useState(''); const [queueForm, setQueueForm] = useState({ clinic: clinics[0][0], day: 'today', arrival: '09:00', doctor: doctors[0][0], complaint: '' })
  const [authMode, setAuthMode] = useState('pin'); const [authRole, setAuthRole] = useState('patient'); const [authError, setAuthError] = useState(''); const [pinStatus, setPinStatus] = useState(''); const [showPin, setShowPin] = useState(false)
  const [landingTab, setLandingTab] = useState('patient')
  const [sharedConsultations, setSharedConsultations] = useState([])
  const [realtimeStatus, setRealtimeStatus] = useState('connecting')
  const [alarm, setAlarm] = useState(false); const [room, setRoom] = useState('sipuskes-konsultasi-ruang-018'); const [currentConsultation, setCurrentConsultation] = useState(null); const [referral, setReferral] = useState('')
  const session = store.session
  const role = session.loggedIn ? session.role : 'patient'
  const activeAccount = role === 'patient' ? store.accounts.find((account) => account.id === session.accountId) : null
  const staffProfile = role === 'doctor'
    ? { ...emptyProfile, name: 'dr. Aditya Pratama', memberId: 'STAFF-DOKTER' }
    : { ...emptyProfile, name: 'Admin PKM Beji', memberId: 'STAFF-ADMIN' }
  const profile = activeAccount?.profile || (session.loggedIn ? staffProfile : seed.profile)
  const emptyTicket = { clinic: 'Belum ada antrean', unit: 'Pilih poli untuk mendaftar', number: '—', ahead: 0, wait: 0, arrival: '--:--', day: 'today', doctor: '', complaint: '' }
  const patientAccounts = store.accounts
  const data = {
    role,
    profile,
    ticket: activeAccount?.ticket || emptyTicket,
    screening: activeAccount?.screening || { complaint: '', history: '', submitted: false },
    visits: activeAccount?.visits || [],
    availability: store.availability,
    appointments: role === 'patient' ? (activeAccount?.appointments || []) : patientAccounts.flatMap((account) => account.appointments),
    virtualConsultations: role === 'patient' ? (activeAccount?.virtualConsultations || []) : patientAccounts.flatMap((account) => account.virtualConsultations),
  }
  const consultations = role === 'doctor' ? sharedConsultations : data.virtualConsultations
  const ticket = data.ticket
  const screening = data.screening
  const clinic = clinics.find(([name]) => name === queueForm.clinic) || clinics[0]; const ClinicIcon = clinic[1]
  const availableDoctors = doctors.filter(([name]) => store.availability[queueForm.day]?.[name])
  const visits = data.visits.filter((visit) => `${visit.clinic} ${visit.diagnosis} ${visit.doctor}`.toLowerCase().includes(query.toLowerCase()))
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(store)) }, [store])
  useEffect(() => { if (!notice) return undefined; const timer = setTimeout(() => setNotice(''), 3500); return () => clearTimeout(timer) }, [notice])
  const toast = (text) => { setNotice(text); setNotifications(false) }
  useEffect(() => {
    if (!session.loggedIn || role !== 'doctor') return undefined
    let active = true
    let firstLoad = true
    const known = new Set()
    const poll = async () => {
      try {
        const payload = await apiFetch('/consultations')
        if (!active) return
        const list = payload?.consultations || []
        setSharedConsultations(list)
        setRealtimeStatus('connected')
        const fresh = list.filter((item) => item.status === 'Menunggu dokter' && !known.has(item.id))
        list.forEach((item) => known.add(item.id))
        if (!firstLoad && fresh.length) toast(`Permintaan konsultasi baru dari ${fresh[0].patient}.`)
        firstLoad = false
      } catch { if (active) setRealtimeStatus('offline') }
    }
    poll()
    const timer = window.setInterval(poll, 3000)
    return () => { active = false; window.clearInterval(timer) }
  }, [session.loggedIn, role])

  const updatePatientAccount = (update, accountId = session.accountId) => {
    if (!accountId) return
    setStore((current) => ({ ...current, accounts: current.accounts.map((account) => account.id === accountId ? update(account) : account) }))
  }
  const signOut = (nextTab = 'patient') => {
    setStore((current) => ({ ...current, session: signedOutSession() }))
    setSharedConsultations([]); setRealtimeStatus('disconnected')
    setPage('Beranda'); setModal(''); setNotifications(false); setMobileNav(false)
    setAuthError(''); setPinStatus(''); setLandingTab(nextTab); setAuthRole(nextTab === 'staff' ? 'admin' : 'patient')
  }
  const openPortalLogin = (nextRole) => {
    setStore((current) => ({ ...current, session: signedOutSession() }))
    setLandingTab(nextRole === 'patient' ? 'patient' : 'staff')
    setAuthRole(nextRole); setAuthMode('pin'); setAuthError(''); setModal('')
  }
  const go = (next) => {
    if (!session.loggedIn) return
    if (['Dasbor admin', 'Operasional admin', 'Analitik petugas'].includes(next) && role !== 'admin') { toast('Halaman ini hanya untuk admin Puskesmas.'); return }
    if (['Dasbor dokter', 'Antrean dokter'].includes(next) && role !== 'doctor') { toast('Halaman ini hanya tersedia untuk akun dokter.'); return }
    setPage(next); setMobileNav(false)
  }
  async function register(event) {
    event.preventDefault(); const form = new FormData(event.currentTarget)
    const pin = String(form.get('pin')); const confirmation = String(form.get('pinConfirmation'))
    if (!/^\d{8}$/.test(pin)) { setPinStatus('PIN harus terdiri dari tepat 8 angka.'); return }
    if (pin !== confirmation) { setPinStatus('PIN dan PIN verifikasi harus sama.'); return }
    const phone = String(form.get('phone')).trim()
    const normalizedPhone = phone.replace(/\D/g, '')
    if (store.accounts.some((account) => account.profile.phone.replace(/\D/g, '') === normalizedPhone)) { setPinStatus('Nomor telepon sudah terdaftar. Silakan masuk ke akun Anda.'); return }
    const highestMemberId = store.accounts.reduce((highest, account) => Math.max(highest, Number(account.profile.memberId) || 0), 20268492)
    if (highestMemberId >= 99999999999) { setPinStatus('Nomor peserta sudah mencapai batas 11 digit.'); return }
    const memberId = String(highestMemberId + 1).padStart(11, '0')
    const random = () => crypto.getRandomValues(new Uint16Array(1))[0].toString(16).padStart(4, '0').toUpperCase()
    const nextProfile = { name: String(form.get('name')).trim(), phone, address: String(form.get('address')), birthDate: String(form.get('birthDate')), gender: String(form.get('gender')), blood: String(form.get('blood')), emergency: String(form.get('emergency')), economy: String(form.get('economy')), memberId, uniqueKey: `KEY-${random()}-${random()}`, pinHash: await hashPin(pin) }
    const account = normalizeAccount({ id: memberId, profile: nextProfile, appointments: [], visits: [], virtualConsultations: [], ticket: null, screening: { complaint: '', history: '', submitted: false } })
    setStore((current) => ({ ...current, accounts: [...current.accounts, account], session: { loggedIn: true, role: 'patient', accountId: account.id } }))
    try {
      await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nextProfile.name,
          phone: nextProfile.phone,
          address: nextProfile.address,
          medicalRecordNumber: memberId,
          birthDate: nextProfile.birthDate,
          gender: nextProfile.gender,
          serviceScheme: nextProfile.economy,
        })
      })
    } catch (e) { console.warn('[patients]', e.message) }
    setPage('Beranda'); setPinStatus(''); setAuthError(''); setModal(''); toast(`Akun siap. Nomor peserta Anda ${memberId}`)
  }
  async function login(event) {
    event.preventDefault(); const form = new FormData(event.currentTarget); const id = String(form.get('identifier')).replaceAll(' ', ''); const secret = String(form.get('secret'))
    if (authRole === 'admin' || authRole === 'doctor') {
      const staffId = authRole === 'admin' ? 'admin@puskesmas.local' : 'dokter@puskesmas.local'
      const staffPin = authRole === 'admin' ? '87654321' : '24681357'
      if (id.toLowerCase() !== staffId || secret !== staffPin) { setAuthError('Email atau PIN petugas tidak sesuai.'); return }
      setStore((current) => ({ ...current, session: { loggedIn: true, role: authRole, accountId: null } }))
      setPage(authRole === 'admin' ? 'Dasbor admin' : 'Dasbor dokter'); setAuthError(''); setModal(''); toast(`Berhasil masuk sebagai ${authRole === 'admin' ? 'admin' : 'dokter'}.`); return
    }
    const normalizedId = id.replace(/\D/g, '')
    const account = store.accounts.find((candidate) => candidate.profile.memberId === id || candidate.profile.phone.replace(/\D/g, '') === normalizedId)
    const secretOkay = account && (authMode === 'key' ? secret.toUpperCase() === account.profile.uniqueKey : await hashPin(secret) === account.profile.pinHash)
    if (!account || !secretOkay) { setAuthError('Nomor telepon/peserta atau kredensial belum sesuai.'); return }
    setStore((current) => ({ ...current, session: { loggedIn: true, role: 'patient', accountId: account.id } }))
    setPage('Beranda'); setAuthError(''); setPinStatus(''); setModal(''); toast('Berhasil masuk ke akun pasien.')
  }
  async function changePin(event) {
    event.preventDefault(); const form = new FormData(event.currentTarget)
    if (await hashPin(String(form.get('current'))) !== profile.pinHash) { setPinStatus('PIN saat ini tidak sesuai.'); return }
    const next = String(form.get('next')); if (!/^\d{8}$/.test(next)) { setPinStatus('PIN baru harus tepat 8 angka.'); return }
    if (next !== String(form.get('confirmation'))) { setPinStatus('PIN baru dan verifikasi harus sama.'); return }
    const pinHash = await hashPin(next)
    updatePatientAccount((account) => ({ ...account, profile: { ...account.profile, pinHash } }))
    setPinStatus('PIN berhasil diperbarui di perangkat ini.'); event.currentTarget.reset()
  }
  function bookQueue(event) {
    event.preventDefault()
    if (!availableDoctors.some(([name]) => name === queueForm.doctor)) { toast('Pilih tenaga medis yang tersedia pada hari tersebut.'); return }
    const ahead = randomInt(6) + 2
    const number = `A-${String(randomInt(70) + 19).padStart(3, '0')}`
    const nextTicket = { memberId: profile.memberId, clinic: clinic[0], unit: clinic[2], number, ahead, wait: ahead * 10, arrival: queueForm.arrival, day: queueForm.day, doctor: queueForm.doctor, complaint: queueForm.complaint }
    updatePatientAccount((account) => ({ ...account, ticket: nextTicket, appointments: [{ ...nextTicket, patient: profile.name, memberId: profile.memberId, status: 'Menunggu' }, ...account.appointments] }))
    setModal(''); go('Antrean saya'); toast('Antrean berhasil dibuat.')
  }
  function saveScreening(event) {
    event.preventDefault(); const form = new FormData(event.currentTarget)
    updatePatientAccount((account) => ({ ...account, screening: { memberId: profile.memberId, complaint: String(form.get('complaint')), history: String(form.get('history')), submitted: true } }))
    toast('Skrining kesehatan tersimpan.')
  }
  function toggleAvailability(day, doctor) {
    setStore((current) => ({ ...current, availability: { ...current.availability, [day]: { ...current.availability[day], [doctor]: !current.availability[day][doctor] } } }))
  }

  const requestVirtualConsultation = async () => {
    const generatedRoom = 'SIPUSKES-Beji-' + Math.floor(100000 + Math.random() * 900000)
    const patientName = profile?.name || 'Pasien'
    const complaint = activeAccount?.screening?.complaint || 'Konsultasi umum'
    const draft = { id: `local-${Date.now()}`, patient: patientName, memberId: profile?.memberId || '', doctor: 'dr. Aditya Pratama', clinic: 'Poli Umum', complaint, room: generatedRoom, status: 'Menunggu dokter' }
    setRoom(generatedRoom); setCurrentConsultation(draft); setModal('video')
    try {
      const payload = await apiFetch('/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientName, roomCode: generatedRoom, memberId: draft.memberId, complaint, clinic: draft.clinic, doctorName: draft.doctor }),
      })
      setCurrentConsultation(payload.consultation)
      toast('Permintaan terkirim. Menunggu dokter bergabung ke ruang yang sama.')
    } catch (error) {
      toast(`Ruang video terbuka, tetapi dokter belum bisa diberi tahu: ${error.message}`)
    }
  }

  async function acceptVirtualConsultation(request) {
    try {
      const payload = await apiFetch(`/consultations/${request.id}/accept?email=${encodeURIComponent(DEMO_DOCTOR_EMAIL)}`, { method: 'PATCH' })
      setSharedConsultations((current) => [payload.consultation, ...current.filter((item) => item.id !== payload.consultation.id)])
      setCurrentConsultation(payload.consultation); setRoom(payload.consultation.room); setModal('video')
    } catch (error) {
      toast(`Konsultasi gagal diterima: ${error.message}`)
    }
  }

  if (!session.loggedIn) return <AuthLanding tab={landingTab} setTab={setLandingTab} authRole={authRole} setAuthRole={setAuthRole} authMode={authMode} setAuthMode={setAuthMode} showPin={showPin} setShowPin={setShowPin} authError={authError} setAuthError={setAuthError} pinStatus={pinStatus} setPinStatus={setPinStatus} onLogin={login} onRegister={register} />

  const nav = role === 'admin'
    ? [['Dasbor admin', LayoutDashboard, 'PORTAL ADMIN'], ['Operasional admin', Ticket], ['Dasbor Analitik Petugas', Activity]]
    : role === 'doctor'
    ? [['Dasbor dokter', LayoutDashboard, 'PORTAL DOKTER'], ['Antrean dokter', UsersRound], ['Konsultasi virtual', Video]]
    : [['Dasbor & Ringkasan', LayoutDashboard], ['Kartu Pasien Digital', CreditCard], ['Pendaftaran Antrean', Ticket], ['Skrining & RME Pasien', FileText], ['Apotek & Jadwal Obat', Pill], ['Konsultasi Jitsi Video', Video], ['Bed & Jadwal Dokter', BedDouble], ['Rujukan RS 119 Depok', Hospital]]

  const patientNavActions = {
    'Dasbor & Ringkasan': () => go('Beranda'),
    'Kartu Pasien Digital': () => setModal('card'),
    'Pendaftaran Antrean': () => setModal('queue'),
    'Skrining & RME Pasien': () => go('Rekam medis'),
    'Apotek & Jadwal Obat': () => go('Obat & apotek'),
    'Konsultasi Jitsi Video': () => go('Konsultasi virtual'),
    'Bed & Jadwal Dokter': () => go('Fasilitas & jadwal'),
    'Rujukan RS 119 Depok': () => go('Rujukan RS 119 Depok'),
  }

  const activeNavLabel = role === 'patient'
    ? ({ Beranda: 'Dasbor & Ringkasan', 'Antrean saya': 'Pendaftaran Antrean', 'Rekam medis': 'Skrining & RME Pasien', 'Obat & apotek': 'Apotek & Jadwal Obat', 'Konsultasi virtual': 'Konsultasi Jitsi Video', 'Fasilitas & jadwal': 'Bed & Jadwal Dokter', 'Rujukan RS 119 Depok': 'Rujukan RS 119 Depok' }[page])
    : role === 'admin' && page === 'Analitik petugas' ? 'Dasbor Analitik Petugas' : page

  const activateNavItem = (label) => role === 'patient' ? patientNavActions[label]?.() : go(label === 'Dasbor Analitik Petugas' ? 'Analitik petugas' : label)

  return <div className={`app-shell role-${role}`} onClick={(event) => { const logoutButton = event.target.closest('.logout-button'); if (logoutButton) { signOut(logoutButton.textContent.includes('Buat akun') ? 'register' : 'patient'); return } if (role !== 'patient' && event.target.closest('.profile-button, .sidebar-foot .nav-link')) setModal('staff') }}>
    <header className="topbar">
      <div className="top-brand">
        <button className="icon-button mobile-menu" aria-label="Buka menu" onClick={() => setMobileNav(!mobileNav)}>
          <Menu size={18} />
        </button>
        <span className="brand-logo"><Hospital size={20} /></span>
        <span className="brand-type"><b>SIPUSKES<span>·</span></b><small>Depok</small></span>
        <span className="open-badge"><i /> Siaga 24 Jam</span>
      </div>
      <label className="search-bar">
        <Search size={15} />
        <input placeholder="Cari poli, nomor tiket, dokter, atau jadwal resep" value={query} onChange={(event) => setQuery(event.target.value)} />
      </label>
      <div className="top-actions">
        {role === 'patient' && (
          <div className="portal-switch" aria-label="Pilih portal">
            <button className="portal-choice active" onClick={() => openPortalLogin('patient')}>Portal Pasien</button>
            <button className="portal-choice" onClick={() => openPortalLogin('admin')}>Portal Petugas</button>
          </div>
        )}
        <button className="emergency-link" onClick={() => setModal('emergency')}>
          <Siren size={15} /><span>Darurat 119</span>
        </button>
        <div className="notification-wrap">
          <button className="icon-button" aria-label="Notifikasi" onClick={() => setNotifications(!notifications)}>
            <Bell size={17} /><i className="notification-dot" />
          </button>
          {notifications && (
            <div className="notification-popover">
              <b>Notifikasi</b>
              <p><Pill size={14} /> Paracetamol sesudah makan</p>
              <p><Ticket size={14} /> {ticket.ahead} pasien di depan antrean</p>
              <p><CalendarDays size={14} /> Kontrol 22 Okt 2026</p>
            </div>
          )}
        </div>
        <button className="profile-button" onClick={() => setModal('account')}>
          <span className="avatar">{profile.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</span>
          <span>{profile.name}</span>
          <ChevronDown size={13} />
        </button>
      </div>
    </header>
    <div className="layout">
      <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
        <div>
          <button className="clinic-picker">
            <span><Hospital size={16} /></span>
            <span><b>UPTD PKM Beji</b><small><MapPin size={10} /> Jl. Bambu Kuning No. 1</small></span>
            <ChevronDown size={13} />
          </button>
          <nav>
            {nav.map(([label, Icon]) => (
              <div key={label}>
                <button className={`nav-link ${activeNavLabel === label ? 'active' : ''}`} onClick={() => activateNavItem(label)}>
                  <Icon size={16} />
                  <span>{label}</span>
                  {label === 'Pendaftaran Antrean' && <i>1</i>}
                </button>
              </div>
            ))}
          </nav>
        </div>
        <div className="sidebar-foot">
          <div className="help-box">
            <MessageCircle size={17} />
            <b>Butuh bantuan?</b>
            <span>Petugas kami siap membantu.</span>
            <button onClick={() => toast('Petugas layanan akan menghubungi Anda.')}>
              Hubungi petugas <ArrowRight size={12} />
            </button>
          </div>
          <button className="sidebar-emergency" onClick={() => setModal('emergency')}>
            <Siren size={14} /> Panggilan Darurat 119
          </button>
          <button className="nav-link" onClick={() => setModal('account')}>
            <Settings size={15} /> Pengaturan akun
          </button>
          <small>© 2026 SIPUSKES Depok<br />Privasi · Bantuan</small>
        </div>
      </aside>
      <main className="main-content">
        {page === 'Dasbor admin' && role === 'admin' && <AdminDashboard appointments={data.appointments} availability={data.availability} go={go} />}
        {page === 'Operasional admin' && role === 'admin' && <AdminOperations appointments={data.appointments} availability={data.availability} toggle={toggleAvailability} />}
        {page === 'Dasbor dokter' && role === 'doctor' && <><DoctorDashboard appointments={data.appointments} availability={data.availability} go={go} /><DoctorConsultationInbox consultations={consultations} realtimeStatus={realtimeStatus} onAccept={acceptVirtualConsultation} go={go} /></>}
        {page === 'Antrean dokter' && role === 'doctor' && <DoctorQueuePage appointments={data.appointments} go={go} />}
        {page === 'Beranda' && role === 'patient' && <PatientDashboard profile={profile} ticket={ticket} availability={data.availability} openCard={() => setModal('card')} openQueue={() => setModal('queue')} openConsult={requestVirtualConsultation} go={go} />}
        {page === 'Konsultasi virtual' && role === 'doctor' && <DoctorConsultations consultations={consultations} realtimeStatus={realtimeStatus} onAccept={acceptVirtualConsultation} />}
        {modal === 'staff' && role !== 'patient' && <StaffAccount role={role} onClose={() => setModal('')} onLogout={() => signOut('patient')} />}
        {page === 'Beranda' && data.visits.length > 0 && <><div className="welcome"><div><small className="eyebrow">{dateText()}</small><h1>Selamat {greeting()}, {honorific(profile.gender)} {profile.name.split(' ')[0]} <span>*</span></h1><p>Semoga hari ini terasa lebih sehat. Layanan Anda siap diakses.</p></div><button className="button primary" onClick={() => setModal('queue')}><Plus size={15} /> Daftar antrean</button></div><div className="dashboard-grid"><section className="dashboard-main"><div className="queue-hero"><div className="queue-copy"><small className="live-label"><i /> ANTREAN AKTIF</small><h2>Anda tinggal<br /><em>{ticket.ahead} pasien lagi</em></h2><p>{ticket.clinic} <i>·</i> Estimasi tunggu {ticket.wait} menit</p><div><button className="button light-button" onClick={() => go('Antrean saya')}>Lihat tiket <ArrowRight size={13} /></button><span><Clock3 size={12} /> Kedatangan {ticket.arrival} WIB</span></div></div><div className="queue-token"><small>Nomor antrean</small><b>{ticket.number}</b><hr /><small>Pasien di depan</small><strong>{ticket.ahead} orang</strong><Ticket className="token-mark" size={48} /></div></div><div className="section-heading"><div><small className="eyebrow">AKSES CEPAT</small><h2>Layanan kesehatan</h2></div><button className="text-link" onClick={() => go('Fasilitas & jadwal')}>Semua layanan <ArrowRight size={12} /></button></div><div className="quick-grid">{[['Ambil antrean', 'Daftar poli online', Ticket, 'green', () => setModal('queue')], ['Rekam medis', 'Riwayat kesehatan', FileText, 'blue', () => go('Rekam medis')], ['Konsultasi online', 'Temui dokter virtual', Video, 'lilac', requestVirtualConsultation], ['Obat & apotek', 'Resep dan stok obat', Pill, 'orange', () => go('Obat & apotek')]].map(([title, subtitle, Icon, color, action]) => <button className="quick-tile" key={title} onClick={action}><span className={`tile-icon ${color}`}><Icon size={17} /></span><b>{title}</b><small>{subtitle}</small><ChevronRight size={13} /></button>)}</div><div className="section-heading section-gap"><div><small className="eyebrow">KAMIS, 15 OKTOBER</small><h2>Jadwal dokter hari ini</h2></div><button className="text-link" onClick={() => go('Fasilitas & jadwal')}>Lihat jadwal <ArrowRight size={12} /></button></div><div className="doctor-list">{doctors.slice(0, 3).map(([name, clinicName, time, status], index) => <div className="doctor-row" key={name}><span className={`doctor-avatar doctor-${index}`}>{name.split(' ').slice(1).map((part) => part[0]).join('').slice(0, 2)}</span><span className="doctor-name"><b>{name}</b><small>{clinicName}</small></span><span className="doctor-time"><Clock3 size={11} /> {time}</span><span className={`status ${status === 'Berpraktik' ? 'status-green' : ''}`}><i /> {status}</span></div>)}</div><div className="section-heading section-gap"><div><small className="eyebrow">PEMANTAUAN KESEHATAN</small><h2>Ringkasan kunjungan</h2></div><button className="text-link" onClick={() => go('Rekam medis')}>Buka rekam medis <ArrowRight size={12} /></button></div><button className="visit-summary" onClick={() => go('Rekam medis')}><span><FileText size={16} /></span><span><b>{data.visits[0].diagnosis}</b><small>{data.visits[0].date} · {data.visits[0].clinic}</small></span><i className="status status-green"><i /> Selesai</i><ChevronRight size={14} /></button></section><aside className="dashboard-rail"><div className="rail-panel"><div className="rail-heading"><b>Kartu pasien digital</b><button onClick={() => setModal('card')}>...</button></div><PatientCard profile={profile} /><button className="card-detail" onClick={() => setModal('card')}>Lihat detail kartu <ArrowRight size={12} /></button></div><div className="subsidy-panel"><div><span><ShieldCheck size={14} /></span><b>Status layanan</b><i><Check size={9} /> Aktif</i></div><small>{profile.economy === 'subsidi' ? 'Subsidi penuh' : 'Layanan mandiri'}</small><strong>{profile.economy === 'subsidi' ? 'Bebas Biaya' : 'Pembayaran di loket'}</strong><hr /><small>{profile.economy === 'subsidi' ? 'Tidak ada iuran bulanan · Rp 0' : 'Estimasi sebelum layanan'}</small></div><div className="rail-panel med-panel"><div className="rail-heading"><span><small className="eyebrow">PENGINGAT OBAT</small><b>Jadwal hari ini</b></span><button onClick={() => go('Obat & apotek')}>Lihat</button></div>{[['12:30', 'Paracetamol 500 mg', true], ['20:00', 'Vitamin C 500 mg', false]].map(([time, name, done]) => <div className="med-time" key={time}><small>{time}</small><i className={done ? '' : 'pending'} /><span><b>{name}</b><small>1 tablet sesudah makan</small></span>{done ? <CheckCircle2 size={15} /> : <button aria-label="Tandai diminum" onClick={() => toast(`${name} ditandai diminum.`)}><Check size={12} /></button>}</div>)}<button className={`alarm-button ${alarm ? 'alarm-on' : ''}`} onClick={() => { setAlarm(!alarm); toast(alarm ? 'Alarm dimatikan.' : 'Alarm minum obat diaktifkan di layar.') }}><Bell size={13} /> {alarm ? 'Alarm aktif' : 'Aktifkan alarm layar'}</button></div><button className="bed-mini" onClick={() => go('Fasilitas & jadwal')}><BedDouble size={16} /><span><b>Ketersediaan tempat tidur</b><small>IGD dan rawat inap data demo</small></span><strong>4/12</strong></button></aside></div></>}
        {page === 'Antrean saya' && <QueuePage ticket={ticket} book={() => setModal('queue')} />}
        {page === 'Rekam medis' && <MedicalPage data={data} screening={screening} save={saveScreening} visits={visits} query={query} setQuery={setQuery} />}
        {page === 'Obat & apotek' && <PharmacyScreen toast={toast} openCard={() => setModal('card')} />}
        {page === 'Konsultasi virtual' && role === 'patient' && <ConsultPage join={requestVirtualConsultation} />}
        {page === 'Fasilitas & jadwal' && <FacilitiesScreen toast={toast} />}
        {page === 'Rujukan RS 119 Depok' && <ReferralScreen onRefer={(hospitalName) => { setReferral(hospitalName); setModal('referral') }} />}
        {page === 'Analitik petugas' && role === 'admin' && <><AdminPage /><AdminOperations appointments={data.appointments} availability={data.availability} toggle={toggleAvailability} /></>}
      </main>
    </div>
    <footer className="mobile-nav">{nav.slice(0, 4).map(([label, Icon]) => <button key={label} className={activeNavLabel === label ? 'selected' : ''} onClick={() => activateNavItem(label)}><Icon size={17} /><span>{label === 'Dasbor & Ringkasan' ? 'Beranda' : label === 'Kartu Pasien Digital' ? 'Kartu' : label === 'Pendaftaran Antrean' ? 'Antrean' : label === 'Skrining & RME Pasien' ? 'Medis' : label}</span></button>)}</footer>
    {modal === 'queue' && <Modal title="Daftar antrean" close={() => setModal('')}><form className="form-stack" onSubmit={bookQueue}><label>Poli tujuan<select value={queueForm.clinic} onChange={(event) => setQueueForm({ ...queueForm, clinic: event.target.value })}>{clinics.map(([name]) => <option key={name}>{name}</option>)}</select></label><div className="unit-preview"><span><ClinicIcon size={16} /></span><span><b>{clinic[0]}</b><small>{clinic[2]}</small></span><CheckCircle2 size={15} /></div><fieldset className="day-choice"><legend>Hari kunjungan</legend>{[['today', 'Hari ini'], ['tomorrow', 'Besok']].map(([value, label]) => <label key={value} className={queueForm.day === value ? 'day-selected' : ''}><input type="radio" name="queueDay" value={value} checked={queueForm.day === value} onChange={() => { const firstDoctor = doctors.find(([name]) => data.availability[value]?.[name])?.[0] || ''; setQueueForm({ ...queueForm, day: value, doctor: firstDoctor }) }} /><CalendarDays size={15} /><span>{label}<small>{value === 'today' ? dateText() : 'Hari berikutnya'}</small></span></label>)}</fieldset><label>Tenaga medis<select value={availableDoctors.some(([name]) => name === queueForm.doctor) ? queueForm.doctor : ''} onChange={(event) => setQueueForm({ ...queueForm, doctor: event.target.value })} required disabled={!availableDoctors.length}><option value="">{availableDoctors.length ? 'Pilih dokter tersedia' : 'Belum ada dokter tersedia'}</option>{availableDoctors.map(([name, assignedClinic]) => <option key={name} value={name}>{name} · {assignedClinic}</option>)}</select></label><label>Jam kedatangan<input type="time" min="07:00" max="19:00" step="3600" value={queueForm.arrival} onChange={(event) => setQueueForm({ ...queueForm, arrival: event.target.value })} required /><small className="field-help">Jam layanan tersedia dari 07.00 sampai 19.00.</small></label><label>Keluhan awal<textarea rows="3" maxLength="300" value={queueForm.complaint} onChange={(event) => setQueueForm({ ...queueForm, complaint: event.target.value })} placeholder="Tuliskan keluhan yang ingin disampaikan ke tenaga medis" /></label><p className="form-note"><Clock3 size={13} /> Estimasi tunggu dihitung saat tiket diterbitkan.</p><button className="button primary full-button" disabled={!availableDoctors.length}><Ticket size={14} /> Terbitkan e-tiket</button></form></Modal>}
    {modal === 'register' && <Modal title="Buat akun pasien" close={() => { setModal(''); setPinStatus('') }} wide><RegisterForm showPin={showPin} setShowPin={setShowPin} pinStatus={pinStatus} onSubmit={register} /></Modal>}
    {modal === 'login' && <Modal title="Masuk ke akun" close={() => { setModal(''); setAuthError('') }}><LoginForm authRole={authRole} setAuthRole={setAuthRole} authMode={authMode} setAuthMode={setAuthMode} showPin={showPin} setShowPin={setShowPin} authError={authError} onSubmit={login} showRoleSelect /></Modal>}
    {modal === 'account' && <Modal title="Pengaturan akun" close={() => { setModal(''); setPinStatus('') }}><div className="account-summary"><span className="avatar large">{profile.name[0]}</span><span><b>{profile.name}</b><small>Peserta {profile.memberId}</small></span></div><div className="account-data"><small>Nomor telepon</small><b>{profile.phone}</b><small>Kunci unik pasien</small><b>{profile.uniqueKey}</b><small>Skema layanan</small><b>{profile.economy === 'subsidi' ? 'Subsidi penuh · Rp 0' : 'Mandiri / reguler'}</b></div><form className="form-stack pin-form" onSubmit={changePin}><h3>Ubah PIN keamanan</h3><PinField label="PIN saat ini" name="current" visible={showPin} toggle={() => setShowPin(!showPin)} /><PinField label="PIN baru (8 angka)" name="next" visible={showPin} toggle={() => setShowPin(!showPin)} /><PinField label="Ulangi PIN baru" name="confirmation" visible={showPin} toggle={() => setShowPin(!showPin)} />{pinStatus && <p className={pinStatus.startsWith('PIN berhasil') ? 'form-success' : 'form-error'}>{pinStatus}</p>}<button className="button secondary-button full-button">Perbarui PIN</button></form><button className="logout-button" onClick={() => signOut('register')}>Buat akun pasien baru</button><button className="logout-button" onClick={() => signOut()}>Keluar</button><p className="privacy-note"><ShieldCheck size={12} /> Data browser hanya prototipe demo, bukan autentikasi produksi.</p></Modal>}
    {modal === 'card' && <Modal title="Kartu pasien digital" close={() => setModal('')}><PatientCard profile={profile} /><div className="card-details"><small>Nomor peserta</small><b>{profile.memberId}</b><small>Kunci unik pasien</small><b>{profile.uniqueKey}</b><small>Alamat</small><b>{profile.address}</b><small>Status layanan</small><b>{profile.economy === 'subsidi' ? 'Subsidi penuh · Bebas biaya (Rp 0)' : 'Mandiri · Pembayaran di loket'}</b></div></Modal>}
    {modal === 'emergency' && <Modal title="Bantuan gawat darurat" close={() => setModal('')}><div className="emergency-modal"><span><Siren size={24} /></span><h3>Butuh bantuan segera?</h3><p>Untuk kondisi yang mengancam nyawa, hubungi layanan darurat nasional 119 atau minta bantuan petugas Puskesmas.</p><a className="button danger-button full-button" href="tel:119"><Siren size={15} /> Hubungi 119 sekarang</a><button className="button secondary-button full-button" onClick={() => setModal('referral')}><Hospital size={15} /> Rujukan rumah sakit</button><small>Jangan gunakan untuk konsultasi rutin.</small></div></Modal>}
    {modal === 'referral' && <Modal title="Rujukan rumah sakit Depok" close={() => setModal('')}><form className="form-stack" onSubmit={(event) => { event.preventDefault(); toast(`Surat rujukan demo diterbitkan ke ${referral}.`); setModal('') }}><p className="muted">Penentuan rujukan klinis sebenarnya dilakukan tenaga medis.</p><label>Rumah sakit rujukan<select required value={referral} onChange={(event) => setReferral(event.target.value)}><option value="">Pilih rumah sakit</option>{hospitals.map((name) => <option key={name}>{name}</option>)}</select></label><label>Catatan kondisi<textarea rows="3" required placeholder="Ringkas kondisi (data demo)" /></label><button className="button primary full-button"><FileText size={14} /> Terbitkan surat rujukan</button></form></Modal>}
    {modal === 'video' && <Modal title="Konsultasi virtual" wide close={() => setModal('')}><div className="video-title"><b>● RUANG KONSULTASI</b><span>{role === 'doctor' ? `${currentConsultation?.patient || 'Pasien'} · ${currentConsultation?.clinic || 'Poli Umum'}` : `${currentConsultation?.doctor || 'dr. Aditya Pratama'} · ${currentConsultation?.clinic || 'Poli Umum'}`}</span></div><JitsiRoom room={currentConsultation?.room || room} name={role === 'doctor' ? 'dr. Aditya Pratama' : profile.name} /><p className="privacy-note"><ShieldCheck size={12} /> Pasien dan dokter terhubung ke ruang konsultasi yang sama melalui Jitsi Meet.</p></Modal>}
    {notice && <div className="toast"><CheckCircle2 size={16} /> {notice}<button aria-label="Tutup" onClick={() => setNotice('')}><X size={13} /></button></div>}
  </div>
}

function PatientDashboard({ profile, ticket, availability, openCard, openQueue, openConsult, go }) {
  const activeDoctors = doctors.filter(([name]) => availability.today?.[name]).slice(0, 4)
  const title = `Selamat ${greeting()}, ${honorific(profile.gender) ? `${honorific(profile.gender)} ` : ''}${profile.name}`
  return <div className="patient-dashboard"><section className="patient-hero"><div className="accreditation"><CheckCircle2 size={11} /> Puskesmas Terakreditasi Paripurna Kota Depok</div><h1>{title}</h1><p>Akses cepat pelayanan kesehatan gratis bersubsidi penuh warga Depok. Ambil nomor antrean, pantau obat berkala, atau konsultasi telemedisin langsung dengan dokter umum.</p><div className="patient-hero-actions"><button className="button patient-hero-light" onClick={openQueue}><Ticket size={14} /> Ambil Antrean Poli Hari Ini</button><button className="button patient-hero-green" onClick={openConsult}><Video size={14} /> Konsultasi Dokter Virtual</button></div><ShieldCheck className="patient-hero-watermark" size={120} /></section>
    <section className="patient-metrics"><button className="patient-metric queue-metric" onClick={() => go('Antrean saya')}><span className="metric-title">ANTREAN POLI AKTIF <span><Clock3 size={14} /></span></span><b>{ticket.clinic}</b><strong>{ticket.number}</strong><span className="metric-chip">Sisa {ticket.ahead} Pasien</span><small>Estimasi dipanggil: {ticket.arrival} WIB (±{ticket.wait} menit)</small></button><button className="patient-metric medicine-metric" onClick={() => go('Obat & apotek')}><span className="metric-title">JADWAL MINUM OBAT <span><Pill size={14} /></span></span><b>3 Dosis Tersisa</b><strong>12:30 <i>Siang Ini</i></strong><small>Paracetamol & Vitamin B-Complex</small></button><button className="patient-metric vital-metric" onClick={() => go('Rekam medis')}><span className="metric-title">TANDA VITAL TERAKHIR <span><Activity size={14} /></span></span><b>Tekanan Darah</b><strong>118/78 <i>Normal</i></strong><small>Diperiksa: 18 Mei 2025 di UPTD Beji</small></button><button className="patient-metric bed-metric" onClick={() => go('Fasilitas & jadwal')}><span className="metric-title">BED IGD SIAGA <span><BedDouble size={14} /></span></span><b>Tersedia</b><strong>4/6 <i>IGD 24 Jam</i></strong><small>Siaga Ambulans Rujukan 119 Ready</small></button></section>
    <section className="patient-home-bottom"><article className="patient-digital-panel"><header><span><CreditCard size={14} /> Kartu Pasien Digital</span><button onClick={openCard}>Buka Penuh <ArrowRight size={12} /></button></header><PatientCard profile={profile} /><div className="facility-validity"><span>Fasilitas Terdaftar: <b>UPTD Puskesmas Beji</b></span><strong>Aktif Valid 2026</strong></div></article><article className="doctors-today-panel"><header><span><Hospital size={15} /> Dokter Jaga & Poli Beroperasi Hari Ini</span><small>Pembaruan: 10 menit lalu</small></header><div className="today-doctor-list">{activeDoctors.map(([name, clinicName, time], index) => <button className="today-doctor-row" key={name} onClick={openQueue}><span className={`clinic-monogram clinic-${index}`}>{clinicName.startsWith('Poli Umum') ? 'PU' : clinicName.startsWith('Poli KIA') ? 'KIA' : clinicName.includes('Gigi') ? 'PG' : 'PL'}</span><span><b>{clinicName} ({name})</b><small>{time} WIB · Ruang {102 + index}</small></span><i>{index === 2 ? 'Tersisa 3 Kuota' : `Buka (${26 - index * 6} Pasien)`}</i></button>)}</div><footer><span>Total 8 Poliklinik Layanan Siaga Aktif</span><button onClick={() => go('Fasilitas & jadwal')}>Daftar Sekarang <ArrowRight size={12} /></button></footer></article></section>
  </div>
}

function PageTitle({ eyebrow, title, detail, action }) {
  const displayDetail = detail.startsWith('Selamat bertugas,') ? detail.replace('Selamat bertugas,', `Selamat ${greeting()},`) : detail
  return <div className="page-title"><div><small className="eyebrow">{eyebrow}</small><h1>{title}</h1><p>{displayDetail}</p></div>{action}</div>
}

function QueuePage({ ticket, book }) {
  return <><PageTitle eyebrow="ANTREAN ONLINE" title="Antrean saya" detail="Pantau giliran tanpa menunggu di ruang pendaftaran." action={<button className="button primary" onClick={book}><Plus size={14} /> Ambil antrean</button>} /><div className="queue-page-grid"><section className="panel"><div className="panel-heading"><span><small className="live-label"><i /> SEDANG AKTIF</small><h2>{ticket.clinic}</h2><p>{ticket.unit}</p></span><Ticket size={19} /></div><div className="ticket-number"><small>Nomor antrean Anda</small><b>{ticket.number}</b><div><i /></div><span>Anda terdaftar <small>Estimasi {ticket.wait} menit</small></span></div><div className="ticket-stats"><span><small>Pasien di depan</small><b>{ticket.ahead} orang</b></span><span><small>Waktu kedatangan</small><b>{ticket.day === 'tomorrow' ? 'Besok' : 'Hari ini'} · {ticket.arrival}</b></span></div><div className="ticket-appointment"><b>{ticket.doctor}</b><span>{ticket.complaint || 'Tidak ada catatan keluhan'}</span></div><button className="button secondary-button" onClick={() => window.print()}><FileText size={14} /> Cetak e-tiket</button></section><section className="panel"><div className="panel-heading"><span><h2>Alur kunjungan</h2><p>Langkah setelah mendaftar.</p></span></div>{['Tunjukkan e-tiket ke petugas', 'Lakukan skrining kesehatan', 'Tunggu nomor dipanggil di poli', 'Siapkan kartu pasien digital'].map((item, index) => <div className="step-row" key={item}><i>{index + 1}</i><span>{item}</span></div>)}<p className="form-note"><Clock3 size={13} /> Datang 10 menit sebelum waktu pilihan.</p></section></div><section className="panel"><div className="panel-heading"><span><h2>Urutan poli layanan</h2><p>Pilih antrean sesuai kebutuhan pemeriksaan.</p></span></div><div className="clinic-grid">{clinics.map(([name, Icon], index) => <div className="clinic-choice" key={name}><Icon size={15} /><span>{name}</span>{index === 0 && <small>Utama</small>}</div>)}</div></section></>
}

function MedicalPage({ data, screening, save, visits, query, setQuery }) {
  return <><PageTitle eyebrow="PORTAL KESEHATAN" title="Rekam medis" detail="Riwayat kunjungan dan skrining kesehatan Anda." action={<button className="button primary" onClick={() => document.getElementById('screening')?.scrollIntoView({ behavior: 'smooth' })}><Plus size={14} /> Skrining baru</button>} /><div className="metric-row"><div><small>Total kunjungan</small><b>{data.visits.length}</b><FileText size={16} /></div><div><small>Hasil lab tersedia</small><b>2</b><Activity size={16} /></div><div><small>Alergi tercatat</small><b>Tidak ada</b><ShieldCheck size={16} /></div></div><section className="panel"><div className="panel-heading"><span><h2>Riwayat kunjungan</h2><p>Diagnosis dan catatan layanan sebelumnya.</p></span><label className="table-search"><Search size={13} /><input placeholder="Cari kunjungan" value={query} onChange={(event) => setQuery(event.target.value)} /></label></div><div className="table-scroll"><table><thead><tr><th>TANGGAL</th><th>POLI</th><th>DIAGNOSIS</th><th>DOKTER</th><th>STATUS</th></tr></thead><tbody>{visits.map((visit) => <tr key={visit.date}><td>{visit.date}</td><td>{visit.clinic}</td><td><b>{visit.diagnosis}</b></td><td>{visit.doctor}</td><td><span className="status status-green"><i /> Selesai</span></td></tr>)}</tbody></table>{!visits.length && <p className="empty-state">Tidak ada kunjungan yang cocok.</p>}</div></section><div className="medical-lower"><section className="panel" id="screening"><div className="panel-heading"><span><h2>Skrining kesehatan</h2><p>Keluhan awal dan riwayat kesehatan.</p></span><span className="status status-green"><i /> {screening.submitted ? 'Tersimpan' : 'Belum diisi'}</span></div><form className="form-stack" onSubmit={save}><label>Keluhan yang dirasakan<textarea name="complaint" rows="3" defaultValue={screening.complaint} required /></label><label>Riwayat kesehatan / alergi<textarea name="history" rows="2" defaultValue={screening.history} /></label><button className="button primary"><Check size={14} /> Simpan skrining</button></form></section><section className="panel"><div className="panel-heading"><span><h2>Hasil pemeriksaan lab</h2><p>Hasil terakhir tersedia.</p></span><Activity size={16} /></div>{[['Gula darah sewaktu', '12 Okt 2026 · Dalam batas normal', '102', 'mg/dL'], ['Hemoglobin', '04 Agu 2026 · Dalam batas normal', '13.2', 'g/dL']].map(([name, date, value, unit]) => <div className="lab-row" key={name}><span><Activity size={14} /></span><span><b>{name}</b><small>{date}</small></span><strong>{value} <small>{unit}</small></strong></div>)}</section></div></>
}

export function PharmacyPage({ toast }) {
  return <><PageTitle eyebrow="APOTEK PKM BEJI" title="Obat & apotek" detail="Informasi ketersediaan obat dan pengingat resep Anda." /><div className="page-columns"><section className="panel"><div className="panel-heading"><span><h2>Ketersediaan obat</h2><p>Data demo pembaruan hari ini pukul 08.00</p></span><span className="status status-green"><i /> Stok tersedia</span></div>{medicines.map(([name, stock, type]) => <div className="medicine-row" key={name}><span><Pill size={15} /></span><b>{name}<small>{type}</small></b><strong className={stock < 10 ? 'low-stock' : ''}>{stock}<small> unit</small></strong><button onClick={() => toast(`Stok ${name}: ${stock} unit (data demo).`)}></button></div>)}<p className="form-note"><CheckCircle2 size={13} /> Konfirmasi kembali ke loket apotek saat pengambilan.</p></section><section className="panel"><div className="panel-heading"><span><small className="eyebrow">RESEP AKTIF</small><h2>Jadwal konsumsi</h2></span><Pill size={17} /></div><div className="prescription-doctor"><b>dr. Aditya Pratama</b><small>Resep 12 Oktober 2026</small></div>{[['Paracetamol 500 mg', '3 kali sehari 1 tablet'], ['Amoxicillin 500 mg', '3 kali sehari 1 kapsul'], ['Vitamin C 500 mg', '1 kali sehari 1 tablet']].map(([name, rule]) => <div className="prescription-row" key={name}><span><b>{name}</b><small>{rule}</small></span><i>Sesudah makan</i></div>)}<button className="button secondary-button full-button" onClick={() => toast('Pengingat obat hari ini diaktifkan.')}><Bell size={13} /> Aktifkan pengingat obat</button></section></div><section className="panel"><div className="panel-heading"><span><h2>Jadwal minum hari ini</h2><p>Ikuti aturan pakai tenaga kesehatan.</p></span><button className="button secondary-button" onClick={() => toast('Pengingat terjadwal: 12.30, 16.30, dan 20.00.')}>Atur notifikasi</button></div>{[['08:30', 'Paracetamol 500 mg', 'Sesudah sarapan', true], ['12:30', 'Paracetamol 500 mg', 'Sesudah makan siang', true], ['16:30', 'Amoxicillin 500 mg', 'Sesudah makan', false], ['20:00', 'Vitamin C 500 mg', 'Sesudah makan malam', false]].map(([time, name, note, done]) => <div className="timeline-row" key={time}><small>{time}</small><i className={done ? 'done' : ''}>{done ? <Check size={10} /> : null}</i><span><b>{name}</b><small>{note}</small></span>{done ? <em>Diminum</em> : <button aria-label="Tandai diminum" onClick={() => toast(`${name} ditandai sudah diminum.`)}><Check size={11} /></button>}</div>)}</section></>
}

function ConsultPage({ join }) {
  return <><PageTitle eyebrow="LAYANAN JARAK JAUH" title="Konsultasi virtual" detail="Konsultasi keluhan ringan langsung dari browser Anda." /><div className="consult-hero"><div><small className="live-label"><i /> TERSEDIA HARI INI</small><h2>Temui dokter, <br />tanpa antre di klinik.</h2><p>Untuk flu, batuk, pilek, demam ringan, dan konsultasi obat. Dokter akan menentukan apakah pemeriksaan langsung diperlukan.</p><button className="button primary" onClick={join}><Video size={15} /> Mulai konsultasi video</button><small className="privacy-note"><ShieldCheck size={12} /> Jitsi Meet panggilan di halaman ini</small></div><div className="consult-visual"><div className="doctor-graphic"><Stethoscope size={56} /><span><Plus size={18} /></span></div><div><i /> dr. Aditya Pratama <small>Dokter umum · Online</small></div></div></div><div className="info-grid">{[['Keluhan ringan', 'Flu, batuk, pilek, demam ringan, dan konsultasi obat rutin.', HeartPulse], ['Jam layanan', 'Senin–Jumat, 08.00–14.00 WIB sesuai jadwal dokter.', Clock3], ['Kondisi darurat?', 'Untuk sesak berat, segera ke IGD atau hubungi 119.', Siren]].map(([name, text, Icon]) => <section className="panel" key={name}><Icon size={18} /><h3>{name}</h3><p>{text}</p></section>)}</div></>
}

function ConsultationRequestRows({ requests, onAccept }) {
  return requests.map((request) => <article className="consultation-request" key={request.id}><span className="consult-request-avatar"><UserRound size={17} /></span><div className="consult-request-copy"><div><b>{request.patient}</b><span className={`status ${request.status === 'Menunggu dokter' ? 'status-waiting' : 'status-green'}`}><i /> {request.status}</span></div><small>{[request.memberId, request.clinic, request.doctor].filter(Boolean).join(' · ')}</small>{request.complaint ? <p>{request.complaint}</p> : null}<small>Permintaan {new Date(request.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</small></div><button className="button primary" onClick={() => onAccept(request)}><Video size={14} /> {request.status === 'Menunggu dokter' ? 'Terima & hubungi' : 'Gabung kembali'}</button></article>)
}

function DoctorConsultationInbox({ consultations, realtimeStatus, onAccept, go }) {
  const waiting = consultations.filter((request) => request.status === 'Menunggu dokter')
  const connectionText = realtimeStatus === 'connected' ? 'Notifikasi realtime aktif' : realtimeStatus === 'offline' ? 'Koneksi realtime terputus' : 'Menghubungkan notifikasi realtime...'
  return <section className="panel doctor-inbox"><div className="panel-heading"><span><h2>Permintaan konsultasi pasien</h2><p>{waiting.length ? `${waiting.length} pasien menunggu dokter.` : 'Belum ada permintaan baru.'} · {connectionText}</p></span><button className="text-button" onClick={() => go('Konsultasi virtual')}>Semua sesi <ArrowRight size={12} /></button></div>{consultations.length ? <ConsultationRequestRows requests={consultations.slice(0, 3)} onAccept={onAccept} /> : <p className="empty-state">Permintaan video dari pasien akan muncul di sini.</p>}</section>
}

function DoctorConsultations({ consultations, realtimeStatus, onAccept }) {
  const waiting = consultations.filter((request) => request.status === 'Menunggu dokter').length
  const connectionText = realtimeStatus === 'connected' ? 'Terhubung ke server' : realtimeStatus === 'offline' ? 'Server tidak terjangkau' : 'Menghubungkan...'
  return <><PageTitle eyebrow="PORTAL DOKTER KONSULTASI" title="Konsultasi Virtual" detail={`Terima panggilan video dari pasien · ${connectionText}.`} /><div className="metric-row"><div><small>Permintaan menunggu</small><b>{waiting}</b><Clock3 size={16} /></div><div><small>Sesi aktif</small><b>{consultations.filter((request) => request.status === 'Sedang berlangsung').length}</b><Video size={16} /></div><div><small>Platform panggilan</small><b>Jitsi Meet</b><ShieldCheck size={16} /></div></div><section className="panel doctor-consultations"><div className="panel-heading"><span><h2>Daftar permintaan pasien</h2><p>Memilih terima memperbarui status sesi pada PostgreSQL.</p></span><Video size={17} /></div>{consultations.length ? <ConsultationRequestRows requests={consultations} onAccept={onAccept} /> : <p className="empty-state">Belum ada pasien yang memulai konsultasi virtual.</p>}</section><p className="privacy-note"><ShieldCheck size={13} /> Permintaan tersimpan di PostgreSQL; room video dibagikan melalui Jitsi Meet.</p></>
}

export function FacilitiesPage() {
  return <><PageTitle eyebrow="INFORMASI PKM BEJI" title="Fasilitas & jadwal" detail="Jadwal praktik dan kapasitas fasilitas data simulasi." /><div className="metric-row"><div><small>Rawat inap tersedia</small><b>3 <i>/ 8 tempat tidur</i></b><BedDouble size={16} /></div><div><small>Bed observasi IGD</small><b>1 <i>/ 4 tempat tidur</i></b><Activity size={16} /></div><div><small>Kunjungan hari ini</small><b>128 <i>pasien</i></b><UsersRound size={16} /></div></div><section className="panel"><div className="panel-heading"><span><h2>Jadwal praktik dokter</h2><p>Kamis, 15 Oktober 2026 · UPTD PKM Beji</p></span><span className="status status-green"><i /> Hari ini</span></div><div className="table-scroll"><table><thead><tr><th>DOKTER</th><th>POLI</th><th>JAM PRAKTIK</th><th>STATUS</th></tr></thead><tbody>{doctors.map(([name, clinicName, time, status]) => <tr key={name}><td><b>{name}</b></td><td>{clinicName}</td><td>{time} WIB</td><td><span className={`status ${status === 'Berpraktik' ? 'status-green' : ''}`}><i />{status}</span></td></tr>)}</tbody></table></div></section><div className="page-columns"><section className="panel"><div className="panel-heading"><span><h2>Kapasitas tempat tidur</h2><p>Pembaruan demo otomatis.</p></span><BedDouble size={17} /></div>{[['Rawat inap', '5 dari 8 tersedia', '62%'], ['Observasi IGD', '3 dari 4 tersedia', '75%']].map(([name, text, width]) => <div className="bed-meter" key={name}><span><small>{name}</small><b>{text}</b></span><div><i style={{ width }} /></div></div>)}</section><section className="panel"><div className="panel-heading"><span><h2>Jadwal tindakan</h2><p>Layanan terjadwal hari ini.</p></span></div>{[['09.00', 'Pemeriksaan gigi', 'Poli Gigi'], ['10.30', 'Imunisasi dasar', 'Ruang KIA'], ['13.00', 'Pemeriksaan kehamilan', 'Poli KIA']].map(([time, title, unit]) => <div className="procedure-row" key={time}><b>{time}</b><span>{title}<small>{unit}</small></span></div>)}</section></div></>
}

function AdminPage() {
  const bars = [36, 54, 44, 76, 59, 84, 68, 96, 74, 57, 83, 65]
  const stats = [['Kunjungan hari ini', '128', '+12,4%', UsersRound], ['Antrean berjalan', '18', '6 poli aktif', Ticket], ['Rata-rata tunggu', '24 mnt', '-8 menit', Clock3], ['Kapasitas fasilitas', '78%', 'Stabil', BedDouble]]
  const clinicStats = [['Poli Umum', 46, '36%'], ['Poli Gigi dan Mulut', 22, '17%'], ['Poli KIA', 18, '14%'], ['Poli Anak / MTBS', 15, '12%'], ['Lainnya', 27, '21%']]
  return <><PageTitle eyebrow="PORTAL PETUGAS DEMO" title="Analitik Puskesmas" detail="Ringkasan operasional UPTD PKM Beji hari ini." action={<button className="button secondary-button" onClick={() => window.print()}><FileText size={13} /> Ekspor laporan</button>} /><p className="admin-notice"><ShieldCheck size={14} /> Data dummy demonstrasi, bukan laporan operasional aktual.</p><div className="admin-stats">{stats.map(([name, value, change, Icon], i) => <div className="admin-stat" key={name}><small>{name}</small><b>{value}</b><span>{i === 0 && ''}{change}</span><Icon size={16} /></div>)}</div><div className="page-columns chart-columns"><section className="panel"><div className="panel-heading"><span><h2>Volume kunjungan</h2><p>Jumlah pasien 12 jam terakhir</p></span><small>HARI INI</small></div><div className="bar-chart">{bars.map((height, i) => <div key={`height-${i}`}><i className={i === 7 ? 'bar-focus' : ''} style={{ height: `${height}%` }} /><small>{String(i + 7).padStart(2, '0')}</small></div>)}</div></section><section className="panel"><div className="panel-heading"><span><h2>Statistik poliklinik</h2><p>Distribusi kunjungan</p></span><Activity size={16} /></div>{clinicStats.map(([name, count, width]) => <div className="clinic-stat" key={name}><span><small>{name}</small><b>{count} pasien</b></span><i><em style={{ width }} /></i></div>)}</section></div><div className="page-columns"><section className="panel"><div className="panel-heading"><span><h2>Ketersediaan fasilitas</h2><p>Ringkasan kapasitas hari ini.</p></span><span className="status status-green"><i /> Normal</span></div>{[['Rawat inap', '3/8 tersedia', '62%'], ['Bed observasi IGD', '1/4 tersedia', '75%']].map(([name, value, width]) => <div className="bed-meter" key={name}><span><small>{name}</small><b>{value}</b></span><div><i style={{ width }} /></div></div>)}</section><section className="panel"><div className="panel-heading"><span><h2>Antrean per poli</h2><p>Pasien menunggu saat ini.</p></span><Ticket size={16} /></div>{[['Poli Umum', 8], ['Poli Gigi dan Mulut', 4], ['Poli KIA', 3], ['Poli Anak / MTBS', 3]].map(([name, count]) => <div className="mini-queue" key={name}><span>{name}</span><b>{count} pasien</b></div>)}</section></div></>
}

function StaffAccount({ role, onClose, onLogout }) {
  const isAdmin = role === 'admin'
  return <Modal title={isAdmin ? 'Sesi Admin Puskesmas' : 'Sesi Dokter'} close={onClose}><div className="staff-account"><span className="staff-avatar">{isAdmin ? <ShieldCheck size={20} /> : <Stethoscope size={20} />}</span><div><b>{isAdmin ? 'Admin PKM Beji' : 'dr. Aditya Pratama'}</b><small>{isAdmin ? 'Administrator layanan' : 'Dokter umum Poli Umum'}</small></div></div><div className="account-data"><small>Fasilitas</small><b>UPTD PKM Beji</b><small>Hak akses</small><b>{isAdmin ? 'Operasional, antrean, dan analitik' : 'Antrean dokter dan konsultasi virtual'}</b></div><p className="privacy-note"><ShieldCheck size={12} /> Akun staf demo tersimpan lokal pada browser ini.</p><button className="logout-button" onClick={onLogout}>Keluar dari akun staf</button></Modal>
}

function AdminDashboard({ appointments, availability, go }) {
  const todayAppointments = appointments.filter((appointment) => appointment.day === 'today' && appointment.status !== 'Selesai')
  const tomorrowAppointments = appointments.filter((appointment) => appointment.day === 'tomorrow' && appointment.status !== 'Selesai')
  const availableCount = Object.values(availability.today || {}).filter(Boolean).length
  return <><PageTitle eyebrow="PORTAL ADMIN UPTD PKM BEJI" title="Dasbor Admin" detail="Ringkasan layanan dan antrean yang perlu ditindaklanjuti." action={<button className="button secondary-button" onClick={() => go('Analitik petugas')}><Activity size={14} /> Buka analitik</button>} /><div className="staff-stats"><div><small>Antrean hari ini</small><b>{todayAppointments.length}</b><span>Pasien menunggu</span><Ticket size={18} /></div><div><small>Jadwal besok</small><b>{tomorrowAppointments.length}</b><span>Tiket terdaftar</span><CalendarDays size={18} /></div><div><small>Dokter tersedia hari ini</small><b>{availableCount}<i> / {doctors.length}</i></b><span>Atur ketersediaan</span><UsersRound size={18} /></div><div><small>Fasilitas</small><b>78%</b><span>Kapasitas terpantau</span><BedDouble size={18} /></div></div><div className="staff-work-grid"><section className="panel staff-action-panel"><div className="panel-heading"><span><h2>Operasional harian</h2><p>Kelola layanan dan antrean Puskesmas.</p></span><Hospital size={18} /></div><button className="staff-action" onClick={() => go('Operasional admin')}><span><Ticket size={17} /></span><span><b>Antrean & ketersediaan</b><small>Kelola dokter per hari dan tinjau detail tiket.</small></span><ArrowRight size={15} /></button><button className="staff-action" onClick={() => go('Analitik petugas')}><span><Activity size={17} /></span><span><b>Analitik kunjungan</b><small>Volume pasien dan distribusi poli.</small></span><ArrowRight size={15} /></button></section><section className="panel staff-next-panel"><div className="panel-heading"><span><h2>Antrean terdekat</h2><p>{todayAppointments.length ? 'Tiket hari ini.' : 'Belum ada pasien menunggu.'}</p></span><button className="text-button" onClick={() => go('Operasional admin')}>Lihat semua <ArrowRight size={12} /></button></div>{todayAppointments.slice(0, 3).map((appointment, index) => <div className="staff-appointment" key={`${appointment.number}-${index}`}><span className="staff-ticket">{appointment.number}</span><span><b>{appointment.patient}</b><small>{appointment.clinic} · {appointment.arrival}</small></span><span className="status status-green"><i /> {appointment.status}</span></div>)}</section></div></>
}

function DoctorDashboard({ appointments, availability, go }) {
  const doctorName = 'dr. Aditya Pratama'
  const todayQueue = appointments.filter((appointment) => appointment.day === 'today' && appointment.status !== 'Selesai')
  const tomorrowQueue = appointments.filter((appointment) => appointment.day === 'tomorrow' && appointment.status !== 'Selesai')
  return <><PageTitle eyebrow="PORTAL DOKTER UPTD PKM BEJI" title="Dasbor Dokter" detail={`Selamat bertugas, ${doctorName}. Berikut agenda praktik Anda.`} action={<button className="button primary" onClick={() => go('Konsultasi virtual')}><Video size={14} /> Buka konsultasi</button>} /><div className="doctor-welcome-panel"><span className="doctor-avatar doctor-0">AP</span><span><small>JADWAL HARI INI</small><b>{doctorName}</b><i><Clock3 size={12} /> Poli Umum · 08.00–12.00</i></span><strong className={availability.today?.[doctorName] ? 'status status-green' : 'status'}><i /> {availability.today?.[doctorName] ? 'Tersedia' : 'Tidak tersedia'}</strong></div><div className="staff-stats doctor-stats"><div><small>Pasien hari ini</small><b>{todayQueue.length}</b><span>Antrean aktif</span><UsersRound size={18} /></div><div><small>Pasien besok</small><b>{tomorrowQueue.length}</b><span>Terjadwal</span><CalendarDays size={18} /></div><div><small>Waktu tunggu estimasi</small><b>{todayQueue.length ? '20 mnt' : '-'}</b><span>Poli Umum</span><Clock3 size={18} /></div><div><small>Konsultasi virtual</small><b>Siap</b><span>Jitsi Meet</span><Video size={18} /></div></div><div className="staff-work-grid"><section className="panel"><div className="panel-heading"><span><h2>Pasien berikutnya</h2><p>{todayQueue.length ? 'Urutan antrean hari ini.' : 'Tidak ada antrean aktif.'}</p></span><Ticket size={17} /></div>{todayQueue.slice(0, 3).map((appointment, index) => <div className="staff-appointment" key={`${appointment.number}-${index}`}><span className="staff-ticket">{appointment.number}</span><span><b>{appointment.patient}</b><small>{appointment.clinic} · {appointment.arrival}</small></span><span className="staff-complaint">{appointment.complaint || 'Tanpa catatan'}</span></div>)}<button className="text-button" onClick={() => go('Antrean dokter')}>Buka daftar pasien <ArrowRight size={12} /></button></section><section className="panel staff-action-panel"><div className="panel-heading"><span><h2>Layanan dokter</h2><p>Akses ruang konsultasi virtual.</p></span><Stethoscope size={18} /></div><div className="doctor-consult-card"><span><Video size={20} /></span><b>Konsultasi virtual</b><small>Kelola sesi konsultasi pasien melalui Jitsi Meet.</small><button className="button primary" onClick={() => go('Konsultasi virtual')}>Masuk ruang konsultasi <ArrowRight size={13} /></button></div></section></div></>
}

function DoctorQueuePage({ appointments, go }) {
  const appointmentsForDoctor = appointments.filter((appointment) => appointment.status !== 'Selesai')
  return <><PageTitle eyebrow="PORTAL DOKTER DAFTAR PASIEN" title="Antrean Pasien" detail="Tinjau keluhan dan jadwal pasien sebelum pemeriksaan." action={<button className="button primary" onClick={() => go('Konsultasi virtual')}><Video size={14} /> Konsultasi virtual</button>} /><section className="panel"><div className="panel-heading"><span><h2>Pasien terjadwal</h2><p>{appointmentsForDoctor.length} tiket dalam data demo.</p></span><span className="status status-green"><i /> Aktif</span></div><div className="table-scroll"><table><thead><tr><th>WAKTU</th><th>PASIEN</th><th>POLI</th><th>KELUHAN AWAL</th><th>STATUS</th></tr></thead><tbody>{appointmentsForDoctor.map((appointment, index) => <tr key={`${appointment.number}-${index}`}><td>{appointment.day === 'tomorrow' ? 'Besok' : 'Hari ini'} · {appointment.arrival}</td><td><b>{appointment.patient}</b><small className="table-subtext">{appointment.memberId}</small></td><td>{appointment.clinic}</td><td className="complaint-cell">{appointment.complaint || 'Tidak ada catatan'}</td><td><span className="status status-green"><i /> {appointment.status}</span></td></tr>)}</tbody></table>{appointmentsForDoctor.length === 0 && <p className="empty-state">Belum ada pasien pada antrean demo.</p>}</div></section></>
}

function AdminOperations({ appointments, availability, toggle }) {
  return <><section className="panel admin-availability"><div className="panel-heading"><span><h2>Ketersediaan tenaga medis</h2><p>Perubahan tersimpan di browser dan langsung memengaruhi pilihan dokter pasien.</p></span><CalendarDays size={17} /></div>{[['today', 'Hari ini'], ['tomorrow', 'Besok']].map(([day, label]) => <div className="availability-day" key={day}><h3>{label}</h3>{doctors.map(([name, clinic, time]) => <label className="availability-row" key={`${day}-${name}`}><span><b>{name}</b><small>{clinic} {time}</small></span><input type="checkbox" checked={Boolean(availability[day]?.[name])} onChange={() => toggle(day, name)} /><i>{availability[day]?.[name] ? 'Tersedia' : 'Tidak tersedia'}</i></label>)}</div>)}</section><section className="panel admin-appointments"><div className="panel-heading"><span><h2>Antrean pasien</h2><p>{appointments.length} tiket tercatat pada data demo.</p></span><Ticket size={17} /></div><div className="table-scroll"><table><thead><tr><th>TIKET</th><th>PASIEN</th><th>POLI/DOKTER</th><th>HARI & JAM</th><th>KELUHAN</th><th>STATUS</th></tr></thead><tbody>{appointments.map((appointment, index) => <tr key={`${appointment.number}-${index}`}><td><b>{appointment.number}</b></td><td>{appointment.patient}<small className="table-subtext">{appointment.memberId}</small></td><td>{appointment.clinic}<small className="table-subtext">{appointment.doctor}</small></td><td>{appointment.day === 'tomorrow' ? 'Besok' : 'Hari ini'} · {appointment.arrival}</td><td className="complaint-cell">{appointment.complaint || 'Tidak ada catatan'}</td><td><span className="status status-green"><i /> {appointment.status}</span></td></tr>)}</tbody></table>{appointments.length === 0 && <p className="empty-state">Belum ada antrean terdaftar.</p>}</div></section></>
}

export default App