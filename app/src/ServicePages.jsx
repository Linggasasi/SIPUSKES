import { useMemo, useState } from 'react'
import {
  AlarmClock, Asterisk, ArrowRight, BedDouble, BellRing, CheckCircle2,
  ChevronDown, MapPin, Mars, Pill, PillBottle, PhoneCall, Search,
  Siren, Smile, SquarePlus, Tablet, UsersRound, Venus,
} from 'lucide-react'
import './ServicePages.css'

const prescriptions = [
  {
    id: 'paracetamol', name: 'Paracetamol 500 mg', Icon: Pill, subtitle: 'Antipiretik & Analgesik · 10 Kaplet',
    dose: '3 x Sehari (1 Tablet)', timing: 'Sesudah Makan', schedule: '07:00 · 12:30 · 19:00',
    remaining: 6, unit: 'Kaplet', note: 'Minum setelah makan. Beri jarak minimal 4 jam antar dosis.',
  },
  {
    id: 'antasida', name: 'Antasida Doen Suspensi', Icon: PillBottle, subtitle: 'Pereda Asam Lambung · 1 Botol 60 ml',
    dose: '3 x Sehari (1 Sendok Takar)', timing: 'Sebelum Makan (1 Jam)', schedule: '06:00 · 11:30 · 18:00',
    remaining: 40, unit: 'ml', note: 'Kocok botol sebelum digunakan dan gunakan sendok takar.',
  },
  {
    id: 'vitamin-b', name: 'Vitamin B Complex', Icon: Tablet, subtitle: 'Suplemen Syaraf & Stamina · 10 Tablet',
    dose: '1 x Sehari (1 Tablet)', timing: 'Sesudah Makan', schedule: '08:00 Pagi',
    remaining: 8, unit: 'Tablet', note: 'Satu tablet setiap pagi setelah sarapan.',
  },
]

const bedRooms = [
  { id: 'igd', name: 'RUANG IGD 24 JAM', available: 4, total: 6, Icon: Asterisk, color: 'red', note: 'Kondisi Siaga: Terbuka Pasien Darurat' },
  { id: 'women', name: 'RAWAT INAP WANITA', available: 2, total: 8, Icon: Venus, color: 'amber', note: 'Hampir Penuh: Tersisa 2 Tempat Tidur' },
  { id: 'men', name: 'RAWAT INAP PRIA', available: 5, total: 8, Icon: Mars, color: 'green', note: 'Kapasitas Lega: Siap Rawat Inap' },
  { id: 'maternity', name: 'RUANG PERSALINAN (VK)', available: 3, total: 4, Icon: Smile, color: 'violet', note: 'Bidan Standby 24 Jam' },
]

const doctorSchedules = [
  { name: 'dr. Hendra Setiawan', clinic: 'Poli Umum', days: 'Senin - Jumat', time: '08:00 - 14:00', status: 'Bertugas', today: true },
  { name: 'drg. Maya Pratiwi', clinic: 'Poli Gigi & Mulut', days: 'Senin - Kamis', time: '08:30 - 12:30', status: 'Bertugas', today: false },
  { name: 'Bdn. Rina Rahmawati, S.Tr.Keb', clinic: 'Poli KIA & Persalinan', days: 'Senin - Sabtu', time: 'Shift Pagi (08:00 - 14:00)', status: 'Bertugas', today: true },
  { name: 'dr. Ahmad Fauzi, Sp.A', clinic: 'Konsultan Anak (MTBS)', days: 'Selasa & Kamis', time: '10:00 - 13:00', status: 'Jadwal Nanti', today: false },
]

