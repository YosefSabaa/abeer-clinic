import { supabaseAdmin } from '@/lib/supabase-admin'
import { requireAdmin } from '@/lib/whatsapp-auth'

export const runtime = 'nodejs'

export async function GET(request) {
  if (!(await requireAdmin())) {
    return Response.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
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

      return Response.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return Response.json({
      messages: data || [],
    })
  }

  const { data, error } = await supabaseAdmin
    .from('whatsapp_conversations')
    .select('*')
    .order('last_message_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error('Load conversations error:', error)

    return Response.json(
      { error: error.message },
      { status: 500 }
    )
  }

  return Response.json({
    conversations: data || [],
  })
}