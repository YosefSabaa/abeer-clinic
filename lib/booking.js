import { supabase } from './supabase'
import { DEFAULT_CLINIC_SETTINGS } from './default-settings'

// توحيد صيغة الهاتف
export function normalizePhone(raw) {
  if (!raw) return ''
  let cleaned = String(raw).replace(/[\s\-()]/g, '').trim()
  if (cleaned.startsWith('+20')) cleaned = '0' + cleaned.slice(3)
  else if (cleaned.startsWith('0020')) cleaned = '0' + cleaned.slice(4)
  else if (/^1[0-9]{9}$/.test(cleaned)) cleaned = '0' + cleaned
  return cleaned
}

function timeToMinutes(hhmm) {
  const [h, m] = String(hhmm || '00:00').split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

function minutesToTime(total) {
  const h = Math.floor(total / 60) % 24
  const m = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

// توليد المواعيد ديناميكياً من جدول مواعيد العمل وقواعد الحجز
export function buildSlotsForDate(date, settings = DEFAULT_CLINIC_SETTINGS) {
  const [y, m, d] = date.split('-').map(Number)
  const dayOfWeek = new Date(y, m - 1, d).getDay()

  const holidays = settings?.holidays || []
  if (holidays.some((h) => h.date === date)) {
    return []
  }

  const workingHours = settings?.working_hours || DEFAULT_CLINIC_SETTINGS.working_hours
  const dayRule = workingHours.find((w) => w.dayIndex === dayOfWeek)
  if (!dayRule || dayRule.closed || !dayRule.start || !dayRule.end) {
    return []
  }

  const duration = Math.max(10, Number(settings?.booking_rules?.slot_duration_minutes) || 30)
  const consultationLabel = settings?.booking_rules?.consultation_label_ar || 'كشف'
  const startMin = timeToMinutes(dayRule.start)
  const endMin = timeToMinutes(dayRule.end)

  const slots = []
  let idx = 1
  for (let t = startMin; t + duration <= endMin; t += duration) {
    slots.push({
      id: String(idx++),
      type: consultationLabel,
      start: minutesToTime(t),
      end: minutesToTime(t + duration),
    })
  }
  return slots
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
  customAnswers,
}) {
  const cleanPhone = normalizePhone(phone)
  if (!name?.trim() || !cleanPhone) {
    throw new Error('يرجى إدخال الاسم ورقم الهاتف')
  }

  const response = await fetch('/api/appointments/book', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: name.trim(),
      phone: cleanPhone,
      date,
      time,
      maritalStatus,
      age,
      ageUnit,
      visitType,
      customAnswers: customAnswers || {},
    }),
  })

  const result = await response.json()
  if (!response.ok) {
    throw new Error(result.message || 'فشل الحجز')
  }
  return result
}

// جلب المواعيد المتاحة فعلياً من قاعدة البيانات واستبعاد المحجوز
export async function getAvailableSlots(date, settings = DEFAULT_CLINIC_SETTINGS) {
  const baseSlots = buildSlotsForDate(date, settings)
  if (baseSlots.length === 0) return []

  const { data: booked, error } = await supabase
    .from('appointments')
    .select('appointment_time')
    .eq('appointment_date', date)
    .neq('status', 'cancelled')

  const bookedTimes = !error && booked ? booked.map((b) => String(b.appointment_time).slice(0, 5)) : []

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

// دوال لوحة تحكم العيادة المؤمنة عبر API الخادم
export async function getAdminDashboardData() {
  const res = await fetch('/api/admin/dashboard', { cache: 'no-store' })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'فشل تحميل بيانات لوحة التحكم')
  return data
}

async function adminAction(action, payload) {
  const res = await fetch('/api/admin/dashboard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, payload }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'فشل تنفيذ العملية')
  return data.data
}

export async function upsertPatientAdmin(patientData) {
  return adminAction('upsert_patient', patientData)
}

export async function updateAppointmentStatus(id, status) {
  return adminAction('update_appointment_status', { id, status })
}

export async function createManualAppointment(payload) {
  return adminAction('create_manual_appointment', payload)
}

export async function addMedicalRecord(record) {
  return adminAction('add_medical_record', record)
}

export async function deleteMedicalRecord(id) {
  return adminAction('delete_medical_record', { id })
}
