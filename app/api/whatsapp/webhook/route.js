import { createHmac, timingSafeEqual } from 'node:crypto'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const runtime = 'nodejs'

function safeEqual(a, b) {
  const x = Buffer.from(String(a || ''))
  const y = Buffer.from(String(b || ''))

  if (x.length !== y.length) return false

  return timingSafeEqual(x, y)
}

function getMessageContent(message) {
  switch (message.type) {
    case 'text':
      return message.text?.body || ''

    case 'image':
      return '[صورة]'

    case 'audio':
      return '[رسالة صوتية]'

    case 'video':
      return '[فيديو]'

    case 'document':
      return `[ملف] ${message.document?.filename || ''}`

    case 'location':
      return '[موقع جغرافي]'

    case 'sticker':
      return '[ملصق]'

    case 'interactive':
      return (
        message.interactive?.button_reply?.title ||
        message.interactive?.list_reply?.title ||
        '[رسالة تفاعلية]'
      )

    case 'button':
      return message.button?.text || '[زر]'

    default:
      return '[رسالة غير نصية]'
  }
}

// التحقق من Webhook عند ربطه مع Meta
export async function GET(request) {
  const url = new URL(request.url)

  const mode = url.searchParams.get('hub.mode')
  const token = url.searchParams.get('hub.verify_token')
  const challenge = url.searchParams.get('hub.challenge')

  const expected = process.env.WHATSAPP_VERIFY_TOKEN

  if (
    mode === 'subscribe' &&
    expected &&
    token &&
    challenge !== null &&
    safeEqual(token, expected)
  ) {
    return new Response(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    })
  }

  return new Response('Verification failed', { status: 403 })
}

export async function POST(request) {
  try {
    const appSecret = process.env.WHATSAPP_APP_SECRET

    if (!appSecret) {
      return Response.json(
        { error: 'Webhook is not configured' },
        { status: 500 }
      )
    }

    const rawBody = await request.text()
    const signature = request.headers.get('x-hub-signature-256')

    if (!signature?.startsWith('sha256=')) {
      return Response.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    const expectedSignature =
      'sha256=' +
      createHmac('sha256', appSecret)
        .update(rawBody)
        .digest('hex')

    if (!safeEqual(signature, expectedSignature)) {
      return Response.json(
        { error: 'Signature verification failed' },
        { status: 401 }
      )
    }

    const payload = JSON.parse(rawBody)

    for (const entry of payload.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field !== 'messages') continue

        const value = change.value || {}

        // تحديث حالات الرسائل الصادرة
        for (const status of value.statuses || []) {
          const firstError = status.errors?.[0] || null

          const statusAt = status.timestamp
            ? new Date(Number(status.timestamp) * 1000).toISOString()
            : new Date().toISOString()

          const updateData = {
            status: status.status,
            status_at: statusAt,
            error_code: firstError?.code
              ? String(firstError.code)
              : null,
            error_title: firstError?.title || null,
            error_message: firstError?.message || null,
            error_details: firstError?.error_data?.details || null,
            raw_status: status,
          }

          const { error } = await supabaseAdmin
            .from('whatsapp_messages')
            .update(updateData)
            .eq('wa_message_id', status.id)

          if (error) {
            console.error('WhatsApp status update error:', {
              messageId: status.id,
              error,
            })
          }
        }

        // استقبال الرسائل الجديدة
        for (const message of value.messages || []) {
          const phone = message.from

          if (!phone) continue

          const content = getMessageContent(message)

          const contact = (value.contacts || []).find(
            (item) => item.wa_id === phone
          )

          const patientName = contact?.profile?.name || null
          const now = new Date().toISOString()

          const { data: conversation, error: conversationError } =
            await supabaseAdmin
              .from('whatsapp_conversations')
              .upsert(
                {
                  phone,
                  patient_name: patientName,
                  last_message: content,
                  last_message_at: now,
                  last_inbound_at: now,
                  updated_at: now,
                },
                { onConflict: 'phone' }
              )
              .select('id')
              .single()

          if (conversationError || !conversation) {
            console.error(
              'Conversation save error:',
              conversationError
            )
            continue
          }

          const { error: messageError } = await supabaseAdmin
            .from('whatsapp_messages')
            .insert({
              conversation_id: conversation.id,
              wa_message_id: message.id,
              direction: 'incoming',
              message_type: message.type || 'unknown',
              content,
              status: 'received',
              status_at: now,
            })

          // منع احتساب الرسالة مرتين عند إعادة إرسال Webhook
          if (messageError?.code === '23505') {
            continue
          }

          if (messageError) {
            console.error('Message save error:', messageError)
            continue
          }

          await supabaseAdmin.rpc(
            'increment_whatsapp_unread',
            { p_conversation_id: conversation.id }
          )
        }
      }
    }

    return Response.json({ received: true })
  } catch (error) {
    console.error('WhatsApp webhook error:', error)

    return Response.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}