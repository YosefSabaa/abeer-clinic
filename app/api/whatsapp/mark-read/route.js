
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
    const { conversationId } = await request.json()

    if (!conversationId) {
      return Response.json(
        { error: 'Missing conversation ID' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('whatsapp_conversations')
      .update({
        unread_count: 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversationId)

    if (error) throw error

    return Response.json({ success: true })
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