const referralHospitals = [
  { name: 'Rumah Sakit Universitas Indonesia (RSUI)', type: 'Tipe A · Rujukan Utama', address: 'Jl. Prof. DR. Bahder Djohan, Pondok Cina, Beji', services: ['IGD Terpadu & Cath Lab Siaga 24 Jam', 'Ketersediaan ICU: 6 Bed Kosong'], tag: 'primary' },
  { name: 'RS Puri Cinere', type: 'Tipe B', address: 'Jl. Maribaya No. 1, Puri Cinere, Depok', services: ['Layanan Jantung & Bedah Vaskular', 'Ketersediaan ICU: 3 Bed Kosong'] },
  { name: 'RS Primaya Depok', type: 'Tipe B', address: 'Jl. Margonda No. 352, Kemiri Muka, Beji', services: ['Pusat Onkologi & Bedah Minimal Invasif', 'Ketersediaan ICU: 4 Bed Kosong'] },
  { name: 'RS Permata Depok', type: 'Tipe C', address: 'Jl. Raya Muhtar No. 22, Sawangan, Depok', services: ['Layanan Ibu & Anak Prima', 'Ketersediaan NICU: 2 Incubator'] },
  { name: 'RSU Bunda Margonda', type: 'Tipe B', address: 'Jl. Margonda Raya No. 28, Pondok Cina', services: ['Robotic Surgery & Morula IVF Center', 'Ketersediaan ICU: 2 Bed Kosong'] },
  { name: 'RSUD Khidmat Sehat Afiat (KiSA)', type: 'RSUD Daerah Depok', address: 'Jl. Raya Muhtar No. 99, Sawangan, Depok', services: ['Rujukan Pemda Depok Penuh Subsidi', 'Ketersediaan Bed: 14 Bed Kelas 3'], tag: 'public' },
  { name: 'RSU Bhakti Yudha', type: 'Tipe C', address: 'Jl. Raya Sawangan No. 2, Pancoran Mas, Depok', services: ['IGD & layanan penyakit dalam', 'Layanan rawat inap umum'] },
  { name: 'RS Bhayangkara Brimob', type: 'Tipe C', address: 'Jl. Komjen Pol. M. Jasin, Pasir Gunung Selatan', services: ['IGD 24 Jam & trauma', 'Layanan bedah umum'] },
  { name: 'Brawijaya Hospital Depok', type: 'Tipe C', address: 'Jl. Raya Cinere, Depok', services: ['Ibu, anak & layanan keluarga', 'IGD dan rawat inap'] },
]

function ServiceHeading({ eyebrow, title, detail, action }) {
  return <header className="service-heading"><div><small>{eyebrow}</small><h1>{title}</h1><p>{detail}</p></div>{action}</header>
}

