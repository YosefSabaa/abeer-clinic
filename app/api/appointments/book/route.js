
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sendAppointmentTemplate } from '@/lib/whatsapp/send-template'

function normalizePhone(raw) {
  let phone = String(raw || '').replace(/[\s\-()+]/g, '')

  if (phone.startsWith('0020')) {
    phone = '0' + phone.slice(4)
  } else if (phone.startsWith('+20')) {
    phone = '0' + phone.slice(3)
  } else if (/^1\d{9}$/.test(phone)) {
    phone = '0' + phone
  }

  return phone
}

export const runtime = 'nodejs'

export async function POST(request) {
  try {
    const body = await request.json()

    const name = String(body.name || '').trim()
    const phone = normalizePhone(body.phone)
    const date = String(body.date || '')
    const time = String(body.time || '')
    const maritalStatus = body.maritalStatus || null
    const age = body.age ? parseInt(body.age, 10) : null
    const ageUnit = body.ageUnit || 'years'
    const visitType = String(body.visitType || 'كشف')

    if (!name || !/^01\d{9}$/.test(phone) || !date || !time) {
      return Response.json(
        { success: false, message: 'يرجى مراجعة بيانات الحجز' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin.rpc(
      'book_appointment',
      {
        p_name: name,
        p_phone: phone,
        p_date: date,
        p_time: time,
        p_marital_status: maritalStatus,
        p_age: age,
        p_age_unit: ageUnit,
      }
    )

    if (error) {
      console.error('Booking RPC error:', error)

      return Response.json(
        { success: false, message: error.message },
        { status: 400 }
      )
    }

    let notificationSent = false

    if (data?.success) {
      try {
        await sendAppointmentTemplate({
          phone,
          name,
          date,
          time,
          visitType,
        })

        notificationSent = true
      } catch (notificationError) {
        console.error(
          'Appointment WhatsApp notification failed:',
          notificationError.message
        )
      }
    }

    return Response.json({
      ...data,
      whatsappNotification: notificationSent
        ? 'sent'
        : 'not_sent',
    })
  } catch (error) {
    console.error('Booking API error:', error)

    return Response.json(
      { success: false, message: 'حدث خطأ أثناء الحجز' },
      { status: 500 }
    )
  }
}
