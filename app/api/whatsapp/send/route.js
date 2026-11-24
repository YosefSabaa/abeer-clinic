
import { supabaseAdmin } from '@/lib/supabase-admin'
import { requireAdmin } from '@/lib/whatsapp-auth'

export const runtime = 'nodejs'

export async function POST(request) {
  if (!(await requireAdmin())) {
    return Response.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()

    const conversationId = String(body.conversationId || '')
    const text = String(body.text || '').trim()

    if (!conversationId || !text || text.length > 4000) {
      return Response.json(
        { error: 'بيانات الرسالة غير صحيحة' },
        { status: 400 }
      )
    }

    const { data: conversation, error: conversationError } =
      await supabaseAdmin
        .from('whatsapp_conversations')
        .select('*')
        .eq('id', conversationId)
        .single()

    if (conversationError || !conversation) {
      return Response.json(
        { error: 'المحادثة غير موجودة' },
        { status: 404 }
      )
    }

    const lastInbound = conversation.last_inbound_at
      ? new Date(conversation.last_inbound_at).getTime()
      : 0

    const within24Hours =
      lastInbound > 0 &&
      Date.now() - lastInbound < 24 * 60 * 60 * 1000

    if (!within24Hours) {
      return Response.json(
        {
          error: 'انتهت نافذة خدمة العملاء. يجب استخدام قالب معتمد.',
          code: 'TEMPLATE_REQUIRED',
        },
        { status: 409 }
      )
    }

    const version = process.env.WHATSAPP_API_VERSION
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
    const token = process.env.WHATSAPP_ACCESS_TOKEN

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
          to: conversation.phone,
          type: 'text',
          text: {
            preview_url: false,
            body: text,
          },
        }),
      }
    )

    const result = await response.json()

    if (!response.ok) {
      console.error('WhatsApp send error:', result)

      return Response.json(
        {
          error:
            result.error?.message || 'فشل إرسال الرسالة',
        },
        { status: 502 }
      )
    }

    const waMessageId = result.messages?.[0]?.id

    const { error: insertError } = await supabaseAdmin
      .from('whatsapp_messages')
      .insert({
        conversation_id: conversationId,
        wa_message_id: waMessageId || null,
        direction: 'outgoing',
        message_type: 'text',
        content: text,
        status: 'sent',
      })

    if (insertError) {
      console.error('Outgoing message save error:', insertError)
    }

    await supabaseAdmin
      .from('whatsapp_conversations')
      .update({
        last_message: text,
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversationId)

    return Response.json({
      success: true,
      messageId: waMessageId,
    })
  } catch (error) {
    console.error('Send message error:', error)

    return Response.json(
      { error: 'حدث خطأ أثناء إرسال الرسالة' },
      { status: 500 }
    )
  }
}
