import { supabase } from './supabase'

// توحيد صيغة الهاتف مع قبول أي رقم يكتبه المريض بدون قيود أو تحقق
export function normalizePhone(raw) {
  if (!raw) return ''
  let cleaned = String(raw).replace(/[\s\-()]/g, '').trim()
  if (cleaned.startsWith('+20')) cleaned = '0' + cleaned.slice(3)
  else if (cleaned.startsWith('0020')) cleaned = '0' + cleaned.slice(4)
  else if (/^1[0-9]{9}$/.test(cleaned)) cleaned = '0' + cleaned
  return cleaned
}

// حجز موعد جديد

export async function bookAppointment({
  name,
  phone,
  date,
  time,
  maritalStatus,
  age,
  ageUnit,
  visitType,
}) {
  const cleanPhone = normalizePhone(phone)

  if (!name?.trim() || !cleanPhone) {
    throw new Error('يرجى إدخال الاسم ورقم الهاتف')
  }

  const response = await fetch('/api/appointments/book', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: name.trim(),
      phone: cleanPhone,
      date,
      time,
      maritalStatus,
      age,
      ageUnit,
      visitType,
    }),
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.message || 'فشل الحجز')
  }

  return result
}


// جلب المواعيد المتاحة فعلياً من قاعدة البيانات واستبعاد المحجوز
export async function getAvailableSlots(date) {
  const [y, m, d] = date.split('-').map(Number)
  const dayOfWeek = new Date(y, m - 1, d).getDay()
  if (dayOfWeek === 5) return [] // الجمعة إجازة

  const baseSlots = [
    { id: '1', type: 'كشف', start: '19:00', end: '19:30' },
    { id: '2', type: 'كشف', start: '19:30', end: '20:00' },
    { id: '3', type: 'كشف', start: '20:00', end: '20:30' },
    { id: '4', type: 'استشارة', start: '20:30', end: '21:00' },
    { id: '5', type: 'كشف', start: '21:00', end: '21:30' },
    { id: '6', type: 'كشف', start: '21:30', end: '22:00' },
    { id: '7', type: 'كشف', start: '22:00', end: '22:30' },
    { id: '8', type: 'كشف', start: '22:30', end: '23:00' },
  ]

  const { data: booked, error } = await supabase
    .from('appointments')
    .select('appointment_time')
    .eq('appointment_date', date)
    .neq('status', 'cancelled')

  const bookedTimes = !error && booked ? booked.map((b) => b.appointment_time) : []

  return baseSlots.map((slot) => ({
    ...slot,
    available: !bookedTimes.includes(slot.start),
  }))
}

// تسجيل دخول المريض برقم الهاتف مباشرة بدون تحقق
export async function loginPatientByPhone(phone, optionalName = '') {
  const cleanPhone = normalizePhone(phone)
  if (!cleanPhone) {
    throw new Error('يرجى إدخال رقم الهاتف')
  }

  let { data: patient, error } = await supabase
    .from('patients')
    .select('*')
    .eq('phone', cleanPhone)
    .maybeSingle()

  if (error) throw new Error(error.message)

  // إنشاء ملف للمريض تلقائياً إذا دخل برقم جديد لأول مرة
  if (!patient) {
    const fallbackName = optionalName.trim() || `مريض (${cleanPhone})`
    const { data: created, error: createError } = await supabase
      .from('patients')
      .insert({ phone: cleanPhone, name: fallbackName })
      .select()
      .single()

    if (createError) throw new Error(createError.message)
    patient = created
  } else if (optionalName.trim() && patient.name.startsWith('مريض (')) {
    const { data: updated } = await supabase
      .from('patients')
      .update({ name: optionalName.trim() })
      .eq('id', patient.id)
      .select()
      .single()
    if (updated) patient = updated
  }

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*')
    .eq('patient_phone', cleanPhone)
    .order('appointment_date', { ascending: false })
    .order('appointment_time', { ascending: false })

  const { data: medicalRecords } = await supabase
    .from('medical_records')
    .select('*')
    .eq('patient_phone', cleanPhone)
    .order('visit_date', { ascending: false })
    .order('created_at', { ascending: false })

  return {
    patient,
    appointments: appointments || [],
    medicalRecords: medicalRecords || [],
  }
}

// دوال لوحة تحكم الدكتورة
export async function getAdminDashboardData() {
  const [patientsRes, appointmentsRes, recordsRes] = await Promise.all([
    supabase.from('patients').select('*').order('created_at', { ascending: false }),
    supabase
      .from('appointments')
      .select('*')
      .order('appointment_date', { ascending: false })
      .order('appointment_time', { ascending: true }),
    supabase
      .from('medical_records')
      .select('*')
      .order('visit_date', { ascending: false })
      .order('created_at', { ascending: false }),
  ])

  if (patientsRes.error) throw new Error(patientsRes.error.message)
  if (appointmentsRes.error) throw new Error(appointmentsRes.error.message)
  if (recordsRes.error) throw new Error(recordsRes.error.message)

  return {
    patients: patientsRes.data || [],
    appointments: appointmentsRes.data || [],
    medicalRecords: recordsRes.data || [],
  }
}

export async function upsertPatientAdmin(patientData) {
  const cleanPhone = normalizePhone(patientData.phone)
  if (!cleanPhone || !patientData.name?.trim()) {
    throw new Error('الاسم ورقم الهاتف مطلوبان')
  }

  const payload = {
    phone: cleanPhone,
    name: patientData.name.trim(),
    age: patientData.age ? parseInt(patientData.age, 10) : null,
    age_unit: patientData.age_unit || 'years',
    marital_status: patientData.marital_status || null,
    chronic_notes: patientData.chronic_notes || null,
  }

  const { data, error } = await supabase
    .from('patients')
    .upsert(payload, { onConflict: 'phone' })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateAppointmentStatus(id, status) {
  const { error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', id)

  if (error) throw new Error(error.message)
}

export async function addMedicalRecord(record) {
  const cleanPhone = normalizePhone(record.patient_phone)
  if (!cleanPhone || !record.diagnosis?.trim()) {
    throw new Error('رقم هاتف المريض والتشخيص مطلوبان')
  }

  const { data, error } = await supabase
    .from('medical_records')
    .insert({
      patient_phone: cleanPhone,
      patient_name: record.patient_name || null,
      visit_date: record.visit_date || new Date().toISOString().split('T')[0],
      symptoms: record.symptoms || null,
      diagnosis: record.diagnosis.trim(),
      prescription: record.prescription || null,
      notes: record.notes || null,
      next_visit: record.next_visit || null,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deleteMedicalRecord(id) {
  const { error } = await supabase.from('medical_records').delete().eq('id', id)
  if (error) throw new Error(error.message)
}