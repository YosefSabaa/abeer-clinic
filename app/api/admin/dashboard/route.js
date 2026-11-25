import { supabaseAdmin } from '@/lib/supabase-admin'
import { loadClinicSettingsFromDB } from '@/lib/clinic-settings-server'
import { requireAdmin } from '@/lib/whatsapp-auth'

export const runtime = 'nodejs'

function normalizePhone(raw) {
  if (!raw) return ''
  let cleaned = String(raw).replace(/[\s\-()+]/g, '').trim()
  if (cleaned.startsWith('0020')) cleaned = '0' + cleaned.slice(4)
  else if (cleaned.startsWith('20') && cleaned.length === 12) cleaned = '0' + cleaned.slice(2)
  else if (/^1[0-9]{9}$/.test(cleaned)) cleaned = '0' + cleaned
  return cleaned
}

function timeToMinutes(hhmm) {
  const [h, m] = String(hhmm || '19:00').split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

function minutesToHHMM(totalMinutes) {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440
  const h = Math.floor(normalized / 60)
  const m = normalized % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export async function GET() {
  if (!(await requireAdmin())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const [patientsRes, appointmentsRes, recordsRes] = await Promise.all([
      supabaseAdmin.from('patients').select('*').order('created_at', { ascending: false }),
      supabaseAdmin
        .from('appointments')
        .select('*')
        .order('appointment_date', { ascending: false })
        .order('queue_number', { ascending: true }),
      supabaseAdmin
        .from('medical_records')
        .select('*')
        .order('visit_date', { ascending: false })
        .order('created_at', { ascending: false }),
    ])

    if (patientsRes.error) throw patientsRes.error
    if (appointmentsRes.error) throw appointmentsRes.error
    if (recordsRes.error) throw recordsRes.error

    return Response.json({
      patients: patientsRes.data || [],
      appointments: appointmentsRes.data || [],
      medicalRecords: recordsRes.data || [],
    })
  } catch (error) {
    console.error('Admin dashboard GET error:', error)
    return Response.json({ error: error.message || 'فشل تحميل البيانات' }, { status: 500 })
  }
}

export async function POST(request) {
  if (!(await requireAdmin())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const action = body.action

    if (action === 'upsert_patient') {
      if (!(await requireAdmin('managePatients'))) {
        return Response.json({ error: 'ليس لديك صلاحية إدارة المرضى' }, { status: 403 })
      }
      const p = body.payload || {}
      const cleanPhone = normalizePhone(p.phone)
      if (!cleanPhone || !p.name?.trim()) {
        return Response.json({ error: 'الاسم ورقم الهاتف مطلوبان' }, { status: 400 })
      }
      const { data, error } = await supabaseAdmin
        .from('patients')
        .upsert(
          {
            phone: cleanPhone,
            name: p.name.trim(),
            age: p.age ? parseInt(p.age, 10) : null,
            age_unit: p.age_unit || 'years',
            marital_status: p.marital_status || null,
            chronic_notes: p.chronic_notes || null,
          },
          { onConflict: 'phone' }
        )
        .select()
        .single()

      if (error) throw error
      return Response.json({ success: true, data })
    }

    if (action === 'update_appointment_status') {
      if (!(await requireAdmin('manageCalendar')) && !(await requireAdmin('viewToday'))) {
        return Response.json({ error: 'ليس لديك صلاحية تعديل الحجوزات' }, { status: 403 })
      }
      const { id, status } = body.payload || {}
      if (!id || !status) {
        return Response.json({ error: 'بيانات غير مكتملة' }, { status: 400 })
      }
      const { error } = await supabaseAdmin
        .from('appointments')
        .update({ status })
        .eq('id', id)
      if (error) throw error
      return Response.json({ success: true })
    }

    if (action === 'create_manual_appointment') {
      if (!(await requireAdmin('manageCalendar')) && !(await requireAdmin('viewToday'))) {
        return Response.json({ error: 'ليس لديك صلاحية إضافة حجز' }, { status: 403 })
      }
      const p = body.payload || {}
      const cleanPhone = normalizePhone(p.phone)
      if (!p.name?.trim() || !cleanPhone || !p.date) {
        return Response.json({ error: 'يرجى استكمال الاسم والهاتف والتاريخ' }, { status: 400 })
      }

      const { settings } = await loadClinicSettingsFromDB()
      const maxDaily = Math.max(1, Number(settings.booking_rules?.max_daily_bookings) || 20)
      const avgMinutes = Math.max(5, Number(settings.booking_rules?.avg_minutes_per_patient) || 15)

      const { data: existingRows } = await supabaseAdmin
        .from('appointments')
        .select('id, queue_number')
        .eq('appointment_date', p.date)
        .neq('status', 'cancelled')

      const activeRows = existingRows || []
      if (activeRows.length >= maxDaily) {
        return Response.json(
          { error: `اكتمل الحد الأقصى لحجوزات هذا اليوم (${maxDaily} حجز).` },
          { status: 400 }
        )
      }

      const maxQ = activeRows.reduce((m, r, i) => Math.max(m, Number(r.queue_number) || i + 1), 0)
      const queueNumber = Math.max(activeRows.length, maxQ) + 1
      const [y, mo, d] = p.date.split('-').map(Number)
      const dayRule = (settings.working_hours || []).find(
        (w) => w.dayIndex === new Date(y, mo - 1, d).getDay()
      )
      const estTime =
        p.time || minutesToHHMM(timeToMinutes(dayRule?.start || '19:00') + activeRows.length * avgMinutes)
      const bookingCode = `CL-${p.date.replace(/-/g, '')}-${String(queueNumber).padStart(3, '0')}`

      const { data: patient } = await supabaseAdmin
        .from('patients')
        .upsert(
          {
            phone: cleanPhone,
            name: p.name.trim(),
            age: p.age ? parseInt(p.age, 10) : null,
            marital_status: p.marital_status || null,
          },
          { onConflict: 'phone' }
        )
        .select('id')
        .single()

      const { data, error } = await supabaseAdmin
        .from('appointments')
        .insert({
          patient_id: patient?.id || null,
          patient_name: p.name.trim(),
          patient_phone: cleanPhone,
          appointment_date: p.date,
          appointment_time: estTime,
          status: p.status || 'confirmed',
          slot_type: p.visitType || 'كشف',
          queue_number: queueNumber,
          booking_code: bookingCode,
          custom_answers: p.customAnswers || {},
        })
        .select()
        .single()

      if (error) throw error
      return Response.json({ success: true, data })
    }

    if (action === 'add_medical_record') {
      if (!(await requireAdmin('viewMedicalRecords'))) {
        return Response.json({ error: 'ليس لديك صلاحية إضافة سجل طبي' }, { status: 403 })
      }
      const r = body.payload || {}
      const cleanPhone = normalizePhone(r.patient_phone)
      if (!cleanPhone || !r.diagnosis?.trim()) {
        return Response.json({ error: 'رقم الهاتف والتشخيص مطلوبان' }, { status: 400 })
      }

      const { data, error } = await supabaseAdmin
        .from('medical_records')
        .insert({
          patient_phone: cleanPhone,
          patient_name: r.patient_name || null,
          visit_date: r.visit_date || new Date().toISOString().split('T')[0],
          symptoms: r.symptoms || null,
          diagnosis: r.diagnosis.trim(),
          prescription: r.prescription || null,
          notes: r.notes || null,
          next_visit: r.next_visit || null,
        })
        .select()
        .single()

      if (error) throw error
      return Response.json({ success: true, data })
    }

    if (action === 'delete_medical_record') {
      if (!(await requireAdmin('viewMedicalRecords'))) {
        return Response.json({ error: 'ليس لديك صلاحية حذف سجل طبي' }, { status: 403 })
      }
      const { id } = body.payload || {}
      if (!id) return Response.json({ error: 'المعرف مطلوب' }, { status: 400 })
      const { error } = await supabaseAdmin.from('medical_records').delete().eq('id', id)
      if (error) throw error
      return Response.json({ success: true })
    }

    return Response.json({ error: 'إجراء غير معروف' }, { status: 400 })
  } catch (error) {
    console.error('Admin dashboard POST error:', error)
    return Response.json({ error: error.message || 'حدث خطأ أثناء تنفيذ العملية' }, { status: 500 })
  }
}
