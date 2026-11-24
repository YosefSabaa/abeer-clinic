import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { DOCTOR } from '@/lib/constants'
import { supabaseAdmin } from '@/lib/supabase-admin'

function normalizeWhatsAppPhone(raw) {
  let phone = String(raw || '').replace(/\D/g, '')

  if (phone.startsWith('0020')) {
    phone = phone.slice(2)
  } else if (phone.startsWith('0')) {
    phone = '20' + phone.slice(1)
  } else if (phone.startsWith('1') && phone.length === 10) {
    phone = '20' + phone
  }

  if (!/^20\d{10}$/.test(phone)) {
    throw new Error('رقم الهاتف غير صالح للإرسال عبر WhatsApp')
  }

  return phone
}

// Meta ترفض وجود أسطر جديدة (\n) أو مسافات زائدة داخل قيمة أي متغير في القالب
function sanitizeParam(value) {
  return String(value ?? '')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function formatArabicDate(dateStr) {
  try {
    const [y, m, d] = String(dateStr).split('-').map(Number)
    const dateObj = new Date(y, m - 1, d)
    if (Number.isNaN(dateObj.getTime())) return dateStr
    return format(dateObj, 'EEEE، d MMMM yyyy', { locale: ar })
  } catch {
    return dateStr
  }
}

function formatArabicTime(timeStr) {
  const match = String(timeStr || '').match(/^(\d{1,2}):(\d{2})/)
  if (!match) return timeStr

  let hours = Number(match[1])
  const minutes = match[2]
  const period = hours >= 12 ? 'م' : 'ص'
  hours = hours % 12 || 12

  return `${String(hours).padStart(2, '0')}:${minutes} ${period}`
}

function buildRenderedConfirmationMessage({
  customerName,
  doctorName,
  appointmentDate,
  appointmentTime,
  visitType,
  consultationPrice,
  clinicAddress,
}) {
  return [
    `مرحبًا ${customerName}،`,
    '',
    `تم تأكيد حجز موعدك بنجاح لدى ${doctorName}.`,
    '',
    'تفاصيل الحجز:',
    '',
    `📅 التاريخ: ${appointmentDate}`,
    `🕒 الوقت: ${appointmentTime}`,
    `🩺 نوع الزيارة: ${visitType}`,
    `💰 سعر الكشف: ${consultationPrice}`,
    '',
    '📍 عنوان العيادة:',
    `${clinicAddress}`,
    '',
    'يرجى الحضور في الموعد المحدد.',
    '',
    'شكرًا لثقتكم بنا.',
    'د. عبير الدالي',
  ].join('\n')
}

async function saveTemplateMessageToInbox({
  phone,
  patientName,
  waMessageId,
  content,
}) {
  const now = new Date().toISOString()

  const { data: conversation, error: convError } = await supabaseAdmin
    .from('whatsapp_conversations')
    .upsert(
      {
        phone,
        patient_name: patientName,
        last_message: content,
        last_message_at: now,
        updated_at: now,
      },
      { onConflict: 'phone' }
    )
    .select('id')
    .single()

  if (convError || !conversation) {
    console.error('Failed to upsert WhatsApp conversation:', convError)
    return
  }

  const { error: msgError } = await supabaseAdmin
    .from('whatsapp_messages')
    .insert({
      conversation_id: conversation.id,
      wa_message_id: waMessageId,
      direction: 'outgoing',
      message_type: 'template',
      content,
      status: 'accepted',
      status_at: now,
    })

  if (msgError) {
    console.error('Failed to save WhatsApp template message:', msgError)
  }
}

async function sendMetaTemplateRequest({
  version,
  phoneNumberId,
  token,
  to,
  languageCode,
  bodyParameters,
}) {
  const response = await fetch(
    `https://graph.facebook.com/${version}/${phoneNumberId}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'template',
        template: {
          name: 'appointment_confirmation_ar',
          language: {
            code: languageCode,
          },
          components: [
            {
              type: 'body',
              parameters: bodyParameters,
            },
          ],
        },
      }),
    }
  )

  const result = await response.json()
  return { ok: response.ok, result }
}

export async function sendAppointmentTemplate({
  phone,
  name,
  date,
  time,
  visitType,
  consultationPrice,
}) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const version = process.env.WHATSAPP_API_VERSION
  const configuredLang = process.env.WHATSAPP_TEMPLATE_LANG

  if (!token || !phoneNumberId || !version) {
    throw new Error('متغيرات WhatsApp API غير مكتملة في .env.local')
  }

  const to = normalizeWhatsAppPhone(phone)

  const templateVars = {
    customer_name: sanitizeParam(name),
    doctor_name: sanitizeParam(DOCTOR.name),
    appointment_date: sanitizeParam(formatArabicDate(date)),
    appointment_time: sanitizeParam(formatArabicTime(time)),
    visit_type: sanitizeParam(visitType || 'كشف'),
    consultation_price: sanitizeParam(
      consultationPrice || DOCTOR.consultationPrice || '360 ج.م'
    ),
    clinic_address: sanitizeParam(DOCTOR.address),
  }

  const bodyParameters = [
    { type: 'text', parameter_name: 'customer_name', text: templateVars.customer_name },
    { type: 'text', parameter_name: 'doctor_name', text: templateVars.doctor_name },
    { type: 'text', parameter_name: 'appointment_date', text: templateVars.appointment_date },
    { type: 'text', parameter_name: 'appointment_time', text: templateVars.appointment_time },
    { type: 'text', parameter_name: 'visit_type', text: templateVars.visit_type },
    { type: 'text', parameter_name: 'consultation_price', text: templateVars.consultation_price },
    { type: 'text', parameter_name: 'clinic_address', text: templateVars.clinic_address },
  ]

  const primaryLang = configuredLang || 'ar_EG'
  let { ok, result } = await sendMetaTemplateRequest({
    version,
    phoneNumberId,
    token,
    to,
    languageCode: primaryLang,
    bodyParameters,
  })

  // إذا كان القالب في Meta مسجلًا بلغة 'ar' العامة بدل 'ar_EG' (رمز الخطأ 132001)، أعد المحاولة تلقائيًا بـ 'ar'
  if (!ok && !configuredLang && result?.error?.code === 132001) {
    const retry = await sendMetaTemplateRequest({
      version,
      phoneNumberId,
      token,
      to,
      languageCode: 'ar',
      bodyParameters,
    })
    ok = retry.ok
    result = retry.result
  }

  if (!ok) {
    console.error('Meta WhatsApp Template Error:', JSON.stringify(result, null, 2))
    throw new Error(
      result.error?.error_data?.details ||
      result.error?.message ||
      'فشل إرسال قالب تأكيد الحجز عبر WhatsApp'
    )
  }

  const waMessageId = result.messages?.[0]?.id

  if (waMessageId) {
    const renderedContent = buildRenderedConfirmationMessage({
      customerName: templateVars.customer_name,
      doctorName: templateVars.doctor_name,
      appointmentDate: templateVars.appointment_date,
      appointmentTime: templateVars.appointment_time,
      visitType: templateVars.visit_type,
      consultationPrice: templateVars.consultation_price,
      clinicAddress: DOCTOR.address,
    })

    await saveTemplateMessageToInbox({
      phone: to,
      patientName: templateVars.customer_name,
      waMessageId,
      content: renderedContent,
    })
  }

  return result
}