export function PharmacyScreen({ toast, openCard }) {
  const [taken, setTaken] = useState([])
  const [alarmOn, setAlarmOn] = useState(false)
  const [expanded, setExpanded] = useState('')

  const toggleDose = (id, name) => {
    const isTaken = taken.includes(id)
    setTaken((current) => isTaken ? current.filter((item) => item !== id) : [...current, id])
    toast(isTaken ? `Status ${name} dikembalikan ke belum diminum.` : `${name} ditandai sudah diminum.`)
  }

  return <div className="service-page pharmacy-page">
    <ServiceHeading
      eyebrow="APOTEK PKM BEJI"
      title="Apotek & Pengingat Minum Obat Pasien"
      detail="Daftar resep elektronik Puskesmas lengkap instruksi makan, status tebus, dan simulasi pengingat."
      action={<button className={`alarm-test-button ${alarmOn ? 'is-on' : ''}`} aria-pressed={alarmOn} onClick={() => { setAlarmOn(!alarmOn); toast(alarmOn ? 'Simulasi alarm dimatikan.' : 'Simulasi alarm minum obat aktif.') }}><BellRing size={15} /> {alarmOn ? 'Matikan Simulasi Alarm' : 'Uji Simulasi Alarm Minum Obat'}</button>}
    />
    <section className="prescription-grid" aria-label="Resep aktif">
      {prescriptions.map((prescription) => {
        const isTaken = taken.includes(prescription.id)
        const PrescriptionIcon = prescription.Icon
        return <article className={`prescription-card ${isTaken ? 'prescription-taken' : ''}`} key={prescription.id}>
          <div className="prescription-card-heading"><span className="prescription-active"><i /> Resep Aktif (Tebus Gratis)</span><PrescriptionIcon size={16} /></div>
          <h2>{prescription.name}</h2>
          <p className="prescription-subtitle">{prescription.subtitle}</p>
          <div className="prescription-instructions">
            <span>Aturan Pakai:</span><b>{prescription.dose}</b>
            <span>Waktu Minum:</span><b className={prescription.timing.startsWith('Sebelum') ? 'before-meal' : 'after-meal'}>{prescription.timing}</b>
            <span>Jadwal Jam:</span><b className="prescription-hours">{prescription.schedule}</b>
          </div>
          {expanded === prescription.id && <p className="prescription-detail">{prescription.note}</p>}
          <footer className="prescription-card-footer">
            <span>Sisa: {Math.max(0, prescription.remaining - (isTaken ? 1 : 0))} {prescription.unit}</span>
            <button className="dose-state" onClick={() => toggleDose(prescription.id, prescription.name)}><CheckCircle2 size={15} /> {isTaken ? 'Batalkan' : 'Sudah Minum'}</button>
          </footer>
          <button className="prescription-detail-toggle" aria-expanded={expanded === prescription.id} onClick={() => setExpanded(expanded === prescription.id ? '' : prescription.id)}>{expanded === prescription.id ? 'Tutup detail' : 'Lihat detail resep'} <ChevronDown size={12} /></button>
        </article>
      })}
    </section>
    <section className="pharmacy-pickup"><span className="pickup-icon"><PillBottle size={18} /></span><div><b>Status Antrean Resep Farmasi: Siap Diambil</b><small>Nomor Resep Obat: <strong>RX-2025-0899</strong> di Loket Farmasi Puskesmas Beji.</small></div><button onClick={openCard}>Tunjukkan Kode Kartu Digital ke Apoteker <ArrowRight size={13} /></button></section>
    {alarmOn && <p className="alarm-status"><AlarmClock size={14} /> Pengingat aktif untuk jadwal dosis hari ini. Ini simulasi, bukan alarm perangkat.</p>}
  </div>
}

export function FacilitiesScreen({ toast }) {
  const [selectedRoom, setSelectedRoom] = useState('')
  const [scheduleMode, setScheduleMode] = useState('week')
  const [selectedDoctor, setSelectedDoctor] = useState('')
  const visibleSchedules = scheduleMode === 'today' ? doctorSchedules.filter((doctor) => doctor.today) : doctorSchedules
  const activeRoom = bedRooms.find((room) => room.id === selectedRoom)

  return <div className="service-page facilities-page">
    <ServiceHeading eyebrow="FASILITAS UPTD PKM BEJI" title="Ketersediaan Bed & Jadwal Dokter Puskesmas" detail="Pantauan kapasitas ruang rawat inap dan jadwal tenaga medis Puskesmas Beji." action={<span className="facility-live"><i /> Data simulasi diperbarui sekarang</span>} />
    <section className="bed-capacity-grid" aria-label="Ketersediaan tempat tidur">
      {bedRooms.map(({ id, name, available, total, Icon, color, note }) => {
        const availablePercent = Math.round((available / total) * 100)
        return <button className={`bed-capacity-card ${color} ${selectedRoom === id ? 'selected' : ''}`} key={id} onClick={() => { setSelectedRoom(selectedRoom === id ? '' : id); toast(`${name}: ${available} dari ${total} bed tersedia.`) }} aria-pressed={selectedRoom === id}>
          <span className="bed-card-label">{name}<Icon size={15} /></span>
          <strong>{available}<small> / {total} Bed Tersedia</small></strong>
          <span className="bed-capacity-track"><i style={{ width: `${availablePercent}%` }} /></span>
          <small className="bed-card-note">{note}</small>
        </button>
      })}
    </section>
    {activeRoom && <div className="selected-room-note"><BedDouble size={15} /><span><b>{activeRoom.name}</b> · {activeRoom.available} tempat tersedia dari kapasitas {activeRoom.total} bed.</span><button onClick={() => setSelectedRoom('')} aria-label="Tutup detail bed">×</button></div>}
    <section className="doctor-schedule-panel">
      <header className="doctor-schedule-heading"><div><h2>Jadwal Shift Dokter & Tenaga Medis Pekan Ini</h2><small>UPTD Puskesmas Beji</small></div><div className="schedule-toggle" aria-label="Filter jadwal"><button className={scheduleMode === 'today' ? 'active' : ''} onClick={() => setScheduleMode('today')}>Hari Ini</button><button className={scheduleMode === 'week' ? 'active' : ''} onClick={() => setScheduleMode('week')}>Pekan Ini</button></div></header>
      <div className="service-table-scroll"><table className="service-table"><thead><tr><th>NAMA TENAGA MEDIS</th><th>SPESIALISASI / POLI</th><th>HARI PRAKTIK</th><th>JAM TUGAS</th><th>STATUS</th></tr></thead><tbody>
        {visibleSchedules.map((doctor) => <tr key={doctor.name} className={selectedDoctor === doctor.name ? 'selected' : ''} onClick={() => setSelectedDoctor(selectedDoctor === doctor.name ? '' : doctor.name)}>
          <td><button className="doctor-name-button">{doctor.name}</button></td><td>{doctor.clinic}</td><td>{doctor.days}</td><td>{doctor.time}</td><td><span className={`doctor-duty-status ${doctor.status === 'Bertugas' ? 'on-duty' : ''}`}>{doctor.status}</span></td>
        </tr>)}
      </tbody></table></div>
      {selectedDoctor && <div className="doctor-selected-note"><UsersRound size={14} /> Jadwal dipilih: <b>{selectedDoctor}</b><span>Konfirmasi perubahan shift melalui petugas Puskesmas.</span></div>}
    </section>
  </div>
}

