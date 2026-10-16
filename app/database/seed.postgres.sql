INSERT INTO facilities (id, code, name, address, phone)
VALUES (1, 'PKM-BEJI', 'UPTD Puskesmas Beji', 'Jl. Bambu Kuning No. 1, Beji, Depok', '021-77200001')
ON CONFLICT DO NOTHING;

INSERT INTO clinics (id, facility_id, code, name, description) VALUES
  (1, 1, 'UMUM', 'Poli Umum', 'Pemeriksaan umum'),
  (2, 1, 'LANSIA', 'Poli Lansia & Disabilitas', 'Layanan prioritas'),
  (3, 1, 'KB', 'Poli KB (Keluarga Berencana)', 'Konsultasi keluarga berencana'),
  (4, 1, 'GIGI', 'Poli Gigi dan Mulut', 'Pemeriksaan gigi'),
  (5, 1, 'ANAK', 'Poli Anak / MTBS', 'Manajemen terpadu balita sakit'),
  (6, 1, 'KIA', 'Poli KIA', 'Kesehatan ibu dan anak'),
  (7, 1, 'GIZI', 'Poli Gizi', 'Konsultasi gizi'),
  (8, 1, 'KONSELING', 'Poli Konseling', 'Kesehatan mental')
ON CONFLICT DO NOTHING;

INSERT INTO users (id, role, email, phone) VALUES
  (1, 'patient', NULL, '081234567890'),
  (2, 'doctor', 'dokter@puskesmas.local', NULL),
  (3, 'admin', 'admin@puskesmas.local', NULL)
ON CONFLICT DO NOTHING;

INSERT INTO patients (id, user_id, member_number, full_name, birth_date, gender, blood_type, address, emergency_phone, service_scheme)
VALUES (1, 1, '00020268492', 'Siti Nurbaya', '1994-06-18', 'Perempuan', 'O+', 'Jl. Margonda Raya, Beji, Depok', '081399887766', 'subsidi')
ON CONFLICT DO NOTHING;

INSERT INTO staff (id, user_id, facility_id, staff_code, display_name, profession, license_number) VALUES
  (1, 2, 1, 'DOK-001', 'dr. Aditya Pratama', 'Dokter umum', 'DEMO-SIP-001'),
  (2, 3, 1, 'ADM-001', 'Admin PKM Beji', 'Administrator', NULL)
ON CONFLICT DO NOTHING;

INSERT INTO clinic_providers (provider_id, clinic_id) VALUES (1, 1)
ON CONFLICT DO NOTHING;

INSERT INTO schedules (id, provider_id, clinic_id, service_date, starts_at, ends_at, capacity, status) VALUES
  (1, 1, 1, CURRENT_DATE, '08:00', '12:00', 30, 'available'),
  (2, 1, 1, CURRENT_DATE + 1, '08:00', '12:00', 30, 'available')
ON CONFLICT DO NOTHING;

INSERT INTO appointments (id, patient_id, facility_id, clinic_id, provider_id, queue_date, queue_number, arrival_time, complaint, status)
VALUES (1, 1, 1, 1, 1, CURRENT_DATE, 'A-018', '09:30', 'Batuk dan pilek', 'waiting')
ON CONFLICT DO NOTHING;

INSERT INTO screenings (id, patient_id, appointment_id, complaint, health_history)
VALUES (1, 1, 1, 'Batuk dan pilek sejak kemarin', 'Tidak ada alergi yang diketahui')
ON CONFLICT DO NOTHING;

INSERT INTO visits (id, patient_id, facility_id, clinic_id, provider_id, visited_at, diagnosis, clinical_notes) VALUES
  (1, 1, 1, 1, 1, CURRENT_TIMESTAMP - INTERVAL '4 days', 'ISPA ringan', 'Data kunjungan demo.'),
  (2, 1, 1, 1, 1, CURRENT_TIMESTAMP - INTERVAL '73 days', 'Pemeriksaan rutin', 'Data kunjungan demo.'),
  (3, 1, 1, 7, 1, CURRENT_TIMESTAMP - INTERVAL '150 days', 'Konsultasi gizi', 'Data kunjungan demo.')
ON CONFLICT DO NOTHING;

INSERT INTO medicines (id, code, name, strength, dosage_form, unit, minimum_stock) VALUES
  (1, 'MED-PAR-500', 'Paracetamol', '500 mg', 'Tablet', 'tablet', 20),
  (2, 'MED-AMO-500', 'Amoxicillin', '500 mg', 'Kapsul', 'kapsul', 20),
  (3, 'MED-ORA-01', 'Oralit', NULL, 'Serbuk', 'sachet', 10),
  (4, 'MED-VITC-500', 'Vitamin C', '500 mg', 'Tablet', 'tablet', 10),
  (5, 'MED-VITB-01', 'Vitamin B-Complex', NULL, 'Tablet', 'tablet', 10)
ON CONFLICT DO NOTHING;

INSERT INTO inventory_batches (id, facility_id, medicine_id, batch_number, expires_on, quantity) VALUES
  (1, 1, 1, 'DEMO-PAR-001', CURRENT_DATE + 365, 128),
  (2, 1, 2, 'DEMO-AMO-001', CURRENT_DATE + 365, 64),
  (3, 1, 3, 'DEMO-ORA-001', CURRENT_DATE + 365, 18),
  (4, 1, 4, 'DEMO-VITC-001', CURRENT_DATE + 365, 7),
  (5, 1, 5, 'DEMO-VITB-001', CURRENT_DATE + 365, 40)
ON CONFLICT DO NOTHING;

INSERT INTO prescriptions (id, visit_id, patient_id, prescribed_by, issued_at, status)
VALUES (1, 1, 1, 1, CURRENT_TIMESTAMP - INTERVAL '4 days', 'active')
ON CONFLICT DO NOTHING;

INSERT INTO prescription_items (id, prescription_id, medicine_id, dosage, frequency, duration_days, quantity, instructions) VALUES
  (1, 1, 1, '1 tablet', '3 kali sehari', 3, 9, 'Sesudah makan'),
  (2, 1, 2, '1 kapsul', '3 kali sehari', 5, 15, 'Habiskan sesuai resep'),
  (3, 1, 5, '1 tablet', '1 kali sehari', 5, 5, 'Sesudah makan')
ON CONFLICT DO NOTHING;

INSERT INTO beds (id, facility_id, code, bed_type, status) VALUES
  (1, 1, 'RI-01', 'inpatient', 'occupied'),
  (2, 1, 'RI-02', 'inpatient', 'occupied'),
  (3, 1, 'RI-03', 'inpatient', 'occupied'),
  (4, 1, 'RI-04', 'inpatient', 'occupied'),
  (5, 1, 'RI-05', 'inpatient', 'occupied'),
  (6, 1, 'RI-06', 'inpatient', 'available'),
  (7, 1, 'RI-07', 'inpatient', 'available'),
  (8, 1, 'RI-08', 'inpatient', 'available'),
  (9, 1, 'IGD-01', 'emergency', 'occupied'),
  (10, 1, 'IGD-02', 'emergency', 'available'),
  (11, 1, 'IGD-03', 'emergency', 'available'),
  (12, 1, 'IGD-04', 'emergency', 'available')
ON CONFLICT DO NOTHING;