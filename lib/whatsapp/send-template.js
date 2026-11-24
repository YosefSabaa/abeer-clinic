
import { DOCTOR } from '@/lib/constants'

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
    throw new Error('Invalid Egyptian WhatsApp phone number')
  }

  return phone
}

export async function sendAppointmentTemplate({
  phone,
  name,
  date,
  time,
  visitType,
}) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const version = process.env.WHATSAPP_API_VERSION

  if (!token || !phoneNumberId || !version) {
    throw new Error('WhatsApp API environment variables are missing')
  }

  const to = normalizeWhatsAppPhone(phone)

  const parameters = [
    name,
    DOCTOR.name,
    date,
    time,
    visitType || 'كشف',
    '360 جنيه',
    DOCTOR.address,
  ]

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
            code: 'ar_EG',
          },
          components: [
            {
              type: 'body',
              parameters: parameters.map((value) => ({
                type: 'text',
                text: String(value ?? ''),
              })),
            },
          ],
        },
      }),
    }
  )

  const result = await response.json()

  if (!response.ok) {
    throw new Error(
      result.error?.message || 'WhatsApp template sending failed'
    )
  }

  return result
}