export function ReferralScreen({ onRefer }) {
  const [query, setQuery] = useState('')
  const filteredHospitals = useMemo(() => referralHospitals.filter((hospital) => `${hospital.name} ${hospital.type} ${hospital.address} ${hospital.services.join(' ')}`.toLowerCase().includes(query.toLowerCase())), [query])

  return <div className="service-page referral-page">
    <ServiceHeading eyebrow="SISRUTE · KOTA DEPOK" title="Jaringan 9 Rumah Sakit Rujukan & Ambulans 119 Depok" detail="Sistem Rujukan Terintegrasi untuk tindak lanjut rawat inap dan fasilitas ICU/NICU." />
    <section className="referral-emergency-banner"><span className="referral-emergency-icon"><Siren size={23} /></span><div><b>Call Center Gawat Darurat Medis 119 Kota Depok</b><small>Siaga 24 Jam bebas pulsa. Penjemputan ambulans gawat darurat trauma dan henti jantung.</small></div><a href="tel:119"><PhoneCall size={14} /> Hubungi 119 Sekarang</a></section>
    <div className="referral-toolbar"><span><b>{filteredHospitals.length}</b> fasilitas rujukan</span><label><Search size={14} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari rumah sakit atau layanan" /><button onClick={() => setQuery('')} aria-label="Hapus pencarian">×</button></label></div>
    <section className="referral-hospital-grid" aria-label="Rumah sakit rujukan">
      {filteredHospitals.map((hospital, index) => <article className="referral-hospital-card" key={hospital.name}>
        <header><span className={`hospital-type ${hospital.tag || ''}`}>{hospital.type}</span><button aria-label={`Detail ${hospital.name}`} onClick={() => onRefer(hospital.name)}><SquarePlus size={15} /></button></header>
        <h2>{index + 1}. {hospital.name}</h2>
        <p className="hospital-address"><MapPin size={12} /> {hospital.address}</p>
        <ul>{hospital.services.map((service) => <li key={service}>{service}</li>)}</ul>
        <footer><span><i /> SISRUTE Terhubung</span><button onClick={() => onRefer(hospital.name)}>Buat Rujukan <ArrowRight size={12} /></button></footer>
      </article>)}
      {!filteredHospitals.length && <p className="hospital-empty">Tidak ada rumah sakit yang cocok dengan pencarian.</p>}
    </section>
  </div>
}
