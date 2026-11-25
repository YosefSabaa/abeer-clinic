import { supabaseAdmin } from '@/lib/supabase-admin'
import { requireAdmin } from '@/lib/whatsapp-auth'

export const runtime = 'nodejs'

function normalizeWhatsAppPhone(raw) {
  let phone = String(raw || '').replace(/\D/g, '')
  if (phone.startsWith('0020')) phone = phone.slice(2)
  else if (phone.startsWith('0')) phone = '20' + phone.slice(1)
  else if (phone.startsWith('1') && phone.length === 10) phone = '20' + phone
  return phone
}

export async function GET(request) {
  if (!(await requireAdmin())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const conversationId = searchParams.get('conversation_id')

  if (conversationId) {
    const { data, error } = await supabaseAdmin
      .from('whatsapp_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(200)

    if (error) {
      console.error('Load messages error:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ messages: data || [] })
  }

  const { data, error } = await supabaseAdmin
    .from('whatsapp_conversations')
    .select('*')
    .order('last_message_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error('Load conversations error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ conversations: data || [] })
}

// فتح أو إنشاء محادثة لمريض محدد عند الضغط على زر واتساب من كارت المريض
export async function POST(request) {
  if (!(await requireAdmin())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const waPhone = normalizeWhatsAppPhone(body.phone)
    const patientName = String(body.patientName || '').trim() || null

    if (!waPhone || waPhone.length < 10) {
      return Response.json({ error: 'رقم الهاتف غير صالح' }, { status: 400 })
    }

    const { data: existing } = await supabaseAdmin
      .from('whatsapp_conversations')
      .select('*')
      .eq('phone', waPhone)
      .maybeSingle()

    if (existing) {
      if (patientName && !existing.patient_name) {
        const { data: updated } = await supabaseAdmin
          .from('whatsapp_conversations')
          .update({ patient_name: patientName, updated_at: new Date().toISOString() })
          .eq('id', existing.id)
          .select('*')
          .single()
        return Response.json({ conversation: updated || existing })
      }
      return Response.json({ conversation: existing })
    }

    const now = new Date().toISOString()
    const { data: created, error } = await supabaseAdmin
      .from('whatsapp_conversations')
      .insert({
        phone: waPhone,
        patient_name: patientName,
        last_message: '',
        last_message_at: now,
        unread_count: 0,
        updated_at: now,
      })
      .select('*')
      .single()

    if (error) throw error
    return Response.json({ conversation: created })
  } catch (error) {
    console.error('Open conversation error:', error)
    return Response.json({ error: error.message || 'تعذر فتح المحادثة' }, { status: 500 })
  }
}
