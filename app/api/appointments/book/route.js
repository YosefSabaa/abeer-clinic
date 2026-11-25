import { supabaseAdmin } from '@/lib/supabase-admin'
import { loadClinicSettingsFromDB } from '@/lib/clinic-settings-server'
import { sendAppointmentTemplate } from '@/lib/whatsapp/send-template'

export const runtime = 'nodejs'

function normalizePhone(raw) {
  let phone = String(raw || '').replace(/[\s\-()+]/g, '')
  if (phone.startsWith('0020')) phone = '0' + phone.slice(4)
  else if (phone.startsWith('20') && phone.length === 12) phone = '0' + phone.slice(2)
  else if (/^1\d{9}$/.test(phone)) phone = '0' + phone
  return phone
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

function formatArabic12h(hhmm) {
  const [hRaw, mRaw] = String(hhmm || '19:00').split(':').map(Number)
  const period = hRaw >= 12 ? 'م' : 'ص'
  const h12 = hRaw % 12 || 12
  return `${String(h12).padStart(2, '0')}:${String(mRaw || 0).padStart(2, '0')} ${period}`
}

export async function POST(request) {
  try {
    const body = await request.json()

    const name = String(body.name || '').trim()
    const phone = normalizePhone(body.phone)
    const date = String(body.date || '')
    const maritalStatus = body.maritalStatus || null
    const age = body.age ? parseInt(body.age, 10) : null
    const ageUnit = body.ageUnit || 'years'
    const visitType = String(body.visitType || 'كشف')
    const customAnswers =
      body.customAnswers && typeof body.customAnswers === 'object' ? body.customAnswers : {}

    if (!name || !/^01\d{9}$/.test(phone) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return Response.json(
        { success: false, message: 'يرجى مراجعة الاسم ورقم الهاتف المصري والتاريخ' },
        { status: 400 }
      )
    }

    const { settings } = await loadClinicSettingsFromDB()

    if (settings.doctor_profile?.available_for_booking === false) {
      return Response.json(
        { success: false, message: 'الحجز الأونلاين متوقف مؤقتًا من قِبل العيادة.' },
        { status: 400 }
      )
    }

    // التحقق من الإجازات ومواعيد العمل
    const holiday = (settings.holidays || []).find((h) => h.date === date)
    if (holiday) {
      return Response.json(
        { success: false, message: 'هذا اليوم إجازة رسمية للعيادة، يرجى اختيار يوم آخر.' },
        { status: 400 }
      )
    }

    const [y, m, d] = date.split('-').map(Number)
    const dayOfWeek = new Date(y, m - 1, d).getDay()
    const dayRule = (settings.working_hours || []).find((w) => w.dayIndex === dayOfWeek)
    if (!dayRule || dayRule.closed) {
      return Response.json(
        { success: false, message: 'العيادة مغلقة في هذا اليوم، يرجى اختيار يوم عمل آخر.' },
        { status: 400 }
      )
    }

    const maxDailyBookings = Math.max(1, Number(settings.booking_rules?.max_daily_bookings) || 20)
    const avgMinutes = Math.max(5, Number(settings.booking_rules?.avg_minutes_per_patient) || 15)

    // جلب حجوزات اليوم غير الملغاة
    const { data: existingRows, error: countErr } = await supabaseAdmin
      .from('appointments')
      .select('id, status, queue_number, patient_phone')
      .eq('appointment_date', date)
      .neq('status', 'cancelled')

    if (countErr) {
      return Response.json({ success: false, message: countErr.message }, { status: 500 })
    }

    const activeRows = existingRows || []

    // منع تكرار الحجز لنفس المريض في نفس اليوم
    if (activeRows.some((r) => r.patient_phone === phone)) {
      return Response.json(
        { success: false, message: 'لديك حجز مسجل بالفعل في هذا اليوم. يمكنك متابعته من «ملفي الطبي».' },
        { status: 400 }
      )
    }

    // التحقق من الحد الأقصى اليومي
    if (activeRows.length >= maxDailyBookings) {
      return Response.json(
        {
          success: false,
          message: `عذرًا، اكتمل الحد الأقصى لحجوزات هذا اليوم (${maxDailyBookings} حجز). يرجى اختيار يوم آخر.`,
        },
        { status: 400 }
      )
    }

    const maxQueueNum = activeRows.reduce(
      (max, r, idx) => Math.max(max, Number(r.queue_number) || idx + 1),
      0
    )
    const queueNumber = Math.max(activeRows.length, maxQueueNum) + 1
    const waitingAhead = activeRows.filter((r) => r.status !== 'completed').length

    const startMinutes = timeToMinutes(dayRule.start || '19:00')
    const estimatedTime = minutesToHHMM(startMinutes + activeRows.length * avgMinutes)
    const estimatedTimeArabic = formatArabic12h(estimatedTime)

    const dateCompact = date.replace(/-/g, '')
    const bookingCode = `CL-${dateCompact}-${String(queueNumber).padStart(3, '0')}`

    // إنشاء أو تحديث ملف المريض
    const { data: patient, error: patientErr } = await supabaseAdmin
      .from('patients')
      .upsert(
        {
          phone,
          name,
          age,
          age_unit: ageUnit,
          marital_status: maritalStatus,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'phone' }
      )
      .select('id')
      .single()

    if (patientErr) {
      console.error('Patient upsert error:', patientErr)
      return Response.json({ success: false, message: patientErr.message }, { status: 500 })
    }

    // تسجيل الحجز
    const { data: appointment, error: aptErr } = await supabaseAdmin
      .from('appointments')
      .insert({
        patient_id: patient?.id || null,
        patient_name: name,
        patient_phone: phone,
        appointment_date: date,
        appointment_time: estimatedTime,
        status: 'confirmed',
        slot_type: visitType,
        queue_number: queueNumber,
        booking_code: bookingCode,
        custom_answers: customAnswers,
      })
      .select('*')
      .single()

    if (aptErr) {
      console.error('Appointment insert error:', aptErr)
      return Response.json({ success: false, message: aptErr.message }, { status: 500 })
    }

    const isFollowup = visitType === (settings.booking_rules?.followup_label_ar || 'استشارة')
    const priceValue = isFollowup
      ? settings.booking_rules?.followup_price || 150
      : settings.booking_rules?.consultation_price || 360
    const priceLabel = `${priceValue} ${settings.booking_rules?.currency_ar || 'ج.م'}`

    let notificationSent = false
    if (settings.whatsapp_settings?.auto_confirmation_enabled !== false) {
      try {
        await sendAppointmentTemplate({
          phone,
          name,
          date,
          time: estimatedTime,
          visitType: `${visitType} (دور #${queueNumber})`,
          consultationPrice: priceLabel,
          doctorName: settings.doctor_profile?.name_ar,
          clinicAddress: settings.clinic_contact?.address_ar,
        })
        notificationSent = true
      } catch (err) {
        console.error('WhatsApp notification failed:', err.message)
      }
    }

    return Response.json({
      success: true,
      message: `تم تأكيد حجزك بنجاح! رقم دورك هو #${queueNumber} والوقت التقريبي للدخول ${estimatedTimeArabic}.`,
      whatsappNotification: notificationSent ? 'sent' : 'not_sent',
      ticket: {
        id: appointment.id,
        bookingCode,
        queueNumber,
        waitingAhead,
        date,
        estimatedTime,
        estimatedTimeArabic,
        patientName: name,
        patientPhone: phone,
        visitType,
        priceLabel,
        doctorName: settings.doctor_profile?.name_ar || 'دكتورة عبير الدالي',
        clinicName: settings.clinic_contact?.clinic_name_ar || settings.doctor_profile?.name_ar || '',
        clinicAddress: settings.clinic_contact?.address_ar || '',
        clinicPhone: settings.clinic_contact?.phone || '',
      },
    })
  } catch (error) {
    console.error('Booking API error:', error)
    return Response.json({ success: false, message: 'حدث خطأ أثناء الحجز' }, { status: 500 })
  }
}
